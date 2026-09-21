"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Badge as BadgeType, Mission } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Target, Award, Zap, MapPin, TrendingUp } from "lucide-react"

export default function GamificationPage() {
  const { user, profile } = useAuthStore()
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [xpLogs, setXpLogs] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => { fetchData() }, [user])

  async function fetchData() {
    const supabase = createClient()
    const { data: b } = await supabase.from("badges").select("*").order("xp_required")
    setBadges(b || [])
    const { data: m } = await supabase.from("missions").select("*, destination:destinations(name,province)").eq("is_active", true).order("created_at", { ascending: false })
    setMissions(m || [])
    if (user) {
      const { data: ub } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id)
      setUserBadges(ub?.map((b: any) => b.badge_id) || [])
      const { data: logs } = await supabase.from("user_xp_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      setXpLogs(logs || [])
    }
    const { data: lb } = await supabase.from("user_profiles").select("id,display_name,avatar_url,xp_total,level,badge_count").order("xp_total", { ascending: false }).limit(10)
    setLeaderboard(lb || [])
  }

  const level = profile?.level || 1
  const xp = profile?.xp_total || 0
  const nextLevelXp = level * 500
  const progress = (xp / nextLevelXp) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gamifikasi</h1>

      {/* XP Status */}
      {profile && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-80">Level saat ini</p>
                <p className="text-4xl font-bold">{level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Total XP</p>
                <p className="text-4xl font-bold">{xp.toLocaleString()}</p>
              </div>
            </div>
            <Progress value={progress} className="h-3 bg-white/20" />
            <p className="text-sm opacity-80 mt-2">{nextLevelXp - xp} XP lagi untuk Level {level + 1}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="missions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="missions"><Target className="h-4 w-4 mr-1" /> Misi</TabsTrigger>
          <TabsTrigger value="badges"><Award className="h-4 w-4 mr-1" /> Badge</TabsTrigger>
          <TabsTrigger value="leaderboard"><TrendingUp className="h-4 w-4 mr-1" /> Leaderboard</TabsTrigger>
          <TabsTrigger value="history"><Zap className="h-4 w-4 mr-1" /> XP Log</TabsTrigger>
        </TabsList>

        <TabsContent value="missions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map(m => (
              <Card key={m.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{m.title}</h3>
                    <Badge className="bg-amber-500">+{m.xp_reward} XP</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{m.description}</p>
                  {m.destination && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />{(m as any).destination?.name}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.current_claims}/{m.max_claims || "∞"} diklaim</span>
                    {user && <Button size="sm" variant="outline">Klaim Misi</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
            {missions.length === 0 && <p className="col-span-2 text-center text-muted-foreground py-8">Belum ada misi aktif.</p>}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map(b => {
              const earned = userBadges.includes(b.id)
              return (
                <Card key={b.id} className={`text-center ${earned ? "border-primary" : "opacity-60"}`}>
                  <CardContent className="p-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${earned ? "bg-primary/10" : "bg-muted"}`}>🏆</div>
                    <h4 className="font-medium text-sm">{b.name}</h4>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                    {b.xp_required > 0 && <Badge variant="outline" className="mt-2 text-xs">{b.xp_required} XP</Badge>}
                    {earned && <Badge className="mt-2 text-xs">Earned</Badge>}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader><CardTitle>Top Traveler</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((u: any, i: number) => (
                  <div key={u.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <span className="text-2xl font-bold w-8 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">{u.display_name?.[0]}</div>
                    <div className="flex-1">
                      <p className="font-medium">{u.display_name}</p>
                      <p className="text-sm text-muted-foreground">Level {u.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{u.xp_total?.toLocaleString()} XP</p>
                      <p className="text-xs text-muted-foreground">{u.badge_count} badge</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Riwayat XP</CardTitle></CardHeader>
            <CardContent>
              {xpLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada riwayat XP.</p>
              ) : (
                <div className="space-y-3">
                  {xpLogs.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm capitalize">{l.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("id-ID")}</p>
                      </div>
                      <span className="font-bold text-primary">+{l.xp_amount} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}