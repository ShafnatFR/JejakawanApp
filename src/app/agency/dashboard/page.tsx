"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Package, Calendar, DollarSign, Users, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function AgencyDashboardPage() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const [agency, setAgency] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchData() }, [user])

  async function fetchData() {
    setLoading(true)
    const { data: ag } = await supabase
      .from("agency_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single()
    setAgency(ag)

    if (ag) {
      const { data: tr } = await supabase
        .from("open_trips")
        .select("*, destination:destinations(name,province)")
        .eq("agency_id", ag.id)
        .order("created_at", { ascending: false })
      setTrips(tr || [])

      const tripIds = (tr || []).map((t: any) => t.id)
      if (tripIds.length > 0) {
        const { data: bk } = await supabase
          .from("open_trip_bookings")
          .select("*, user:user_profiles(display_name,avatar_url), trip:open_trips(title,price)")
          .in("trip_id", tripIds)
          .order("created_at", { ascending: false })
        setBookings(bk || [])
      }
    }
    setLoading(false)
  }

  async function deleteTrip(tripId: string) {
    if (!confirm("Yakin hapus trip ini?")) return
    await supabase.from("open_trips").update({ is_active: false }).eq("id", tripId)
    fetchData()
  }

  const totalEarnings = bookings.filter(b => b.payment_status === "paid").reduce((sum, b) => sum + (b.trip?.price || 0), 0)

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>

  if (!agency) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Kamu belum terdaftar sebagai agensi</h2>
        <Link href="/agency/register"><Button>Daftar Sekarang</Button></Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{agency.agency_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {agency.is_verified && <Badge className="bg-green-500">Terverifikasi</Badge>}
            <span className="text-sm text-muted-foreground">Rating: {agency.rating_avg?.toFixed(1) || "0.0"}</span>
          </div>
        </div>
        <Link href="/agency/packages"><Button><Plus className="h-4 w-4 mr-2" /> Kelola Paket</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Paket Trip", value: trips.length, icon: Package, color: "text-blue-500" },
          { label: "Total Booking", value: bookings.length, icon: Calendar, color: "text-purple-500" },
          { label: "Peserta", value: trips.reduce((s, t) => s + t.current_participants, 0), icon: Users, color: "text-green-500" },
          { label: "Pendapatan", value: `Rp ${totalEarnings.toLocaleString("id-ID")}`, icon: DollarSign, color: "text-amber-500" },
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

      <Tabs defaultValue="trips" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trips"><Package className="h-4 w-4 mr-1" /> Trip Saya</TabsTrigger>
          <TabsTrigger value="bookings"><Calendar className="h-4 w-4 mr-1" /> Booking Masuk</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          {trips.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Belum ada trip. <Link href="/agency/packages" className="text-primary underline">Buat sekarang</Link></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {trips.map(t => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-sm text-muted-foreground">{t.destination?.name} &bull; Rp {t.price?.toLocaleString("id-ID")} &bull; {t.start_date} - {t.end_date}</p>
                      <p className="text-xs text-muted-foreground">{t.current_participants}/{t.max_participants} peserta</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Aktif" : "Nonaktif"}</Badge>
                      <Button size="sm" variant="destructive" onClick={() => deleteTrip(t.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Belum ada booking masuk.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <Card key={b.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{b.user?.display_name || "Wisatawan"}</p>
                      <p className="text-sm text-muted-foreground">Trip: {b.trip?.title} &bull; Rp {b.trip?.price?.toLocaleString("id-ID")}</p>
                    </div>
                    <Badge variant={b.payment_status === "paid" ? "default" : b.status === "confirmed" ? "secondary" : "outline"}>
                      {b.payment_status === "paid" ? "Dibayar" : b.status}
                    </Badge>
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
