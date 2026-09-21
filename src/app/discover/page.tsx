"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Destination } from "@/types/database"
import { DestinationCard } from "@/components/destination-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Compass, Search, Sparkles, MapPin, TrendingUp, Star } from "lucide-react"

export default function DiscoverPage() {
  const { user, profile } = useAuthStore()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [trending, setTrending] = useState<Destination[]>([])
  const [underrated, setUnderrated] = useState<Destination[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const categories = ["alam", "pantai", "budaya", "kuliner", "gunung", "air_terjun", "gua", "sejarah"]

  useEffect(() => {
    fetchData()
  }, [category])

  async function fetchData() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase.from("destinations").select("*").eq("is_active", true).order("rating_avg", { ascending: false }).limit(20)
    if (category) query = query.contains("category", [category])
    const { data: all } = await query

    const { data: trend } = await supabase.from("destinations").select("*").eq("is_active", true).order("visit_count", { ascending: false }).limit(6)
    const { data: under } = await supabase.from("destinations").select("*").eq("is_active", true).eq("is_underrated", true).order("rating_avg", { ascending: false }).limit(6)

    setDestinations(all || [])
    setTrending(trend || [])
    setUnderrated(under || [])
    setLoading(false)
  }

  const filtered = destinations.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.province?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {profile ? `Halo, ${profile.display_name}!` : "Discover"}
        </h1>
        <p className="text-muted-foreground">Temukan destinasi impianmu di seluruh Indonesia.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari destinasi, provinsi, atau kategori..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <Badge variant={category === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setCategory(null)}>Semua</Badge>
        {categories.map(c => (
          <Badge key={c} variant={category === c ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setCategory(c === category ? null : c)}>{c.replace("_", " ")}</Badge>
        ))}
      </div>

      {/* Trending */}
      {!search && !category && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Trending</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map(d => <DestinationCard key={d.id} destination={d} />)}
          </div>
        </section>
      )}

      {/* Underrated */}
      {!search && !category && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold">Hidden Gems</h2>
            <Badge variant="secondary" className="text-xs">Underrated</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {underrated.map(d => <DestinationCard key={d.id} destination={d} />)}
          </div>
        </section>
      )}

      {/* All / Filtered */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{category ? `Kategori: ${category}` : "Semua Destinasi"}</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Compass className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada destinasi ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => <DestinationCard key={d.id} destination={d} />)}
          </div>
        )}
      </section>
    </div>
  )
}