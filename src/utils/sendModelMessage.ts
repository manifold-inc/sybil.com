import type {
  PlaygroundModel,
  PlaygroundTextParameters,
} from "@/app/stores/playground-store";
import { MODEL_SYSTEM_PROMPT, THINKING_MODELS } from "@/constant";
import type { OpenAI } from "openai";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  reasoningCompleted?: boolean;
  placeholder?: boolean;
  error?: boolean;
  canRetry?: boolean;
  originalMessage?: string;
};

type SendMessageParams = {
  client: OpenAI;
  model: PlaygroundModel;
  message: string;
  chat: ChatMessage[];
  textParameters: PlaygroundTextParameters;
  setChat: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
  shouldStop?: () => boolean;
};

function toOpenAIMessages(
  chat: ChatMessage[],
  systemPrompt: string,
  userMessage: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return [
    { role: "system", content: systemPrompt },
    ...chat
      .filter(
        (message): message is ChatMessage =>
          message.role === "user" || message.role === "assistant"
      )
      .map((message) => ({ role: message.role, content: message.content })),
    { role: "user", content: userMessage },
  ];
}

function updateAssistantMessage(
  prev: ChatMessage[],
  assistantMessage: string,
  reasoningCompleted: boolean
) {
  const updatedMessage = [...prev];
  updatedMessage[updatedMessage.length - 1] = {
    role: "assistant",
    content: assistantMessage,
    reasoningCompleted,
  };
  return updatedMessage;
}

export const parseAssistantMessage = (content: string) => {
  const trimmedContent = content.trim();
  if (!trimmedContent) return { thinking: "", answer: "" };

  const thinkStart = trimmedContent.indexOf("<think>");
  if (thinkStart === -1) return { thinking: "", answer: trimmedContent };

  const thinkEnd = trimmedContent.lastIndexOf("</think>");
  if (thinkEnd === -1 || thinkEnd <= thinkStart)
    return {
      thinking: trimmedContent.substring(thinkStart + 7).trim(),
      answer: "",
    };

  const thinking = trimmedContent.substring(thinkStart + 7, thinkEnd).trim();
  const answer = trimmedContent.substring(thinkEnd + 8).trim();
  return { thinking, answer };
};

export async function sendModelMessage({
  client,
  model,
  message,
  chat,
  textParameters,
  setChat,
  shouldStop = () => false,
}: SendMessageParams) {
  const systemPrompt = MODEL_SYSTEM_PROMPT;

  const isThinkingModel = THINKING_MODELS.includes(
    `${model.org}/${model.name}`
  );

  switch (true) {
    case model.supportedEndpoints.includes("CHAT"): {
      const messages = toOpenAIMessages(chat, systemPrompt, message);
      const response = await client.chat.completions.create({
        model: `${model.org}/${model.name}`,
        messages,
        ...textParameters,
      });

      if (textParameters.stream) {
        let assistantMessage = "";

        for await (const event of response as AsyncIterable<{
          choices: { delta?: { content?: string } }[];
        }>) {
          if (shouldStop()) break;
          if (!event.choices[0]?.delta?.content) continue;

          const content = event.choices[0].delta.content;
          assistantMessage += content;

          // don't mark reasoning as completed while streaming
          const reasoningCompleted = false;

          setChat((prev) =>
            updateAssistantMessage(prev, assistantMessage, reasoningCompleted)
          );
        }

        // after streaming is done, mark as completed
        const finalReasoningCompleted = isThinkingModel ? true : false;

        setChat((prev) =>
          updateAssistantMessage(
            prev,
            assistantMessage,
            finalReasoningCompleted
          )
        );
      } else {
        const resp = response as {
          choices: { message?: { content?: string } }[];
        };
        const assistantMessage = resp.choices[0]?.message?.content || "";
        const reasoningCompleted = isThinkingModel ? true : false;

        setChat((prev) =>
          updateAssistantMessage(prev, assistantMessage, reasoningCompleted)
        );
      }
      return;
    }

    case model.supportedEndpoints.includes("COMPLETION"): {
      const prompt = `${systemPrompt}\n\n${message}`;
      const response = await client.completions.create({
        model: `${model.org}/${model.name}`,
        prompt,
        ...textParameters,
      });

      if (textParameters.stream) {
        let assistantMessage = "";

        for await (const event of response as AsyncIterable<{
          choices: { text?: string }[];
        }>) {
          if (shouldStop()) break;
          if (!event.choices[0]?.text) continue;

          const content = event.choices[0].text;
          assistantMessage += content;

          // don't mark reasoning as complete during streaming for thinking models
          const reasoningCompleted = false;

          setChat((prev) =>
            updateAssistantMessage(prev, assistantMessage, reasoningCompleted)
          );
        }

        // after streaming is complete, mark reasoning as complete
        const finalReasoningCompleted = isThinkingModel ? true : false;

        setChat((prev) =>
          updateAssistantMessage(
            prev,
            assistantMessage,
            finalReasoningCompleted
          )
        );
      } else {
        const resp = response as { choices: { text?: string }[] };
        const assistantMessage = resp.choices[0]?.text || "";
        const reasoningCompleted = isThinkingModel ? true : false;

        setChat((prev) =>
          updateAssistantMessage(prev, assistantMessage, reasoningCompleted)
        );
      }
      return;
    }
    default:
      throw new Error("Unsupported model endpoint");
  }
}
