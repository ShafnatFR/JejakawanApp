"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Crown, Zap, Star, Shield } from "lucide-react"

const plans = [
  { name: "Free", price: "Rp 0", period: "Selamanya", icon: Star, features: ["3 rekomendasi/hari", "Trip matching", "Iklan ditampilkan", "XP 1x multiplier"], color: "border-gray-200" },
  { name: "Weekly", price: "Rp 9.900", period: "/minggu", icon: Zap, features: ["10 rekomendasi/hari", "Bebas iklan", "XP 1.5x multiplier"], color: "border-blue-200" },
  { name: "Monthly", price: "Rp 29.000", period: "/bulan", icon: Crown, features: ["Rekomendasi unlimited", "Priority matching", "Filter partner detail", "XP 1.5x multiplier", "Bebas iklan"], color: "border-primary", popular: true },
  { name: "Exclusive", price: "Rp 299.000", period: "/tahun", icon: Shield, features: ["Semua fitur Monthly", "Early access open trip", "Diskon 5% partner travel", "XP 2x multiplier", "Badge premium"], color: "border-amber-300" },
]

export default function SubscriptionPage() {
  const { profile, updateProfile } = useAuthStore()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  async function purchasePlan(plan: string) {
    setPurchasing(plan)
    // Mock payment - real Midtrans integration later
    setTimeout(async () => {
      const expiresAt = new Date()
      if (plan === "weekly") expiresAt.setDate(expiresAt.getDate() + 7)
      else if (plan === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1)
      else if (plan === "exclusive") expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      await updateProfile({ subscription: plan as any, subscription_expires_at: expiresAt.toISOString() })
      setPurchasing(null)
      alert("Berhasil upgrade ke " + plan + "!")
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Langganan</h1>
        <p className="text-muted-foreground">Upgrade untuk fitur premium</p>
        <div className="mt-4"><Badge variant="outline" className="text-lg px-4 py-1 capitalize">Paket saat ini: {profile?.subscription || "Free"}</Badge></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? "border-2 border-primary shadow-lg scale-105" : ""}`}>
            {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Populer</Badge>}
            <CardHeader className="text-center">
              <plan.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle>{plan.name}</CardTitle>
              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Button className="w-full" variant={profile?.subscription === plan.name.toLowerCase() ? "outline" : "default"} disabled={profile?.subscription === plan.name.toLowerCase() || purchasing === plan.name.toLowerCase()} onClick={() => purchasePlan(plan.name.toLowerCase())}>
                {purchasing === plan.name.toLowerCase() ? "Memproses..." : profile?.subscription === plan.name.toLowerCase() ? "Aktif" : "Pilih Paket"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}