"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Crown, Zap, Star, Shield } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"

const ICON_MAP: Record<string, any> = { Free: Star, Weekly: Zap, Monthly: Crown, Exclusive: Shield }
const plans = SUBSCRIPTION_PLANS.map(p => ({ ...p, icon: ICON_MAP[p.name] || Star }))

export default function SubscriptionPage() {
  const { profile, updateProfile, fetchProfile } = useAuthStore()
  const [purchasing, setPurchasing] = useState<string | null>(null)

  // Muat ulang profil saat halaman dimuat — setelah
  // redirect dari Mayar, status langganan bisa berubah.
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function purchasePlan(plan: string) {
    setPurchasing(plan)
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Gagal membuat pembayaran.")
        setPurchasing(null)
        return
      }
      if (data.payment_url) {
        // Arahkan ke halaman pembayaran Mayar
        window.location.href = data.payment_url
        return
      }
      // Tanpa payment_url (gratis) — perbarui profil langsung
      await updateProfile({ subscription: plan as any })
      alert("Berhasil upgrade ke " + plan + "!")
      setPurchasing(null)
    } catch {
      alert("Terjadi kesalahan. Silakan coba lagi.")
      setPurchasing(null)
    }
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