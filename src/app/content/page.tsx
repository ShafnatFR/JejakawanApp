"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Camera, Upload, Trash2, Image, CheckCircle, CloudUpload, Info, Star, Heart, Eye, ChevronDown, Shield, X as XIcon, MessageCircle, Bell, Compass, Map, Trophy, User } from "lucide-react"

export default function ContentPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [destinations, setDestinations] = useState<any[]>([])
  const [myContent, setMyContent] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [form, setForm] = useState({ destination_id: "", caption: "", url: "" })
  const [selectedTags, setSelectedTags] = useState<string[]>(["#SpotSunrise"])

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    fetchData()
  }, [user])

  async function fetchData() {
    const supabase = createClient()
    const { data: dests } = await supabase.from("destinations").select("id,name,province").eq("is_active", true).order("name")
    setDestinations(dests || [])
    if (user) {
      const { data: content } = await supabase.from("user_content").select("*, destination:destinations(name,province)").eq("user_id", user.id).order("created_at", { ascending: false })
      setMyContent(content || [])
    }
  }

  async function uploadContent() {
    if (!user || !form.destination_id) return
    setUploading(true)
    const supabase = createClient()
    await supabase.from("user_content").insert({ user_id: user.id, destination_id: form.destination_id, type: "photo", url: form.url || "https://placehold.co/600x400", caption: form.caption })
    await supabase.from("user_xp_logs").insert({ user_id: user.id, action: "upload_content", xp_amount: 100, reference_type: "content" })
    setForm({ destination_id: "", caption: "", url: "" })
    setUploading(false)
    fetchData()
  }

  async function deleteContent(id: string) {
    const supabase = createClient()
    await supabase.from("user_content").delete().eq("id", id)
    fetchData()
  }

  const tags = ["#SpotSunrise", "#HiddenSpot", "#AmanUntukSolo", "#BudgetFriendly", "#AestheticPhoto"]

  function toggleTag(tag: string) {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const galleryPreviews = [
    { name: "Tumpak Sewu", likes: 42 },
    { name: "Bromo Sunrise", likes: 88 },
    { name: "Kelingking", likes: 110 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* Hero Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Konten & Galeri Petualang</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-3xl">
            Bagikan dokumentasi, review foto destinasi tersembunyi, dan dapatkan XP gamifikasi untuk setiap kontribusi valid.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-sm font-medium">
            <button
              onClick={() => setActiveTab("upload")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === "upload" ? "bg-white font-semibold text-brand-700 shadow-xs border border-slate-200/60" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Foto Destinasi</span>
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === "gallery" ? "bg-white font-semibold text-brand-700 shadow-xs border border-slate-200/60" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
            >
              <Image className="w-4 h-4" />
              <span>Galeri Saya</span>
              <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">{myContent.length}</span>
            </button>
          </div>
          <a className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition" href="#">
            <Info className="w-4 h-4 text-amber-500" />
            <span>1 draft foto tersimpan otomatis</span>
          </a>
        </div>

        {activeTab === "upload" ? (
          /* Two-Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: Upload Form */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
                    Upload Foto Destinasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Sumbangkan foto otentik perjalananmu untuk membantu sesama petualang</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  +100 XP Gamifikasi
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* Destination Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Destinasi Wisata <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-xl border-slate-300 py-2.5 pl-3.5 pr-10 text-sm focus:border-brand-500 focus:ring-brand-500 bg-white"
                      value={form.destination_id}
                      onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
                    >
                      <option value="">Pilih destinasi yang ingin diulas...</option>
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.province}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Pilih dari database Jejakawan agar geotag otomatis terkoneksi ke peta wisata.</p>
                </div>

                {/* Upload Area */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      File Foto Destinasi <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/70 hover:bg-brand-50/20 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3 transition">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Tarik & lepas foto di sini, atau <span className="text-brand-600 hover:underline">pilih file dari perangkat</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Format: JPG, PNG, atau WebP (Maksimal 10 MB)</p>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Atau tempel URL gambar eksternal:</label>
                    <input
                      className="w-full text-sm rounded-xl border-slate-300 placeholder-slate-400 focus:border-brand-500 focus:ring-brand-500 py-2 px-3"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                    />
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">
                      Caption & Cerita Perjalanan <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400 font-mono">{form.caption.length} / 500 karakter</span>
                  </div>
                  <textarea
                    className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500 p-3 leading-relaxed placeholder-slate-400"
                    placeholder="Ceritakan pengalamanmu... rute terbaik, tiket masuk, waktu kunjungan ideal, atau tips penting."
                    rows={4}
                    value={form.caption}
                    onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Kategori & Tag Penanda (Opsional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                          selectedTags.includes(tag)
                            ? "border-brand-200 bg-brand-50 text-brand-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commitment */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input defaultChecked className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" type="checkbox" />
                    <span className="text-xs text-slate-600 leading-normal">
                      Saya menyatakan foto ini merupakan dokumentasi pribadi saya yang orisinal, serta bersedia mematuhi pedoman komunitas dan etika kelestarian lingkungan Jejakawan.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition">
                    Simpan sebagai Draft
                  </button>
                  <button
                    onClick={uploadContent}
                    disabled={uploading || !form.destination_id}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{uploading ? "Mengupload..." : "Upload (+100 XP)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Contributor Status */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                      {user?.email?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-none">Petualang</h3>
                      <span className="text-xs text-brand-600 font-semibold">Level 1 Adventurer</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-md border border-amber-200">
                    Rank #42
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-lg font-bold text-slate-800">{myContent.length}</div>
                    <div className="text-[11px] text-slate-500">Foto</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-lg font-bold text-slate-800">3.4k</div>
                    <div className="text-[11px] text-slate-500">Dilihat</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div className="text-lg font-bold text-slate-800">240</div>
                    <div className="text-[11px] text-slate-500">Disukai</div>
                  </div>
                </div>
                <div className="mt-1 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">Misi: Master Fotografer Alam</span>
                    <span className="font-bold text-brand-600">{myContent.length} / 20 Foto</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-brand-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((myContent.length / 20) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Unggah {20 - myContent.length} foto valid lagi untuk mendapatkan Badge Gold & 500 XP tambahan.</p>
                </div>
              </div>

              {/* Content Guidelines */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-600" />
                  Pedoman Konten Komunitas
                </h3>
                <ul className="text-xs text-slate-600 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Foto jernih & beresolusi tinggi tanpa watermark.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Lokasi otentik di Indonesia dengan deskripsi jujur.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Dilarang mengunggah foto satwa dilindungi yang dieksploitasi.</span>
                  </li>
                </ul>
              </div>

              {/* Mini Gallery */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Galeri Terakhirmu</h3>
                  <a className="text-xs font-semibold text-brand-600 hover:text-brand-700" href="#">Lihat Semua</a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {galleryPreviews.map((item, i) => (
                    <div key={i} className="group relative rounded-lg overflow-hidden aspect-square bg-slate-100 border border-slate-200 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition"></div>
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                        <Camera className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[10px] text-white font-medium">
                        <span className="truncate">{item.name}</span>
                        <span className="flex items-center gap-0.5">❤️ {item.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Gallery Tab */
          myContent.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Belum ada konten. Upload foto pertamamu!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myContent.map((c: any) => (
                <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs group">
                  <div className="h-40 bg-gradient-to-br from-indigo-300 to-teal-300 flex items-center justify-center relative">
                    <Camera className="h-8 w-8 text-white" />
                    <div className="absolute top-2 right-2">
                      <button onClick={() => deleteContent(c.id)} className="p-1.5 bg-white/90 rounded-lg text-slate-600 hover:text-rose-600 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate text-slate-900">{c.destination?.name || "Destinasi"}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{c.caption}</p>
                    <div className="flex items-center justify-between mt-2">
                      {c.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-lg">
                <Compass className="w-5 h-5" />
                <span>Jejakawan</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-4">Jelajahi</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a className="hover:text-brand-600 transition" href="#">Rekomendasi Wisata</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Peta Destinasi & Rute</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Open Trip Komunitas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-4">Komunitas</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a className="hover:text-brand-600 transition" href="#">Cari Teman Jalan</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Misi & Badge Petualang</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Leaderboard Kontributor</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-wide uppercase mb-4">Bantuan</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a className="hover:text-brand-600 transition" href="#">Pusat Bantuan & FAQ</a></li>
                <li><a className="hover:text-brand-600 transition" href="#">Pengaturan Akun</a></li>
                <li><a className="text-brand-600 font-medium hover:underline" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
            <div className="flex items-center space-x-6">
              <a className="hover:text-slate-800 transition" href="#">Kebijakan Privasi</a>
              <a className="hover:text-slate-800 transition" href="#">Ketentuan Layanan</a>
              <a className="hover:text-slate-800 transition" href="#">Keamanan Komunitas</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}