"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GuideRegisterPage() {
  const { user, profile } = useAuthStore()
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    guide_name: profile?.display_name || "",
    bio: "",
    operating_locations: "",
    price_per_day: 200000,
    languages: "Indonesia",
    bank_account: "",
    bank_name: "",
  })

  async function handleSubmit() {
    if (!user) return alert("Harus login dulu")
    if (!form.guide_name) return alert("Nama guide wajib diisi")

    setSaving(true)
    const { error } = await supabase.from("guide_profiles").insert({
      user_id: user.id,
      guide_name: form.guide_name,
      bio: form.bio || null,
      operating_locations: form.operating_locations.split(",").map(s => s.trim()).filter(Boolean),
      price_per_day: form.price_per_day,
      languages: form.languages.split(",").map(s => s.trim()).filter(Boolean),
      bank_account: form.bank_account || null,
      bank_name: form.bank_name || null,
    })

    if (error) {
      alert("Gagal mendaftar: " + error.message)
    } else {
      alert("Pendaftaran berhasil! Menunggu verifikasi admin.")
      router.push("/guides/dashboard")
    }
    setSaving(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Harus login untuk mendaftar sebagai guide.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Daftar Sebagai Guide</h1>
        <p className="text-muted-foreground">Isi data dirimu untuk menjadi panduan lokal</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Informasi Guide</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nama Guide *</Label>
            <Input value={form.guide_name} onChange={e => setForm({...form, guide_name: e.target.value})} placeholder="Nama yang akan ditampilkan ke wisatawan" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Ceritakan pengalaman dan keahlianmu..." rows={4} />
          </div>
          <div>
            <Label>Lokasi Operasional (pisahkan koma)</Label>
            <Input value={form.operating_locations} onChange={e => setForm({...form, operating_locations: e.target.value})} placeholder="Bali, Lombok, Yogyakarta" />
          </div>
          <div>
            <Label>Harga per Hari (Rp)</Label>
            <Input type="number" value={form.price_per_day} onChange={e => setForm({...form, price_per_day: +e.target.value})} />
          </div>
          <div>
            <Label>Bahasa (pisahkan koma)</Label>
            <Input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} placeholder="Indonesia, English" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nama Bank</Label>
              <Input value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="BCA" />
            </div>
            <div>
              <Label>No. Rekening</Label>
              <Input value={form.bank_account} onChange={e => setForm({...form, bank_account: e.target.value})} placeholder="1234567890" />
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Mendaftarkan..." : "Daftar Sebagai Guide"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
