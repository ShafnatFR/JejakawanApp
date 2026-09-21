"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { TripRequest, Destination } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, MapPin, Calendar, DollarSign, Plus, Star, Shield } from "lucide-react"

export default function MatchPage() {
  const { user, profile } = useAuthStore()
  const [trips, setTrips] = useState<TripRequest[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ destination_id: "", date_from: "", date_to: "", budget_min: 0, budget_max: 2000000, transport_modes: ["mobil"], max_members: 4, notes: "" })
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: d } = await supabase.from("destinations").select("id,name,province").eq("is_active", true).order("name")
    setDestinations(d || [])
    const { data: t } = await supabase.from("trip_requests").select("*, creator:user_profiles!creator_id(display_name,avatar_url,rating_avg,ktp_verified), destination:destinations(name,province)").eq("status", "open").order("created_at", { ascending: false }).limit(20)
    setTrips(t || [])
    setLoading(false)
  }

  async function createTrip() {
    if (!user) return
    const supabase = createClient()
    await supabase.from("trip_requests").insert({ creator_id: user.id, ...form, date_from: form.date_from || new Date().toISOString().split("T")[0], date_to: form.date_to || new Date(Date.now() + 3*86400000).toISOString().split("T")[0] })
    setDialogOpen(false)
    fetchData()
  }

  async function viewCandidates(tripId: string) {
    setSelectedTrip(tripId)
    const supabase = createClient()
    const { data: matches } = await supabase.from("trip_matches").select("*, invitee:user_profiles!invitee_id(display_name,avatar_url,rating_avg,ktp_verified,preferred_interests)").eq("trip_request_id", tripId).order("compatibility", { ascending: false })
    setCandidates(matches || [])
  }

  async function sendMatch(tripId: string, inviteeId: string) {
    if (!user) return
    const supabase = createClient()
    const compat = Math.floor(Math.random() * 30) + 70
    await supabase.from("trip_matches").insert({ trip_request_id: tripId, inviter_id: user.id, invitee_id: inviteeId, compatibility: compat })
    alert("Undangan terkirim!")
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
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Buat Trip Baru</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Buat Trip Request</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Destinasi</Label>
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12"><Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-medium mb-2">Belum ada trip aktif</h3><p className="text-muted-foreground">Jadilah yang pertama membuat trip!</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map(trip => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{(trip as any).destination?.name || trip.destination_name || "Destinasi"}</h3>
                    <p className="text-sm text-muted-foreground">{(trip as any).destination?.province || ""}</p>
                  </div>
                  <Badge variant="outline">{trip.status}</Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{trip.date_from} - {trip.date_to}</span></div>
                  <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" /><span>Rp {trip.budget_min.toLocaleString("id-ID")} - {trip.budget_max.toLocaleString("id-ID")}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{trip.current_members}/{trip.max_members} anggota</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">{(trip as any).creator?.display_name?.[0] || "?"}</div>
                    <div>
                      <p className="text-sm font-medium">{(trip as any).creator?.display_name || "Anonim"}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{(trip as any).creator?.rating_avg?.toFixed(1) || "0.0"}</span>
                        {(trip as any).creator?.ktp_verified && <Shield className="h-3 w-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  {user && user.id !== trip.creator_id && (
                    <Button size="sm" onClick={() => sendMatch(trip.id, user.id)}>Ajak Match</Button>
                  )}
                </div>
                {trip.notes && <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted rounded">{trip.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}