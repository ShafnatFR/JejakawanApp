"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, MapPin, Star, Shield } from "lucide-react"
import { TripRequest } from "@/types/database"

interface TripCardProps {
  trip: TripRequest & { creator?: any; destination?: any }
  showActions?: boolean
}

export function TripCard({ trip, showActions = true }: TripCardProps) {
  const statusColors: Record<string, string> = {
    open: "bg-green-500",
    matched: "bg-blue-500",
    in_progress: "bg-purple-500",
    completed: "bg-gray-500",
    cancelled: "bg-red-500",
  }

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">{(trip as any).destination?.name || trip.destination_name || "Trip"}</h3>
              <p className="text-sm text-muted-foreground">{(trip as any).destination?.province || ""}</p>
            </div>
            <Badge className={statusColors[trip.status] || "bg-gray-500"}>{trip.status}</Badge>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{trip.date_from} - {trip.date_to}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Rp {trip.budget_min.toLocaleString("id-ID")} - {trip.budget_max.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{trip.current_members}/{trip.max_members} anggota</span>
            </div>
          </div>

          {trip.notes && <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{trip.notes}</p>}
        </CardContent>
      </Card>
    </Link>
  )
}