"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth"
import { MapPin, ArrowRight, Compass, Camera, Mountain, UtensilsCrossed, Car, Palmtree, ChevronRight, Star, Users, ShieldCheck } from "lucide-react"

const interests = [
  "Pantai", "Gunung", "Air Terjun", "Danau", "Hutan", "Desa Wisata",
  "Kuliner", "Sejarah", "Budaya", "Snorkeling", "Diving", "Hiking",
  "Camping", "Fotografi", "Sunrise", "Sunset", "Wildlife", "Festival"
]

const transportModes = ["Motor", "Mobil", "Bus", "Kereta", "Kapal", "Pesawat"]

const personas = [
  { value: "solo", emoji: "🧭", label: "Solo Backpacker" },
  { value: "hidden-gems", emoji: "💎", label: "Hidden Gems" },
  { value: "nature", emoji: "🌲", label: "Alam & Pendaki" },
  { value: "culinary", emoji: "🍲", label: "Kuliner Autentik" },
  { value: "roadtrip", emoji: "🚗", label: "Road Tripper" },
  { value: "relaxed", emoji: "🏖️", label: "Santai & Resort" },
]

const quickCities = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali"]

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, updateProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState(100000)
  const [budgetMax, setBudgetMax] = useState(5000000)
  const [selectedTransport, setSelectedTransport] = useState<string[]>([])
  const [homeLocation, setHomeLocation] = useState("")
  const [travelerPersona, setTravelerPersona] = useState("solo")
  const [loading, setLoading] = useState(false)

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  const toggleTransport = (mode: string) => {
    setSelectedTransport(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    )
  }

  const handleComplete = async () => {
    setLoading(true)
    await updateProfile({
      display_name: displayName,
      preferred_interests: selectedInterests,
      budget_min: budgetMin,
      budget_max: budgetMax,
      transport_modes: selectedTransport,
      home_location: homeLocation,
    })
    router.push("/discover")
  }

  const stepLabels = ["Identitas & Asal", "Minat Wisata", "Preferensi Perjalanan"]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Selamat Datang di Jejakawan!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Atur preferensi kamu agar kami bisa memberikan rekomendasi petualangan, rute, dan kawan perjalanan terbaik.
          </p>
          {/* Step Indicators */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span className={step === 1 ? "text-indigo-600 font-bold" : ""}>{stepLabels[0]}</span>
              <span className={`hidden sm:inline ${step === 2 ? "text-indigo-600 font-bold" : ""}`}>{stepLabels[1]}</span>
              <span className={`hidden sm:inline ${step === 3 ? "text-indigo-600 font-bold" : ""}`}>{stepLabels[2]}</span>
              <span className="text-slate-700 font-bold">{Math.round((step / 3) * 100)}% Selesai</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-2 rounded-full ${step >= s ? "bg-indigo-600 shadow-sm" : "bg-slate-200"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Form */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 sm:p-10">
            {/* Step Header */}
            <div className="border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {step === 1 ? "Tentang Kamu" : step === 2 ? "Minat & Hobi" : "Budget & Transportasi"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {step === 1 ? "Ceritakan sedikit tentang dirimu untuk memulai jejak petualangan." : step === 2 ? "Pilih yang kamu suka (bisa lebih dari satu)" : "Atur preferensi perjalananmu"}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Langkah {step}/3
                </span>
              </div>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Name inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Tampilan</label>
                    <input
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-sm placeholder:text-slate-400"
                      placeholder="cth. Surya Pratama"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Lokasi Domisili <span className="text-indigo-600">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-sm placeholder:text-slate-400"
                        placeholder="Jakarta, Bandung, Surabaya, dll."
                        value={homeLocation}
                        onChange={(e) => setHomeLocation(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Pilihan cepat:</span>
                      {quickCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          onClick={() => setHomeLocation(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Persona */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Persona Petualangan Utama <span className="text-xs font-normal text-slate-400">(Pilih salah satu)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {personas.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setTravelerPersona(p.value)}
                        className={`relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition select-none ${
                          travelerPersona === p.value
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 ${
                          travelerPersona === p.value ? "text-indigo-900" : "text-slate-700"
                        }`}>
                          <span>{p.emoji}</span> {p.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  <button type="button" onClick={() => router.push("/discover")} className="w-full sm:w-auto text-center px-5 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
                    Atur Nanti Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!displayName}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition duration-150 disabled:opacity-50"
                  >
                    <span>Lanjut ke Minat Wisata</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`cursor-pointer text-sm py-1.5 px-3 rounded-lg border-2 transition font-medium ${
                        selectedInterests.includes(interest)
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-100 flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition">
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={selectedInterests.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Budget Minimum (Rp)</label>
                    <input
                      type="number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-sm"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Budget Maksimum (Rp)</label>
                    <input
                      type="number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-sm"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Moda Transportasi</label>
                  <div className="flex flex-wrap gap-2">
                    {transportModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => toggleTransport(mode)}
                        className={`cursor-pointer text-sm py-1.5 px-3 rounded-lg border-2 transition font-medium ${
                          selectedTransport.includes(mode)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition">
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading || selectedTransport.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : "Selesai!"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Kenapa mengisi profil ini penting?</h3>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span>Rekomendasi destinasi yang tepat sesuai asal kota & bujetmu.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span>Menghubungkanmu ke rekan open trip dengan minat yang seirama.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span>Membuka akses badge penjelajah & reward komunitas.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Bonus Onboarding</div>
                <div className="text-xs font-bold text-slate-800">+50 XP</div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
