import Groq from "groq-sdk";
import {env} from "@/lib/env";

type JsonChatInput = {
  system: string;
  user: unknown;
};

async function readJsonResponse(response: Response, provider: string) {
  if (!response.ok) {
    throw new Error(`${provider} 请求失败：${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function callDeepSeek(input: JsonChatInput) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY 未配置。");
  }

  // DeepSeek 是默认主力模型：要求 JSON 输出，避免摘要和思维导图在前端解析时
  // 因自然语言解释或 Markdown 包裹而失败。
  const response = await fetch(`${env.DEEPSEEK_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_CHAT_MODEL,
      response_format: {type: "json_object"},
      messages: [
        {role: "system", content: input.system},
        {role: "user", content: JSON.stringify(input.user)}
      ]
    })
  });
  const data = await readJsonResponse(response, "DeepSeek");
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek 没有返回内容。");
  return {model: `deepseek/${env.DEEPSEEK_CHAT_MODEL}`, content};
}

async function callGemini(input: JsonChatInput) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY 未配置。");
  }

  // Gemini 的 API 形态不同于 OpenAI 兼容接口，需要把系统提示和用户载荷合并到 parts 中。
  // 这里仍强制 responseMimeType 为 JSON，保持上层解析逻辑一致。
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      generationConfig: {responseMimeType: "application/json"},
      contents: [
        {
          role: "user",
          parts: [{text: `${input.system}\n\n${JSON.stringify(input.user)}`}]
        }
      ]
    })
  });
  const data = await readJsonResponse(response, "Gemini");
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Gemini 没有返回内容。");
  return {model: `gemini/${env.GEMINI_MODEL}`, content};
}

async function callGroq(input: JsonChatInput) {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY 未配置。");
  }

  // Groq 作为最后的在线兜底，优先保证 AI 后处理可用；全部在线模型失败后才回退本地规则。
  const groq = new Groq({apiKey: env.GROQ_API_KEY});
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    response_format: {type: "json_object"},
    messages: [
      {role: "system", content: input.system},
      {role: "user", content: JSON.stringify(input.user)}
    ]
  });
  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("Groq 没有返回内容。");
  return {model: "groq/llama-3.1-70b-versatile", content};
}

export async function generateJsonWithFallback<T>(input: JsonChatInput, localFallback: T) {
  const errors: string[] = [];
  const providers = [callDeepSeek, callGemini, callGroq];

  // 上层页面需要稳定返回结构，因此这里不把单个模型失败直接抛给用户；
  // errors 会随结果返回，便于排障时看到每个服务商的失败原因。
  for (const provider of providers) {
    try {
      const result = await provider(input);
      return {payload: JSON.parse(result.content) as T, model: result.model, errors};
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {payload: localFallback, model: "local-fallback", errors};
}
