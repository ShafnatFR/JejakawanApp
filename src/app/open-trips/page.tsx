"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, DollarSign, Star, Backpack } from "lucide-react"

export default function OpenTripsPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTrips() }, [])

  async function fetchTrips() {
    const supabase = createClient()
    const { data } = await supabase.from("open_trips").select("*, agency:agency_profiles(agency_name,logo_url,rating_avg,is_verified), destination:destinations(name,province)").eq("is_active", true).order("created_at", { ascending: false }).limit(20)
    setTrips(data || [])
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Open Trip</h1>
        <p className="text-muted-foreground">Temukan dan booking open trip dari agen terpercaya</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16"><Backpack className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="text-lg font-medium mb-2">Belum ada open trip</h3><p className="text-muted-foreground">Agen travel belum menambahkan trip.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((t: any) => (
            <Card key={t.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-indigo-400 to-teal-400 flex items-center justify-center text-white">
                <Backpack className="h-12 w-12" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t.destination?.name || "Destinasi"} - {t.destination?.province || ""}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{t.start_date} - {t.end_date}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{t.current_participants}/{t.max_participants} peserta</span></div>
                  <div className="flex items-center gap-2 text-sm"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="font-semibold text-primary">Rp {t.price?.toLocaleString("id-ID")}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{t.agency?.rating_avg?.toFixed(1) || "0.0"}</span>
                    {t.agency?.is_verified && <Badge variant="outline" className="text-xs ml-1 text-green-600">Verified</Badge>}
                  </div>
                  <Button size="sm">Booking</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}