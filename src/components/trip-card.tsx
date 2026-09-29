"use client"

import Link from "next/link"
import { Calendar, Users, DollarSign, MapPin } from "lucide-react"
import { TripRequest } from "@/types/database"

interface TripCardProps {
  trip: TripRequest & { creator?: any; destination?: any }
  showActions?: boolean
}

export function TripCard({ trip, showActions = true }: TripCardProps) {
  const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    open: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    matched: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    in_progress: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
    completed: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  }

  const style = statusStyles[trip.status] || statusStyles.open

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle hover:shadow-card-hover transition-all duration-300 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
              {(trip as any).destination?.name || trip.destination_name || "Trip"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{(trip as any).destination?.province || ""}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border border-current/10`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {trip.status}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{trip.date_from} - {trip.date_to}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            <span>Rp {trip.budget_min.toLocaleString("id-ID")} - {trip.budget_max.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{trip.current_members}/{trip.max_members} anggota</span>
          </div>
        </div>

        {trip.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">{trip.notes}</p>
        )}
      </div>
    </Link>
  )
}
