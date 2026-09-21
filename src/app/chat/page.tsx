"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatRoomWithMeta {
  id: string
  type: string
  trip_group_id: string | null
  created_at: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  other_members: { display_name: string; avatar_url: string | null }[]
}

export default function ChatListPage() {
  const { user } = useAuthStore()
  const [rooms, setRooms] = useState<ChatRoomWithMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchRooms()
  }, [user])

  async function fetchRooms() {
    if (!user) return
    const supabase = createClient()

    // Get rooms the user is a member of
    const { data: memberships } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", user.id)

    if (!memberships || memberships.length === 0) {
      setRooms([])
      setLoading(false)
      return
    }

    const roomIds = memberships.map((m) => m.room_id)

    const { data: chatRooms } = await supabase
      .from("chat_rooms")
      .select("*")
      .in("id", roomIds)
      .order("created_at", { ascending: false })

    if (!chatRooms) {
      setRooms([])
      setLoading(false)
      return
    }

    const enriched: ChatRoomWithMeta[] = await Promise.all(
      chatRooms.map(async (room) => {
        // Get other members
        const { data: members } = await supabase
          .from("chat_room_members")
          .select("user_id")
          .eq("room_id", room.id)
          .neq("user_id", user.id)

        const otherUserIds = members?.map((m) => m.user_id) || []
        let otherMembers: { display_name: string; avatar_url: string | null }[] = []

        if (otherUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("display_name, avatar_url")
            .in("id", otherUserIds.slice(0, 5))
          otherMembers = profiles || []
        }

        // Get last message
        const { data: lastMsg } = await supabase
          .from("chat_messages")
          .select("content, created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        // Unread count (messages after last read or all if never read)
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id)
          .neq("sender_id", user.id)
          .gt("created_at", room.created_at) // simplified: count all messages not from user

        return {
          ...room,
          last_message: lastMsg?.content || null,
          last_message_at: lastMsg?.created_at || null,
          unread_count: count || 0,
          other_members: otherMembers,
        }
      })
    )

    setRooms(enriched)
    setLoading(false)
  }

  function formatTime(dateStr: string | null) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">Masuk untuk mengakses chat</h3>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Pesan</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Belum ada percakapan</h3>
          <p className="text-muted-foreground text-sm">Mulai chat dari halaman trip atau match</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="relative">
                    {room.other_members.length === 1 ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={room.other_members[0].avatar_url || ""} />
                        <AvatarFallback>
                          {room.other_members[0].display_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    {room.unread_count > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        {room.unread_count > 9 ? "9+" : room.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {room.other_members.map((m) => m.display_name).join(", ") || "Chat"}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(room.last_message_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {room.last_message || "Belum ada pesan"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
