"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, TrendingUp, Award, Shield } from "lucide-react"

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [leaders, setLeaders] = useState<any[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

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

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Top traveler di seluruh Indonesia</p>
      </div>

      {/* My rank */}
      {user && myRank && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">#{myRank}</span>
              <div>
                <p className="font-medium">Peringkatmu</p>
                <p className="text-sm opacity-80">{leaders[myRank - 1]?.xp_total?.toLocaleString()} XP</p>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {leaders.map((u: any, i: number) => (
            <Card key={u.id} className={`${u.id === user?.id ? "border-primary" : ""} ${i < 3 ? "bg-gradient-to-r from-amber-50 to-transparent" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <span className="text-2xl font-bold w-10 text-center">
                  {i < 3 ? medals[i] : i + 1}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={u.avatar_url || ""} />
                  <AvatarFallback>{u.display_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{u.display_name}</p>
                    {u.ktp_verified && <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Level {u.level}</span>
                    <span>•</span>
                    <span>{u.badge_count} badge</span>
                    <span>•</span>
                    <span className="capitalize">{u.current_mode}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{u.xp_total?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}