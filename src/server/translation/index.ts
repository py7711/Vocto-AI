import {env} from "@/lib/env";

type TranslateInput = {
  text: string;
  targetLocale: string;
  sourceLocale?: string;
};

function mapDeepLTarget(locale: string) {
  // DeepL 对部分语言使用地区化代码；前端只保存通用 locale，这里集中做服务商映射。
  const normalized = locale.toUpperCase();
  if (normalized === "ZH") return "ZH-HANS";
  if (normalized === "EN") return "EN-US";
  if (normalized === "PT") return "PT-BR";
  return normalized;
}

async function translateWithDeepL(input: TranslateInput) {
  if (!env.DEEPL_API_KEY) {
    throw new Error("DEEPL_API_KEY 未配置。");
  }

  const form = new URLSearchParams();
  form.set("text", input.text);
  form.set("target_lang", mapDeepLTarget(input.targetLocale));
  // 自动识别时不传 source_lang，让 DeepL 自己判断，避免把 mixed-language 转写误锁到单一来源语言。
  if (input.sourceLocale && input.sourceLocale !== "auto") {
    form.set("source_lang", input.sourceLocale.toUpperCase());
  }

  const response = await fetch(env.DEEPL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`DeepL 请求失败：${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.translations?.[0]?.text;
  if (!text) throw new Error("DeepL 没有返回翻译文本。");
  return {text, provider: "deepl"};
}

async function translateWithDeepSeekFlash(input: TranslateInput) {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY 未配置。");
  }

  // DeepSeek Flash 是翻译兜底模型，只要求返回译文；这样导出和分享页可以直接复用文本结果。
  const response = await fetch(`${env.DEEPSEEK_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_FLASH_MODEL,
      messages: [
        {role: "system", content: "你是专业翻译引擎，只返回译文，不添加解释。"},
        {role: "user", content: `请翻译为 ${input.targetLocale}：\n\n${input.text}`}
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek 翻译请求失败：${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("DeepSeek 没有返回翻译文本。");
  return {text, provider: `deepseek/${env.DEEPSEEK_FLASH_MODEL}`};
}

export async function translateWithFallback(input: TranslateInput) {
  const errors: string[] = [];
  const providers = [translateWithDeepL, translateWithDeepSeekFlash];

  // 翻译是附加能力，不能因为外部服务不可用阻断转写主流程；全部失败时返回原文并记录错误。
  for (const provider of providers) {
    try {
      return {...(await provider(input)), errors};
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {text: input.text, provider: "local-fallback", errors};
}
