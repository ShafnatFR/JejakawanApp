"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, X } from "lucide-react"

interface WeatherAlertProps {
  province: string
}

export function WeatherAlert({ province }: WeatherAlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const [weather, setWeather] = useState<{ condition: string; temp: string; icon: any } | null>(null)

  useEffect(() => {
    // Mock weather data based on province
    const conditions: Record<string, any> = {
      "Jawa Barat": { condition: "Cerah Berawan", temp: "26°C", icon: Sun },
      "Jawa Tengah": { condition: "Hujan Ringan", temp: "24°C", icon: CloudRain },
      "Jawa Timur": { condition: "Berawan", temp: "25°C", icon: Cloud },
      "DIY": { condition: "Cerah", temp: "27°C", icon: Sun },
      "Bali": { condition: "Cerah", temp: "29°C", icon: Sun },
    }
    setWeather(conditions[province] || conditions["Jawa Barat"])
  }, [province])

  if (dismissed || !weather) return null

  const Icon = weather.icon

  return (
    <Card className="bg-blue-50 border-blue-200 mb-4">
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium">{weather.condition} di {province}</p>
            <p className="text-xs text-muted-foreground">{weather.temp}</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}