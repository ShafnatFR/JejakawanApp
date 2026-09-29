"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { Heart, Star, Award, Crown, Gift, Shield, Users, Globe, BarChart3, Lock, ChevronRight, Compass, Map, Trophy, MessageCircle, Bell, Search } from "lucide-react"

const TIERS = [
  { name: "Bronze", min: 10000, color: "amber", icon: Star, xp: "+50 XP", perk: "Supporter" },
  { name: "Silver", min: 50000, color: "indigo", icon: Award, xp: "+250 XP", perk: "Diskusi Privat", popular: true },
  { name: "Gold", min: 200000, color: "yellow", icon: Crown, xp: "+1.000 XP", perk: "Merchandise" },
  { name: "Platinum", min: 500000, color: "purple", icon: Gift, xp: "+3.000 XP", perk: "Wall of Fame" },
]

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 1000000]

const SUPPORTERS = [
  { name: "Dimas Anggara", initials: "DA", color: "purple", tier: "Platinum", amount: 500000, time: "4 menit yang lalu", message: "Semoga semakin banyak hidden gems terawat! Salam dari traveler Yogya." },
  { name: "Rian & Lina", initials: "RL", color: "indigo", tier: "Silver", amount: 50000, time: "18 menit yang lalu", message: "Maju terus pariwisata Indonesia berdaya & bersih dari sampah plastik!" },
  { name: "Kawan Petualang", initials: "?", color: "slate", tier: "Gold", amount: 200000, time: "1 jam yang lalu", message: "Untuk program reboisasi jalur pendakian Gunung Argopuro." },
  { name: "Bima Wicaksono", initials: "BW", color: "amber", tier: "Bronze", amount: 20000, time: "3 jam yang lalu", message: "Dukungan kecil untuk platform favorit traveler lokal!" },
]

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}

