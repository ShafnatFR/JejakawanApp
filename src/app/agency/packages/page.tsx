"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, Loader2, Package } from "lucide-react"

export default function AgencyPackagesPage() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const [agency, setAgency] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    start_date: "",
    end_date: "",
    max_participants: 20,
    destination_id: "",
    includes: "",
    excludes: "",
  })

  useEffect(() => { if (user) fetchData() }, [user])

  async function fetchData() {
    setLoading(true)
    const { data: ag } = await supabase.from("agency_profiles").select("*").eq("user_id", user!.id).single()
    setAgency(ag)

    const { data: dests } = await supabase.from("destinations").select("id,name,province").eq("is_active", true).order("name")
    setDestinations(dests || [])

    if (ag) {
      const { data: tr } = await supabase
        .from("open_trips")
        .select("*, destination:destinations(name,province)")
        .eq("agency_id", ag.id)
        .order("created_at", { ascending: false })
      setTrips(tr || [])
    }
    setLoading(false)
  }

  function openCreate() {
    setEditingId(null)
    setForm({ title: "", description: "", price: 0, start_date: "", end_date: "", max_participants: 20, destination_id: "", includes: "", excludes: "" })
    setDialogOpen(true)
  }

  function openEdit(trip: any) {
    setEditingId(trip.id)
    setForm({
      title: trip.title,
      description: trip.description || "",
      price: trip.price,
      start_date: trip.start_date,
      end_date: trip.end_date,
      max_participants: trip.max_participants,
      destination_id: trip.destination_id || "",
      includes: (trip.includes || []).join(", "),
      excludes: (trip.excludes || []).join(", "),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!agency) return
    if (!form.title || !form.price) return alert("Judul dan harga wajib diisi")
    setSaving(true)

    const payload = {
      agency_id: agency.id,
      title: form.title,
      description: form.description || null,
      price: form.price,
      start_date: form.start_date || new Date().toISOString().split("T")[0],
      end_date: form.end_date || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      max_participants: form.max_participants,
      destination_id: form.destination_id || null,
      includes: form.includes.split(",").map(s => s.trim()).filter(Boolean),
      excludes: form.excludes.split(",").map(s => s.trim()).filter(Boolean),
    }

    if (editingId) {
      const { error } = await supabase.from("open_trips").update(payload).eq("id", editingId)
      if (error) alert("Gagal update: " + error.message)
    } else {
      const { error } = await supabase.from("open_trips").insert(payload)
      if (error) alert("Gagal membuat: " + error.message)
    }

    setSaving(false)
    setDialogOpen(false)
    fetchData()
  }

  async function handleDelete(tripId: string) {
    if (!confirm("Yakin hapus paket ini?")) return
    await supabase.from("open_trips").update({ is_active: false }).eq("id", tripId)
    fetchData()
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>

  if (!agency) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Kamu belum terdaftar sebagai agensi.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kelola Paket Trip</h1>
          <p className="text-muted-foreground">Buat dan kelola open trip</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Buat Paket Baru</Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Belum ada paket trip</h3>
          <p className="text-muted-foreground">Buat paket open trip pertamamu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{t.title}</p>
                    <Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Aktif" : "Nonaktif"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.destination?.name || "-"} &bull; Rp {t.price?.toLocaleString("id-ID")} &bull; {t.start_date} - {t.end_date}</p>
                  <p className="text-xs text-muted-foreground">{t.current_participants}/{t.max_participants} peserta</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Paket" : "Buat Paket Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Judul Trip *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Open Trip Bali 3D2N" /></div>
            <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detail trip..." rows={3} /></div>
            <div><Label>Harga (Rp) *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tanggal Mulai</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} /></div>
              <div><Label>Tanggal Selesai</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
            </div>
            <div><Label>Maks Peserta</Label><Input type="number" value={form.max_participants} onChange={e => setForm({...form, max_participants: +e.target.value})} /></div>
            <div><Label>Termasuk (koma)</Label><Input value={form.includes} onChange={e => setForm({...form, includes: e.target.value})} placeholder="Transport, Hotel, Makan" /></div>
            <div><Label>Tidak Termasuk (koma)</Label><Input value={form.excludes} onChange={e => setForm({...form, excludes: e.target.value})} placeholder="Tiket pesawat, Asuransi" /></div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? "Menyimpan..." : editingId ? "Update Paket" : "Buat Paket"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
