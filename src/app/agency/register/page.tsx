"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AgencyRegisterPage() {
  const { user } = useAuthStore()
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    agency_name: "",
    description: "",
    phone: "",
    email: "",
    npwp: "",
  })

  async function handleSubmit() {
    if (!user) return alert("Harus login dulu")
    if (!form.agency_name) return alert("Nama agensi wajib diisi")

    setSaving(true)
    const { error } = await supabase.from("agency_profiles").insert({
      user_id: user.id,
      agency_name: form.agency_name,
      description: form.description || null,
      phone: form.phone || null,
      email: form.email || null,
    })

    if (error) {
      alert("Gagal mendaftar: " + error.message)
    } else {
      alert("Pendaftaran agensi berhasil!")
      router.push("/agency/dashboard")
    }
    setSaving(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Harus login untuk mendaftar sebagai agensi.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Daftar Sebagai Agen Perjalanan</h1>
        <p className="text-muted-foreground">Daftarkan bisnis travelmu</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Informasi Agensi</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nama Agensi *</Label>
            <Input value={form.agency_name} onChange={e => setForm({...form, agency_name: e.target.value})} placeholder="PT Jelajah Nusantara" />
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ceritakan tentang agensi travelmu..." rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telepon</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08123456789" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="info@travel.com" />
            </div>
          </div>
          <div>
            <Label>NPWP (opsional)</Label>
            <Input value={form.npwp} onChange={e => setForm({...form, npwp: e.target.value})} placeholder="12.345.678.9-012.345" />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Mendaftarkan..." : "Daftarkan Agensi"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
