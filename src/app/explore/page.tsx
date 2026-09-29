"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Destination } from "@/types/database"
import { DestinationCard } from "@/components/destination-card"
import { Search, MapPin, List, Grid3X3, SlidersHorizontal, ChevronDown, Compass, Mountain, TreePine, Waves, Building2, Gem } from "lucide-react"

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [search, setSearch] = useState("")
  const [province, setProvince] = useState<string | null>(null)
  const [underratedOnly, setUnderratedOnly] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)

  const provinces = ["Jawa Barat", "Jawa Tengah", "Jawa Timur", "DIY", "Bali"]

  useEffect(() => { fetchDestinations() }, [province, underratedOnly])

  async function fetchDestinations() {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from("destinations").select("*").eq("is_active", true).order("rating_avg", { ascending: false })
    if (province) q = q.eq("province", province)
    if (underratedOnly) q = q.eq("is_underrated", true)
    const { data } = await q.limit(50)
    setDestinations(data || [])
    setLoading(false)
  }

  const filtered = destinations.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.regency?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Direktori Destinasi</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Jelajahi <span className="font-semibold text-slate-700">{destinations.length}</span> destinasi di seluruh Indonesia
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 rounded-lg border transition ${
                view === "grid" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 rounded-lg border transition ${
                view === "list" ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <section className="pt-6 pb-4 space-y-4">
          <div className="relative shadow-sm rounded-2xl bg-white border border-slate-200/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1.5 flex items-center gap-2">
            <div className="pl-3 text-slate-400 flex items-center pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="w-full text-slate-800 text-sm sm:text-base border-0 focus:ring-0 bg-transparent placeholder-slate-400 font-medium py-2.5 px-2 outline-none"
              placeholder="Cari destinasi, kota, atau kabupaten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>

          {/* Province Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
            <button
              onClick={() => setProvince(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                province === null
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Semua Provinsi
            </button>
            {provinces.map((p) => (
              <button
                key={p}
                onClick={() => setProvince(province === p ? null : p)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border ${
                  province === p
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setUnderratedOnly(!underratedOnly)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition border flex items-center gap-1.5 ${
                underratedOnly
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Gem className="w-3.5 h-3.5" />
              Hidden Gems Only
            </button>
          </div>
        </section>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
              <Compass className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-medium">Tidak ada destinasi ditemukan.</p>
          </div>
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {filtered.map((d) => <DestinationCard key={d.id} destination={d} />)}
          </div>
        )}
      </main>
    </div>
  )
}
