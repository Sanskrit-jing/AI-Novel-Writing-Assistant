import type { LLMProvider } from "@ai-novel/shared/types/llm";

export interface ProviderConfig {
  name: string;
  baseURL: string;
  defaultModel: string;
  models: string[];
  envKey: string;
  maxTokens?: number;
}

export const PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  deepseek: {
    name: "腾讯混元",
    baseURL: "https://api.hunyuan.cloud.tencent.com/v1",
    defaultModel: "hunyuan-lite",
    models: ["hunyuan-lite"],
    envKey: "DEEPSEEK_API_KEY",
    maxTokens: 8192,
  },
  siliconflow: {
    name: "硅基流动",
    baseURL: "https://api.siliconflow.cn/v1",
    defaultModel: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    models: ["deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"],
    envKey: "SILICONFLOW_API_KEY",
  },
  openai: {
    name: "智谱",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4.7-flash",
    models: ["glm-4.7-flash", "GLM-4-Flash-250414"],
    envKey: "OPENAI_API_KEY",
  },
  anthropic: {
    name: "开源路由",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "stepfun/step-3.5-flash:free",
    models: ["stepfun/step-3.5-flash:free"],
    envKey: "ANTHROPIC_API_KEY",
  },
  grok: {
    name: "askcodi",
    baseURL: "https://api.askcodi.com/v1",
    defaultModel: "google/gemini-3-flash:free",
    models: ["google/gemini-3-flash:free", "deepseek/deepseek-v3.2:free"],
    envKey: "XAI_API_KEY",
  },
  // OpenAI-compatible 的厂商：只需要 baseURL / defaultModel / models 配好即可。
  kimi: {
    name: "魔塔",
    baseURL: "https://api-inference.modelscope.cn/v1",
    defaultModel: "deepseek-ai/DeepSeek-R1-0528",
    models: ["deepseek-ai/DeepSeek-R1-0528", "deepseek-ai/DeepSeek-V3.1", "deepseek-ai/DeepSeek-V3.2", "ZhipuAI/GLM-5"],
    envKey: "KIMI_API_KEY",
  },
  glm: {
    name: "longcat",
    baseURL: "https://api.longcat.chat/openai",
    defaultModel: "LongCat-Flash-Lite",
    models: ["LongCat-Flash-Lite"],
    envKey: "GLM_API_KEY",
  },
  qwen: {
    name: "sambanova",
    baseURL: "https://api.sambanova.ai/v1",
    defaultModel: "DeepSeek-R1-0528",
    models: ["DeepSeek-R1-0528", "DeepSeek-R1-Distill-Llama-70B", "DeepSeek-V3-0324", "Deepseek-V3.1", "Meta-Llama-3.3-70B-Instruct", "Meta-Llama-3.1-8B-Instruct"],
    envKey: "QWEN_API_KEY",
  },
  gemini: {
    name: "gpt",
    baseURL: "https://api.chatanywhere.tech/v1",
    defaultModel: "gpt-3.5-turbo",
    models: ["gpt-3.5-turbo"],
    envKey: "GEMINI_API_KEY",
  },
};

export const SUPPORTED_PROVIDERS = Object.keys(PROVIDERS) as LLMProvider[];
