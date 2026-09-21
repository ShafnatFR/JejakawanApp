"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, Clock, MapPin } from "lucide-react"

interface ItineraryItem {
  id: string
  day: number
  time: string
  title: string
  description: string
  location: string
}

export default function ItineraryPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const [trip, setTrip] = useState<any>(null)
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [newItem, setNewItem] = useState({ day: 1, time: "08:00", title: "", description: "", location: "" })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (params.id) fetchTrip(params.id as string)
  }, [params.id])

  async function fetchTrip(id: string) {
    const supabase = createClient()
    const { data } = await supabase.from("trip_requests").select("*, destination:destinations(name,province)").eq("id", id).single()
    setTrip(data)
    // Load itinerary from trip data (stored in notes or separate table)
    // For now, use local state
  }

  function addItem() {
    if (!newItem.title) return
    const item: ItineraryItem = {
      id: Date.now().toString(),
      ...newItem,
    }
    setItinerary([...itinerary, item].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)))
    setNewItem({ day: newItem.day, time: "08:00", title: "", description: "", location: "" })
    setShowForm(false)
  }

  function removeItem(id: string) {
    setItinerary(itinerary.filter(i => i.id !== id))
  }

  const days = [...new Set(itinerary.map(i => i.day))].sort()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Itinerary Builder</h1>
        <p className="text-muted-foreground">
          {trip?.destination?.name || "Trip"} - {trip?.date_from} s/d {trip?.date_to}
        </p>
      </div>

      {/* Add item form */}
      {showForm ? (
        <Card className="mb-6">
          <CardHeader><CardTitle>Tambah Aktivitas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Hari ke-</label>
                <Input type="number" min={1} value={newItem.day} onChange={e => setNewItem({...newItem, day: +e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Jam</label>
                <Input type="time" value={newItem.time} onChange={e => setNewItem({...newItem, time: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Lokasi</label>
                <Input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} placeholder="Opsional" />
              </div>
            </div>
            <Input placeholder="Judul aktivitas" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
            <Textarea placeholder="Deskripsi (opsional)" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
            <div className="flex gap-2">
              <Button onClick={addItem}>Tambah</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="mb-6"><Plus className="h-4 w-4 mr-2" /> Tambah Aktivitas</Button>
      )}

      {/* Itinerary list */}
      {days.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada aktivitas. Mulai tambahkan rencana perjalananmu!</p>
        </div>
      ) : (
        days.map(day => (
          <div key={day} className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Badge>Hari {day}</Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(new Date(trip?.date_from || Date.now()).getTime() + (day - 1) * 86400000).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </h2>
            <div className="space-y-3">
              {itinerary.filter(i => i.day === day).map(item => (
                <Card key={item.id} className="relative">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">{item.time}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      {item.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</p>}
                      {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}