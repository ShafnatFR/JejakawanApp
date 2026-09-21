"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, CreditCard } from "lucide-react"

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({ display_name: "", bio: "", current_mode: "tourist" as string, preferred_interests: [] as string[], budget_min: 0, budget_max: 10000000, transport_modes: [] as string[] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    if (profile) {
      setForm({ display_name: profile.display_name, bio: profile.bio || "", current_mode: profile.current_mode, preferred_interests: profile.preferred_interests, budget_min: profile.budget_min, budget_max: profile.budget_max, transport_modes: profile.transport_modes })
    }
  }, [profile, user])

  async function saveProfile() {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    alert("Profil tersimpan!")
  }

  const interests = ["alam", "pantai", "budaya", "kuliner", "gunung", "air_terjun", "gua", "sejarah", "adventure", "foto", "diving", "camping"]
  const transports = ["motor", "mobil", "bus", "kereta", "pesawat", "kapal"]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" /> Notifikasi</TabsTrigger>
          <TabsTrigger value="subscription"><CreditCard className="h-4 w-4 mr-1" /> Langganan</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Edit Profil</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Nama</Label><Input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} /></div>
              <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Ceritakan tentang dirimu..." /></div>
              <div><Label>Mode</Label>
                <Select value={form.current_mode} onValueChange={v => setForm({...form, current_mode: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourist">Tourist - Jelajahi destinasi populer</SelectItem>
                    <SelectItem value="explorer">Explorer - Temukan hidden gems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Minat</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {interests.map(i => (
                    <Button key={i} variant={form.preferred_interests.includes(i) ? "default" : "outline"} size="sm" onClick={() => {
                      setForm({...form, preferred_interests: form.preferred_interests.includes(i) ? form.preferred_interests.filter(x => x !== i) : [...form.preferred_interests, i]})
                    }} className="capitalize">{i}</Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Budget Min</Label><Input type="number" value={form.budget_min} onChange={e => setForm({...form, budget_min: +e.target.value})} /></div>
                <div><Label>Budget Max</Label><Input type="number" value={form.budget_max} onChange={e => setForm({...form, budget_max: +e.target.value})} /></div>
              </div>
              <div><Label>Transportasi</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {transports.map(t => (
                    <Button key={t} variant={form.transport_modes.includes(t) ? "default" : "outline"} size="sm" onClick={() => {
                      setForm({...form, transport_modes: form.transport_modes.includes(t) ? form.transport_modes.filter(x => x !== t) : [...form.transport_modes, t]})
                    }} className="capitalize">{t}</Button>
                  ))}
                </div>
              </div>
              <Button onClick={saveProfile} disabled={saving} className="w-full">{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Pengaturan Notifikasi</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground text-center py-8">Pengaturan notifikasi akan segera tersedia.</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader><CardTitle>Langganan</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-4 mb-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Paket saat ini</p>
                <p className="text-2xl font-bold capitalize">{profile?.subscription || "Free"}</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Weekly", price: "Rp 9.900/minggu", desc: "XP 1.5x, no iklan, 10 rekomendasi/hari" },
                  { name: "Monthly", price: "Rp 29.000/bulan", desc: "Priority matching, filter detail, XP 1.5x" },
                  { name: "Exclusive", price: "Rp 299.000/tahun", desc: "Semua fitur, early access, diskon partner, XP 2x" },
                ].map(p => (
                  <div key={p.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div><p className="font-medium">{p.name}</p><p className="text-sm text-muted-foreground">{p.desc}</p></div>
                    <div className="text-right"><p className="font-bold">{p.price}</p><Button size="sm" variant="outline" className="mt-1">Upgrade</Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}