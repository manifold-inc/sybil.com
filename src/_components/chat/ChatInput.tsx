"use client";

import ModelSelector from "@/_components/ModelSelector";
import type { ChatMessage } from "@/utils/sendModelMessage";
import { Combobox } from "@headlessui/react";
import { clsx } from "clsx";
import { SendHorizontal, Square } from "lucide-react";
import { type KeyboardEvent, useRef } from "react";

interface ChatInputProps {
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  value: string;
  setValue: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  sendDisabled: boolean;
  hasError: boolean;
  onInputChange: () => void;
}

export function ChatInput({
  value,
  setValue,
  onSend,
  onStop,
  sendDisabled,
  hasError,
  onInputChange,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!value.trim()) {
      return;
    }
    if (sendDisabled) {
      onStop();
    } else {
      onSend();
    }
  };

  const handleKeyDown = (k: KeyboardEvent<HTMLInputElement>) => {
    if (k.key === "Enter" && !k.shiftKey) {
      k.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={clsx(
        "w-full transition-all",
        hasError && "animate-shake animate-duration-300"
      )}
    >
      <div className="relative w-full">
        <Combobox
          onChange={() => {
            handleSubmit();
          }}
          value={
            { query: value, option: "chat" } as {
              query: string;
              option: "chat";
            }
          }
        >
          <div className="relative z-10">
            <div
              className={clsx(
                "z-10 flex h-fit w-full items-center rounded-full border py-1.5 pr-3.5 pl-2 transition-colors bg-mf-new-700",
                hasError ? "border-mf-safety-500" : "border-mf-new-500"
              )}
            >
              <ModelSelector />
              <Combobox.Input
                displayValue={({ query }: { query: string }) => query}
                value={value}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                className={clsx(
                  "min-h-7 w-full outline-none bg-mf-new-700",
                  hasError
                    ? "text-mf-milk-300 placeholder:text-red-300/60"
                    : "text-mf-milk-300 placeholder:text-mf-milk-700/80"
                )}
                placeholder="Ask me anything..."
                onBlur={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onChange={(event) => {
                  setValue(event.target.value);
                  onInputChange();
                }}
              />
              <div className="relative flex h-full items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!sendDisabled && value.length === 0}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={sendDisabled ? "Stop generation" : "Send message"}
                  title={sendDisabled ? "Stop generation" : "Send message"}
                >
                  {sendDisabled ? (
                    <Square
                      className="h-5 w-5 text-red-400 transition-colors"
                      fill="currentColor"
                    />
                  ) : (
                    <SendHorizontal
                      className={clsx(
                        "h-5 w-5 transition-colors",
                        value.length === 0
                          ? "text-mf-ash-500"
                          : "text-mf-milk-300"
                      )}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </Combobox>
      </div>
    </div>
  );
}
