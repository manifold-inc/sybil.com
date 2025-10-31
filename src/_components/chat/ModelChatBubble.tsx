import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const ModelChatBubble = memo(({ content }: { content: string }) => {
  return (
    <div className="flex items-center">
      <div className="w-full markdown-body text-xs lg:text-sm no-scrollbar">
        <ReactMarkdown
          components={{
            code: ({ inline, className, children, ...rest }: CodeProps) => {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...rest}
                >
                  {typeof children === "string"
                    ? children.replace(/\n$/, "")
                    : ""}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

ModelChatBubble.displayName = "ModelChatBubble";
