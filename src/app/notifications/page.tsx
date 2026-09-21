"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Notification } from "@/types/database"
import { NotificationItem } from "@/components/notification-item"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  async function fetchNotifications() {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    setNotifications(data || [])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    const supabase = createClient()
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
  }

  async function markAllAsRead() {
    if (!user) return
    const supabase = createClient()
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)

    setNotifications((prev) =>
      prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n))
    )
  }

  function groupByDate(items: Notification[]) {
    const groups: Record<string, Notification[]> = {}
    for (const n of items) {
      const d = new Date(n.created_at)
      const key = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      if (!groups[key]) groups[key] = []
      groups[key].push(n)
    }
    return groups
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length
  const grouped = groupByDate(notifications)

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">Masuk untuk melihat notifikasi</h3>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Tidak ada notifikasi</h3>
          <p className="text-muted-foreground text-sm">Notifikasi akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {date}
              </p>
              <div className="space-y-1">
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
