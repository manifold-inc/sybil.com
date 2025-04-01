"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Combobox, Transition } from "@headlessui/react";
import { clsx } from "clsx";
import { Info, Search, X } from "lucide-react";

import { emitCustomEvent, useCustomEvent } from "@/hooks/event";
import { useKeyDown } from "@/hooks/keydown";
import { Locale } from "@/locales";
import { reactClient } from "@/trpc/react";

export default function AskBox(params: {
  query?: string;
  path?: string;
  autofocus?: boolean;
}) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  useCustomEvent("page-already-loaded", () => {
    setShouldAnimate(true);
    setTimeout(() => {
      setShouldAnimate(false);
    }, 400);
  });
  const [query, setQuery] = useState(params.query ?? "");
  const [open, setOpen] = useState(false);
  const comboRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const ac = reactClient.main.autocomplete.useMutation({
    onSuccess: (q) => setAutocomplete(q.slice(0, 6)),
  });

  function onSubmit(query: string) {
    if (!query.trim()) {
      emitCustomEvent({ type: "page-already-loaded" });
      setTimeout(() => {
        setQuery(query);
        setOpen(false);
        setAutocomplete([]);
      }, 1);
      return;
    }
    router.push(`${params.path ?? "/search"}?q=${encodeURIComponent(query)}`);
  }
  const focusRec = useCallback(() => comboRef.current?.focus(), []);
  useKeyDown(focusRec, ["/"]);
  useEffect(() => {
    if (!params.query) return;
    setQuery(params.query);
  }, [params.query]);
  return (
    <div
      className={`w-full ${
        shouldAnimate && "animate-shake animate-duration-300"
      }`}
    >
      <div className="relative w-full">
        <Combobox
          onChange={(q) => {
            setOpen(false);
            void onSubmit(q.query);
          }}
          value={
            { query, option: "search" } as { query: string; option: "search" }
          }
        >
          <div className="relative z-10">
            <div
              className={clsx(
                "z-10 flex h-fit w-full items-center rounded-full py-1.5 pl-2 pr-3.5  transition-colors",
                open && query.length !== 0
                  ? "bg-mf-night-300"
                  : "bg-mf-night-300 shadow-center",
              )}
            >
              <Link
                href="/"
                className="mr-2 flex min-h-8 min-w-8 items-center justify-center rounded-full bg-mf-green-500"
              >
                <img
                  src="/sybil-dark.svg"
                  alt="Sybil"
                  className="h-5 w-5 flex-shrink-0"
                />
              </Link>
              <Combobox.Input
                displayValue={({ query }: { query: string }) => query}
                value={query}
                onKeyDown={(k) =>
                  k.key === "Enter" && !k.shiftKey && void onSubmit(query)
                }
                ref={comboRef}
                autoFocus={params.autofocus}
                className="min-h-7 w-full bg-mf-night-300 text-mf-milk-300 outline-none placeholder:text-mf-milk-700/80"
                placeholder={Locale.Home.SearchInput}
                onFocus={() => {
                  setOpen(true);
                }}
                onBlur={(e) => {
                  setOpen(false);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                  if (query.includes(event.target.value)) {
                    return;
                  }
                  ac.mutate({ query: event.target.value });
                }}
              />
              <div className="relative flex h-full items-center gap-2">
                <div className="group relative">
                  <Info className="h-4 w-4 text-mf-milk-300/60" />
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-mf-ash-500 p-2 text-sm text-mf-milk-300 opacity-0 shadow-center transition-opacity group-hover:opacity-100">
                    Using Targon&apos;s fallback servers until V6 is launched to
                    answer your question.
                  </div>
                </div>
                {query.length > 0 && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setAutocomplete([]);
                      comboRef.current?.focus();
                    }}
                  >
                    <X className="h-4 w-4 text-mf-milk-300" />
                  </button>
                )}
              </div>
            </div>
            <Transition
              show={open && query.length !== 0}
              enter="ease-out duration-300"
              enterFrom="max-h-10"
              enterTo="max-h-80"
              leave="ease-in max-h-10 duration-200"
              leaveFrom="opacity-100 max-h-80"
              leaveTo="opacity-0"
              className={clsx(
                "absolute left-0 right-0 top-0 -z-10 overflow-hidden rounded-3xl bg-mf-night-300 pt-6 shadow-center transition-all",
              )}
            >
              <Combobox.Options
                static
                className="max-h-72 scroll-py-2 overflow-y-auto px-2 py-2 text-mf-milk-300"
              >
                {query !== "" && (
                  <div className="mt-2 w-full">
                    <Combobox.Option
                      value={{ query, option: "search" }}
                      onClick={(e) => {
                        void onSubmit(query);
                        e.preventDefault();
                      }}
                      className={({ active }) =>
                        clsx(
                          active && "bg-mf-night-300 text-mf-milk-300",
                          "flex h-9 w-full cursor-pointer select-none items-center gap-2 overflow-hidden truncate whitespace-nowrap rounded-md px-2 py-2",
                        )
                      }
                    >
                      {({ active }) => (
                        <>
                          <div>
                            <Search
                              className={clsx(
                                active
                                  ? "text-mf-milk-300"
                                  : "text-mf-milk-300",
                                "pointer-events-none w-5",
                              )}
                            />
                          </div>
                          <span className="overflow-hidden truncate whitespace-nowrap">
                            {query}{" "}
                          </span>
                          <span
                            className={clsx(
                              active ? "text-mf-milk-300" : "text-mf-milk-300 ",
                              "whitespace-nowrap",
                            )}
                          >
                            Search
                          </span>
                        </>
                      )}
                    </Combobox.Option>
                    {query.length > 0 &&
                      autocomplete.map((a) => (
                        <Combobox.Option
                          key={a}
                          onClick={(e) => {
                            void onSubmit(a);
                            e.preventDefault();
                          }}
                          value={{ query: a, option: "search" }}
                          className={({ active }) =>
                            clsx(
                              active && "bg-mf-night-300 text-mf-milk-300",
                              "flex h-9 w-full cursor-pointer select-none items-center gap-2 overflow-hidden truncate whitespace-nowrap rounded-md px-2 py-2",
                            )
                          }
                        >
                          {({ active }) => (
                            <>
                              <div>
                                <Search
                                  className={clsx(
                                    active
                                      ? "text-mf-milk-300"
                                      : "text-mf-milk-300",
                                    "pointer-events-none w-5",
                                  )}
                                />
                              </div>
                              <span className="overflow-hidden truncate whitespace-nowrap">
                                {a}{" "}
                              </span>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                  </div>
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>
    </div>
  );
}
