"use client"

import Link from "next/link"
import { MapPin, Star, Sparkles } from "lucide-react"
import { Destination } from "@/types/database"

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link href={`/destinations/${destination.id}`} className="block group">
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle hover:shadow-card-hover transition-all duration-300 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-teal-400">
          {destination.cover_image_url ? (
            <img src={destination.cover_image_url} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          {destination.is_underrated && (
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
                <Sparkles className="h-3 w-3" /> Hidden Gem
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">{destination.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2.5">
            <MapPin className="h-3 w-3" />
            <span>{destination.regency}, {destination.province}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-slate-900">{destination.rating_avg.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({destination.visit_count})</span>
            </div>
            <div className="flex gap-1">
              {destination.category.slice(0, 2).map(c => (
                <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">{c}</span>
              ))}
            </div>
          </div>
          {destination.entry_fee_max > 0 && (
            <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
              Rp {destination.entry_fee_min.toLocaleString("id-ID")} - {destination.entry_fee_max.toLocaleString("id-ID")}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
