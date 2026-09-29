"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { ChatMessage } from "@/types/database"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { ChatInput } from "@/components/chat/chat-input"
import { ArrowLeft, Phone, Video, MapPin, MoreVertical, Paperclip, Smile, Mic, Send, Loader2, Shield, Calendar, Users, Mountain, Compass, Sparkles } from "lucide-react"

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !roomId) return
    let channel: ReturnType<typeof supabase.channel> | null = null
    let polling: NodeJS.Timeout | null = null
    const supabase = createClient()

    fetchMessages()

    try {
      channel = supabase
        .channel(`chat:${roomId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
          async (payload) => {
            const newMsg = payload.new as ChatMessage
            const { data: sender } = await supabase
              .from("user_profiles")
              .select("display_name, avatar_url")
              .eq("id", newMsg.sender_id)
              .single()
            setMessages((prev) => [...prev, { ...newMsg, sender: sender || undefined }])
          }
        )
        .subscribe()
    } catch {
      polling = setInterval(fetchMessages, 5000)
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (polling) clearInterval(polling)
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
    setTimeout(async () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.content === content && last?.sender_id === user.id) return prev
        return prev
      })
      await fetchMessages()
    }, 500)
    setSending(false)
  }

  const quickReplies = [
    "Siap, sudah dipacking! 👍",
    "Mau share lokasi sekarang?",
    "Berapa split bill logistik?",
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Masuk untuk mengakses chat</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased">
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[760px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => router.push("/chat")} className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200">
                    ?
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-sm sm:text-base font-semibold text-slate-900 truncate">Chat</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Shield className="w-3 h-3" />
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors" title="Panggilan Suara">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors" title="Panggilan Video">
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-100" title="Rencana Perjalanan">
                <MapPin className="w-3.5 h-3.5" />
                <span>Itinerary</span>
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Opsi Percakapan">
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {/* Date Separator */}
            <div className="flex items-center justify-center my-2">
              <div className="px-3.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500 shadow-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Hari ini
              </div>
            </div>

            {/* Safety Tip */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5 max-w-2xl mx-auto">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p>
                <span className="font-semibold">Tips Keamanan Jejakawan:</span> Selalu simpan kontak darurat dan jangan bagikan dokumen penting perbankan.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Belum ada pesan. Mulai percakapan!
              </div>
            ) : (
              messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} isOwn={msg.sender_id === user.id} />
              ))
            )}

            {/* Typing indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-11 pt-1">
              <span>Mengetik</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Saran:
            </span>
            {quickReplies.map((reply, i) => (
              <button key={i} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 rounded-full text-slate-600 transition-colors border border-slate-200">
                {reply}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.querySelector("input"); if (input?.value) { handleSend(input.value); input.value = ""; } }}>
              <button type="button" className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors" title="Lampirkan File">
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:block" title="Bagikan Lokasi">
                <MapPin className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <input
                  className="w-full bg-slate-50 border border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                  placeholder="Ketik pesan..."
                  type="text"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" title="Emoji">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button type="button" className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors hidden sm:block" title="Pesan Suara">
                <Mic className="w-5 h-5" />
              </button>
              <button type="submit" className="p-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl font-medium shadow-sm transition-all flex items-center justify-center" title="Kirim Pesan">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 pt-10 pb-6 text-sm text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-lg">
                <Compass className="w-5 h-5" />
                <span>Jejakawan</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">Jelajahi</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Rekomendasi</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Peta</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Open Trip</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">Komunitas</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Cari Teman</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Misi & Badge</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Profil</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">Bantuan</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Pengaturan</a></li>
                <li><a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">Kontak: halo@jejakawan.id</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}