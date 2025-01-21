"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import {
  Bookmark,
  Bot,
  ChevronDown,
  ChevronUp,
  Copy,
  List,
  Loader2,
  Plus,
  RotateCw,
} from "lucide-react";
import { tryCatch } from "rambda";
import { toast } from "sonner";
import { match } from "ts-pattern";

import { Card } from "@/components/cards";
import { Markdown } from "@/components/markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Path } from "@/constant";
import { type ThreadFile } from "@/hooks/file";
import { Locale } from "@/locales";
import { type SourceSchema } from "@/server/api/main/schema";
import { useControllerStore } from "@/store/controller";
import { copyToClipboard } from "@/utils/os";
import { search } from "@/utils/search";
import { type Data } from "./reducer";

export default function ClientPage({
  query,
  followup: _followup,
}: {
  query: string;
  followup?: string;
}) {
  const [data, setData] = useState({
    query: query,
    answer: "",
    sources: [],
    followups: [],
    relatedCards: [],
    finished: false,
  } as Data);

  return (
    <div className="relative box-border flex w-screen px-4">
      <div className="relative w-full max-w-5xl pb-32 pt-4 sm:pl-8 lg:pl-36">
        <Thread data={data} setData={setData} />
      </div>
    </div>
  );
}

function Thread(props: {
  data: Data;
  setData: Dispatch<SetStateAction<Data>>;
}) {
  const router = useRouter();
  const controllerStore = useControllerStore();
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRun = useRef(true);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(
    (payload: { query: string; files: ThreadFile[] }) => {
      setIsLoading(true);

      const validFiles = payload.files
        .filter((v) => v.status === "uploaded")
        .map((v) => v.key);

      let answerText = "";
      const controller = search(
        {
          query: payload.query,
          files: validFiles,
        },
        {
          onChunk(chunk) {
            match(chunk)
              .with({ type: "heroCard" }, (chunk) => {
                props.setData((d) => ({
                  ...d,
                  heroCard: chunk.heroCard,
                }));
              })
              .with({ type: "sources" }, (chunk) => {
                props.setData((d) => ({
                  ...d,
                  sources: chunk.sources,
                }));
              })
              .with({ type: "answer" }, ({ text }) => {
                // #30: trim end `..</s>`
                const UNEXPECTED_TOKENS = [".</s>", "<|im_end|>></s>"];
                UNEXPECTED_TOKENS.forEach((UNEXPECTED_TOKEN) => {
                  if (text.endsWith(UNEXPECTED_TOKEN)) {
                    text = text.slice(
                      0,
                      Math.max(0, text.length - UNEXPECTED_TOKEN.length),
                    );
                  }
                });
                answerText += text;
                props.setData((d) => ({
                  ...d,
                  answer: answerText,
                }));
              })
              .with({ type: "related" }, (chunk) => {
                props.setData((d) => ({
                  ...d,
                  followups: chunk.followups,
                }));
              });
          },
          onFinished(reason) {
            setIsLoading(false);
            controllerStore.stop("query");
            if (reason === "normal") {
              props.setData((d) => ({
                ...d,
                answer: answerText,
                finished: true,
              }));
            }
          },
          onError() {
            setIsLoading(false);
          },
        },
      );

      controllerStore.insert("query", controller);
      controller.signal.addEventListener("abort", () => {
        controllerStore.stop("query");
      });
    },
    [controllerStore, props],
  );

  const retry = useCallback(() => {
    controllerStore.stop("query");
    props.setData((d) => ({ ...d, answer: "" }));
    void doSearch({ query: props.data.query, files: [] });
  }, [doSearch, controllerStore, props]);

  useEffect(() => {
    if (!isFirstRun.current) return;
    isFirstRun.current = false;
    /*
        const cache = localStorage.getItem(`q_${props.data.query}`);
        if (cache?.length) {
          const data = JSON.parse(cache) as Data; // TODO
          props.dispatch({ type: "UPDATE_DATA", data: data });
          return
        }
    */
    void retry();
  }, [retry, props]);

  const loadMoreSources = useMutation({
    mutationFn: (p: number) => {
      return fetch(`${Path.API.Search}/sources`, {
        method: "POST",
        body: JSON.stringify({ query: props.data.query, page: p }),
      });
    },
    onSuccess: async (res: Response) => {
      const newSources = (await res.json()) as SourceSchema.UrlSource[];
      setPage((p) => p + 1);
      props.setData((d) => ({
        ...d,
        sources: props.data.sources?.concat(newSources),
      }));
    },
  });

  let herocard = <Skeleton className="h-16 w-full rounded-md" />;
  if (props.data.heroCard == null && props.data.sources.length > 0) {
    const fs = props.data.sources.at(0)!;
    herocard = (
      <Card
        card={{
          type: "news",
          url: fs.url,
          size: "auto",
          image:
            "https://img.freepik.com/premium-vector/beautiful-colorful-gradient-background_492281-1165.jpg",
          intro: fs.parsed_url.at(1),
          title: fs.title ?? "No descriptions provided.",
          version: 1,
        }}
      />
    );
  }
  if (props.data.heroCard) {
    herocard = <Card card={props.data.heroCard} />;
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="w-full">
        {herocard}
        <AnswerBox
          isLoading={props.data.answer.length === 0 && isLoading}
          answer={props.data.answer ?? ""}
          retry={retry}
        />
        <div className="flex justify-between">
          <ThreadSectionTitle icon={<List />} title={Locale.Thread.Sources} />
        </div>
        <div className="divide-y divide-gray-200 dark:divide-zinc-600">
          {props.data.sources.length === 0 &&
            new Array(4).fill(0).map((_, i) => (
              <div key={i} className="py-4">
                <Skeleton className={`h-4 w-3/4 `} />
                <Skeleton className={`my-2 h-4 w-1/2 `} />
                {/* Add spacing for the description */}
                <Skeleton className={`my-4 h-4 w-5/6`} />
              </div>
            ))}
          {props.data.sources.length !== 0 &&
            new Array(props.data.sources.length + 1).fill(null).map((_, i) => {
              if (i === 4) {
                return (
                  <div
                    key="threads"
                    className="py-5 text-gray-700 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    <ThreadSectionTitle
                      icon={<Bookmark />}
                      title={Locale.Thread.Related}
                    />

                    <div className="space-y-2 pt-3">
                      {props.data.followups?.length
                        ? props.data.followups.map((r, i) => (
                            <button
                              onClick={() => {
                                void router.push(`/search?q=${r}`);
                              }}
                              className="flex w-full justify-between py-1 text-left text-black hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                              key={i}
                            >
                              <span className="line-clamp-1 text-ellipsis text-sm font-semibold">
                                {r}
                              </span>
                              {/* Bold and uniform text */}
                              <Plus className="h-5 w-5" />
                              {/* Appropriately sized plus sign */}
                            </button>
                          ))
                        : new Array(2).fill(0).map((_, i) => (
                            <div key={i} className="py-2">
                              <Skeleton className={`h-4 w-3/4 `} />
                              <Skeleton className={`my-2 h-4 w-1/2 `} />
                              {/* Add spacing for the description */}
                              <Skeleton className={`my-4 h-4 w-5/6`} />
                            </div>
                          ))}
                    </div>
                  </div>
                );
              }
              const s =
                i < 4 ? props.data.sources.at(i) : props.data.sources.at(i - 1);
              if (!s) return;
              const hostname = tryCatch(
                () => new URL(s.url).hostname.replace("www.", ""),
                "",
              )(null);
              return (
                <div className="block py-4" key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center space-x-2 overflow-hidden"
                  >
                    <img
                      onError={(a) =>
                        a.currentTarget.classList.add("opacity-0")
                      }
                      src={`https://s2.googleusercontent.com/s2/favicons?domain=${s.parsed_url[1]}`}
                      alt={""}
                      width={20}
                      height={20}
                    />
                    <div className="w-full">
                      <div className="line-clamp-1 overflow-hidden text-ellipsis font-semibold text-gray-800 group-hover:underline dark:text-zinc-300">
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">
                        {hostname}
                      </div>
                    </div>
                  </a>
                  <div className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">
                    {s.content ?? "No description available."}
                  </div>
                </div>
              );
            })}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => loadMoreSources.mutate(page + 1)}
              disabled={loadMoreSources.isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-70 dark:bg-black dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-900 active:dark:bg-gray-800"
            >
              {loadMoreSources.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Load More ...
            </button>
          </div>
        </div>
      </div>
      <div className="w-full sm:sticky sm:top-16 sm:self-start">
        <div className="grid h-fit w-full grid-cols-2 gap-2 sm:grid-cols-1 md:grid-cols-2">
          {props.data.relatedCards.map((card, i) => (
            <Card
              card={card}
              key={i}
              className="h-[100px] w-full sm:h-[80px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const AnswerBox = ({
  answer,
  isLoading,
  retry,
}: {
  answer: string;
  isLoading: boolean;
  retry: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col pb-2 pt-6 text-sm text-gray-700 dark:border-zinc-700 dark:text-zinc-300">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen((s) => !s)}
          className="flex flex-grow items-center justify-between text-sm"
        >
          <ThreadSectionTitle icon={<Bot />} title={Locale.Thread.Answer} />
          <div className="flex items-center justify-between gap-2 rounded-md">
            {!isOpen ? <ChevronDown /> : <ChevronUp />}
          </div>
        </button>
        <button
          className="mr-2 cursor-pointer rounded-md"
          title={Locale.Thread.Actions.Rewrite}
          onClick={retry}
        >
          <RotateCw />
        </button>

        <button
          title={Locale.Thread.Actions.Copy}
          className="mr-2 cursor-pointer rounded-md"
          onClick={() => {
            void copyToClipboard(answer);
            toast.success("Copied answer to clipboard");
          }}
        >
          <Copy />
        </button>
      </div>
      <div
        className={clsx(
          `flex flex-col gap-2 overflow-hidden transition-[margin]`,
          isOpen ? "mb-0 max-h-full" : "-mb-2 h-28 pb-2",
        )}
        style={{
          maskImage: isOpen
            ? ""
            : "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage: isOpen
            ? ""
            : "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      >
        <Markdown
          isLoading={isLoading}
          content={(answer ?? "") || "No Content."}
          fontSize={22}
        />
      </div>
    </div>
  );
};

function ThreadSectionTitle(props: {
  icon: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`text-md flex items-center font-bold dark:text-zinc-200 ${props.className}`}
    >
      {props.icon}
      <div className="ml-2">{props.title}</div>
    </div>
  );
}
