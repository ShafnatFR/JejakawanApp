"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { TripRequest, TripMatch, Destination } from "@/types/database"
import { findCandidates, sendMatchRequest, acceptMatch, declineMatch, Candidate } from "@/lib/matching"
import { checkMatchingEligibility } from "@/lib/safety"
import { getCompatibilityColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, MapPin, Calendar, DollarSign, Plus, Star, Shield, CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function MatchPage() {
  const { user, profile } = useAuthStore()
  const supabase = createClient()
  const [trips, setTrips] = useState<any[]>([])
  const [myMatches, setMyMatches] = useState<any[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null)
  const [form, setForm] = useState({
    destination_id: "",
    date_from: "",
    date_to: "",
    budget_min: 0,
    budget_max: 2000000,
    transport_modes: ["mobil"],
    max_members: 4,
    notes: "",
  })

  useEffect(() => {
    fetchData()
    if (user) {
      checkMatchingEligibility(user.id).then(setEligibility)
    }
  }, [user])

  async function fetchData() {
    setLoading(true)
    const { data: d } = await supabase
      .from("destinations")
      .select("id,name,province")
      .eq("is_active", true)
      .order("name")
    setDestinations(d || [])

    const { data: t } = await supabase
      .from("trip_requests")
      .select("*, creator:user_profiles!creator_id(display_name,avatar_url,rating_avg,ktp_verified,level), destination:destinations(name,province)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20)
    setTrips(t || [])

    if (user) {
      const { data: m } = await supabase
        .from("trip_matches")
        .select("*, inviter:user_profiles!inviter_id(display_name,avatar_url,rating_avg,ktp_verified,level), invitee:user_profiles!invitee_id(display_name,avatar_url,rating_avg,ktp_verified,level), trip_request:trip_requests(*, destination:destinations(name,province))")
        .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
      setMyMatches(m || [])
    }

    setLoading(false)
  }

  async function createTrip() {
    if (!user) return
    await supabase.from("trip_requests").insert({
      creator_id: user.id,
      ...form,
      date_from: form.date_from || new Date().toISOString().split("T")[0],
      date_to: form.date_to || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    })
    setDialogOpen(false)
    fetchData()
  }

  async function viewCandidates(tripId: string) {
    setSelectedTrip(tripId)
    setLoadingCandidates(true)
    const cands = await findCandidates(tripId)
    setCandidates(cands)
    setLoadingCandidates(false)
  }

  async function handleSendMatch(tripId: string, inviteeId: string) {
    if (!user) return
    const match = await sendMatchRequest(tripId, user.id, inviteeId)
    if (match) {
      alert("Undangan terkirim!")
      fetchData()
    }
  }

  async function handleAccept(matchId: string) {
    const success = await acceptMatch(matchId)
    if (success) fetchData()
  }

  async function handleDecline(matchId: string) {
    const success = await declineMatch(matchId)
    if (success) fetchData()
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-yellow-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menunggu</Badge>
      case "accepted": return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Diterima</Badge>
      case "declined": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  function getCompatibilityBar(score: number) {
    const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500"
    return (
      <div className="flex items-center gap-2">
        <Progress value={score} className={`h-2 flex-1 ${color}`} />
        <span className="text-sm font-bold w-10 text-right">{score}%</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Trip Matching</h1>
          <p className="text-muted-foreground">Cari teman perjalanan yang kompatibel</p>
        </div>
        {user && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={eligibility && !eligibility.eligible}>
                <Plus className="h-4 w-4 mr-2" /> Buat Trip Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Buat Trip Request</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Destinasi</Label>
                  <Select value={form.destination_id} onValueChange={v => setForm({...form, destination_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Pilih destinasi" /></SelectTrigger>
                    <SelectContent>{destinations.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - {d.province}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Dari</Label><Input type="date" value={form.date_from} onChange={e => setForm({...form, date_from: e.target.value})} /></div>
                  <div><Label>Sampai</Label><Input type="date" value={form.date_to} onChange={e => setForm({...form, date_to: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Budget Min</Label><Input type="number" value={form.budget_min} onChange={e => setForm({...form, budget_min: +e.target.value})} /></div>
                  <div><Label>Budget Max</Label><Input type="number" value={form.budget_max} onChange={e => setForm({...form, budget_max: +e.target.value})} /></div>
                </div>
                <div><Label>Maks Anggota</Label><Input type="number" min={1} max={10} value={form.max_members} onChange={e => setForm({...form, max_members: +e.target.value})} /></div>
                <div><Label>Catatan</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Ceritakan tentang tripmu..." /></div>
                <Button onClick={createTrip} className="w-full">Buat Trip</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Eligibility warning */}
      {eligibility && !eligibility.eligible && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Tidak bisa membuat trip</p>
              <p className="text-xs text-red-600">{eligibility.reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="trips" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trips">
            <MapPin className="h-4 w-4 mr-1" /> Trip Aktif
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="h-4 w-4 mr-1" /> Kandidat
          </TabsTrigger>
          <TabsTrigger value="matches">
            <CheckCircle className="h-4 w-4 mr-1" /> Match Saya
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Belum ada trip aktif</h3>
              <p className="text-muted-foreground">Jadilah yang pertama membuat trip!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map(trip => (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{trip.destination?.name || "Destinasi"}</h3>
                        <p className="text-sm text-muted-foreground">{trip.destination?.province || ""}</p>
                      </div>
                      <Badge variant="outline">{trip.status}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{trip.date_from} - {trip.date_to}</span></div>
                      <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>Rp {trip.budget_min?.toLocaleString("id-ID")} - {trip.budget_max?.toLocaleString("id-ID")}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{trip.current_members}/{trip.max_members} anggota</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">{trip.creator?.display_name?.[0] || "?"}</div>
                        <div>
                          <p className="text-sm font-medium">{trip.creator?.display_name || "Anonim"}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{trip.creator?.rating_avg?.toFixed(1) || "0.0"}</span>
                            {trip.creator?.ktp_verified && <Shield className="h-3 w-3 text-green-500" />}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/trips/${trip.id}`}>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4 mr-1" /> Detail
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => viewCandidates(trip.id)}>
                          Cari Kandidat
                        </Button>
                        {user && user.id !== trip.creator_id && (
                          <Button size="sm" onClick={() => handleSendMatch(trip.id, user.id)}>
                            Ajak Match
                          </Button>
                        )}
                      </div>
                    </div>
                    {trip.notes && <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted rounded">{trip.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="candidates">
          {!selectedTrip ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Pilih trip dan klik "Cari Kandidat" untuk melihat calon teman perjalanan.</p>
            </div>
          ) : loadingCandidates ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Mencari kandidat yang kompatibel...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada kandidat yang cocok. Coba buat trip baru atau perluas kriteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map(c => (
                <Card key={c.trip.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">
                          {c.trip.creator?.display_name?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="font-semibold">{c.trip.creator?.display_name || "Anonim"}</h3>
                          <p className="text-sm text-muted-foreground">{c.trip.destination?.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{c.trip.creator?.rating_avg?.toFixed(1) || "0.0"}</span>
                            {c.trip.creator?.ktp_verified && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                <Shield className="h-3 w-3 mr-1" /> Terverifikasi
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={getCompatibilityColor(c.compatibility)}>
                        {c.compatibility}% cocok
                      </Badge>
                    </div>

                    {/* Compatibility breakdown */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Destinasi</p>
                        <p className="font-bold text-sm">{Math.round(c.factors.destination * 100)}%</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Tanggal</p>
                        <p className="font-bold text-sm">{Math.round(c.factors.date_overlap * 100)}%</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-bold text-sm">{Math.round(c.factors.budget_overlap * 100)}%</p>
                      </div>
                    </div>

                    {getCompatibilityBar(c.compatibility)}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1" onClick={() => handleSendMatch(c.trip.id, c.trip.creator_id)}>
                        Ajak Match
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedTrip(null)}>
                        Kembali
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches">
          {myMatches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada match. Buat trip atau ajak orang lain untuk match!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myMatches.map(m => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{m.trip_request?.destination?.name || "Trip"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user?.id === m.inviter_id
                            ? `Mengajak: ${m.invitee?.display_name}`
                            : `Diajak oleh: ${m.inviter?.display_name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCompatibilityColor(m.compatibility)}>
                          {m.compatibility}%
                        </Badge>
                        {getStatusBadge(m.status)}
                      </div>
                    </div>
                    {m.status === "pending" && user?.id === m.invitee_id && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={() => handleAccept(m.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Terima
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDecline(m.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Tolak
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
