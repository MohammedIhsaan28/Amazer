"use client";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import { createContext, useRef, useState } from "react";
import { toast } from "sonner";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  fileId: string;
  children: React.ReactNode;
}
export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const backupMessage = useRef("");
  const utils = trpc.useContext();

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");
      setIsLoading(true);

      await utils.getFileMessages.cancel();
      const previousData = utils.getFileMessages.getInfiniteData({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      });

      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  messages: [
                    {
                      id: crypto.randomUUID(),
                      text: message,
                      isUserMessage: true,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  nextCursor: undefined,
                },
              ],
              pageParams: [],
            };
          }

          const newPages = [...old.pages];
          newPages[0] = {
            ...newPages[0],

            messages: [
              {
                id: crypto.randomUUID(),
                text: message,
                isUserMessage: true,
                createdAt: new Date().toISOString(),
              },
              ...newPages[0].messages,
            ],
          };

          return { ...old, pages: newPages };
        }
      );
      return { previousData };
    },
    onSuccess: async (stream) => {
      setMessage("");
      setIsLoading(false);
      if (!stream) {
        return toast.error("Please refresh this page and try again");
      }
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = value ? decoder.decode(value,{stream: true}): '';

        accResponse+= chunkValue;

        // append chunk to the actual message in the cache
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          (old) => {
            if (!old) return { pages: [], pageParams: [] };

            let isAIResponseCreated = old.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response")
            );
            let updatedPages = old.pages.map((page) => {
              if (page === old.pages[0]) {
                let updatedMessages;

                if (!isAIResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }
                    return message;
                  });
                }
                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              return page;
            });

            return {
              ...old,
              pages: updatedPages,
            };
          }
        );
      }

    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      if (context?.previousData) {
        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          context.previousData
        );
      }

      toast.error("Failed to send Message");
    },
    onSettled: async () => {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      });
    },
  });
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };
  const addMessage = () => {
    if (!message.trim()) return toast.error("Are you blind!, you can't send empty messages.");
    sendMessage({ message });
  };

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

