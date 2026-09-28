"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Shield } from "lucide-react"

export default function LiveLocationPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchLocation() {
      const supabase = createClient()
      const { data: share } = await supabase
        .from("live_location_shares")
        .select("*, user:user_profiles(display_name)")
        .eq("share_token", token)
        .eq("is_active", true)
        .single()

      if (!share) {
        setError("Link tidak valid atau sudah kedaluwarsa.")
      } else {
        setData(share)
      }
      setLoading(false)
    }
    fetchLocation()
  }, [token])

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><p>Memuat...</p></div>

  if (error) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md"><CardContent className="p-8 text-center">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">Tidak Ditemukan</h2>
        <p className="text-muted-foreground">{error}</p>
      </CardContent></Card>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Live Location</h1>
              <p className="text-sm text-muted-foreground">{data.user?.display_name || "Traveler"}</p>
            </div>
          </div>
          {/* Placeholder map - TODO: Google Maps integration */}
          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Peta akan tampil di sini</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lat: {data.current_lat || "-"}, Lng: {data.current_lng || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Terakhir diperbarui: {data.last_updated ? new Date(data.last_updated).toLocaleString("id-ID") : "Belum ada data"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
