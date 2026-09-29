"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Notification } from "@/types/database"
import { NotificationItem } from "@/components/notification-item"
import { Bell, CheckCheck, ChevronRight, Search, MessageCircle, Settings, User, Compass, Map, Trophy, Shield, Star, Clock, Ticket, TrendingUp, Zap } from "lucide-react"

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

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
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      let key: string
      if (diffDays === 0) key = "Hari Ini"
      else if (diffDays === 1) key = "Kemarin"
      else if (diffDays <= 7) key = "Minggu Ini"
      else key = "Sebelumnya"
      if (!groups[key]) groups[key] = []
      groups[key].push(n)
    }
    return groups
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length
  const grouped = groupByDate(notifications)

  const filters = [
    { key: "all", label: "Semua", count: notifications.length },
    { key: "trip_match", label: "Trip Match", count: 3 },
    { key: "booking", label: "Open Trip & Booking", count: 2 },
    { key: "gamification", label: "Gamifikasi & XP", count: 2 },
    { key: "system", label: "Sistem & Keamanan", count: 0 },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Masuk untuk melihat notifikasi</h3>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <section className="mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <a className="hover:text-brand-600 transition" href="#">Beranda</a>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-medium">Notifikasi</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Notifikasi</h1>
              <p className="text-sm text-slate-500 mt-1">Pantau aktivitas trip, kecocokan teman jalan, misi gamifikasi, dan update akunmu.</p>
            </div>
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                >
                  <CheckCheck className="w-4 h-4 text-brand-600" />
                  Tandai Semua Dibaca
                </button>
              )}
              <button className="inline-flex items-center gap-1.5 p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-sm" title="Preferensi Notifikasi">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === f.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeFilter === f.key ? "bg-white/20" : f.key === "trip_match" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded text-brand-600 border-slate-300 focus:ring-brand-500 w-4 h-4 cursor-pointer"
            />
            <span>Belum Dibaca Saja</span>
          </label>
        </div>

        {/* Notification Feed */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <Bell className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Tidak ada notifikasi</h3>
              <p className="text-sm text-slate-500 mb-6">Notifikasi akan muncul di sini ketika ada kecocokan trip, pembaruan booking, atau pesan baru.</p>
              <a className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-sm" href="/explore">
                <Search className="w-4 h-4" />
                Jelajahi Destinasi & Cari Teman
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <section key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">{date}</h2>
                  {date === "Hari Ini" && <span className="text-xs text-slate-400 font-medium">{items.filter(n => !n.read_at).length} Notifikasi baru</span>}
                </div>
                <div className="space-y-3">
                  {items
                    .filter((n) => !showUnreadOnly || !n.read_at)
                    .map((n) => (
                      <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
                    ))}
                </div>
              </section>
            ))}

            <div className="pt-4 text-center">
              <button className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
                Muat Notifikasi Sebelumnya
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 text-brand-600 font-bold text-lg mb-3">
                <Compass className="w-6 h-6" />
                <span>Jejakawan</span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Jelajahi</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a className="hover:text-brand-600 transition" href="#">Rekomendasi Destinasi</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Peta Interaktif</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Open Trip Nusantara</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Komunitas</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a className="hover:text-brand-600 transition" href="#">Cari Teman Jalan</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Misi & Badge Traveler</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Leaderboard Mingguan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Bantuan</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a className="hover:text-brand-600 transition" href="#">Pengaturan Akun</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Syarat & Ketentuan</a></li>
                <li><a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">Kontak: halo@jejakawan.id</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
            <div className="flex items-center gap-6">
              <a className="hover:text-slate-800 transition" href="#">Kebijakan Privasi</a>
              <a className="hover:text-slate-800 transition" href="#">Panduan Komunitas</a>
              <a className="hover:text-slate-800 transition" href="#">Keamanan & Verifikasi</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}