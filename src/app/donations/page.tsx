"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Crown, Star, Award, Gift } from "lucide-react"

const TIERS = [
  { name: "Bronze", min: 10000, max: 49999, color: "bg-orange-100 text-orange-700", icon: Star, badge: "Donatur Bronze" },
  { name: "Silver", min: 50000, max: 199999, color: "bg-gray-100 text-gray-700", icon: Award, badge: "Donatur Silver" },
  { name: "Gold", min: 200000, max: 499999, color: "bg-yellow-100 text-yellow-700", icon: Crown, badge: "Donatur Gold" },
  { name: "Platinum", min: 500000, max: 999999999, color: "bg-purple-100 text-purple-700", icon: Gift, badge: "Donatur Platinum" },
]

export default function DonationsPage() {
  const { user } = useAuthStore()
  const [amount, setAmount] = useState(50000)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const selectedTier = TIERS.find(t => amount >= t.min && amount <= t.max)

  async function handleDonate() {
    if (!user) return
    setLoading(true)
    // TODO: Mayar integration
    const supabase = createClient()
    await supabase.from("donations").insert({
      user_id: user.id,
      amount,
      tier: selectedTier?.name.toLowerCase(),
      payment_status: "paid",
    })
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Dukung Jejakawan</h1>
      <p className="text-muted-foreground mb-8">Donasimu membantu kami mengembangkan platform dan mempromosikan destinasi underrated di Indonesia.</p>

      {success ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-green-500 fill-green-500" />
            <h2 className="text-xl font-bold mb-2">Terima Kasih!</h2>
            <p className="text-muted-foreground">Donasi kamu sangat berarti untuk komunitas traveler Indonesia.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {TIERS.map(tier => (
              <Card key={tier.name} className={`cursor-pointer transition-all ${amount >= tier.min && amount <= tier.max ? "ring-2 ring-primary" : ""}`}
                onClick={() => setAmount(tier.min)}>
                <CardContent className="p-4 text-center">
                  <tier.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold text-sm">{tier.name}</p>
                  <p className="text-xs text-muted-foreground">Rp{tier.min.toLocaleString("id-ID")}+</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTier && (
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <selectedTier.icon className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Badge: {selectedTier.badge}</p>
                  <p className="text-sm text-muted-foreground">Badge ini akan muncul di profilmu</p>
                </div>
                <Badge className={selectedTier.color}>{selectedTier.name}</Badge>
              </CardContent>
            </Card>
          )}

          <Button className="w-full" size="lg" onClick={handleDonate} disabled={loading || !user}>
            {loading ? "Memproses..." : `Donasi Rp${amount.toLocaleString("id-ID")}`}
          </Button>
          {!user && <p className="text-sm text-muted-foreground text-center mt-2">Login untuk berdonasi</p>}
        </>
      )}
    </div>
  )
}
