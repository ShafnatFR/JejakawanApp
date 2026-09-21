"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { UserProfile, Review } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrustBadge } from "@/components/safety/trust-badge"
import { VerificationBadges } from "@/components/safety/verification-badges"
import { ReportDialog } from "@/components/safety/report-dialog"
import { Star, MapPin, Award, Shield, Ban, Calendar, ArrowLeft } from "lucide-react"

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [tripCount, setTripCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [blockOpen, setBlockOpen] = useState(false)

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    if (user.id === id) { router.push("/profile"); return }
    fetchProfile()
  }, [id, user])

  async function fetchProfile() {
    setLoading(true)
    const supabase = createClient()

    const { data: p } = await supabase.from("user_profiles").select("*").eq("id", id).single()
    setProfile(p as UserProfile)

    const { data: r } = await supabase
      .from("reviews")
      .select("*, reviewer:user_profiles!reviewer_id(display_name,avatar_url)")
      .eq("target_id", id)
      .eq("target_type", "user")
      .order("created_at", { ascending: false })
      .limit(10)
    setReviews(r || [])

    const { count } = await supabase
      .from("trip_requests")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", id)
    setTripCount(count || 0)

    setLoading(false)
  }

  async function handleBlock() {
    if (!user || !id) return
    const supabase = createClient()
    await supabase.from("user_blocks").upsert({ blocker_id: user.id, blocked_id: id })
    setBlockOpen(false)
    router.push("/discover")
  }

  // Trust score calculation (mock: based on verification + rating)
  function getTrustScore(p: UserProfile): number {
    let score = 20 // base
    if (p.phone_verified) score += 20
    if (p.ktp_verified) score += 30
    score += Math.min(p.rating_avg * 6, 30) // max 30 from rating
    return Math.min(Math.round(score), 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60" /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Profil tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Kembali</Button>
      </div>
    )
  }

  const trustScore = getTrustScore(profile)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl">{profile.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.display_name}</h1>
              <p className="text-muted-foreground text-sm">{profile.bio || "Belum ada bio"}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="capitalize"><MapPin className="h-3 w-3 mr-1" />{profile.current_mode}</Badge>
                <TrustBadge score={trustScore} size="sm" />
              </div>
            </div>
          </div>

          {/* Verification badges */}
          <div className="mt-4">
            <VerificationBadges phoneVerified={profile.phone_verified} ktpVerified={profile.ktp_verified} clickable={false} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center mt-4 pt-4 border-t">
            <div>
              <p className="text-2xl font-bold text-primary">{tripCount}</p>
              <p className="text-xs text-muted-foreground">Trip</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{reviews.length}</p>
              <p className="text-xs text-muted-foreground">Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                {profile.rating_avg.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <ReportDialog reportedId={id} />
            <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-muted-foreground">
                  <Ban className="h-4 w-4 mr-1" /> Blokir
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Blokir Pengguna?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  {profile.display_name} tidak akan bisa melihat profilmu atau menghubungimu. Kamu bisa membuka blokir kapan saja di Pengaturan.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setBlockOpen(false)}>Batal</Button>
                  <Button variant="destructive" className="flex-1" onClick={handleBlock}>Blokir</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" /> Review ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum ada review.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={r.reviewer?.avatar_url || ""} />
                    <AvatarFallback>{r.reviewer?.display_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{r.reviewer?.display_name || "Anonim"}</p>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
