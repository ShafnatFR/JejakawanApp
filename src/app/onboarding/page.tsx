"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const interests = [
  "Pantai", "Gunung", "Air Terjun", "Danau", "Hutan", "Desa Wisata",
  "Kuliner", "Sejarah", "Budaya", "Snorkeling", "Diving", "Hiking",
  "Camping", "Fotografi", "Sunrise", "Sunset", "Wildlife", "Festival"
]

const transportModes = ["Motor", "Mobil", "Bus", "Kereta", "Kapal", "Pesawat"]

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, updateProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState(100000)
  const [budgetMax, setBudgetMax] = useState(5000000)
  const [selectedTransport, setSelectedTransport] = useState<string[]>([])
  const [homeLocation, setHomeLocation] = useState("")
  const [loading, setLoading] = useState(false)

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  const toggleTransport = (mode: string) => {
    setSelectedTransport(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    )
  }

  const handleComplete = async () => {
    setLoading(true)
    await updateProfile({
      display_name: displayName,
      preferred_interests: selectedInterests,
      budget_min: budgetMin,
      budget_max: budgetMax,
      transport_modes: selectedTransport,
      home_location: homeLocation,
    })
    router.push("/discover")
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Selamat Datang di Jejakawan!</h1>
        <p className="text-muted-foreground mt-2">Atur preferensi kamu agar kami bisa memberikan rekomendasi terbaik.</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-2 w-16 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tentang Kamu</CardTitle>
            <CardDescription>Ceritakan sedikit tentang dirimu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Tampilan</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nama kamu" />
            </div>
            <div className="space-y-2">
              <Label>Lokasi Asal</Label>
              <Input value={homeLocation} onChange={e => setHomeLocation(e.target.value)} placeholder="Jakarta, Bandung, dll." />
            </div>
            <Button onClick={() => setStep(2)} className="w-full" disabled={!displayName}>Lanjut</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Minat & Hobi</CardTitle>
            <CardDescription>Pilih yang kamu suka (bisa lebih dari satu)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer text-sm py-1.5 px-3"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Kembali</Button>
              <Button onClick={() => setStep(3)} className="flex-1" disabled={selectedInterests.length === 0}>Lanjut</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget & Transportasi</CardTitle>
            <CardDescription>Atur preferensi perjalananmu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Minimum (Rp)</Label>
                <Input type="number" value={budgetMin} onChange={e => setBudgetMin(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Budget Maksimum (Rp)</Label>
                <Input type="number" value={budgetMax} onChange={e => setBudgetMax(Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Moda Transportasi</Label>
              <div className="flex flex-wrap gap-2">
                {transportModes.map(mode => (
                  <Badge
                    key={mode}
                    variant={selectedTransport.includes(mode) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleTransport(mode)}
                  >
                    {mode}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Kembali</Button>
              <Button onClick={handleComplete} className="flex-1" disabled={loading || selectedTransport.length === 0}>
                {loading ? "Menyimpan..." : "Selesai!"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