export default function DonationsPage() {
  const { user } = useAuthStore()
  const [amount, setAmount] = useState(50000)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("qris")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState("")

  const selectedTier = TIERS.find((t) => amount >= t.min) || TIERS[0]

  async function handleDonate() {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from("donations").insert({
      user_id: user.id,
      amount,
      tier: selectedTier.name.toLowerCase(),
      payment_status: "paid",
    })
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      <main className="flex-grow py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero */}
          <section className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
              <Heart className="w-4 h-4 text-brand-600" />
              Inisiatif Komunitas & Konservasi
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Dukung Ekosistem Jejakawan
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              Donasimu membantu pemeliharaan platform gratis, ekspedisi kurasi destinasi tersembunyi, serta edukasi pelestarian alam bagi komunitas lokal di pelosok Indonesia.
            </p>
          </section>

          {/* Impact Metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Dana Terkumpul", value: "Rp 42.850.000", sub: "Bulan berjalan: +18%", icon: BarChart3, color: "emerald" },
              { label: "Total Donatur", value: "842 Traveler", sub: "Dari 34 provinsi", icon: Users, color: "blue" },
              { label: "Destinasi Terbantu", value: "38 Lokasi", sub: "Jalur & konservasi lokal", icon: Globe, color: "indigo" },
              { label: "Alokasi Utama", value: "60% Konservasi", sub: "25% Edukasi, 15% Platform", icon: BarChart3, color: "amber" },
            ].map((m, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className={`p-3 bg-${m.color}-50 rounded-xl text-${m.color}-600 border border-${m.color}-100`}>
                  <m.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{m.label}</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{m.value}</p>
                  <span className={`text-xs font-medium ${m.color === "emerald" ? "text-emerald-600" : "text-slate-500"}`}>{m.sub}</span>
                </div>
              </div>
            ))}
          </section>

          {success ? (
            <div className="max-w-xl mx-auto bg-white border border-emerald-200 rounded-3xl p-12 text-center shadow-sm">
              <Heart className="h-16 w-16 mx-auto mb-4 text-emerald-500 fill-emerald-500" />
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Terima Kasih!</h2>
              <p className="text-slate-500">Donasi kamu sangat berarti untuk komunitas traveler Indonesia.</p>
            </div>
          ) : (
            /* Main Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Donation Form */}
              <section className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                {/* Frequency Tab */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Pilih Skema Donasi</h2>
                    <p className="text-xs text-slate-500">Dukunganmu sangat berarti untuk menjaga bumi nusantara</p>
                  </div>
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                    <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-slate-900 shadow-sm">Sekali Donasi</button>
                    <button className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900">Donasi Rutin Bulanan</button>
                  </div>
                </div>

                {/* Tier Cards */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-slate-900">Pilih Tier Donatur & Dapatkan Lencana Eksklusif</label>
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">Badge Aktif Selamanya</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {TIERS.map((tier) => {
                      const isSelected = selectedTier.name === tier.name
                      return (
                        <div
                          key={tier.name}
                          onClick={() => setAmount(tier.min)}
                          className={`relative rounded-2xl border-2 p-4 text-center cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            isSelected ? `border-brand-600 bg-brand-50/20 shadow-sm` : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {tier.popular && (
                            <div className="absolute -top-2.5 right-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                              Populer
                            </div>
                          )}
                          <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-xl bg-${tier.color}-50 text-${tier.color}-700 flex items-center justify-center mb-3`}>
                              <tier.icon className="w-6 h-6" />
                            </div>
                            <h3 className={`font-bold text-sm ${isSelected ? "text-slate-900" : "text-slate-800"}`}>{tier.name}</h3>
                            <p className={`text-xs mt-0.5 ${isSelected ? "text-brand-700 font-semibold" : "text-slate-500"}`}>{formatRupiah(tier.min)}+</p>
                          </div>
                          <div className={`mt-3 pt-2 border-t ${isSelected ? "border-brand-100" : "border-slate-100"} text-[11px] ${isSelected ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                            {tier.xp} & {tier.perk}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Badge Preview */}
                <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <selectedTier.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Badge: Donatur {selectedTier.name}</h4>
                      <p className="text-xs text-slate-500">Badge ini akan otomatis muncul pada kartu profil & leaderboard Anda</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">{selectedTier.name}</span>
                </div>

                {/* Custom Amount */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Nominal Donasi (IDR)</label>
                  <div className="relative rounded-2xl">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      className="block w-full rounded-2xl border border-slate-200 pl-12 pr-4 py-3.5 text-base font-bold text-slate-900 focus:border-brand-600 focus:ring-brand-600 bg-slate-50/50"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={10000}
                      step={5000}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_AMOUNTS.map((qa) => (
                      <button
                        key={qa}
                        onClick={() => setAmount(qa)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          amount === qa ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-600"
                        }`}
                      >
                        {formatRupiah(qa)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Support Message */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">
                    Pesan Dukungan atau Catatan Konservasi <span className="text-xs font-normal text-slate-500">(Opsional)</span>
                  </label>
                  <textarea
                    className="block w-full rounded-2xl border border-slate-200 p-3.5 text-sm text-slate-900 focus:border-brand-600 focus:ring-brand-600 bg-slate-50/50"
                    placeholder="Tuliskan ucapan semangat untuk tim penjelajah dan pejuang pariwisata daerah..."
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Pilih Metode Pembayaran Cepat</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "qris", label: "QRIS / Instant", sub: "GoPay, OVO, Dana" },
                      { id: "bca", label: "BCA Virtual Account", sub: "Konfirmasi Otomatis" },
                      { id: "mandiri", label: "Mandiri Livin", sub: "Transfer VA" },
                      { id: "ewallet", label: "ShopeePay / VA Lain", sub: "BRI, BNI, Permata" },
                    ].map((pm) => (
                      <label
                        key={pm.id}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition ${
                          paymentMethod === pm.id ? "border-brand-600 bg-brand-50/30" : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={pm.id}
                          checked={paymentMethod === pm.id}
                          onChange={() => setPaymentMethod(pm.id)}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold text-slate-800">{pm.label}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{pm.sub}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Anonymous */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label className="ml-2.5 text-xs sm:text-sm text-slate-700">
                    Sembunyikan identitas saya di Wall of Supporters (Donasi sebagai Anonim)
                  </label>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleDonate}
                    disabled={loading || !user}
                    className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base transition-colors duration-200 shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-5 h-5 text-indigo-200" />
                    <span>{loading ? "Memproses..." : `Donasi ${formatRupiah(amount)}`}</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Enkripsi 256-bit SSL Terjamin Aman • Donasi disalurkan transparan setiap akhir bulan
                  </p>
                </div>
              </section>

              {/* Right: Wall of Supporters */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">Supporter Terbaru</h3>
                    </div>
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">Live Feed</span>
                  </div>
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                    {SUPPORTERS.map((s, i) => {
                      const tierColors: Record<string, string> = {
                        Platinum: "bg-purple-50 text-purple-700 border-purple-200",
                        Silver: "bg-indigo-50 text-brand-700 border-indigo-200",
                        Gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
                        Bronze: "bg-amber-50 text-amber-700 border-amber-200",
                      }
                      const avatarColors: Record<string, string> = {
                        purple: "bg-purple-100 text-purple-700 border-purple-200",
                        indigo: "bg-indigo-100 text-brand-700 border-indigo-200",
                        slate: "bg-slate-200 text-slate-600 border-slate-300",
                        amber: "bg-amber-100 text-amber-800 border-amber-200",
                      }
                      return (
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${avatarColors[s.color]}`}>
                                {s.initials}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{s.name}</p>
                                <span className="text-[10px] text-slate-400">{s.time}</span>
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${tierColors[s.tier]}`}>{s.tier}</span>
                          </div>
                          <p className="text-xs text-slate-600 italic">&ldquo;{s.message}&rdquo;</p>
                          <div className="text-[11px] font-semibold text-slate-700 pt-1 border-t border-slate-200/60 flex justify-between">
                            <span>Berdonasi:</span>
                            <span className="text-brand-700 font-bold">{formatRupiah(s.amount)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Conservation Program Card */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Program Jejak Lestari</h4>
                      <p className="text-xs text-slate-500">Laporan transparan dirilis triwulanan</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap donatur terverifikasi menerima tautan ringkasan alokasi dana secara langsung melalui email dan dasbor akun.
                  </p>
                  <a className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700" href="#">
                    Lihat Laporan Dampak 2025
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Jejakawan</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed pr-4">Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.</p>
            </div>
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Jelajahi</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Rekomendasi Destinasi</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Peta Interaktif</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Open Trip Nusantara</a></li>
              </ul>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Komunitas</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Cari Teman Trip</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Misi & Badge</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Donasi Konservasi</a></li>
              </ul>
            </div>
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Bantuan & Kontak</h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Pengaturan Akun</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Pusat Bantuan & FAQ</a></li>
                <li>
                  <a className="font-semibold text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
            <div className="flex items-center gap-6">
              <a className="hover:underline" href="#">Kebijakan Privasi</a>
              <a className="hover:underline" href="#">Syarat & Ketentuan</a>
              <a className="hover:underline" href="#">Transparansi Dana</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}