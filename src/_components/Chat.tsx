"use client";

import { AssistantMessage } from "@/_components/chat/AssistantMessage";
import { ChatInput } from "@/_components/chat/ChatInput";
import { MobileParametersSideBar } from "@/_components/chat/MobileParametersSideBar";
import { PlaygroundParameters } from "@/_components/chat/PlaygroundParameters";
import { Thinking } from "@/_components/chat/Thinking";
import { UserChatBubble } from "@/_components/chat/UserChatBubble";
import { useAuth } from "@/_components/providers";
import { showTargonToast } from "@/_components/TargonToast";
import usePlaygroundStore from "@/app/stores/playground-store";
import type { GetModalityModels } from "@/constant";
import { env } from "@/env.mjs";
import { api } from "@/trpc/react";
import { type ChatMessage, sendModelMessage } from "@/utils/sendModelMessage";
import { SettingsIcon } from "lucide-react";
import Image from "next/image";
import { OpenAI } from "openai";
import { useCallback, useRef, useState } from "react";

const TIMEOUT_DURATION = 180000;

export function Chat() {
  const auth = useAuth();
  const utils = api.useUtils();
  const { model, textParameters, setModel } = usePlaygroundStore();
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSuccessfulResponse, setHasSuccessfulResponse] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [isParametersOpen, setIsParametersOpen] = useState(false);

  const currentModelRef = useRef<GetModalityModels | null>(model);
  const currentChatRef = useRef<ChatMessage[]>(chat);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const stopFlagRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: availableModels } = api.model.getByModality.useQuery({
    modality: "text-to-text",
  });

  const hasSetDefaultModel = useRef(false);
  if (
    !hasSetDefaultModel.current &&
    !model.name &&
    availableModels &&
    availableModels.length > 0
  ) {
    const defaultModel = availableModels[0];
    if (defaultModel) {
      const newModel: GetModalityModels = {
        id: defaultModel.id,
        name: defaultModel.name ?? "",
        description: defaultModel.description ?? "",
        modality: defaultModel.modality,
        supportedEndpoints: defaultModel.supportedEndpoints,
        enabled: defaultModel.enabled,
        allowedUserId: defaultModel.allowedUserId,
      };
      setModel(newModel);
      hasSetDefaultModel.current = true;
    }
  }

  if (model.name) {
    hasSetDefaultModel.current = true;
  }

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 0);
  }, []);

  const setErrorMessage = (errorMessage: string, originalMessage: string) => {
    setChat((prev) => {
      const updatedMessages: ChatMessage[] = [...prev];
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: errorMessage,
          reasoningCompleted: false,
          error: true,
          canRetry: true,
          originalMessage,
        };
      }

      return updatedMessages;
    });
    scrollToBottom();
  };

  const initializeChat = useCallback(
    (message: string): ChatMessage[] => {
      const userMessage: ChatMessage = { role: "user", content: message };
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        reasoningCompleted: false,
        ...(textParameters.stream ? {} : { placeholder: true }),
      };

      setChat((prev) => [...prev, userMessage, assistantMessage]);

      return [
        ...chat,
        { role: "user", content: message },
        { role: "assistant", content: "" },
      ];
    },
    [chat, textParameters.stream]
  );

  const stopResponse = useCallback(() => {
    stopFlagRef.current = true;
    clearCurrentTimeout();
  }, [clearCurrentTimeout]);

  if (currentModelRef.current !== model) {
    currentModelRef.current = model;
    setChat([]);
    setHasSuccessfulResponse(false);
    clearCurrentTimeout();
  }

  if (currentChatRef.current !== chat && chatContainerRef.current) {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }

  const {
    data: mostRecentKey,
    isLoading: isLoadingKey,
    error: keyError,
  } = api.apiKey.getLatestApiKey.useQuery(undefined, {
    enabled: auth.status === "AUTHED",
  });

  const sendMessage = async (message: string) => {
    if (auth.status === "UNAUTHED") {
      setInputError(false);
      setTimeout(() => setInputError(true), 10);

      showTargonToast("Please Log In to continue", "Log In", "/sign-in");
      return;
    }

    if (!model.name || model.supportedEndpoints.length === 0) {
      setInputError(false);
      setTimeout(() => setInputError(true), 10);

      showTargonToast("Please select a model to continue");
      return;
    }

    let apiKey = mostRecentKey;
    if (isLoadingKey || !apiKey) {
      try {
        apiKey = await utils.apiKey.getLatestApiKey.ensureData();
      } catch {
        if (keyError) {
          showTargonToast("Error loading API keys: " + keyError.message);
        } else {
          showTargonToast("Failed to load API key. Please try again.");
        }
        return;
      }
    }

    if (!apiKey) {
      showTargonToast(
        "No API key found. Please add an API key in settings.",
        "Settings",
        "/settings"
      );
      return;
    }

    const messageClient = new OpenAI({
      baseURL: env.NEXT_PUBLIC_CHAT_API + "/v1",
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    setIsLoading(true);
    stopFlagRef.current = false;

    const updatedChat = initializeChat(message);

    timeoutRef.current = setTimeout(() => {
      if (!stopFlagRef.current) {
        stopFlagRef.current = true;
        setIsLoading(false);
        setErrorMessage(
          "Request timed out after 3 minutes. The server may be experiencing high load.",
          message
        );
      }
    }, TIMEOUT_DURATION);

    const setChatWithSuccessTracking = (
      updateFn: (prev: ChatMessage[]) => ChatMessage[]
    ) => {
      if (!hasSuccessfulResponse) {
        setHasSuccessfulResponse(true);
      }
      setChat(updateFn);
    };

    try {
      await sendModelMessage({
        client: messageClient,
        model,
        message,
        chat: updatedChat,
        textParameters,
        setChat: setChatWithSuccessTracking,
        shouldStop: () => stopFlagRef.current,
      });
    } catch (error) {
      setInput(message);
      setInputError(false);
      setTimeout(() => setInputError(true), 10);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while processing your request.";

      const isInsufficientCredits = errorMessage
        .toLowerCase()
        .includes("insufficient credits");

      if (isInsufficientCredits) {
        showTargonToast("Out of credits", "Purchase", "/settings/billing");
      } else {
        showTargonToast(errorMessage);
      }
    } finally {
      clearCurrentTimeout();
      setIsLoading(false);
    }
  };

  const isEmptyChat = chat.length === 0 || !hasSuccessfulResponse;

  return (
    <div className="rounded-sm flex flex-col w-full justify-center">
      {isEmptyChat ? (
        <div className="h-2/6 w-[80%] max-w-2xl mx-auto">
          <div className="flex justify-center pb-8">
            <Image
              src="/sybil-text.svg"
              alt="Sybil"
              width={80}
              height={50}
              priority
            />
          </div>
          <div className="flex flex-row gap-1 px-2 justify-center items-center w-full lg:text-md text-sm py-7">
            <div className="w-full">
              <ChatInput
                setChat={setChat}
                value={input}
                setValue={setInput}
                onSend={() => {
                  void sendMessage(input);
                  setInput("");
                }}
                onStop={stopResponse}
                sendDisabled={isLoading}
                hasError={inputError}
                onInputChange={() => setInputError(false)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-15rem)]">
          <div
            className="px-4 py-6 lg:py-10 flex-1 h-full overflow-y-auto no-scrollbar"
            ref={chatContainerRef}
          >
            <div className="flex flex-col sm:gap-4">
              {chat.map((msg, idx) =>
                msg.role === "user" ? (
                  <div
                    className="flex w-full break-words mb-6 justify-end sm:justify-center"
                    key={idx}
                  >
                    <div className="w-full sm:w-[62.5%] flex justify-end">
                      <UserChatBubble content={msg.content} />
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex w-full break-words mb-4 sm:mb-6 justify-start sm:justify-center"
                    key={idx}
                  >
                    {msg.placeholder ? (
                      <div className="w-full sm:w-2/3 md:w-1/2">
                        <Thinking content="" completed={false} stream={false} />
                      </div>
                    ) : (
                      <AssistantMessage
                        content={msg.content}
                        completed={msg.reasoningCompleted ?? false}
                        error={msg.error}
                        canRetry={msg.canRetry}
                        originalMessage={msg.originalMessage}
                        onRetry={async () => {
                          setChat((prev) => prev.slice(0, -1));
                          await sendMessage(msg.originalMessage ?? "");
                        }}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex flex-row gap-1 px-2 sm:px-0 sm:w-2/3 justify-center items-center w-full max-w-6xl lg:text-md text-sm mx-auto">
            <div className="w-full">
              <ChatInput
                setChat={setChat}
                value={input}
                setValue={setInput}
                onSend={() => {
                  void sendMessage(input);
                  setInput("");
                }}
                onStop={stopResponse}
                sendDisabled={isLoading}
                hasError={inputError}
                onInputChange={() => setInputError(false)}
              />
            </div>
            <div className="relative" tabIndex={-1}>
              <button
                className="min-w-11.5 min-h-11.5 rounded-full  bg-mf-new-700 flex items-center justify-center cursor-pointer border border-mf-new-500"
                onClick={() => setIsParametersOpen(!isParametersOpen)}
                aria-label="Playground Parameters"
                title="Playground Parameters"
              >
                <SettingsIcon className="w-5 h-5 text-mf-milk-300" />
              </button>
              {isParametersOpen && (
                <>
                  <div className="absolute left-full bottom-full mb-1 ml-4 z-50 hidden sm:block">
                    <div className="h-full w-full min-h-[20rem] bg-[#19181B] overflow-y-auto no-scrollbar max-h-[70vh] rounded-sm">
                      <PlaygroundParameters
                        closeSidebar={() => setIsParametersOpen(false)}
                      />
                    </div>
                  </div>
                  <div className="block sm:hidden h-full">
                    <MobileParametersSideBar
                      isOpen={isParametersOpen}
                      onClose={() => setIsParametersOpen(false)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
