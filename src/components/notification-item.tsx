"use client"

import { Notification } from "@/types/database"
import { cn } from "@/lib/utils"
import { Bell, MessageCircle, MapPin, Star, Award, Info } from "lucide-react"

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

function getRelativeTime(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return "Baru saja"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} hari lalu`
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function getIcon(type: string) {
  switch (type) {
    case "match": return <MapPin className="h-4 w-4" />
    case "trip": return <MapPin className="h-4 w-4" />
    case "review": return <Star className="h-4 w-4" />
    case "badge": return <Award className="h-4 w-4" />
    case "chat": return <MessageCircle className="h-4 w-4" />
    default: return <Info className="h-4 w-4" />
  }
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const isUnread = !notification.read_at

  function handleClick() {
    if (isUnread) {
      onMarkRead(notification.id)
    }
    if (notification.data?.link) {
      window.location.href = notification.data.link
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted"
      )}
    >
      <div className={cn(
        "mt-0.5 p-2 rounded-full shrink-0",
        isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", isUnread ? "font-semibold" : "font-medium")}>
            {notification.title}
          </p>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
          )}
        </div>
        {notification.body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">{getRelativeTime(notification.created_at)}</p>
      </div>
    </div>
  )
}
