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
