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

  const { mutate: sendMessage, isPending } = useMutation({
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
              ...newPages[0].messages,
              {
                id: crypto.randomUUID(),
                text: message,
                isUserMessage: true,
                createdAt: new Date().toISOString(),
              },
            ],
          };

          return { ...old, pages: newPages };
        }
      );
      return { previousData };
    },
    onSuccess: async (stream) => {
  if (!stream) {
    toast.error("No response stream received");
    return;
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let accResponse = "";
  const aiMessageId = crypto.randomUUID();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    accResponse += decoder.decode(value);

    utils.getFileMessages.setInfiniteData(
      { fileId, limit: INFINITE_QUERY_LIMIT },
      (old) => {
        if (!old) return old;

        const newPages = [...old.pages];
        const firstPage = newPages[0];

        const aiExists = firstPage.messages.some(
          (m) => m.id === aiMessageId
        );

        firstPage.messages = aiExists
          ? firstPage.messages.map((m) =>
              m.id === aiMessageId ? { ...m, text: accResponse } : m
            )
          : [
              ...firstPage.messages,
              {
                id: aiMessageId,
                text: accResponse,
                isUserMessage: false,
                createdAt: new Date().toISOString(),
              },
            ];

        newPages[0] = { ...firstPage };
        return { ...old, pages: newPages };
      }
    );
  }

  setIsLoading(false);
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
    if (!message.trim()) return;
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
