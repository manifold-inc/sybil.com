/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import ReactMarkdown from "react-markdown";

import "katex/dist/katex.min.css";

import type { RefObject } from "react";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Copy } from "lucide-react";
import mermaid from "mermaid";
import RehypeHighlight from "rehype-highlight";
import RemarkBreaks from "remark-breaks";
import RemarkGfm from "remark-gfm";
import { useDebouncedCallback } from "use-debounce";

import { copyToClipboard } from "@/utils/os";
import { Skeleton } from "./ui/skeleton";

export function Mermaid(props: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
          suppressErrors: true,
        })
        .catch(() => {
          setHasError(true);
        });
    }
  }, [props.code]);

  if (hasError) {
    return null;
  }

  return (
    <div
      className="no-dark mermaid"
      style={{
        cursor: "pointer",
        overflow: "auto",
      }}
      ref={ref}
    >
      {props.code}
    </div>
  );
}

export function PreCode(props: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState("");

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return 0;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refText]);
  const lang = ref.current
    ?.querySelector("code.hljs")
    ?.className.split(" ")[1]
    ?.split("-")
    .at(1);
  return (
    <>
      {mermaidCode.length > 0 && (
        <Mermaid code={mermaidCode} key={mermaidCode} />
      )}
      <pre ref={ref} className={`hljs relative ${lang ? "pt-6" : ""}`}>
        {lang ? (
          <div className="absolute top-0 left-0 flex w-full justify-between rounded-t-sm bg-gray-700 px-2 py-1 text-xs text-gray-50 capitalize">
            {lang}
            <button
              className="cursor-pointer"
              onClick={() => {
                if (ref.current) {
                  const code = ref.current.innerText;
                  void copyToClipboard(code);
                }
              }}
            >
              <Copy className="z-10 h-4 w-4 text-gray-300" />
            </button>
          </div>
        ) : (
          <button
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => {
              if (ref.current) {
                const code = ref.current.innerText;
                void copyToClipboard(code);
              }
            }}
          >
            <Copy className="z-10 h-4 w-4 text-gray-300" />
          </button>
        )}
        {props.children}
      </pre>
    </>
  );
}

function _MarkDownContent(props: { content: string }) {
  return (
    <div className="relative max-w-full text-justify text-sm">
      <ReactMarkdown
        remarkPlugins={[RemarkGfm, RemarkBreaks]}
        rehypePlugins={[
          [
            RehypeHighlight,
            {
              detect: false,
              ignoreMissing: true,
            },
          ],
        ]}
        components={{
          pre: PreCode,
          p: (pProps) => <p {...pProps} dir="auto" />,
          a: (aProps) => {
            const href = aProps.href ?? "";
            const isInternal = /^\/#/i.test(href);
            const target = isInternal ? "_self" : aProps.target ?? "_blank";
            return <a {...aProps} target={target} />;
          },
        }}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

export function Markdown(
  props: {
    content: string;
    fontSize?: number;
    parentRef?: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
    isLoading: boolean;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={clsx(
        "prose-sm sm:prose-lg text-justify [&_p]:!my-2 [&_p]:!leading-tight",
      )}
      ref={mdRef}
      // eslint-disable-next-line react/prop-types
      onContextMenu={props.onContextMenu}
      // eslint-disable-next-line react/prop-types
      onDoubleClickCapture={props.onDoubleClickCapture}
      dir="auto"
    >
      {props.isLoading ? (
        <div className="mt-2">
          <Skeleton className="mb-2 h-4 w-[50%]" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-[80%]" />
        </div>
      ) : (
        <MarkdownContent content={props.content} />
      )}
    </div>
  );
}
