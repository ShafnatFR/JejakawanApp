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
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, CreditCard, Ban, MapPin, Eye, EyeOff, Users } from "lucide-react"

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({ display_name: "", bio: "", current_mode: "tourist" as string, preferred_interests: [] as string[], budget_min: 0, budget_max: 10000000, transport_modes: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [prefs, setPrefs] = useState({ show_location: true, show_profile: true, show_trips: true })
  const [emergencyContacts, setEmergencyContacts] = useState<{ name: string; phone: string }[]>([])
  const [newContact, setNewContact] = useState({ name: "", phone: "" })

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    if (profile) {
      setForm({ display_name: profile.display_name, bio: profile.bio || "", current_mode: profile.current_mode, preferred_interests: profile.preferred_interests, budget_min: profile.budget_min, budget_max: profile.budget_max, transport_modes: profile.transport_modes })
    }
    fetchBlocked()
  }, [profile, user])

  async function fetchBlocked() {
    if (!user) return
    const supabase = createClient()
    const { data } = await supabase
      .from("user_blocks")
      .select("*, blocked:user_profiles!blocked_id(display_name,avatar_url)")
      .eq("blocker_id", user.id)
    setBlockedUsers(data || [])
  }

  async function handleUnblock(blockedId: string) {
    if (!user) return
    const supabase = createClient()
    await supabase.from("user_blocks").delete().eq("blocker_id", user.id).eq("blocked_id", blockedId)
    setBlockedUsers(prev => prev.filter(b => b.blocked_id !== blockedId))
  }

  async function saveProfile() {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    alert("Profil tersimpan!")
  }

  async function savePreferences() {
    // Mock: save to user_preferences table when it exists
    alert("Pengaturan privasi tersimpan!")
  }

  function addEmergencyContact() {
    if (!newContact.name || !newContact.phone) return
    setEmergencyContacts(prev => [...prev, newContact])
    setNewContact({ name: "", phone: "" })
  }

  const interests = ["alam", "pantai", "budaya", "kuliner", "gunung", "air_terjun", "gua", "sejarah", "adventure", "foto", "diving", "camping"]
  const transports = ["motor", "mobil", "bus", "kereta", "pesawat", "kapal"]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" /> Notifikasi</TabsTrigger>
          <TabsTrigger value="safety"><Shield className="h-4 w-4 mr-1" /> Keamanan</TabsTrigger>
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

        <TabsContent value="safety">
          <div className="space-y-6">
            {/* Privacy Settings */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Privasi</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "show_location" as const, label: "Tampilkan lokasi di profil", desc: "Orang lain bisa melihat lokasi umummu" },
                  { key: "show_profile" as const, label: "Profil publik", desc: "Profil bisa dilihat oleh pengguna lain" },
                  { key: "show_trips" as const, label: "Tampilkan trip", desc: "Tripmu bisa dilihat di profil publik" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs[item.key] ? "bg-primary" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs[item.key] ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
                <Button onClick={savePreferences} className="w-full">Simpan Pengaturan Privasi</Button>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Kontak Darurat</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Tambahkan kontak yang bisa dihubungi dalam keadaan darurat.</p>

                {emergencyContacts.length > 0 && (
                  <div className="space-y-2">
                    {emergencyContacts.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.phone}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEmergencyContacts(prev => prev.filter((_, idx) => idx !== i))}>
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input placeholder="Nama" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} />
                  <Input placeholder="No. HP" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                  <Button size="sm" onClick={addEmergencyContact}>Tambah</Button>
                </div>
              </CardContent>
            </Card>

            {/* Blocked Users */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Ban className="h-5 w-5" /> Pengguna Diblokir</CardTitle></CardHeader>
              <CardContent>
                {blockedUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Tidak ada pengguna yang diblokir.</p>
                ) : (
                  <div className="space-y-2">
                    {blockedUsers.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                            {b.blocked?.display_name?.[0] || "?"}
                          </div>
                          <p className="text-sm font-medium">{b.blocked?.display_name || "Pengguna"}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleUnblock(b.blocked_id)}>
                          Buka Blokir
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
