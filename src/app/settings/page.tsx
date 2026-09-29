"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User, Bell, Shield, CreditCard, Check, ChevronDown, Camera, X, Users, Eye, EyeOff, Ban } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({ display_name: "", bio: "", current_mode: "tourist" as string, preferred_interests: [] as string[], budget_min: 0, budget_max: 10000000, transport_modes: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "safety" | "subscription">("profile")
  const [prefs, setPrefs] = useState({ show_location: true, show_profile: true, show_trips: true })
  const [emergencyContacts, setEmergencyContacts] = useState<{ name: string; phone: string }[]>([])
  const [newContact, setNewContact] = useState({ name: "", phone: "" })
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])

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
    const { data } = await supabase.from("user_blocks").select("*, blocked:user_profiles!blocked_id(display_name,avatar_url)").eq("blocker_id", user.id)
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
  }

  function addEmergencyContact() {
    if (!newContact.name || !newContact.phone) return
    setEmergencyContacts(prev => [...prev, newContact])
    setNewContact({ name: "", phone: "" })
  }

  const interests = [
    { id: "alam", label: "Alam" }, { id: "pantai", label: "Pantai" }, { id: "budaya", label: "Budaya" },
    { id: "kuliner", label: "Kuliner" }, { id: "gunung", label: "Gunung" }, { id: "air_terjun", label: "Air Terjun" },
    { id: "gua", label: "Gua" }, { id: "sejarah", label: "Sejarah" }, { id: "adventure", label: "Adventure" },
    { id: "foto", label: "Foto" }, { id: "diving", label: "Diving" }, { id: "camping", label: "Camping" },
  ]

  const transports = ["Motor", "Mobil", "Bus", "Kereta", "Pesawat", "Kapal"]

  const tabs = [
    { id: "profile" as const, label: "Profil", icon: User },
    { id: "notifications" as const, label: "Notifikasi", icon: Bell },
    { id: "safety" as const, label: "Keamanan", icon: Shield },
    { id: "subscription" as const, label: "Langganan", icon: CreditCard },
  ]

  return (
    <div className="flex-grow py-8 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Pengaturan</h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2">Kelola identitas, preferensi penjelajahan, gaya perjalanan, dan keamanan akun</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-slate-200/70 p-1.5 rounded-2xl flex items-center gap-1 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                activeTab === tab.id ? "shadow-sm bg-white text-indigo-600 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-500" : "text-slate-400"}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profil</h2>
                <p className="text-sm text-slate-500 mt-1">Sesuaikan informasi pribadimu agar teman perjalanan & algoritma rekomendasi lebih akurat.</p>
              </div>
              {profile?.ktp_verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  KTP Terverifikasi
                </span>
              )}
            </div>

            <form className="p-6 sm:p-8 space-y-7" onSubmit={e => { e.preventDefault(); saveProfile() }}>
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-white shadow">
                    {form.display_name?.[0] || "S"}
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                    <Check className="w-3 h-3" />
                  </span>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <button type="button" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-sm">
                      Ganti Foto
                    </button>
                    <button type="button" className="px-3.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition">Hapus</button>
                  </div>
                  <p className="text-xs text-slate-500">Mendukung format JPG, PNG, atau WEBP maks 2 MB.</p>
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Nama Lengkap</label>
                  <input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all placeholder:text-slate-400" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-medium">@</span>
                    <input className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" value={form.display_name?.toLowerCase().replace(/\s+/g, "")} readOnly />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-800">Bio & Catatan Petualang</label>
                  <span className="text-xs text-slate-400">{form.bio.length}/250 karakter</span>
                </div>
                <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all placeholder:text-slate-400 resize-y" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Ceritakan tentang dirimu..." />
              </div>

              {/* Mode */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">Mode Petualang</label>
                <div className="relative">
                  <select className="w-full appearance-none px-4 py-3 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition cursor-pointer pr-10" value={form.current_mode} onChange={e => setForm({...form, current_mode: e.target.value})}>
                    <option value="tourist">Tourist - Jelajahi destinasi populer & santai</option>
                    <option value="backpacker">Backpacker - Petualangan hemat, spontan & autentik</option>
                    <option value="explorer">Explorer - Ekspedisi hidden gems, jalur terpencil & alam liar</option>
                    <option value="luxury">Luxury Escapist - Pengalaman premium & kenyamanan penuh</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-800">Minat & Aktivitas Favorit</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {interests.map(i => {
                    const active = form.preferred_interests.includes(i.id)
                    return (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setForm({...form, preferred_interests: active ? form.preferred_interests.filter(x => x !== i.id) : [...form.preferred_interests, i.id]})}
                        className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-lg border transition ${
                          active
                            ? "bg-indigo-50 text-indigo-600 border-indigo-300 font-semibold"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {i.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">Kisaran Budget Trip (IDR)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Budget Min</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-medium">Rp</span>
                      <input type="number" step={50000} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition" value={form.budget_min} onChange={e => setForm({...form, budget_min: +e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Budget Max</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-medium">Rp</span>
                      <input type="number" step={100000} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition" value={form.budget_max} onChange={e => setForm({...form, budget_max: +e.target.value})} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic">Membantu kami merekomendasikan Open Trip dan paket wisata sesuai alokasi dana kamu.</p>
              </div>

              {/* Transport */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-800">Moda Transportasi Favorit</label>
                <div className="flex flex-wrap gap-2.5">
                  {transports.map(t => {
                    const active = form.transport_modes.includes(t.toLowerCase())
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({...form, transport_modes: active ? form.transport_modes.filter(x => x !== t.toLowerCase()) : [...form.transport_modes, t.toLowerCase()]})}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                          active
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/25"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Trip Match Toggle */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-800 block">Tampilkan profil di pencarian Trip Match</span>
                    <span className="text-xs text-slate-500">Traveler lain dapat menemukanmu untuk mengajak menjelajah bareng.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs(p => ({ ...p, show_profile: !p.show_profile }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.show_profile ? "bg-indigo-500" : "bg-slate-200"}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${prefs.show_profile ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400 text-center sm:text-left">Terakhir diperbarui: Hari ini</span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button type="button" className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition">Batal</button>
                  <button type="submit" disabled={saving} className="w-1/2 sm:w-auto px-8 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Pengaturan notifikasi akan segera tersedia.</p>
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === "safety" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Eye className="w-5 h-5" /> Privasi</h3>
              <div className="space-y-4">
                {[
                  { key: "show_location" as const, label: "Tampilkan lokasi di profil", desc: "Orang lain bisa melihat lokasi umummu" },
                  { key: "show_profile" as const, label: "Profil publik", desc: "Profil bisa dilihat oleh pengguna lain" },
                  { key: "show_trips" as const, label: "Tampilkan trip", desc: "Tripmu bisa dilihat di profil publik" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <button onClick={() => setPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs[item.key] ? "bg-indigo-500" : "bg-slate-200"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs[item.key] ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Users className="w-5 h-5" /> Kontak Darurat</h3>
              <p className="text-sm text-slate-500 mb-4">Tambahkan kontak yang bisa dihubungi dalam keadaan darurat.</p>
              {emergencyContacts.length > 0 && (
                <div className="space-y-2 mb-4">
                  {emergencyContacts.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div><p className="text-sm font-medium text-slate-900">{c.name}</p><p className="text-xs text-slate-500">{c.phone}</p></div>
                      <button onClick={() => setEmergencyContacts(prev => prev.filter((_, idx) => idx !== i))} className="text-xs text-rose-600 hover:underline">Hapus</button>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-4">
                <input placeholder="Nama" className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} />
                <input placeholder="No. HP" className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} />
                <button onClick={addEmergencyContact} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">Tambah</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Ban className="w-5 h-5" /> Pengguna Diblokir</h3>
              {blockedUsers.length === 0 ? (
                <p className="text-center text-slate-400 py-4">Tidak ada pengguna yang diblokir.</p>
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">{b.blocked?.display_name?.[0] || "?"}</div>
                        <p className="text-sm font-medium text-slate-900">{b.blocked?.display_name || "Pengguna"}</p>
                      </div>
                      <button onClick={() => handleUnblock(b.blocked_id)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">Buka Blokir</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Langganan</h3>
            <div className="text-center py-4 mb-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">Paket saat ini</p>
              <p className="text-2xl font-bold capitalize text-slate-900">{profile?.subscription || "Free"}</p>
            </div>
            <div className="space-y-3">
              {[
                { name: "Weekly", price: "Rp 9.900/minggu", desc: "XP 1.5x, no iklan, 10 rekomendasi/hari" },
                { name: "Monthly", price: "Rp 29.000/bulan", desc: "Priority matching, filter detail, XP 1.5x" },
                { name: "Exclusive", price: "Rp 299.000/tahun", desc: "Semua fitur, early access, diskon partner, XP 2x" },
              ].map(p => (
                <div key={p.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div><p className="font-medium text-slate-900">{p.name}</p><p className="text-sm text-slate-500">{p.desc}</p></div>
                  <div className="text-right"><p className="font-bold text-slate-900">{p.price}</p><button className="mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition">Upgrade</button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
