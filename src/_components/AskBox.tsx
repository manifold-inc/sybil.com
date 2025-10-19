"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Combobox } from "@headlessui/react";
import { clsx } from "clsx";
import { Search } from "lucide-react";

import ModelSelector from "@/_components/ModelSelector";
import { emitCustomEvent, useCustomEvent } from "@/hooks/event";
import { useKeyDown } from "@/hooks/keydown";
import { Locale } from "@/locales";

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
  const comboRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onSubmit(query: string) {
    if (!query.trim()) {
      emitCustomEvent({ type: "page-already-loaded" });
      setTimeout(() => {
        setQuery(query);
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
            void onSubmit(q.query);
          }}
          value={
            { query, option: "search" } as { query: string; option: "search" }
          }
        >
          <div className="relative z-10">
            <div
              className={clsx(
                "z-10 flex h-fit w-full items-center rounded-full border border-mf-new-500 bg-mf-new-700 py-1.5 pl-2 pr-3.5 transition-colors",
              )}
            >
              <ModelSelector />
              <Combobox.Input
                displayValue={({ query }: { query: string }) => query}
                value={query}
                onKeyDown={(k) =>
                  k.key === "Enter" && !k.shiftKey && void onSubmit(query)
                }
                ref={comboRef}
                autoFocus={params.autofocus}
                className="min-h-7 w-full bg-mf-new-700 text-mf-milk-300 outline-none placeholder:text-mf-milk-700/80"
                placeholder={Locale.Home.SearchInput}
                onBlur={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (query.includes(event.target.value)) {
                    return;
                  }
                }}
                onSubmit={() => {
                  void onSubmit(query);
                }}
              />
              <div className="relative flex h-full items-center gap-2">
                <button
                  onClick={() => {
                    void onSubmit(query);
                  }}
                  disabled={query.length === 0}
                >
                  <Search
                    className={clsx(
                      "h-5 w-5 transition-colors",
                      query.length === 0
                        ? "text-mf-ash-500"
                        : "text-mf-milk-300",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </Combobox>
      </div>
    </div>
  );
}
