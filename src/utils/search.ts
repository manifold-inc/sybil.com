import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";

import { Path } from "@/constant";
import type { SearchSchema } from "@/server/api/schema";
import { prettyObject } from "@/utils/format";

type FinishReason = "abort" | "unexpected" | "normal" | "unauthorized";

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string | null;
      tool_calls?: null;
    };
    logprobs: null;
    finish_reason: string | null;
    matched_stop: null;
  }[];
  usage: null;
}

export function search(
  params: SearchSchema.SearchPayload,
  options: {
    onChunk: (chunk: SearchSchema.SearchResponse) => void;
    onFinished: (reason: FinishReason) => void;
    onError?: (e: Error) => void;
  },
) {
  const chatPayload = {
    model: params.model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI search assistant. Provide comprehensive, accurate answers based on the user's query.",
      },
      {
        role: "user",
        content: params.query,
      },
    ],
    temperature: 0.7,
    stream: true,
  };

  const context = {
    responseText: "",
    finished: false,
    finishReason: "normal" as FinishReason,
  };

  const controller = new AbortController();

  const finish = () => {
    if (context.finished) return;
    context.finished = true;
    options.onFinished(context.finishReason);
  };

  controller.signal.onabort = () => {
    context.finishReason = "abort";
    finish();
  };

  const chatApiUrl = Path.API.ChatCompletions;
  if (!chatApiUrl) {
    throw new Error(
      "NEXT_PUBLIC_CHAT_API environment variable is not configured",
    );
  }

  void fetchEventSource(chatApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Path.API.ApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatPayload),
    signal: controller.signal,
    async onopen(res) {
      if (
        !res.ok ||
        !res.headers.get("content-type")?.startsWith(EventStreamContentType) ||
        res.status !== 200
      ) {
        const responseTexts = [context.responseText];
        let extraInfo = await res.clone().text();
        try {
          const resJson = (await res.clone().json()) as object;
          extraInfo = prettyObject(resJson);
        } catch {
          // Ignore JSON parsing errors
        }

        if (extraInfo) {
          responseTexts.push(extraInfo);
        }

        context.responseText = responseTexts.join("\n\n");
        context.finishReason = "unexpected";
        options.onChunk({
          type: "answer",
          text: context.responseText,
          finished: true,
        });

        return finish();
      }
    },
    onmessage(msg) {
      if (msg.data === "[DONE]" || context.finished) {
        context.finishReason = "normal";
        return finish();
      }
      const text = msg.data;
      try {
        const json = JSON.parse(text) as OpenAIStreamChunk;

        const content = json.choices[0]?.delta?.content;

        if (content) {
          options.onChunk({
            type: "answer",
            text: content,
            finished: false,
          });
        }

        if (json.choices[0]?.finish_reason) {
          context.finishReason = "normal";
          finish();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error parsing SSE chunk:", e);
        context.finishReason = "unexpected";
      }
    },
    onclose() {
      finish();
    },
    onerror(e) {
      options.onError?.(e as Error);
    },
    openWhenHidden: true,
  });

  return controller;
}
