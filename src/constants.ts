export const CREDIT_PER_DOLLAR = 100_000_000 as number;

export const MODEL_SYSTEM_PROMPT_TOKENS = 100;

// models that support reasoning
export const THINKING_MODELS = ["deepseek-ai/DeepSeek-R1"];

// system prompt for reasoning
export const REASONING_SYSTEM_PROMPT = `
  - Please reason for only two to three sentences.
  `;

// system prompt for models that do not support reasoning
export const MODEL_SYSTEM_PROMPT = `
  You are a helpful and knowledgeable AI assistant.

  Important Rules:
  - Do not include any reasoning in your response.
  - Do not include the </think> tag in your response.
  - Do not include HTML, JSX, or code unless the user specifically asks for it.
  - Always respond in English.
  - Format your response using Markdown if appropriate.
  `;

export type GetModalityModels = {
  id: number;
  name: string | null;
  description: string | null;
  modality: "text-to-text" | "text-to-image";
  supportedEndpoints: string[];
  enabled: boolean;
  allowedUserId: number | null;
};
