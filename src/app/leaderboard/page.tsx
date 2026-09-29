"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { TrendingUp, Search, ChevronRight, MapPin, Shield, Clock, Zap } from "lucide-react"

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [leaders, setLeaders] = useState<any[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => { fetchLeaderboard() }, [user])

  async function fetchLeaderboard() {
    const supabase = createClient()
    const { data } = await supabase
      .from("user_profiles")
      .select("id, display_name, avatar_url, xp_total, level, badge_count, rating_avg, ktp_verified, current_mode")
      .order("xp_total", { ascending: false })
      .limit(50)
    setLeaders(data || [])

    if (user) {
      const idx = (data || []).findIndex((u: any) => u.id === user.id)
      setMyRank(idx >= 0 ? idx + 1 : null)
    }
    setLoading(false)
  }

  const filteredLeaders = leaders.filter(u =>
    !searchQuery || u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const top3 = filteredLeaders.slice(0, 3)
  const rest = filteredLeaders.slice(3, 10)
  const currentUser = leaders.find((u: any) => u.id === user?.id)
  const userLevel = currentUser?.level || 1

  const tierName = (level: number) => {
    if (level <= 5) return "Tourist"
    if (level <= 10) return "Petualang Pemula"
    if (level <= 20) return "Penjelajah Sejati"
    return "Master Penjelajah"
  }

  return (
    <div className="flex-1 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 mb-4">
          <span className="hover:text-slate-700 cursor-pointer">Gamifikasi</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-indigo-600 font-semibold">Leaderboard Komunitas</span>
        </nav>

        {/* Hero Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">Leaderboard Petualang Nusantara</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Peringkat traveler teraktif di seluruh Indonesia. Kumpulkan XP dari eksplorasi destinasi, selesaikan misi jelajah, dan raih badge eksklusif komunitas!
            </p>
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 self-start md:self-auto shrink-0">
            <Clock className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="text-xs font-semibold">Musim Kemarau berakhir dalam: <strong className="font-bold text-indigo-900">12 Hari 8 Jam</strong></span>
          </div>
        </div>

        {/* User Rank Banner */}
        {user && currentUser && myRank && (
          <section className="mb-10 bg-indigo-600 rounded-2xl text-white shadow-md overflow-hidden relative">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-5">
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-indigo-700 border-2 border-white/30 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xs uppercase font-semibold text-indigo-200">Peringkat</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">#{myRank}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{currentUser.display_name}</h2>
                    <span className="bg-indigo-500/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/20">Kamu</span>
                    {currentUser.ktp_verified && (
                      <Shield className="w-4 h-4 text-amber-300" />
                    )}
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">{tierName(currentUser.level)} • Level {currentUser.level}</p>
                  <div className="mt-3 flex items-center space-x-3 text-xs text-indigo-100">
                    <span>Total: <strong className="text-white font-bold">{currentUser.xp_total?.toLocaleString()} XP</strong></span>
                    <span>•</span>
                    <span className="flex items-center text-emerald-300 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      +2 Peringkat minggu ini
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:border-indigo-500/60 lg:pl-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-indigo-700/60 px-3 py-2 rounded-xl border border-indigo-500">
                    <span className="text-xs text-indigo-200 block">Badge</span>
                    <span className="text-base font-bold text-white">{currentUser.badge_count}</span>
                  </div>
                  <div className="bg-indigo-700/60 px-3 py-2 rounded-xl border border-indigo-500">
                    <span className="text-xs text-indigo-200 block">Level</span>
                    <span className="text-base font-bold text-white">{currentUser.level}</span>
                  </div>
                  <div className="bg-indigo-700/60 px-3 py-2 rounded-xl border border-indigo-500">
                    <span className="text-xs text-indigo-200 block">Rating</span>
                    <span className="text-base font-bold text-white">{currentUser.rating_avg?.toFixed(1) || "-"}</span>
                  </div>
                </div>
                {myRank > 1 && (
                  <button className="flex-1 sm:flex-none text-center bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm">
                    Kejar Posisi #{myRank - 1}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Filter Toolbar */}
        <section className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start overflow-x-auto w-full sm:w-auto">
            {(["week", "month", "all"] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  timeframe === tf ? "bg-white text-indigo-700 font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tf === "week" ? "Minggu Ini" : tf === "month" ? "Bulan Ini (Aktif)" : "Sepanjang Masa"}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Cari nama traveler..."
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </section>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <section className="mb-12">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Podium Jawara Musim Ini</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">Peringkat 3 Teratas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* #2 Silver */}
              <div className="order-2 md:order-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all text-center relative flex flex-col justify-between">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
                  Peringkat 2
                </div>
                <div className="pt-2">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl font-black text-slate-700 shadow-sm">
                      {top3[1].display_name?.[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-black text-xs">🥈</div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{top3[1].display_name}</h3>
                  <p className="text-xs text-slate-500">{tierName(top3[1].level)} • Lvl {top3[1].level}</p>
                  <div className="my-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-black text-slate-800 tracking-tight">{top3[1].xp_total?.toLocaleString()}</div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total XP</span>
                  </div>
                  <div className="flex justify-around text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div><span className="block font-bold text-slate-900">{top3[1].badge_count}</span><span className="text-[10px] text-slate-400">Badge</span></div>
                    <div className="border-r border-slate-200" />
                    <div><span className="block font-bold text-slate-900">{top3[1].level}</span><span className="text-[10px] text-slate-400">Level</span></div>
                  </div>
                </div>
              </div>

              {/* #1 Gold */}
              <div className="order-1 md:order-2 bg-white rounded-2xl p-6 md:p-8 border-2 border-amber-400 shadow-xl shadow-amber-100/50 text-center relative flex flex-col justify-between md:-translate-y-2">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-extrabold px-4 py-1 rounded-full shadow-md">👑 JUARA 1 NASIONAL</div>
                <div className="pt-2">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <div className="w-24 h-24 rounded-full bg-amber-50 border-4 border-amber-400 flex items-center justify-center text-2xl font-black text-amber-800 shadow-md">{top3[0].display_name?.[0]}</div>
                    <div className="absolute -bottom-2 -right-1 w-8 h-8 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md font-black text-sm">🥇</div>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{top3[0].display_name}</h3>
                  <p className="text-xs text-slate-500">{tierName(top3[0].level)} • Lvl {top3[0].level}</p>
                  <div className="my-4 py-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                    <div className="text-3xl font-black text-amber-900 tracking-tight">{top3[0].xp_total?.toLocaleString()}</div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Total XP</span>
                  </div>
                  <div className="flex justify-around text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div><span className="block font-bold text-slate-900 text-sm">{top3[0].badge_count}</span><span className="text-[10px] text-slate-400">Badge</span></div>
                    <div className="border-r border-slate-200" />
                    <div><span className="block font-bold text-slate-900 text-sm">{top3[0].level}</span><span className="text-[10px] text-slate-400">Level</span></div>
                  </div>
                </div>
              </div>

              {/* #3 Bronze */}
              <div className="order-3 bg-white rounded-2xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-all text-center relative flex flex-col justify-between">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-100 border border-orange-300 text-orange-800 text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
                  Peringkat 3{top3[2].id === user?.id ? " (Kamu)" : ""}
                </div>
                <div className="pt-2">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-300 flex items-center justify-center text-xl font-black text-orange-800 shadow-sm">{top3[2].display_name?.[0]}</div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-400 border-2 border-white rounded-full flex items-center justify-center text-white shadow font-black text-xs">🥉</div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{top3[2].display_name}</h3>
                  <p className="text-xs text-slate-500">{tierName(top3[2].level)} • Lvl {top3[2].level}</p>
                  <div className="my-4 py-3 bg-orange-50/50 rounded-xl border border-orange-100">
                    <div className="text-2xl font-black text-orange-950 tracking-tight">{top3[2].xp_total?.toLocaleString()}</div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Total XP</span>
                  </div>
                  <div className="flex justify-around text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div><span className="block font-bold text-slate-900">{top3[2].badge_count}</span><span className="text-[10px] text-slate-400">Badge</span></div>
                    <div className="border-r border-slate-200" />
                    <div><span className="block font-bold text-slate-900">{top3[2].level}</span><span className="text-[10px] text-slate-400">Level</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Layout: Leaderboard List & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Rank 4-10 Table */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Peringkat 4 – 10</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daftar petualang paling aktif</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Terupdate 15 mnt lalu</span>
            </div>
            <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-1 text-center">No</div>
              <div className="col-span-5">Traveler & Gelar</div>
              <div className="col-span-3 text-center">Level</div>
              <div className="col-span-3 text-right">Total XP</div>
            </div>
            <div className="divide-y divide-slate-100">
              {rest.map((u: any, i: number) => (
                <div key={u.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-3 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors ${u.id === user?.id ? "bg-indigo-50/30" : ""}`}>
                  <div className="flex sm:justify-center items-center col-span-1">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">#{i + 4}</span>
                  </div>
                  <div className="col-span-5 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">{u.display_name?.[0]}</div>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 text-sm">{u.display_name}</span>
                        {u.ktp_verified && <Shield className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-slate-500">{tierName(u.level)} (Lvl {u.level})</p>
                    </div>
                  </div>
                  <div className="col-span-3 sm:text-center text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Lvl {u.level}</span> • <span className="font-semibold text-slate-800">{u.badge_count}</span> Badge
                  </div>
                  <div className="col-span-3 sm:text-right flex items-center justify-between sm:justify-end space-x-2">
                    <span className="text-sm font-extrabold text-indigo-600">{u.xp_total?.toLocaleString()} <span className="text-xs font-normal text-slate-400">XP</span></span>
                    <button className="text-slate-400 hover:text-indigo-600 p-1 rounded transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {rest.length === 0 && !loading && (
                <p className="text-center text-slate-400 py-8 col-span-12">Belum ada data leaderboard.</p>
              )}
            </div>
            {loading && (
              <div className="space-y-3 p-6">{[...Array(7)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}</div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Level Tiers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Tingkatan Level Traveler</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">Tingkatkan status akunmu dengan menjelajahi lebih banyak tempat wisata.</p>
              <div className="space-y-3">
                {[
                  { name: "Tourist", range: "Level 1 - 5", xp: "0 - 500 XP", level: 1 },
                  { name: "Petualang Pemula", range: "Level 6 - 10", xp: "501 - 1.500 XP", level: 6 },
                  { name: "Penjelajah Sejati", range: "Level 11 - 20", xp: "1.501 - 3.500 XP", level: 11 },
                  { name: "Master Penjelajah", range: "Level 21+", xp: "3.501+ XP", level: 21 },
                ].map(tier => {
                  const isCurrent = userLevel >= tier.level && userLevel < (tier.level + 10)
                  return (
                    <div key={tier.name} className={`p-3 rounded-xl flex items-center justify-between ${isCurrent ? "bg-indigo-50/70 border border-indigo-200" : "bg-slate-50 border border-slate-100"}`}>
                      <div>
                        <span className={`text-xs font-bold block flex items-center ${isCurrent ? "text-indigo-900" : "text-slate-800"}`}>
                          {tier.name}
                          {isCurrent && <span className="ml-1.5 text-[9px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded">Kamu</span>}
                        </span>
                        <span className={`text-[11px] ${isCurrent ? "text-indigo-700" : "text-slate-500"}`}>{tier.range}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${isCurrent ? "text-indigo-700 bg-white border-indigo-200" : "text-slate-600 bg-white border-slate-200"}`}>{tier.xp}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Season Rewards */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Hadiah Musim Ini</span>
              </h3>
              <div className="space-y-3.5 text-xs">
                {[
                  { medal: "🥇", title: "Peringkat 1:", desc: "Voucher Open Trip Rp 1.000.000 + Badge Emas Eksklusif & Official Jersey." },
                  { medal: "🥈", title: "Peringkat 2:", desc: "Voucher Open Trip Rp 500.000 + Badge Perak & Buff Headband Jejakawan." },
                  { medal: "🥉", title: "Peringkat 3:", desc: "Voucher Diskon Open Trip Rp 250.000 + Badge Perunggu Profil." },
                ].map((r, i) => (
                  <div key={i} className={`flex items-start space-x-3 ${i < 2 ? "pb-3 border-b border-slate-100" : ""}`}>
                    <span className="text-lg">{r.medal}</span>
                    <div>
                      <strong className="text-slate-800 font-bold block">{r.title}</strong>
                      <p className="text-slate-500">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center">
              <h4 className="text-sm font-bold text-indigo-900 mb-1">Ingin Naik Peringkat Cepat?</h4>
              <p className="text-xs text-indigo-700 mb-4">Selesaikan 3 misi mingguan yang belum kamu klaim sekarang.</p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-colors">
                Buka Misi Tersedia (+450 XP)
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
