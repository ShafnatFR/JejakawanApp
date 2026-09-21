"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { Destination } from "@/types/database"
import { getRecommendations, RecommendationResult } from "@/lib/recommendation"
import { DestinationCard } from "@/components/destination-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmergencyButton } from "@/components/safety/emergency-button"
import { Compass, Search, Sparkles, MapPin, TrendingUp, Star, Eye, Zap } from "lucide-react"
import { formatXP } from "@/lib/utils"

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
    const result = await getRecommendations(
      user?.id,
      mode,
      append ? offset : 0,
      20
    )

    const newDests = append
      ? [...recommendations, ...result.destinations]
      : result.destinations

    setRecommendations(newDests)
    setDailyRemaining(result.daily_remaining)
    setHasMore(result.has_more)
    setOffset(append ? offset + 20 : 20)

    // Build scores map
    const scores: Record<string, number> = {}
    result.destinations.forEach(d => {
      scores[d.id] = (d as any).relevance_score || 0
    })
    setRelevanceScores(prev => ({ ...prev, ...scores }))
    setLoading(false)
  }

  const filtered = recommendations.filter(d => {
    const matchesSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.province?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || d.category?.includes(category)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {profile ? `Halo, ${profile.display_name}!` : "Discover"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "explorer"
                ? "Temukan hidden gems yang jarang dikunjungi."
                : "Temukan destinasi populer di seluruh Indonesia."}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              <Eye className="h-3 w-3 mr-1" />
              {dailyRemaining === 9999 ? "∞" : dailyRemaining} rekomendasi tersisa
            </Badge>
            <p className="text-xs text-muted-foreground capitalize">
              Mode: {mode}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari destinasi, provinsi, atau kategori..."
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <Badge
          variant={category === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setCategory(null)}
        >
          Semua
        </Badge>
        {categories.map(c => (
          <Badge
            key={c}
            variant={category === c ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setCategory(c === category ? null : c)}
          >
            {c.replace("_", " ")}
          </Badge>
        ))}
      </div>

      {/* Mode-specific tip */}
      {mode === "explorer" && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Explorer Mode Aktif</p>
              <p className="text-xs text-amber-600">Destinasi underrated diberi skor lebih tinggi untukmu.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily limit warning */}
      {dailyRemaining !== 9999 && dailyRemaining <= 1 && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Batas rekomendasi hampir habis</p>
              <p className="text-xs text-red-600">Upgrade ke Weekly/Monthly untuk rekomendasi unlimited.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {category ? `Kategori: ${category}` : "Rekomendasi Untukmu"}
        </h2>
        {loading && recommendations.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Compass className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada destinasi ditemukan.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(d => (
                <div key={d.id} className="relative">
                  <DestinationCard destination={d} />
                  {relevanceScores[d.id] !== undefined && relevanceScores[d.id] > 0 && (
                    <Badge
                      className="absolute top-2 left-2 z-10 text-xs"
                      variant="secondary"
                    >
                      {Math.round(relevanceScores[d.id] * 100)}% match
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {hasMore && !search && !category && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => fetchRecommendations(true)}
                  disabled={loading}
                >
                  {loading ? "Memuat..." : "Muat Lebih Banyak"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
      {/* Emergency SOS - only when logged in */}
      {user && <EmergencyButton />}
    </div>
  )
}
