import { ModelChatBubble } from "@/_components/chat/ModelChatBubble";
import { Thinking } from "@/_components/chat/Thinking";
import { parseAssistantMessage } from "@/utils/sendModelMessage";

export const AssistantMessage = ({
  content,
  completed,
  error,
  canRetry,
  originalMessage,
  onRetry,
}: {
  content: string;
  completed: boolean;
  error?: boolean;
  canRetry?: boolean;
  originalMessage?: string;
  onRetry: () => Promise<void>;
}) => {
  const { thinking, answer } = parseAssistantMessage(content);
  return (
    <div className="w-full sm:w-2/3 md:w-[62.5%]">
      <div className="mb-8">
        {thinking && (
          <Thinking content={thinking} completed={completed} stream={true} />
        )}
      </div>
      <div className="space-y-1">
        <ModelChatBubble content={answer} />
        {error && canRetry && originalMessage && (
          <div className="flex justify-start">
            <button
              onClick={() => {
                void onRetry();
              }}
              className=" hover:text-mf-edge-700 text-sm font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
