"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, Users, Star, Save, Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

export default function GuideDashboardPage() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ guide_name: "", bio: "", price_per_day: 0, operating_locations: "", languages: "" })

  useEffect(() => { if (user) fetchData() }, [user])

  async function fetchData() {
    setLoading(true)
    const { data: gp } = await supabase
      .from("guide_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single()
    setProfile(gp)
    if (gp) {
      setEditForm({
        guide_name: gp.guide_name,
        bio: gp.bio || "",
        price_per_day: gp.price_per_day,
        operating_locations: (gp.operating_locations || []).join(", "),
        languages: (gp.languages || []).join(", "),
      })
      const { data: bk } = await supabase
        .from("guide_bookings")
        .select("*, user:user_profiles(display_name,avatar_url)")
        .eq("guide_id", gp.id)
        .order("created_at", { ascending: false })
      setBookings(bk || [])
    }
    setLoading(false)
  }

  async function updateProfile() {
    if (!profile) return
    setSaving(true)
    await supabase.from("guide_profiles").update({
      guide_name: editForm.guide_name,
      bio: editForm.bio || null,
      price_per_day: editForm.price_per_day,
      operating_locations: editForm.operating_locations.split(",").map(s => s.trim()).filter(Boolean),
      languages: editForm.languages.split(",").map(s => s.trim()).filter(Boolean),
    }).eq("id", profile.id)
    setSaving(false)
    fetchData()
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    await supabase.from("guide_bookings").update({ status }).eq("id", bookingId)
    fetchData()
  }

  const totalEarnings = bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + b.total_price, 0)
  const pendingBookings = bookings.filter(b => b.status === "pending").length

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Kamu belum terdaftar sebagai guide</h2>
        <a href="/guides/register"><Button>Daftar Sekarang</Button></a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Guide</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Rating", value: profile.rating_avg?.toFixed(1) || "0.0", icon: Star, color: "text-yellow-500" },
          { label: "Total Booking", value: bookings.length, icon: Calendar, color: "text-blue-500" },
          { label: "Pending", value: pendingBookings, icon: Clock, color: "text-orange-500" },
          { label: "Pendapatan", value: `Rp ${totalEarnings.toLocaleString("id-ID")}`, icon: DollarSign, color: "text-green-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings"><Calendar className="h-4 w-4 mr-1" /> Booking</TabsTrigger>
          <TabsTrigger value="profile"><Users className="h-4 w-4 mr-1" /> Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Belum ada booking.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <Card key={b.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{b.user?.display_name || "Wisatawan"}</p>
                      <p className="text-sm text-muted-foreground">{b.booking_date} &bull; {b.duration_days} hari &bull; Rp {b.total_price.toLocaleString("id-ID")}</p>
                      {b.notes && <p className="text-sm text-muted-foreground mt-1">{b.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.status === "pending" ? "outline" : b.status === "confirmed" ? "default" : b.status === "completed" ? "secondary" : "destructive"}>
                        {b.status}
                      </Badge>
                      {b.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")}><CheckCircle className="h-4 w-4 mr-1" /> Terima</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateBookingStatus(b.id, "cancelled")}><XCircle className="h-4 w-4 mr-1" /> Tolak</Button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateBookingStatus(b.id, "completed")}>Selesai</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Edit Profil Guide</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Nama Guide</Label><Input value={editForm.guide_name} onChange={e => setEditForm({...editForm, guide_name: e.target.value})} /></div>
              <div><Label>Bio</Label><Textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={4} /></div>
              <div><Label>Harga per Hari (Rp)</Label><Input type="number" value={editForm.price_per_day} onChange={e => setEditForm({...editForm, price_per_day: +e.target.value})} /></div>
              <div><Label>Lokasi Operasional (koma)</Label><Input value={editForm.operating_locations} onChange={e => setEditForm({...editForm, operating_locations: e.target.value})} /></div>
              <div><Label>Bahasa (koma)</Label><Input value={editForm.languages} onChange={e => setEditForm({...editForm, languages: e.target.value})} /></div>
              <Button onClick={updateProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
