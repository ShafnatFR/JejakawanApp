"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "../../../lib/supabase/client"
import { Destination, Review } from "../../../types/database"
import { submitReport, blockUser, getTrustScore } from "../../../lib/safety"
import { getTrustScoreColor } from "../../../lib/utils"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { MapPin, Star, Wifi, Calendar, DollarSign, Sparkles, Heart, Share2, MessageCircle, Flag, MoreVertical, Ban, Shield } from "lucide-react"
import { useAuthStore } from "../../../stores/auth"

const REPORT_REASONS = [
  { value: "spam", label: "Spam atau iklan" },
  { value: "inappropriate", label: "Konten tidak pantas" },
  { value: "fake", label: "Informasi palsu" },
  { value: "harassment", label: "Pelecehan atau intimidasi" },
  { value: "scam", label: "Penipuan" },
  { value: "other", label: "Lainnya" },
]

export default function DestinationDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const supabase = createClient()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewerTrustScores, setReviewerTrustScores] = useState<Record<string, number>>({})
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(true)
  const [reportDialog, setReportDialog] = useState({ open: false, targetType: "destination" as "user" | "content", targetId: "" })
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [reporting, setReporting] = useState(false)
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    if (params.id) fetchDestination(params.id as string)
  }, [params.id])

  async function fetchDestination(id: string) {
    const { data: dest } = await supabase.from("destinations").select("*").eq("id", id).single()
    setDestination(dest)

    const { data: revs } = await supabase
      .from("reviews")
      .select("*, reviewer:user_profiles!reviewer_id(id,display_name,avatar_url,ktp_verified,rating_avg)")
      .eq("target_id", id)
      .eq("target_type", "destination")
      .order("created_at", { ascending: false })
      .limit(10)
    setReviews(revs || [])

    // Fetch trust scores for reviewers
    if (revs && revs.length > 0) {
      const scores: Record<string, number> = {}
      for (const rev of revs) {
        const reviewerId = (rev.reviewer as any)?.id
        if (reviewerId) {
          scores[reviewerId] = await getTrustScore(reviewerId)
        }
      }
      setReviewerTrustScores(scores)
    }

    setLoading(false)
  }

  async function submitReview() {
    if (!user || !newReview.trim()) return
    await supabase.from("reviews").insert({
      reviewer_id: user.id,
      target_type: "destination",
      target_id: params.id as string,
      rating,
      comment: newReview,
    })
    setNewReview("")
    fetchDestination(params.id as string)
  }

  async function handleReport() {
    if (!user || !reportReason) return
    setReporting(true)
    const result = await submitReport(
      user.id,
      "content",
      params.id as string,
      reportReason,
      reportDescription || undefined
    )
    if (result.success) {
      alert("Laporan berhasil dikirim. Tim kami akan meninjau.")
      setReportDialog({ open: false, targetType: "content", targetId: "" })
      setReportReason("")
      setReportDescription("")
    } else {
      alert(result.error)
    }
    setReporting(false)
  }

  async function handleBlockUser(userId: string) {
    if (!user) return
    if (!confirm("Yakin ingin memblokir pengguna ini?")) return
    setBlocking(true)
    const result = await blockUser(user.id, userId)
    if (result.success) {
      alert("Pengguna berhasil diblokir.")
    } else {
      alert(result.error)
    }
    setBlocking(false)
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>
  if (!destination) return <div className="container mx-auto px-4 py-8 text-center"><p>Destinasi tidak ditemukan.</p></div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-indigo-400 to-teal-400">
        {destination.cover_image_url ? (
          <img src={destination.cover_image_url} alt={destination.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white"><MapPin className="h-24 w-24" /></div>
        )}
        {destination.is_underrated && (
          <Badge className="absolute top-4 right-4 bg-amber-500"><Sparkles className="h-3 w-3 mr-1" /> Hidden Gem</Badge>
        )}
      </div>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{destination.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{destination.address || `${destination.regency}, ${destination.province}`}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><Heart className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
          {user && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setReportDialog({ open: true, targetType: "content", targetId: params.id as string })}
            >
              <Flag className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" /><p className="text-lg font-bold">{destination.rating_avg?.toFixed(1) || "0.0"}</p><p className="text-xs text-muted-foreground">Rating</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" /><p className="text-lg font-bold">Rp {destination.entry_fee_min?.toLocaleString("id-ID")}</p><p className="text-xs text-muted-foreground">Tiket masuk</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Wifi className="h-5 w-5 mx-auto mb-1 text-blue-500" /><p className="text-lg font-bold capitalize">{destination.signal_strength || "N/A"}</p><p className="text-xs text-muted-foreground">Sinyal</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="h-5 w-5 mx-auto mb-1 text-purple-500" /><p className="text-lg font-bold">{destination.visit_count || 0}</p><p className="text-xs text-muted-foreground">Pengunjung</p></CardContent></Card>
      </div>

      <div className="flex gap-2 mb-6">
        {destination.category?.map(c => <Badge key={c} variant="secondary" className="capitalize">{c.replace("_", " ")}</Badge>)}
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Tentang</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground leading-relaxed">{destination.description || "Belum ada deskripsi."}</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Review ({reviews.length})</CardTitle></CardHeader>
        <CardContent>
          {user && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star className={`h-5 w-5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Tulis review..." value={newReview} onChange={e => setNewReview(e.target.value)} className="mb-2" />
              <Button onClick={submitReview} size="sm">Kirim Review</Button>
            </div>
          )}
          <div className="space-y-4">
            {reviews.map(r => {
              const reviewer = r.reviewer as any
              const trustScore = reviewer?.id ? reviewerTrustScores[reviewer.id] || 0 : 0
              return (
                <div key={r.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">{reviewer?.display_name?.[0] || "?"}</div>
                      <div>
                        <span className="font-medium text-sm">{reviewer?.display_name || "Anonim"}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}</div>
                          {reviewer?.ktp_verified && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              <Shield className="h-3 w-3 mr-1" /> KTP
                            </Badge>
                          )}
                          {trustScore > 0 && (
                            <span className={`text-xs font-medium ${getTrustScoreColor(trustScore)}`}>
                              Trust: {trustScore}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {user && reviewer?.id && reviewer.id !== user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setReportDialog({ open: true, targetType: "user", targetId: reviewer.id })}>
                            <Flag className="h-4 w-4 mr-2" /> Laporkan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBlockUser(reviewer.id)} className="text-red-600">
                            <Ban className="h-4 w-4 mr-2" /> Blokir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              )
            })}
            {reviews.length === 0 && <p className="text-center text-muted-foreground py-4">Belum ada review.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={reportDialog.open} onOpenChange={open => setReportDialog({ ...reportDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reportDialog.targetType === "user" ? "Laporkan Pengguna" : "Laporkan Destinasi"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Alasan</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Detail (opsional)</Label>
              <Textarea
                placeholder="Jelaskan lebih detail..."
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleReport} disabled={!reportReason || reporting}>
              {reporting ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
