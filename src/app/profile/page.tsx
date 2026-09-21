"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, MapPin, Star, Shield, Calendar, Award, TrendingUp } from "lucide-react"

export default function ProfilePage() {
  const { user, profile } = useAuthStore()
  const router = useRouter()
  const [badges, setBadges] = useState<any[]>([])
  const [trips, setTrips] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    fetchData()
  }, [user])

  async function fetchData() {
    if (!user) return
    const supabase = createClient()
    const { data: b } = await supabase.from("user_badges").select("*, badge:badges(name,description,icon_url,category)").eq("user_id", user.id)
    setBadges(b || [])
    const { data: t } = await supabase.from("trip_requests").select("*, destination:destinations(name,province)").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(5)
    setTrips(t || [])
    const { data: r } = await supabase.from("reviews").select("*").eq("reviewer_id", user.id).order("created_at", { ascending: false }).limit(5)
    setReviews(r || [])
  }

  if (!profile) return <div className="container mx-auto px-4 py-8 text-center"><p>Loading...</p></div>

  const levelProgress = (profile.xp_total % 500) / 5

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl">{profile.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.display_name}</h1>
              <p className="text-muted-foreground">{profile.bio || "Belum ada bio"}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="capitalize"><MapPin className="h-3 w-3 mr-1" />{profile.current_mode}</Badge>
                {profile.ktp_verified && <Badge variant="outline" className="text-green-600"><Shield className="h-3 w-3 mr-1" />Terverifikasi</Badge>}
                <Badge variant="outline"><Star className="h-3 w-3 mr-1" />{profile.rating_avg.toFixed(1)}</Badge>
              </div>
            </div>
          </div>

          {/* XP & Level */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /><span className="font-semibold">Level {profile.level}</span></div>
              <span className="text-sm text-muted-foreground">{profile.xp_total} XP</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{500 - (profile.xp_total % 500)} XP lagi untuk level berikutnya</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-primary">{trips.length}</p><p className="text-xs text-muted-foreground">Trip</p></div>
            <div><p className="text-2xl font-bold text-primary">{badges.length}</p><p className="text-xs text-muted-foreground">Badge</p></div>
            <div><p className="text-2xl font-bold text-primary">{reviews.length}</p><p className="text-xs text-muted-foreground">Review</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Badge ({badges.length})</CardTitle></CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum punya badge. Mulai petualanganmu!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((ub: any) => (
                <div key={ub.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">🏆</div>
                  <div><p className="text-sm font-medium">{ub.badge?.name}</p><p className="text-xs text-muted-foreground">{ub.badge?.category}</p></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent trips */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Trip Terakhir</CardTitle></CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum ada trip. Buat trip pertamamu!</p>
          ) : (
            <div className="space-y-3">
              {trips.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{t.destination?.name || t.destination_name || "Trip"}</p>
                    <p className="text-sm text-muted-foreground">{t.date_from} - {t.date_to}</p>
                  </div>
                  <Badge>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}