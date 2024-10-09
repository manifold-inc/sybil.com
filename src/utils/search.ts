import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";

import { Path } from "@/constant";
import { SearchSchema } from "@/server/api/main/schema";
import { prettyObject } from "@/utils/format";

type FinishReason = "abort" | "unexpected" | "normal" | "unauthorized";

export function search(
  params: SearchSchema.SearchPayload,
  options: {
    onChunk: (chunk: SearchSchema.SearchResponse) => void;
    onFinished: (reason: FinishReason) => void;
    onError?: (e: Error) => void;
  },
) {
  const chatPayload = {
    method: "POST",
    body: JSON.stringify(params),
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
    context.finishReason = "unexpected"
    options.onFinished(context.finishReason);
  };

  controller.signal.onabort = () => {
    context.finishReason = "abort";
    finish();
  };

  void fetchEventSource(Path.API.Search, {
    ...chatPayload,
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
        } catch { }

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
        return finish();
      }
      const text = msg.data;
      try {
        const json = JSON.parse(text) as unknown;
        const chunk = SearchSchema.SearchResponse.safeParse(json);
        if (!chunk.success) {
          console.log(chunk.error);
          return;
        }
        options.onChunk(chunk.data);
      } catch (e) {
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
