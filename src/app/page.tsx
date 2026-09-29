import Link from "next/link"

export default function LandingPage() {
  const stats = [
    { value: "50.000+", label: "Traveler Aktif" },
    { value: "150+", label: "Hidden Gems" },
    { value: "500+", label: "Komunitas Terverifikasi" },
  ]

  const features = [
    { icon: "🧭", title: "Rekomendasi Personal", desc: "Temukan destinasi yang sesuai minat dan budget kamu." },
    { icon: "🤝", title: "Trip Matching", desc: "Cari teman perjalanan yang kompatibel dan seru." },
    { icon: "🛡️", title: "Keamanan & Kepercayaan", desc: "Verifikasi KTP, trust score, dan sistem laporan." },
    { icon: "🏆", title: "Gamifikasi", desc: "Kumpulkan XP, badge, dan selesaikan misi seru." },
    { icon: "📍", title: "Destinasi Tersembunyi", desc: "Jelajahi 50+ spot underrated di seluruh Indonesia." },
    { icon: "⭐", title: "Open Trip & Marketplace", desc: "Temukan dan booking open trip dari agen terpercaya." },
  ]

  const steps = [
    { num: "1", title: "Buat Profil", desc: "Daftar gratis dan personalisasi minat petualanganmu." },
    { num: "2", title: "Temukan Destinasi", desc: "Jelajahi rekomendasi yang dipersonalisasi untukmu." },
    { num: "3", title: "Trip Match", desc: "Temukan teman perjalanan yang kompatibel." },
    { num: "4", title: "Berpetualang!", desc: "Nikmati perjalanan dan kumpulkan badge." },
  ]

  return (
    <div className="bg-slate-50 text-slate-800 antialiased">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 600">
            <path d="M0,300 Q300,100 600,300 T1200,300 L1200,600 L0,600 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Platform Traveler #1 Indonesia
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Temukan Jejak<br />
              <span className="text-amber-300">Petualanganmu</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Jelajahi Indonesia bersama komunitas traveler. Temukan destinasi tersembunyi, cari teman jalan, dan kumpulkan pengalaman tak terlupakan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Mulai Petualangan
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/discover" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-xl border border-white/30 transition-all">
                Jelajahi Destinasi
              </Link>
            </div>
          </div>
          {/* Stats Bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold">{s.value}</div>
                <div className="text-sm text-white/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Cara Kerja Jejakawan</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">Mulai petualanganmu dalam 4 langkah mudah.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {s.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Fitur Utama</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">Semua yang kamu butuhkan untuk petualangan sempurna.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-card-hover hover:border-brand-200 transition-all group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed mb-6">
              &ldquo;Menemukan teman trip ke Labuan Bajo dalam 2 hari lewat Jejakawan. Pengalaman berlibur terbaik yang pernah saya rasakan!&rdquo;
            </blockquote>
            <div>
              <p className="font-bold text-slate-900">Rian F.</p>
              <p className="text-sm text-brand-600">Bandung &bull; Trip Match Traveler</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Siap Berpetualang?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Bergabunglah dengan ribuan traveler Indonesia dan mulai petualanganmu sekarang.
          </p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
            Daftar Gratis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
