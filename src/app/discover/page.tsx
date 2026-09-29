"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { Destination } from "@/types/database"
import { getRecommendations, RecommendationResult } from "@/lib/recommendation"
import { DestinationCard } from "@/components/destination-card"
import { EmergencyButton } from "@/components/safety/emergency-button"
import { Compass, Search, Sparkles, MapPin, TrendingUp, Star, Eye, Zap, MessageCircle, Bell, ChevronDown, SlidersHorizontal, ArrowRight, Flame } from "lucide-react"

export default function DiscoverPage() {
  const { user, profile } = useAuthStore()
  const [recommendations, setRecommendations] = useState<Destination[]>([])
  const [relevanceScores, setRelevanceScores] = useState<Record<string, number>>({})
  const [dailyRemaining, setDailyRemaining] = useState(9999)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const categories = ["alam", "pantai", "budaya", "kuliner", "gunung", "air_terjun", "gua", "sejarah"]
  const mode = profile?.current_mode || "tourist"

  useEffect(() => {
    fetchRecommendations()
  }, [category, mode])

  async function fetchRecommendations(append = false) {
    setLoading(true)
    const result = await getRecommendations(user?.id, mode, append ? offset : 0, 20)
    const newDests = append ? [...recommendations, ...result.destinations] : result.destinations
    setRecommendations(newDests)
    setDailyRemaining(result.daily_remaining)
    setHasMore(result.has_more)
    setOffset(append ? offset + 20 : 20)
    const scores: Record<string, number> = {}
    result.destinations.forEach(d => { scores[d.id] = (d as any).relevance_score || 0 })
    setRelevanceScores(prev => ({ ...prev, ...scores }))
    setLoading(false)
  }

  const filtered = recommendations.filter(d => {
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.province?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || d.category?.includes(category)
    return matchesSearch && matchesCategory
  })

  const categoryLabels: Record<string, string> = {
    alam: "Alam", pantai: "Pantai", budaya: "Budaya", kuliner: "Kuliner",
    gunung: "Gunung", air_terjun: "Air Terjun", gua: "Gua", sejarah: "Sejarah"
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile ? `Halo, ${profile.display_name}! 👋` : "Discover"}
              </h1>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
              {mode === "explorer"
                ? "Temukan hidden gems yang jarang dikunjungi."
                : "Temukan destinasi populer dan hidden gem di seluruh Indonesia sesuai preferensi petualanganmu."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {dailyRemaining !== 9999 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" />
                <span>{dailyRemaining} rekomendasi tersisa</span>
              </div>
            )}
            <div className="flex items-center bg-white border border-slate-200 rounded-full p-1 text-xs font-medium text-slate-600">
              <span className="px-2.5 py-1 text-slate-400 font-normal">Mode:</span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full flex items-center gap-1.5 capitalize">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                {mode}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <section className="pt-6 pb-4 space-y-4">
          <div className="relative shadow-sm rounded-2xl bg-white border border-slate-200/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1.5 flex items-center gap-2">
            <div className="pl-3 text-slate-400 flex items-center pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="w-full text-slate-800 text-sm sm:text-base border-0 focus:ring-0 bg-transparent placeholder-slate-400 font-medium py-2.5 px-2 outline-none"
              placeholder="Cari destinasi, gunung, pantai, provinsi, atau aktivitas petualangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                category === null
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? null : c)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  category === c
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {categoryLabels[c] || c}
              </button>
            ))}
          </div>
        </section>

        {/* Explorer mode tip */}
        {mode === "explorer" && (
          <div className="mb-6 bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Explorer Mode Aktif</h3>
              <p className="text-xs sm:text-sm text-amber-800/90 mt-1">Destinasi underrated diberi skor lebih tinggi untukmu.</p>
            </div>
          </div>
        )}

        {/* Daily limit warning */}
        {dailyRemaining !== 9999 && dailyRemaining <= 1 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Batas rekomendasi hampir habis</p>
              <p className="text-xs text-red-600">Upgrade ke Weekly/Monthly untuk rekomendasi unlimited.</p>
            </div>
          </div>
        )}

        {/* Results */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {category ? `Kategori: ${categoryLabels[category] || category}` : "Rekomendasi Untukmu"}
          </h2>
          {loading && recommendations.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                <Compass className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-medium">Tidak ada destinasi ditemukan.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((d) => (
                  <div key={d.id} className="relative group">
                    <DestinationCard destination={d} />
                    {relevanceScores[d.id] !== undefined && relevanceScores[d.id] > 0 && (
                      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-xs font-semibold backdrop-blur-sm shadow-sm">
                        <Flame className="w-3 h-3 text-amber-300" />
                        {Math.round(relevanceScores[d.id] * 100)}% match
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {hasMore && !search && !category && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => fetchRecommendations(true)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? "Memuat..." : "Muat Lebih Banyak"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        {user && <EmergencyButton />}
      </main>
    </div>
  )
}
