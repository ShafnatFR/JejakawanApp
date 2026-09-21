"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Badge as BadgeType, Mission, MissionClaim } from "@/types/database"
import { claimMission, completeMission, getLeaderboard, getXPHistory, getLevelFromXP, getNextLevelThreshold, getLevelThreshold } from "@/lib/gamification"
import { formatXP, getLevelThreshold as getLevelThresholdUtil } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy, Star, Target, Award, Zap, MapPin, TrendingUp, CheckCircle, Clock, Gift, Sparkles } from "lucide-react"

export default function GamificationPage() {
  const { user, profile } = useAuthStore()
  const supabase = createClient()
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [myClaims, setMyClaims] = useState<MissionClaim[]>([])
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [xpLogs, setXpLogs] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [proofDialog, setProofDialog] = useState<{ open: boolean; claimId: string | null }>({ open: false, claimId: null })
  const [proofUrl, setProofUrl] = useState("")
  const [newBadgeUnlock, setNewBadgeUnlock] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [user])

  async function fetchData() {
    const { data: b } = await supabase.from("badges").select("*").order("xp_required")
    setBadges(b || [])

    const { data: m } = await supabase
      .from("missions")
      .select("*, destination:destinations(name,province)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
    setMissions(m || [])

    if (user) {
      const { data: ub } = await supabase.from("user_badges").select("badge_id").eq("user_id", user.id)
      setUserBadges(ub?.map((b: any) => b.badge_id) || [])

      const { data: claims } = await supabase
        .from("mission_claims")
        .select("*, mission:missions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setMyClaims(claims || [])

      const logs = await getXPHistory(user.id, 20)
      setXpLogs(logs)
    }

    const lb = await getLeaderboard(10)
    setLeaderboard(lb)
  }

  async function handleClaimMission(missionId: string) {
    if (!user) return
    setClaiming(missionId)
    const result = await claimMission(user.id, missionId)
    if (result.success) {
      await fetchData()
    } else {
      alert(result.error)
    }
    setClaiming(null)
  }

  async function handleCompleteMission(claimId: string) {
    setCompleting(claimId)
    const result = await completeMission(claimId, proofUrl || undefined)
    if (result.success) {
      setProofDialog({ open: false, claimId: null })
      setProofUrl("")
      await fetchData()
      // Check for new badges
      if (user) {
        const { checkBadgeUnlock } = await import("@/lib/gamification")
        const newBadges = await checkBadgeUnlock(user.id)
        if (newBadges.length > 0) {
          setNewBadgeUnlock(newBadges[0])
          setTimeout(() => setNewBadgeUnlock(null), 5000)
        }
      }
    } else {
      alert(result.error)
    }
    setCompleting(null)
  }

  function getClaimStatus(missionId: string) {
    return myClaims.find(c => c.mission_id === missionId)
  }

  const level = profile?.level || 1
  const xp = profile?.xp_total || 0
  const currentThreshold = getLevelThreshold(level)
  const nextThreshold = getNextLevelThreshold(level)
  const progress = nextThreshold > currentThreshold
    ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gamifikasi</h1>

      {/* Badge unlock animation */}
      {newBadgeUnlock && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              <div>
                <p className="font-bold">Badge Baru!</p>
                <p className="text-sm opacity-90">Kamu membuka badge baru!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <p className="text-4xl font-bold">{formatXP(xp)}</p>
              </div>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3 bg-white/20" />
            <p className="text-sm opacity-80 mt-2">
              {nextThreshold - xp > 0
                ? `${nextThreshold - xp} XP lagi untuk Level ${level + 1}`
                : "Level maksimal!"}
            </p>
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
            {missions.map(m => {
              const claim = getClaimStatus(m.id)
              return (
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
                      <span className="text-xs text-muted-foreground">
                        {m.current_claims}/{m.max_claims || "∞"} diklaim
                      </span>
                      {user && !claim && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClaimMission(m.id)}
                          disabled={claiming === m.id || (m.max_claims !== null && m.current_claims >= m.max_claims)}
                        >
                          {claiming === m.id ? "Mengklaim..." : "Klaim Misi"}
                        </Button>
                      )}
                      {claim && claim.status === "claimed" && (
                        <Button
                          size="sm"
                          onClick={() => setProofDialog({ open: true, claimId: claim.id })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Selesaikan
                        </Button>
                      )}
                      {claim && claim.status === "in_progress" && (
                        <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Dikerjakan</Badge>
                      )}
                      {claim && claim.status === "completed" && (
                        <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Selesai</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {missions.length === 0 && (
              <p className="col-span-2 text-center text-muted-foreground py-8">Belum ada misi aktif.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map(b => {
              const earned = userBadges.includes(b.id)
              return (
                <Card key={b.id} className={`text-center ${earned ? "border-primary" : "opacity-60"}`}>
                  <CardContent className="p-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2 ${earned ? "bg-primary/10" : "bg-muted"}`}>
                      {earned ? "🏆" : "🔒"}
                    </div>
                    <h4 className="font-medium text-sm">{b.name}</h4>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                    {b.xp_required > 0 && (
                      <Badge variant="outline" className="mt-2 text-xs">{b.xp_required} XP</Badge>
                    )}
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
                  <div
                    key={u.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      u.id === user?.id ? "bg-primary/10 border border-primary/20" : "bg-muted"
                    }`}
                  >
                    <span className="text-2xl font-bold w-8 text-center">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                      {u.display_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{u.display_name}</p>
                      <p className="text-sm text-muted-foreground">Level {u.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatXP(u.xp_total || 0)} XP</p>
                      <p className="text-xs text-muted-foreground">{u.badge_count} badge</p>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Belum ada data leaderboard.</p>
                )}
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
                        <p className="text-xs text-muted-foreground">
                          {new Date(l.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
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

      {/* Proof URL Dialog */}
      <Dialog open={proofDialog.open} onOpenChange={open => setProofDialog({ open, claimId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Misi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL Bukti (opsional)</Label>
              <Input
                placeholder="https://..."
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload foto atau link bukti kunjungan kamu.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => proofDialog.claimId && handleCompleteMission(proofDialog.claimId)}
              disabled={completing === proofDialog.claimId}
            >
              {completing === proofDialog.claimId ? "Memproses..." : "Selesaikan Misi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
