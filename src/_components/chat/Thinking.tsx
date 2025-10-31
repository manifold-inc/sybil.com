import { useEffect, useMemo, useRef, useState } from "react";

export const Thinking = ({
  content,
  completed = false,
  stream: _stream,
}: {
  content: string;
  completed: boolean;
  stream: boolean;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousCompletedContentRef = useRef<string>("");
  const [userCollapsed, setUserCollapsed] = useState<boolean>(false);

  const isCollapsed = userCollapsed && completed;

  const { completedContent, activeLineExists } = useMemo(() => {
    if (!content) return { completedContent: "", activeLineExists: false };

    if (completed) {
      return { completedContent: content, activeLineExists: false };
    }

    const allWords = content.split(/\s+/).filter((word) => word.trim());
    const countableWords = allWords.filter((word) => word !== "</think>");

    if (countableWords.length <= 13) {
      return { completedContent: "", activeLineExists: true };
    }

    const completedWords = allWords.slice(0, -13);
    const completedText = completedWords.join(" ");

    const formattedText = completedText
      .replace(/([.!?])\s+/g, "$1\n")
      .replace(/,\s+/g, ", ")
      .trim();

    return {
      completedContent: formattedText,
      activeLineExists: allWords.length > completedWords.length,
    };
  }, [content, completed]);

  useEffect(() => {
    if (
      contentRef.current &&
      completedContent &&
      completedContent !== previousCompletedContentRef.current &&
      completedContent.length > previousCompletedContentRef.current.length
    ) {
      const container = contentRef.current;
      const currentScrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      const lineHeight = 24;
      const scrollAmount = lineHeight * 0.8;
      const newScrollTop = Math.min(
        currentScrollTop + scrollAmount,
        scrollHeight - clientHeight
      );

      container.scrollTo({
        top: newScrollTop,
        behavior: "smooth",
      });

      previousCompletedContentRef.current = completedContent;
    }
  }, [completedContent]);

  const hasCompletedContent =
    completedContent && completedContent.trim().length > 0;
  const isThinking = (hasCompletedContent || activeLineExists) && !completed;

  if (!content && !isThinking) return null;

  return (
    <div className="w-full rounded-xl bg-mf-noir-300/50 flex flex-col relative z-2 overflow-hidden border border-mf-metal-300">
      {/* Header */}
      <div
        className="flex items-center justify-between py-3 px-4 cursor-pointer"
        onClick={() => setUserCollapsed(!userCollapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs lg:text-sm">
            {completed ? "Completed!" : "Thinking"}
          </span>
          {/* Loading circle or check icon */}
          {completed ? (
            <svg
              className="w-4 h-4 text-mf-edge-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-mf-edge-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-mf-edge-400 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Collapsible content with smooth minimization animation */}
      <div
        className={`px-3 relative transition-all duration-500 ease-in-out overflow-hidden ${
          isCollapsed ? "max-h-0 pb-0 opacity-0" : "max-h-20 pb-4 opacity-100"
        }`}
      >
        <div
          ref={contentRef}
          className="h-12 overflow-y-auto overflow-x-hidden relative"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {hasCompletedContent ? (
            <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-line relative z-10">
              {completedContent}
            </p>
          ) : (
            <p className="text-xs lg:text-sm italic relative z-10">
              {isThinking ? "Thinking..." : "Waiting for thinking to begin..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
