"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Users, DollarSign, Star, Shield, Check, X, Backpack } from "lucide-react"

export default function OpenTripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [trip, setTrip] = useState<any>(null)
  const [participants, setParticipants] = useState(1)
  const [booking, setBooking] = useState(false)
  const [myBooking, setMyBooking] = useState<any>(null)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchTrip(params.id as string)
  }, [params.id, user])

  async function fetchTrip(id: string) {
    const supabase = createClient()
    const { data } = await supabase.from("open_trips").select("*, agency:agency_profiles(agency_name,description,rating_avg,is_verified,phone,email), destination:destinations(name,province,description,latitude,longitude)").eq("id", id).single()
    setTrip(data)
    if (user) {
      const { data: booking } = await supabase.from("open_trip_bookings").select("*").eq("trip_id", id).eq("user_id", user.id).maybeSingle()
      setMyBooking(booking)
      if (booking && booking.payment_status === "pending") {
        const { data: tx } = await supabase
          .from("transactions")
          .select("payment_url")
          .eq("reference_type", "booking")
          .eq("reference_id", booking.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        setPendingPaymentUrl(tx?.payment_url ?? null)
      } else {
        setPendingPaymentUrl(null)
      }
    }
    setLoading(false)
  }

  async function bookTrip() {
    if (!user || !trip) return
    setBooking(true)
    setError(null)
    try {
      const res = await fetch(`/api/open-trips/${trip.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal membuat booking. Silakan coba lagi.")
        return
      }
      if (!data.payment_url) {
        // Trip gratis — booking langsung dikonfirmasi
        fetchTrip(trip.id)
        return
      }
      // Arahkan ke halaman pembayaran Mayar
      window.location.href = data.payment_url
    } catch {
      setError("Gagal menghubungi server. Silakan coba lagi beberapa saat lagi.")
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>
  if (!trip) return <div className="container mx-auto px-4 py-8 text-center"><p>Trip tidak ditemukan.</p></div>

  const spotsLeft = trip.max_participants - trip.current_participants
  const totalPrice = trip.price * participants

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hero */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-indigo-400 to-teal-400 flex items-center justify-center">
        <Backpack className="h-24 w-24 text-white/50" />
        <Badge className="absolute top-4 right-4 text-lg px-3 py-1">Rp {trip.price?.toLocaleString("id-ID")}/orang</Badge>
      </div>

      <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" />{trip.destination?.name}, {trip.destination?.province}</span>
        {trip.agency?.is_verified && <Badge variant="outline" className="text-green-600"><Shield className="h-3 w-3 mr-1" /> Verified</Badge>}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4 text-center"><Calendar className="h-5 w-5 mx-auto mb-1 text-blue-500" /><p className="font-bold">{trip.start_date}</p><p className="text-xs text-muted-foreground">sampai {trip.end_date}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-green-500" /><p className="font-bold">{spotsLeft}</p><p className="text-xs text-muted-foreground">slot tersisa</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto mb-1 text-amber-500" /><p className="font-bold">Rp {trip.price?.toLocaleString("id-ID")}</p><p className="text-xs text-muted-foreground">per orang</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" /><p className="font-bold">{trip.agency?.rating_avg?.toFixed(1) || "0.0"}</p><p className="text-xs text-muted-foreground">rating agen</p></CardContent></Card>
      </div>

      {/* Agency info */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Agen Travel</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium">{trip.agency?.agency_name}</p>
          <p className="text-sm text-muted-foreground">{trip.agency?.description || "Agen travel terpercaya"}</p>
        </CardContent>
      </Card>

      {/* Description */}
      {trip.description && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Deskripsi</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">{trip.description}</p></CardContent>
        </Card>
      )}

      {/* Includes/Excludes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg text-green-600">Termasuk</CardTitle></CardHeader>
          <CardContent>
            {(trip.includes || []).length > 0 ? (
              <ul className="space-y-1">{trip.includes.map((item: string, i: number) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" />{item}</li>)}</ul>
            ) : <p className="text-sm text-muted-foreground">-</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg text-red-600">Tidak Termasuk</CardTitle></CardHeader>
          <CardContent>
            {(trip.excludes || []).length > 0 ? (
              <ul className="space-y-1">{trip.excludes.map((item: string, i: number) => <li key={i} className="flex items-center gap-2 text-sm"><X className="h-4 w-4 text-red-500" />{item}</li>)}</ul>
            ) : <p className="text-sm text-muted-foreground">-</p>}
          </CardContent>
        </Card>
      </div>

      {/* Booking */}
      <Card>
        <CardHeader><CardTitle>Booking</CardTitle></CardHeader>
        <CardContent>
          {myBooking ? (
            <div className="text-center py-4">
              <Badge className="text-lg px-4 py-2 mb-2" variant={myBooking.status === "confirmed" ? "default" : "secondary"}>{myBooking.status}</Badge>
              {myBooking.payment_status === "pending" ? (
                pendingPaymentUrl ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-amber-600">Menunggu pembayaran</p>
                    <Button variant="outline" onClick={() => { window.location.href = pendingPaymentUrl }}>Bayar Sekarang</Button>
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 mt-2">Menunggu pembayaran</p>
                )
              ) : (
                <p className="text-muted-foreground">Kamu sudah booking trip ini.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
              )}
              <div>
                <Label>Jumlah Peserta</Label>
                <Input type="number" min={1} max={spotsLeft} value={participants} onChange={e => setParticipants(Math.max(1, Math.min(spotsLeft, +e.target.value || 1)))} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <Button className="w-full" size="lg" onClick={bookTrip} disabled={booking || spotsLeft < 1}>
                {booking ? "Memproses..." : spotsLeft < 1 ? "Penuh" : "Booking Sekarang"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Pembayaran aman via Mayar — Anda akan diarahkan ke halaman pembayaran.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}