"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GuideProfile } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Globe, DollarSign, Shield, UserPlus, Search } from "lucide-react"
import Link from "next/link"

export default function GuidesPage() {
  const supabase = createClient()
  const [guides, setGuides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")

  useEffect(() => { fetchGuides() }, [])

  async function fetchGuides() {
    setLoading(true)
    let query = supabase
      .from("guide_profiles")
      .select("*, user:user_profiles(display_name,avatar_url,rating_avg)")
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("rating_avg", { ascending: false })

    const { data } = await query
    setGuides(data || [])
    setLoading(false)
  }

  const locations = [...new Set(guides.flatMap(g => g.operating_locations || []))].sort()

  const filtered = guides.filter(g => {
    const matchSearch = !search || g.guide_name.toLowerCase().includes(search.toLowerCase())
    const matchLocation = locationFilter === "all" || (g.operating_locations || []).includes(locationFilter)
    return matchSearch && matchLocation
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panduan Lokal</h1>
          <p className="text-muted-foreground">Temukan guide berpengalaman untuk petualanganmu</p>
        </div>
        <Link href="/guides/register"><Button><UserPlus className="h-4 w-4 mr-2" /> Jadi Guide</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari guide..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Lokasi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lokasi</SelectItem>
            {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Belum ada guide ditemukan</h3>
          <p className="text-muted-foreground">Coba ubah filter atau jadilah guide pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <Card key={g.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                    {g.photo_url ? (
                      <img src={g.photo_url} alt={g.guide_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      g.guide_name[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{g.guide_name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{g.rating_avg?.toFixed(1) || "0.0"}</span>
                      <span className="text-xs text-muted-foreground">({g.rating_count} ulasan)</span>
                      {g.is_verified && <Shield className="h-3 w-3 text-green-500 ml-1" />}
                    </div>
                  </div>
                </div>
                {g.bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{g.bio}</p>}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(g.operating_locations || []).slice(0, 3).map((loc: string) => (
                    <Badge key={loc} variant="secondary" className="text-xs">{loc}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">Rp {g.price_per_day?.toLocaleString("id-ID")}/hari</span>
                  <Link href={`/guides/${g.id}`}><Button size="sm">Lihat Profil</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
