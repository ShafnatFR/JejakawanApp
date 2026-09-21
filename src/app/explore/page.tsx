"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Destination } from "@/types/database"
import { DestinationCard } from "@/components/destination-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, MapPin, List, Grid3X3 } from "lucide-react"

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-muted-foreground">Jelajahi {destinations.length} destinasi di Indonesia</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "grid" ? "default" : "outline"} size="icon" onClick={() => setView("grid")}><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari destinasi..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
        <Badge variant={province === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setProvince(null)}>Semua Provinsi</Badge>
        {provinces.map(p => (
          <Badge key={p} variant={province === p ? "default" : "outline"} className="cursor-pointer" onClick={() => setProvince(province === p ? null : p)}>{p}</Badge>
        ))}
        <Badge variant={underratedOnly ? "default" : "outline"} className="cursor-pointer" onClick={() => setUnderratedOnly(!underratedOnly)}>Hidden Gems Only</Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filtered.map(d => <DestinationCard key={d.id} destination={d} />)}
        </div>
      )}
    </div>
  )
}