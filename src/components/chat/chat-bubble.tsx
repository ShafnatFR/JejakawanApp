"use client"

import { ChatMessage, UserProfile } from "@/types/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground italic bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2 mb-3", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1 shrink-0">
          <AvatarImage src={message.sender?.avatar_url || ""} />
          <AvatarFallback className="text-xs">
            {message.sender?.display_name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <p className="text-xs font-medium text-muted-foreground mb-1 ml-1">
            {message.sender?.display_name || "Anonim"}
          </p>
        )}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          {message.content}
        </div>
        <p className={cn("text-[10px] text-muted-foreground mt-1", isOwn ? "text-right mr-1" : "ml-1")}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
