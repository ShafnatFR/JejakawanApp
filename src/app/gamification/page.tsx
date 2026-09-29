"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Badge as BadgeType, Mission, MissionClaim } from "@/types/database"
import { claimMission, completeMission, getLeaderboard, getXPHistory, getLevelFromXP, getNextLevelThreshold, getLevelThreshold } from "@/lib/gamification"
import { formatXP } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Star, Target, Award, Zap, MapPin, TrendingUp, CheckCircle, Clock, Gift, Sparkles, Info, Flame, Users, Shield, Gift as GiftIcon, ChevronRight } from "lucide-react"

export default function GamificationPage() {
  const { user, profile } = useAuthStore()
  const supabase = createClient()
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [myClaims, setMyClaims] = useState<MissionClaim[]>([])
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [xpLogs, setXpLogs] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [proofDialog, setProofDialog] = useState<{ open: boolean; claimId: string | null }>({ open: false, claimId: null })
  const [proofUrl, setProofUrl] = useState("")
  const [newBadgeUnlock, setNewBadgeUnlock] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"missions" | "badges" | "leaderboard" | "history">("missions")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => { fetchData() }, [user])

  async function fetchData() {
    const { data: b } = await supabase.from("badges").select("*").order("xp_required")
    setBadges(b || [])

    const { data: m } = await supabase
      .from("missions")
      .select("*, destination:destinations(name,province)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
    setMissions(m || [])

    if (user) {
      const { data: ub } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id)
      setUserBadges(ub?.map((b: any) => b.badge_id) || [])

      const { data: claims } = await supabase
        .from("mission_claims")
        .select("*, mission:missions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setMyClaims(claims || [])

      const logs = await getXPHistory(user.id, 20)
      setXpLogs(logs)
    }

    const lb = await getLeaderboard(10)
    setLeaderboard(lb)
  }

  async function handleClaimMission(missionId: string) {
    if (!user) return
    setClaiming(missionId)
    const result = await claimMission(user.id, missionId)
    if (result.success) {
      await fetchData()
    } else {
      alert(result.error)
    }
    setClaiming(null)
  }

  async function handleCompleteMission(claimId: string) {
    setCompleting(claimId)
    const result = await completeMission(claimId, proofUrl || undefined)
    if (result.success) {
      setProofDialog({ open: false, claimId: null })
      setProofUrl("")
      await fetchData()
      if (user) {
        const { checkBadgeUnlock } = await import("@/lib/gamification")
        const newBadges = await checkBadgeUnlock(user.id)
        if (newBadges.length > 0) {
          setNewBadgeUnlock(newBadges[0])
          setTimeout(() => setNewBadgeUnlock(null), 5000)
        }
      }
    } else {
      alert(result.error)
    }
    setCompleting(null)
  }

  function getClaimStatus(missionId: string) {
    return myClaims.find(c => c.mission_id === missionId)
  }

  const level = profile?.level || 1
  const xp = profile?.xp_total || 0
  const currentThreshold = getLevelThreshold(level)
  const nextThreshold = getNextLevelThreshold(level)
  const progress = nextThreshold > currentThreshold
    ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100

  const tabs = [
    { id: "missions" as const, label: "Misi Eksplorasi", icon: Target, count: missions.length },
    { id: "badges" as const, label: "Badge & Prestasi", icon: Award, count: `${userBadges.length}/${badges.length}` },
    { id: "leaderboard" as const, label: "Leaderboard", icon: TrendingUp },
    { id: "history" as const, label: "XP Log & Riwayat", icon: Zap },
  ]

  const filters = [
    { id: "all", label: `Semua Misi (${missions.length})` },
    { id: "gunung", label: "Gunung & Dataran Tinggi" },
    { id: "pantai", label: "Pantai & Laut" },
    { id: "hidden", label: "Hidden Gem" },
    { id: "komunitas", label: "Komunitas Jejakawan" },
  ]

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Badge unlock animation */}
      {newBadgeUnlock && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl rounded-2xl p-4 flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            <div>
              <p className="font-bold">Badge Baru!</p>
              <p className="text-sm opacity-90">Kamu membuka badge baru!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Gamifikasi Petualang</h1>
            <p className="mt-1 text-slate-500 text-sm sm:text-base">Kumpulkan XP perjalanan, raih badge penjelajah, selesaikan misi, dan tukarkan rewards eksklusif.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors" type="button">
              <Info className="w-4 h-4 text-slate-500" />
              Panduan XP & Level
            </button>
          </div>
        </div>
      </section>

      {/* Level Dashboard Card */}
      {profile && (
        <section className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-700/20 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium uppercase tracking-wider text-indigo-100">Peringkat Petualang</span>
                  <span className="text-xs text-indigo-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Aktif Berpetualang
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-indigo-100 font-medium">Target: Level {level + 1}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">Level {level}</span>
                <span className="text-lg sm:text-xl font-medium text-indigo-100">— {level <= 5 ? "Pejalan Pemula" : level <= 10 ? "Petualang Aktif" : "Penjelajah Sejati"}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
                  <span className="text-indigo-100">Progress Level</span>
                  <span className="font-bold text-white tracking-wide">{xp} / {nextThreshold} XP ({Math.round(progress)}%)</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3.5 p-0.5 backdrop-blur-sm overflow-hidden">
                  <div className="bg-white h-full rounded-full shadow-sm transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <p className="text-xs text-indigo-100/90 pt-1">
                  ✨ Butuh <strong className="text-white font-semibold">{nextThreshold - xp > 0 ? `${nextThreshold - xp} XP lagi` : "tercapai!"}</strong> untuk naik ke Level {level + 1}!
                </p>
              </div>
            </div>
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15 grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <span className="text-xs text-indigo-100 font-medium block">Total XP</span>
                <span className="text-2xl font-bold tracking-tight">{formatXP(xp)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-indigo-100 font-medium block">Misi Selesai</span>
                <span className="text-2xl font-bold tracking-tight">{myClaims.filter(c => c.status === "completed").length}</span>
              </div>
              <div className="space-y-0.5 pt-2 border-t border-white/10">
                <span className="text-xs text-indigo-100 font-medium block">Badge Dikoleksi</span>
                <span className="text-2xl font-bold tracking-tight">{userBadges.length}</span>
              </div>
              <div className="space-y-0.5 pt-2 border-t border-white/10">
                <span className="text-xs text-indigo-100 font-medium block">Peringkat</span>
                <span className="text-2xl font-bold tracking-tight">#{leaderboard.findIndex((u: any) => u.id === user?.id) + 1 || "-"}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Tabs */}
      <section className="border-b border-slate-200">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto pb-px" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
              role="tab"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === "missions" && (
        <>
          {/* Filter Chips */}
          <section className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeFilter === f.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset misi mingguan: <strong className="text-slate-700 font-semibold">4 hari lagi</strong></span>
            </div>
          </section>

          {/* Mission Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {missions.map(m => {
              const claim = getClaimStatus(m.id)
              const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                "Gunung": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
                "Pantai": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
                "Hidden Gem": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
              }
              const cat = categoryColors[m.category || ""] || { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }

              return (
                <article key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${cat.bg} ${cat.text} border ${cat.border}`}>
                        {m.category || "Misi"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        +{m.xp_reward} XP
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description}</p>
                    </div>
                    {(m as any).destination && (
                      <div className="flex items-center text-xs text-slate-500 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{(m as any).destination?.name}, {(m as any).destination?.province}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-medium text-slate-400">Kuota Terklaim: <span className="font-semibold text-slate-600">{m.current_claims} / {m.max_claims || "∞"}</span></div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${m.max_claims ? (m.current_claims / m.max_claims) * 100 : 0}%` }} />
                      </div>
                    </div>
                    {user && !claim && (
                      <button
                        onClick={() => handleClaimMission(m.id)}
                        disabled={claiming === m.id || (m.max_claims !== null && m.current_claims >= m.max_claims)}
                        className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                      >
                        {claiming === m.id ? "Mengklaim..." : "Klaim Misi"}
                      </button>
                    )}
                    {claim && claim.status === "claimed" && (
                      <button onClick={() => setProofDialog({ open: true, claimId: claim.id })} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Selesaikan
                      </button>
                    )}
                    {claim && claim.status === "in_progress" && (
                      <span className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Dikerjakan</span>
                    )}
                    {claim && claim.status === "completed" && (
                      <span className="px-3 py-1 text-xs font-medium text-white bg-emerald-500 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Selesai</span>
                    )}
                  </div>
                </article>
              )
            })}
            {missions.length === 0 && (
              <p className="col-span-2 text-center text-slate-400 py-8">Belum ada misi aktif.</p>
            )}
          </section>

          {/* Gamification Highlights */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {/* Badge Showcase */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Badge Penjelajah Berikutnya
                </h4>
                <button onClick={() => setActiveTab("badges")} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Lihat Semua</button>
              </div>
              {badges.filter(b => !userBadges.includes(b.id)).slice(0, 2).map(b => (
                <div key={b.id} className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{b.name}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{b.description}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {b.xp_required} XP Diperlukan
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Travel Tips Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-end p-5 min-h-[200px] bg-gradient-to-t from-slate-950/90 via-indigo-900/50 to-indigo-600/30">
              <div className="relative z-10 text-white space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wide inline-block">Tips Eksplorasi</span>
                <h4 className="text-base font-bold leading-tight">Pendakian Pertama? Temukan Rekan di Trip Match</h4>
                <p className="text-xs text-slate-300">Dapatkan bonus 150 XP ketika berhasil mendaki bersama teman dari Jejakawan.</p>
              </div>
            </div>

            {/* XP Rewards */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Hadiah Tukar XP
                </h4>
                <span className="text-xs text-slate-400">XP Diperlukan</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Diskon Open Trip 15%", desc: "Untuk trip Gunung & Pantai", xp: "800 XP", icon: "%" },
                  { name: "Kaos Eksklusif Jejakawan", desc: "Bahan quick-dry petualang", xp: "1.200 XP", icon: "👕" },
                  { name: "Voucher Homestay Rp150k", desc: "Partner penginapan lokal", xp: "2.000 XP", icon: "🏨" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">{item.icon}</div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "badges" && (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map(b => {
            const earned = userBadges.includes(b.id)
            return (
              <div key={b.id} className={`bg-white border rounded-2xl p-5 text-center shadow-sm transition-all ${earned ? "border-indigo-300 shadow-indigo-100" : "border-slate-200 opacity-60"}`}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${earned ? "bg-indigo-100" : "bg-slate-100"}`}>
                  {earned ? "🏆" : "🔒"}
                </div>
                <h4 className="font-medium text-sm text-slate-900">{b.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{b.description}</p>
                {b.xp_required > 0 && <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-600">{b.xp_required} XP</span>}
                {earned && <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-emerald-500 text-white font-medium">Earned</span>}
              </div>
            )
          })}
        </section>
      )}

      {activeTab === "leaderboard" && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Top Traveler</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {leaderboard.map((u: any, i: number) => (
              <div key={u.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors ${u.id === user?.id ? "bg-indigo-50/50" : ""}`}>
                <span className="text-2xl font-bold w-8 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-medium text-indigo-700">{u.display_name?.[0]}</div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{u.display_name}</p>
                  <p className="text-sm text-slate-500">Level {u.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{formatXP(u.xp_total || 0)} XP</p>
                  <p className="text-xs text-slate-400">{u.badge_count} badge</p>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && <p className="text-center text-slate-400 py-8">Belum ada data leaderboard.</p>}
          </div>
        </section>
      )}

      {activeTab === "history" && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Riwayat XP</h2>
          </div>
          {xpLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Belum ada riwayat XP.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {xpLogs.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-slate-900 capitalize">{l.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(l.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="font-bold text-indigo-600">+{l.xp_amount} XP</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Proof URL Dialog */}
      <Dialog open={proofDialog.open} onOpenChange={open => setProofDialog({ open, claimId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Misi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL Bukti (opsional)</Label>
              <Input placeholder="https://..." value={proofUrl} onChange={e => setProofUrl(e.target.value)} />
              <p className="text-xs text-slate-500 mt-1">Upload foto atau link bukti kunjungan kamu.</p>
            </div>
            <button
              className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              onClick={() => proofDialog.claimId && handleCompleteMission(proofDialog.claimId)}
              disabled={completing === proofDialog.claimId}
            >
              {completing === proofDialog.claimId ? "Memproses..." : "Selesaikan Misi"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
