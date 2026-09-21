"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Sparkles } from "lucide-react"
import { Destination } from "@/types/database"

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link href={`/destinations/${destination.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="relative h-48 bg-gradient-to-br from-indigo-400 to-teal-400">
          {destination.cover_image_url ? (
            <img src={destination.cover_image_url} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          {destination.is_underrated && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-amber-500 text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Hidden Gem
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{destination.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{destination.regency}, {destination.province}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{destination.rating_avg.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({destination.visit_count})</span>
            </div>
            <div className="flex gap-1">
              {destination.category.slice(0, 2).map(c => (
                <Badge key={c} variant="secondary" className="text-xs capitalize">{c}</Badge>
              ))}
            </div>
          </div>
          {destination.entry_fee_max > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Rp {destination.entry_fee_min.toLocaleString("id-ID")} - {destination.entry_fee_max.toLocaleString("id-ID")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}