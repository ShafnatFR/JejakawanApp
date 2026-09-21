"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Users, Backpack } from "lucide-react"

export default function BookingsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    fetchBookings()
  }, [user])

  async function fetchBookings() {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase.from("open_trip_bookings").select("*, trip:open_trips(title,price,start_date,end_date,max_participants,current_participants,destination:destinations(name,province))").eq("user_id", user.id).order("created_at", { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  async function cancelBooking(id: string) {
    const supabase = createClient()
    await supabase.from("open_trip_bookings").update({ status: "cancelled" }).eq("id", id)
    fetchBookings()
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Booking Saya</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-12"><Backpack className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-medium mb-2">Belum ada booking</h3><p className="text-muted-foreground">Jelajahi open trip dan booking petualangan pertamamu!</p></div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{b.trip?.title || "Open Trip"}</h3>
                    <p className="text-sm text-muted-foreground">{b.trip?.destination?.name} - {b.trip?.destination?.province}</p>
                  </div>
                  <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"}>{b.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{b.trip?.start_date} - {b.trip?.end_date}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />Rp {b.trip?.price?.toLocaleString("id-ID")}</span>
                </div>
                {b.status === "pending" && <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>Batalkan</Button>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}