"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Destination } from "@/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Star, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchFavorites() }, [user])

  async function fetchFavorites() {
    setLoading(true)
    const { data } = await supabase
      .from("user_favorites")
      .select("*, destination:destinations(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
    setFavorites(data || [])
    setLoading(false)
  }

  async function removeFavorite(destId: string) {
    await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user!.id)
      .eq("destination_id", destId)
    setFavorites(f => f.filter((x: any) => x.destination_id !== destId))
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Login dulu yuk</h2>
        <p className="text-muted-foreground mb-4">Masuk untuk melihat destinasi favoritmu</p>
        <Link href="/login"><Button>Masuk</Button></Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Favorit Saya</h1>
        <p className="text-muted-foreground">Destinasi yang kamu simpan</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Belum ada favorit</h3>
          <p className="text-muted-foreground mb-4">Simpan destinasi yang kamu suka</p>
          <Link href="/discover"><Button>Jelajahi Destinasi</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav: any) => {
            const dest = fav.destination
            if (!dest) return null
            return (
              <Card key={fav.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{dest.name}</h3>
                      <p className="text-sm text-muted-foreground">{dest.province}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeFavorite(dest.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{dest.rating_avg?.toFixed(1) || "0.0"}</span>
                    {dest.is_underrated && <Badge variant="secondary" className="text-xs">Hidden Gem</Badge>}
                  </div>
                  <Link href={`/destinations/${dest.id}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      <MapPin className="h-4 w-4 mr-1" /> Lihat Detail
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
