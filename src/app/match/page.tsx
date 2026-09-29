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
import {
  Users, MapPin, Calendar, DollarSign, Plus, Star, Shield, CheckCircle, XCircle,
  AlertTriangle, Loader2, ExternalLink, Compass, Heart, Handshake, SlidersHorizontal,
  ChevronDown, Plane, Send, ListChecks, Sparkles, ShieldAlert
} from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("trips")
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
    const { data: d } = await supabase.from("destinations").select("id,name,province").eq("is_active", true).order("name")
    setDestinations(d || [])

    const { data: t } = await supabase
      .from("trip_requests")
      .select("*, creator:user_profiles!creator_id(display_name,avatar_url,rating_avg,ktp_verified,level), destination:destinations(name,province)")
      .eq("status", "open").order("created_at", { ascending: false }).limit(20)
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
    if (match) { alert("Undangan terkirim!"); fetchData() }
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
      case "pending": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><Loader2 className="h-3 w-3 animate-spin" />Menunggu</span>
      case "accepted": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="h-3 w-3" />Diterima</span>
      case "declined": return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200"><XCircle className="h-3 w-3" />Ditolak</span>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  function getCompatibilityBar(score: number) {
    const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-indigo-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-sm font-bold w-10 text-right">{score}%</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Bar */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Trip Matching</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-2xl">
              Cari teman perjalanan yang kompatibel berdasarkan rute, minat petualangan, dan kesamaan preferensi travelingmu.
            </p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  disabled={eligibility && !eligibility.eligible}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-sm shadow-indigo-200 transition disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Trip Baru</span>
                </button>
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
        </section>

        {/* Eligibility warning */}
        {eligibility && !eligibility.eligible && (
          <aside className="mb-7 bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-amber-900">Verifikasi Identitas Diperlukan</h2>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 text-amber-900">Tindakan Diperlukan</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">{eligibility.reason}</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-7">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-xl max-w-fit">
            <button
              onClick={() => setActiveTab("trips")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === "trips" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Trip Aktif</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">{trips.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("candidates")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === "candidates" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kandidat Match</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{candidates.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === "matches" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>Match Saya</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{myMatches.length}</span>
            </button>
          </div>
        </div>

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />)}
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada trip aktif</h3>
                <p className="text-slate-500 text-sm">Jadilah yang pertama membuat trip!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {trips.map((trip, idx) => (
                  <article key={trip.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                    <div className="p-6 sm:p-7 flex flex-col justify-between">
                      <div>
                        {/* Host */}
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-slate-200 border-2 border-indigo-100 overflow-hidden flex items-center justify-center font-bold text-slate-700 text-sm">
                              {trip.creator?.display_name?.[0] || "?"}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-sm sm:text-base">{trip.creator?.display_name || "Anonim"}</span>
                                {trip.creator?.ktp_verified && <Shield className="w-4 h-4 text-indigo-600" />}
                              </div>
                              <p className="text-xs text-slate-500">Solo Backpacker</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg text-amber-800 text-xs font-semibold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{trip.creator?.rating_avg?.toFixed(1) || "0.0"} / 5.0</span>
                          </div>
                        </div>
                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-snug">
                          {trip.destination?.name || "Destinasi"}
                        </h2>
                        {trip.notes && <p className="text-sm text-slate-600 line-clamp-2 mb-5">{trip.notes}</p>}
                        {/* Meta */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                          <div className="flex flex-col">
                            <span className="text-slate-400 font-medium mb-0.5">Waktu Berangkat</span>
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> {trip.date_from} - {trip.date_to}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-400 font-medium mb-0.5">Estimasi Biaya</span>
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-indigo-600" /> Rp {trip.budget_max?.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex flex-col col-span-2 sm:col-span-1">
                            <span className="text-slate-400 font-medium mb-0.5">Kapasitas Teman</span>
                            <span className="font-bold text-indigo-600 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-indigo-600" /> {trip.current_members}/{trip.max_members} Terisi
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
                        <Link href={`/trips/${trip.id}`} className="w-full sm:w-auto">
                          <button className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition flex items-center justify-center gap-1.5">
                            <ListChecks className="w-4 h-4" />
                            <span>Lihat Detail</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => viewCandidates(trip.id)}
                          className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <Users className="w-4 h-4" />
                          <span>Cari Kandidat</span>
                        </button>
                        {user && user.id !== trip.creator_id && (
                          <button
                            onClick={() => handleSendMatch(trip.id, user.id)}
                            className="w-full sm:w-auto flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>Kirim Permintaan Gabung</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div className="space-y-4">
            {!selectedTrip ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                  <Users className="w-10 h-10" />
                </div>
                <p className="text-slate-500 font-medium">Pilih trip dan klik &quot;Cari Kandidat&quot; untuk melihat calon teman perjalanan.</p>
              </div>
            ) : loadingCandidates ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-indigo-600" />
                <p className="text-slate-500">Mencari kandidat yang kompatibel...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500">Belum ada kandidat yang cocok. Coba buat trip baru atau perluas kriteria.</p>
              </div>
            ) : (
              candidates.map((c) => (
                <article key={c.trip.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                        {c.trip.creator?.display_name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{c.trip.creator?.display_name || "Anonim"}</span>
                          {c.trip.creator?.ktp_verified && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                        <span className="text-xs text-slate-500">{c.trip.destination?.name}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Heart className="w-3 h-3" /> {c.compatibility}% Cocok
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="text-center">
                      <p className="text-slate-400">Destinasi</p>
                      <p className="font-bold text-slate-800">{Math.round(c.factors.destination * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Tanggal</p>
                      <p className="font-bold text-slate-800">{Math.round(c.factors.date_overlap * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Budget</p>
                      <p className="font-bold text-slate-800">{Math.round(c.factors.budget_overlap * 100)}%</p>
                    </div>
                  </div>
                  {getCompatibilityBar(c.compatibility)}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleSendMatch(c.trip.id, c.trip.creator_id)}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition"
                    >
                      Ajak Cocok / Match
                    </button>
                    <button onClick={() => setSelectedTrip(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition">
                      Kembali
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === "matches" && (
          <div className="space-y-4">
            {myMatches.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Belum ada match</h3>
                <p className="text-slate-500 text-sm">Buat trip atau ajak orang lain untuk match!</p>
              </div>
            ) : (
              myMatches.map((m) => (
                <article key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{m.trip_request?.destination?.name || "Trip"}</h3>
                      <p className="text-sm text-slate-500">
                        {user?.id === m.inviter_id
                          ? `Mengajak: ${m.invitee?.display_name}`
                          : `Diajak oleh: ${m.inviter?.display_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Heart className="w-3 h-3" /> {m.compatibility}%
                      </span>
                      {getStatusBadge(m.status)}
                    </div>
                  </div>
                  {m.status === "pending" && user?.id === m.invitee_id && (
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button onClick={() => handleAccept(m.id)} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Terima
                      </button>
                      <button onClick={() => handleDecline(m.id)} className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-700 font-medium text-sm rounded-xl transition flex items-center justify-center gap-1.5">
                        <XCircle className="h-4 w-4" /> Tolak
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* CTA */}
        <section className="mt-8 bg-gradient-to-r from-indigo-50 via-slate-50 to-white rounded-2xl border border-indigo-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Belum menemukan tujuan perjalanan yang pas?</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Tentukan rute, tanggal impian, dan budget fleksibelmu. Biarkan algoritma Jejakawan mencocokkan teman perjalanan terbaik.</p>
            </div>
          </div>
          <button className="flex-shrink-0 px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition">
            Mulai Rancang Rute Saya
          </button>
        </section>
      </main>
    </div>
  )
}
