"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { ChatMessage } from "@/types/database"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { ChatInput } from "@/components/chat/chat-input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user && roomId) {
      fetchMessages()
      setupRealtimeOrPolling()
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [user, roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchMessages() {
    const supabase = createClient()
    const { data } = await supabase
      .from("chat_messages")
      .select("*, sender:user_profiles!sender_id(display_name, avatar_url)")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200)

    setMessages(data || [])
    setLoading(false)
  }

  function setupRealtimeOrPolling() {
    const supabase = createClient()
    try {
      const channel = supabase
        .channel(`chat:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            const newMsg = payload.new as ChatMessage
            // Fetch sender info
            const { data: sender } = await supabase
              .from("user_profiles")
              .select("display_name, avatar_url")
              .eq("id", newMsg.sender_id)
              .single()

            setMessages((prev) => [
              ...prev,
              { ...newMsg, sender: sender || undefined },
            ])
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch {
      // Fallback to polling
      pollingRef.current = setInterval(fetchMessages, 3000)
    }
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  async function handleSend(content: string) {
    if (!user) return
    setSending(true)
    const supabase = createClient()
    await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      type: "text",
    })
    // If realtime didn't add it, fetch manually
    setTimeout(async () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.content === content && last?.sender_id === user.id) return prev
        return prev // realtime handled it
      })
      // Refresh in case realtime missed
      await fetchMessages()
    }, 500)
    setSending(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Masuk untuk mengakses chat</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold">Chat</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Belum ada pesan. Mulai percakapan!
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_id === user.id} />
          ))
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  )
}
