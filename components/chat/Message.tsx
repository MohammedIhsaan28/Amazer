import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import { Icon } from "../icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

interface MessageProps {
  message: ExtendedMessage;
  isNextMessageSamePerson: boolean;
}
export default function Message({
  message,
  isNextMessageSamePerson,
}: MessageProps) {
  return (
    <div
      className={cn("flex items-end", {
        "justify-end": message.isUserMessage,
        "justify-start": !message.isUserMessage,
      })}
    >
      <div
        className={cn(
          "relative flex h-6 w-6 aspect-square items-center justify-center",
          {
            "order-2 bg-cyan-600 rounded-sm ml-2": message.isUserMessage,
            "order-1 bg-zinc-800 rounded-sm mr-2": !message.isUserMessage,
            invisible: isNextMessageSamePerson,
          }
        )}
      >
        {message.isUserMessage ? (
          <Icon.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
        ) : (
          <Icon.logo className="fill-zinc-300 h-3/4 w-3/4" />
        )}
      </div>

      <div
        className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
          "order-1 items-end": message.isUserMessage,
          "order-2 items-start": !message.isUserMessage,
        })}
      >
        <div
          className={cn("px-4 py-2 rounded-lg inline-block", {
            "bg-cyan-600 text-white": message.isUserMessage,
            "bg-gray-200 text-gray-900": !message.isUserMessage,
            "rounded-br-none":
              !isNextMessageSamePerson && message.isUserMessage,
            "rounded-bl-none":
              !isNextMessageSamePerson && !message.isUserMessage,
          })}
        >
          {typeof message.text === "string" ? (
            <div
              className={cn("prose wrap-break-word whitespace-pre-wrap", {
                "text-zinc-50": message.isUserMessage,
                "text-zinc-900": !message.isUserMessage,
              })}
            >
              <ReactMarkdown skipHtml>{message.text}</ReactMarkdown>
            </div>
          ) : (
            message.text
          )}
          <div className="text-xs select-none mt-2 w-full text-right">
            {format(new Date(message.createdAt), "HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
}
