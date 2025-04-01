"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import {
  Bookmark,
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
import ModelSelector from "src/app/_components/ModelSelector";
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
    <div className="relative box-border flex">
      <div className="relative w-full px-4 pb-32 pt-8 sm:px-8 lg:px-36">
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
  const query = useSearchParams();

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
      <div className="flex flex-row gap-4">
        <Link
          href={`/search?q=${encodeURIComponent(query.get("q") ?? "")}`}
          className="after:dark:bg-white relative px-0.5 text-mf-green-500 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:bg-mf-green-500"
        >
          General
        </Link>
        <Link
          href={`/images?q=${encodeURIComponent(query.get("q") ?? "")}`}
          className="relative px-0.5"
        >
          Images
        </Link>
      </div>
      <div className="w-full">
        {herocard}
        <div className="pt-4 sm:pt-6" />
        <AnswerBox
          isLoading={props.data.answer.length === 0 && isLoading}
          answer={props.data.answer ?? ""}
          retry={retry}
        />
        <div className="flex justify-between pt-6">
          <ThreadSectionTitle icon={<List />} title={Locale.Thread.Sources} />
        </div>
        <div className="divide-gray-200 divide-y dark:divide-mf-ash-300">
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
                    className="text-gray-700 dark:border-zinc-700 dark:text-zinc-300 py-5"
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
                              className="text-black hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-300 flex w-full justify-between py-1 text-left"
                              key={i}
                            >
                              <span className="line-clamp-1 text-ellipsis  font-semibold">
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
                      <div className="text-gray-800 dark:text-zinc-300 line-clamp-1 overflow-hidden text-ellipsis font-semibold group-hover:underline">
                        {s.title}
                      </div>
                      <div className="text-gray-500 dark:text-zinc-400 text-xs">
                        {hostname}
                      </div>
                    </div>
                  </a>
                  <div className="text-gray-500 dark:text-zinc-400  mt-2 line-clamp-2">
                    {s.content ?? "No description available."}
                  </div>
                </div>
              );
            })}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => loadMoreSources.mutate(page + 1)}
              disabled={loadMoreSources.isLoading}
              className="inline-flex items-center gap-2 px-2.5 py-1 font-semibold text-mf-milk-300"
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

function AnswerBox({
  answer,
  isLoading,
  retry,
}: {
  answer: string;
  isLoading: boolean;
  retry: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopy = () => {
    void copyToClipboard(answer);
    setIsCopying(true);
    toast("Copied answer to clipboard", {
      className: "bg-mf-ash-300 text-mf-milk-700 border-none",
    });
    setTimeout(() => setIsCopying(false), 3000);
  };

  return (
    <div
      className={clsx(
        "text-gray-700 dark:border-zinc-700 dark:text-zinc-300 flex flex-col rounded-md bg-mf-ash-300 p-4 pt-2 sm:p-6",
        isCopying ? "inset-0 ring-2 ring-mf-green-500" : "border-0",
      )}
    >
      <div className="flex items-center gap-2">
        <ThreadSectionTitle
          icon={<Image src="/sybil.svg" alt="SYBIL" width={16} height={16} />}
          title={Locale.Thread.Answer}
        />
        <div className="z-20 block -translate-x-4 sm:hidden sm:translate-x-0">
          <ModelSelector search={true} />
        </div>
        <div className="z-20 hidden -translate-x-4 sm:block sm:translate-x-0">
          <ModelSelector search={false} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center justify-end gap-2 rounded-md">
            <button
              onClick={() => setIsOpen((s) => !s)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center justify-between gap-2 rounded-md">
                {!isOpen ? (
                  <ChevronDown className="h-4 w-4 sm:h-6 sm:w-6" />
                ) : (
                  <ChevronUp className="h-4 w-4 sm:h-6 sm:w-6" />
                )}
              </div>
            </button>
            <button
              className="mr-2 cursor-pointer rounded-md"
              title={Locale.Thread.Actions.Rewrite}
              onClick={retry}
            >
              <RotateCw className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>

            <button
              title={Locale.Thread.Actions.Copy}
              className={clsx("mr-2 cursor-pointer rounded-md")}
              onClick={handleCopy}
            >
              <Copy
                className={clsx(
                  "h-4 w-4 sm:h-6 sm:w-6",
                  isCopying && "text-mf-green-500",
                )}
              />
            </button>
          </div>
        </div>
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
}

function ThreadSectionTitle(props: {
  icon: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`text-md dark:text-zinc-200 flex items-center font-bold ${props.className}`}
    >
      {props.icon}
      <div className="ml-2">{props.title}</div>
    </div>
  );
}
