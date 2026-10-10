import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { LANDING_FEATURES, LANDING_STEPS, GEM_FILTERS, LANDING_FAQS, GAMIFICATION_TIERS, LANDING_TESTIMONIALS, LANDING_BADGES } from "@/lib/constants"
import {
  Compass, Users, ShieldCheck, Trophy, MapPin, ShoppingBag,
  Calendar, Search, Star, BadgeCheck, Heart, Shield, ArrowRight,
  PlayCircle, HelpCircle, Lock, Award, Mountain, Ship, UtensilsCrossed,
  Leaf, Globe, CheckCircle2, ChevronDown, Footprints, Sparkles,
  Menu, X, Eye, MessageCircle, Flame, Zap, Crown, MountainSnow,
  TreePine, Waves, Gem,
} from "lucide-react"

// ─── Icon mapping for LANDING_FEATURES (emoji → lucide) ───
const featureIcons = [Compass, Users, ShieldCheck, Trophy, MapPin, ShoppingBag]

// Data fetched from Supabase below; marketing config from constants
const gemFilters = GEM_FILTERS
const testimonials = LANDING_TESTIMONIALS
const gamificationTiers = GAMIFICATION_TIERS.map(t => ({
  ...t,
  icon: t.name === "Explorer" ? Footprints : t.name === "Pathfinder" ? MapPin : Crown,
}))
const badges = LANDING_BADGES.map(b => ({
  ...b,
  icon: b.icon === "MountainSnow" ? MountainSnow : b.icon === "Waves" ? Waves : b.icon === "TreePine" ? TreePine : b.icon === "Gem" ? Gem : b.icon === "Camera" ? Camera : Flame,
}))
const faqs = LANDING_FAQS

// Need Camera icon (not in main import)
import { Camera } from "lucide-react"

