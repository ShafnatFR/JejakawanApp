"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { MessageCircle, Search, Plus, Users, Shield, Eye, Compass, Map, Trophy, User, Settings, Mail } from "lucide-react"

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
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (user) fetchRooms()
  }, [user])

  async function fetchRooms() {
    if (!user) return
    const supabase = createClient()
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

        const { data: lastMsg } = await supabase
          .from("chat_messages")
          .select("content, created_at")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id)
          .neq("sender_id", user.id)
          .gt("created_at", room.created_at)

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

  const avatarColors = [
    "bg-indigo-100 text-brand-600",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Masuk untuk mengakses chat</h3>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Action & Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pesan & Obrolan</h1>
            <p className="text-sm text-slate-500 mt-0.5">Terhubung dengan kawan perjalanan dan pemandu open trip Anda</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm">
              <Eye className="w-4 h-4 mr-1.5 text-slate-400" />
              Lihat Panduan Baru
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Mulai Chat Baru
            </button>
          </div>
        </div>

        {/* Workspace Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row h-[720px]">
          {/* Column A: Inbox Conversation List */}
          <section className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Cari obrolan atau destinasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-1 mt-3 text-xs font-medium text-slate-600">
                <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md font-semibold ${filter === "all" ? "bg-brand-50 text-brand-600" : "hover:bg-slate-100 text-slate-500"}`}>Semua ({rooms.length})</button>
                <button onClick={() => setFilter("trip_match")} className={`px-3 py-1.5 rounded-md transition ${filter === "trip_match" ? "bg-brand-50 text-brand-600 font-semibold" : "hover:bg-slate-100 text-slate-500"}`}>Trip Match</button>
                <button onClick={() => setFilter("open_trip")} className={`px-3 py-1.5 rounded-md transition ${filter === "open_trip" ? "bg-brand-50 text-brand-600 font-semibold" : "hover:bg-slate-100 text-slate-500"}`}>Open Trip</button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="p-3.5 animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : rooms.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <MessageCircle className="w-14 h-14 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada percakapan</h3>
                    <p className="text-sm text-slate-500 mb-5">Mulai chat dari halaman trip atau match</p>
                    <div className="flex items-center justify-center space-x-3">
                      <a href="/trip-match" className="px-4 py-2 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition">Cari Trip Match</a>
                      <a href="/open-trips" className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">Lihat Katalog Open Trip</a>
                    </div>
                  </div>
                </div>
              ) : (
                rooms.map((room, index) => (
                  <Link key={room.id} href={`/chat/${room.id}`}>
                    <div className={`p-3.5 flex items-start space-x-3 cursor-pointer transition ${index === 0 ? "bg-indigo-50/70 border-l-4 border-brand-600 hover:bg-indigo-50" : "hover:bg-slate-50"}`}>
                      <div className="relative flex-shrink-0">
                        {room.other_members.length === 1 ? (
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${avatarColors[index % avatarColors.length]}`}>
                            {room.other_members[0].display_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                            <Users className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm truncate ${index === 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                            {room.other_members.map((m) => m.display_name).join(", ") || "Chat"}
                          </h3>
                          <span className={`text-xs ${index === 0 ? "text-brand-600 font-semibold" : "text-slate-400"}`}>
                            {formatTime(room.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{room.type || "Chat"}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{room.last_message || "Belum ada pesan"}</p>
                          {room.unread_count > 0 && (
                            <span className="px-1.5 py-0.5 bg-brand-600 text-white rounded-full text-[10px] font-bold">
                              {room.unread_count > 9 ? "9+" : room.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Help Badge */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Server Jejakawan Normal
              </span>
              <a className="text-brand-600 hover:underline" href="#">Bantuan Chat</a>
            </div>
          </section>

          {/* Column B: Empty / Placeholder */}
          <section className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center p-8">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-200" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Pilih percakapan</h3>
              <p className="text-sm text-slate-500">Pilih chat dari daftar untuk mulai mengobrol</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Jejakawan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Jelajahi</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a className="hover:text-brand-600 transition" href="#">Rekomendasi</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Peta</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Open Trip</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Komunitas</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a className="hover:text-brand-600 transition" href="#">Cari Teman</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Misi & Badge</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Profil</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Bantuan</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li><a className="hover:text-brand-600 transition" href="#">Pengaturan</a></li>
                <li><a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">Kontak: halo@jejakawan.id</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 text-center">
            <p className="text-xs text-slate-400">© 2026 Jejakawan. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}