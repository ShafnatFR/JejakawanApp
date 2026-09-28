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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Star, Globe, DollarSign, Shield, Calendar, Loader2 } from "lucide-react"

export default function GuideDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore()
  const supabase = createClient()
  const [guide, setGuide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [booking, setBooking] = useState({ booking_date: "", duration_days: 1, notes: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchGuide() }, [params.id])

  async function fetchGuide() {
    setLoading(true)
    const { data } = await supabase
      .from("guide_profiles")
      .select("*, user:user_profiles(display_name,avatar_url,rating_avg,ktp_verified)")
      .eq("id", params.id)
      .single()
    setGuide(data)
    setLoading(false)
  }

  async function handleBook() {
    if (!user) return alert("Harus login dulu")
    if (!booking.booking_date) return alert("Pilih tanggal booking")
    setSubmitting(true)
    const { error } = await supabase.from("guide_bookings").insert({
      guide_id: guide.id,
      user_id: user.id,
      booking_date: booking.booking_date,
      duration_days: booking.duration_days,
      total_price: guide.price_per_day * booking.duration_days,
      notes: booking.notes || null,
    })
    if (error) {
      alert("Gagal booking: " + error.message)
    } else {
      alert("Booking berhasil! Guide akan mengonfirmasi.")
      setBookingOpen(false)
      setBooking({ booking_date: "", duration_days: 1, notes: "" })
    }
    setSubmitting(false)
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>
  if (!guide) return <div className="container mx-auto px-4 py-8 text-center"><p>Guide tidak ditemukan.</p></div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold">
              {guide.photo_url ? (
                <img src={guide.photo_url} alt={guide.guide_name} className="w-20 h-20 rounded-full object-cover" />
              ) : guide.guide_name[0]}
            </div>
            <div>
              <CardTitle className="text-2xl">{guide.guide_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{guide.rating_avg?.toFixed(1) || "0.0"}</span>
                <span className="text-sm text-muted-foreground">({guide.rating_count} ulasan)</span>
                {guide.is_verified && <Badge className="bg-green-500"><Shield className="h-3 w-3 mr-1" /> Terverifikasi</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {guide.bio && (
            <div>
              <h3 className="font-semibold mb-2">Tentang</h3>
              <p className="text-muted-foreground">{guide.bio}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Harga</p>
              <p className="font-bold text-lg">Rp {guide.price_per_day?.toLocaleString("id-ID")}/hari</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Bahasa</p>
              <div className="flex flex-wrap gap-1">
                {(guide.languages || []).map((l: string) => <Badge key={l} variant="secondary">{l}</Badge>)}
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Lokasi Operasional</h3>
            <div className="flex flex-wrap gap-2">
              {(guide.operating_locations || []).map((loc: string) => (
                <Badge key={loc} variant="outline"><MapPin className="h-3 w-3 mr-1" />{loc}</Badge>
              ))}
            </div>
          </div>

          {user && user.id !== guide.user_id && (
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg"><Calendar className="h-4 w-4 mr-2" /> Booking Guide Ini</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Booking {guide.guide_name}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tanggal Booking</Label>
                    <Input type="date" value={booking.booking_date} onChange={e => setBooking({...booking, booking_date: e.target.value})} />
                  </div>
                  <div>
                    <Label>Durasi (hari)</Label>
                    <Input type="number" min={1} value={booking.duration_days} onChange={e => setBooking({...booking, duration_days: +e.target.value})} />
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Harga</p>
                    <p className="text-xl font-bold">Rp {(guide.price_per_day * booking.duration_days).toLocaleString("id-ID")}</p>
                  </div>
                  <div>
                    <Label>Catatan (opsional)</Label>
                    <Textarea value={booking.notes} onChange={e => setBooking({...booking, notes: e.target.value})} placeholder="Rencana perjalanan, preferensi, dll." />
                  </div>
                  <Button className="w-full" onClick={handleBook} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {submitting ? "Memproses..." : "Konfirmasi Booking"}
                    // TODO: Mayar integration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