export default async function LandingPage() {
  const supabase = createClient(cookies())
  const [travelersRes, destinationsRes, guidesRes] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("destinations").select("id", { count: "exact", head: true }),
    supabase.from("guide_profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
  ])

  const travelerCount = travelersRes.count || 0
  const destinationCount = destinationsRes.count || 0
  const guideCount = guidesRes.count || 0

  const stats = [
    { value: `${travelerCount.toLocaleString("id-ID")}+`, label: "Traveler Aktif" },
    { value: `${destinationCount.toLocaleString("id-ID")}+`, label: "Hidden Gems" },
    { value: `${guideCount.toLocaleString("id-ID")}+`, label: "Komunitas Terverifikasi" },
  ]

  // Fetch featured destinations for hidden gems section
  const { data: destData } = await supabase
    .from("destinations")
    .select("id, name, province, category, image_url, price_estimate, reviews(count)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)

  const hiddenGems = (destData || []).map((d: any) => ({
    image: d.image_url || "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&h=400&fit=crop",
    title: d.name,
    location: d.province || "Indonesia",
    category: d.category || "Alam",
    rating: 4.8,
    reviews: d.reviews?.[0]?.count || 0,
    price: d.price_estimate ? `Rp ${Number(d.price_estimate).toLocaleString("id-ID")}` : "Hubungi Kami",
  }))

  const features = LANDING_FEATURES
  const steps = LANDING_STEPS

  return (
    <div className="bg-slate-50 text-slate-800 antialiased">
      {/* ━━━ Hero Section ━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 700">
            <path d="M0,400 Q360,100 720,400 T1440,400 L1440,700 L0,700 Z" fill="currentColor" />
            <path d="M0,500 Q360,250 720,500 T1440,500 L1440,700 L0,700 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <div className="relative container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Platform Traveler #1 Indonesia
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Temukan Jejak<br />
                <span className="text-amber-300">Petualanganmu</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
                Jelajahi Indonesia bersama komunitas traveler. Temukan destinasi tersembunyi, cari teman jalan, dan kumpulkan pengalaman tak terlupakan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Mulai Petualangan
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-xl border border-white/30 transition-all"
                >
                  <Compass className="w-5 h-5" />
                  Jelajahi Destinasi
                </Link>
              </div>
              {/* Stats */}
              <div className="mt-10 flex flex-wrap gap-8">
                {stats.map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-extrabold">{s.value}</div>
                    <div className="text-sm text-white/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: Visual showcase */}
            <div className="hidden lg:block relative">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=500&fit=crop"
                    alt="Pantai Indonesia"
                    className="w-full h-[420px] object-cover"
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 text-slate-800 max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="text-sm font-bold">Pulau Weh, Aceh</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-slate-400">(128 review)</span>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-900 rounded-2xl shadow-lg px-4 py-3 text-center">
                  <Award className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Level 5</span>
                </div>
              </div>
            </div>
          </div>
          {/* Floating search bar */}
          <div className="mt-12 md:mt-16 max-w-2xl mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Mau ke mana hari ini?"
                  className="w-full py-3 text-slate-700 placeholder-slate-400 focus:outline-none text-sm"
                  readOnly
                />
              </div>
              <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                Cari
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Hidden Gems Section (#jelajah) ━━━ */}
      <section id="jelajah" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <span className="text-brand-600 font-semibold text-sm">Jelajahi</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Hidden Gems Indonesia
              </h2>
              <p className="mt-3 text-slate-500 max-w-lg">
                Destinasi tersembunyi yang jarang dikunjungi tapi punya pesona luar biasa.
              </p>
            </div>
            <Link
              href="/discover"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {gemFilters.map((f, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  f.active
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hiddenGems.map((gem, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-card-hover hover:border-brand-200 transition-all"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={gem.image}
                    alt={gem.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-600 text-xs font-bold px-3 py-1 rounded-full">
                    {gem.category}
                  </span>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {gem.title}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{gem.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-semibold">{gem.rating}</span>
                      <span className="text-slate-400">({gem.reviews})</span>
                    </div>
                    <span className="text-brand-600 font-bold text-sm">{gem.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ Features Section (#fitur) ━━━ */}
      <section id="fitur" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm">Fitur Utama</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Platform lengkap untuk petualangan sempurna — dari penemuan destinasi hingga teman perjalanan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = featureIcons[i] || Compass
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-card-hover hover:border-brand-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ━━━ How It Works / Trip Matching Section (#trip-match) ━━━ */}
      <section id="trip-match" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Steps */}
            <div>
              <span className="text-brand-600 font-semibold text-sm">Trip Matching</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 mb-4">
                Temukan Teman Jalan yang Cocok
              </h2>
              <p className="text-slate-500 mb-8 max-w-lg">
                Sistem kami mencocokkan kamu dengan traveler lain berdasarkan minat, budget, dan gaya traveling.
              </p>
              <div className="space-y-6">
                {steps.map((s, i) => {
                  const StepIcons = [BadgeCheck, Search, Users, Trophy]
                  const StepIcon = StepIcons[i] || Compass
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                        <p className="text-sm text-slate-500">{s.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Right: Visual mockup */}
            <div className="hidden lg:block relative">
              <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-3xl p-8 border border-brand-100">
                {/* Mockup card 1 */}
                <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">Trip Match Found!</p>
                      <p className="text-xs text-slate-500">3 traveler cocok untuk Bali Trip</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      98% Match
                    </span>
                  </div>
                </div>
                {/* Mockup card 2 */}
                <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                      AS
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">Andi S.</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" /> Jakarta
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-semibold">4.8</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">🏔️ Gunung</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">🏖️ Pantai</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">📸 Foto</span>
                  </div>
                </div>
                {/* Mockup card 3 */}
                <div className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                      DR
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-900">Dewi R.</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" /> Bandung
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-semibold">4.9</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">🌊 Diving</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">🍲 Kuliner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Gamification Section (#gamifikasi) ━━━ */}
      <section id="gamifikasi" className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-semibold text-sm">Gamifikasi</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              Kumpulkan XP & Badge
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Setiap petualangan menghadiahimu XP. Naik level, kumpulkan badge, dan buka fitur eksklusif.
            </p>
          </div>
          {/* Tier cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {gamificationTiers.map((tier, i) => {
              const TierIcon = tier.icon
              return (
                <div
                  key={i}
                  className={`relative bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 hover:border-brand-500 transition-all ${
                    tier.popular ? "ring-2 ring-brand-500" : ""
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Populer
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-xl ${tier.badgeBg} flex items-center justify-center mb-4`}>
                    <TierIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{tier.range}</p>
                  <ul className="space-y-2">
                    {tier.perks.map((perk, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          {/* Badge showcase */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-6 text-slate-300">Badge Collection</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {badges.map((b, i) => {
                const BadgeIcon = b.icon
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-2xl ${b.color} flex items-center justify-center`}>
                      <BadgeIcon className="w-7 h-7" />
                    </div>
                    <span className="text-xs text-slate-400">{b.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ Testimonials Section (#cerita) ━━━ */}
      <section id="cerita" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm">Cerita Mereka</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Dipercaya Ribuan Traveler
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-card-hover transition-all"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-700 mb-6 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-brand-600">
                      {t.origin} &bull; {t.tag}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FAQ Section (#tentang-kami) ━━━ */}
      <section id="tentang-kami" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Pertanyaan Umum
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-slate-900 hover:text-brand-600 transition-colors list-none">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA Section (#daftar) ━━━ */}
      <section id="daftar" className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Gratis Selamanya
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Siap Memulai<br />Petualangan?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Bergabunglah dengan ribuan traveler Indonesia dan mulai petualanganmu sekarang. Daftar gratis, tanpa kartu kredit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Daftar Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl border border-white/30 transition-all"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}