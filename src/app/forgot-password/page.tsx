"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Auth Section */}
      <section className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between px-6 sm:px-12 md:px-16 lg:px-20 py-8 lg:py-10 bg-white shadow-sm z-10">
        <header className="flex items-center justify-between pb-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5 text-white stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-brand-600 transition-colors">Jejakawan</span>
          </Link>
          <div className="text-sm">
            <span className="text-gray-500 hidden sm:inline">Ingat kata sandi?</span>
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 ml-1.5 inline-flex items-center gap-1 transition-colors">
              Masuk
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </Link>
          </div>
        </header>

        <div className="py-10 max-w-md w-full mx-auto">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Atur Ulang Kata Sandi</h1>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {sent
                ? "Link reset password sudah dikirim ke email kamu. Cek inbox dan folder spam."
                : "Jangan khawatir! Masukkan alamat email terdaftar akun Jejakawan Anda, kami akan mengirimkan tautan verifikasi atau instruksi reset."}
            </p>
          </div>

          {!sent ? (
            <>
              {/* Mode Selector */}
              <div className="flex items-center p-1 bg-gray-100 rounded-xl mb-6">
                <button className="w-1/2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg bg-white text-gray-900 shadow-sm flex items-center justify-center gap-2 border border-gray-200" type="button">
                  <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Email Akun
                </button>
                <button className="w-1/2 py-2 px-3 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg flex items-center justify-center gap-2 transition-colors" type="button">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  WhatsApp / SMS
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-gray-700 uppercase mb-2" htmlFor="email">
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative rounded-xl border border-gray-300 shadow-sm bg-white overflow-hidden">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-11 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 border-0 focus:ring-0 outline-none"
                      id="email"
                      name="email"
                      placeholder="nama@email.com"
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Pastikan Anda memiliki akses ke inbox email ini untuk membuka instruksi.</p>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold text-sm bg-brand-600 hover:bg-brand-700 active:scale-[0.99] transition-all duration-150 shadow-md shadow-brand-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 cursor-pointer"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? "Mengirim..." : "Kirim Tautan Reset"}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Cek inbox email <strong>{email}</strong> dan klik link reset password.
                Jika tidak ada di inbox, cek folder spam.
              </p>
              <button
                className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
                onClick={() => { setSent(false); setEmail("") }}
              >
                Kirim Ulang
              </button>
            </div>
          )}

          {/* Security Badge */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 py-2.5 px-3 rounded-lg border border-gray-100 mt-6">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            <span>256-Bit SSL Encrypted &amp; Verifikasi Identitas Terjamin</span>
          </div>

          <div className="text-center pt-4">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>

        <footer className="pt-6 border-t border-gray-100 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Jejakawan. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-gray-500">
            <Link href="#" className="hover:text-gray-800 transition-colors">Bantuan</Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-800 transition-colors">Kebijakan Privasi</Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-800 transition-colors">Syarat Ketentuan</Link>
          </div>
        </footer>
      </section>

      {/* Right Showcase */}
      <aside className="hidden lg:relative lg:flex lg:w-1/2 xl:w-[52%] overflow-hidden bg-gray-900 flex-col justify-between p-12 select-none">
        <img alt="Turquoise waters and karst islands of Raja Ampat Indonesia" className="absolute inset-0 w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida/AEtjO1W0Jd9GRtRse37AqCbLBvjVipMs0K1f7T59VCrgnbhsNbzo9FW9fCgSXxseuNKSIEDCHFG2w6N9z-2ZslL9m21ALSyaLPYmvtELS3yUolaTC4UENdX04d-LcGwsqJKVTyy7awrxYf7YTMUznPVR-rk9rQa23uI5vdwNzDHVMq-0LrQVWGCzYfcGaznqeW7FwJQh9RwFkPw_aC8JQBXiy_Afo6w_wviwc-7fuKtsngla4WYPQzd2Q8Qs0g" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-black/30 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Eksplorasi Aman Nusantara</span>
          </div>
          <div className="text-white/80 text-xs font-medium tracking-wide flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <svg className="w-3.5 h-3.5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Kepulauan Raja Ampat, Papua Barat Daya
          </div>
        </div>
        <div className="relative z-10 mt-auto max-w-xl">
          <div className="bg-gray-900/75 backdrop-blur-md border border-white/15 p-6 rounded-2xl shadow-2xl text-white">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs font-semibold ml-2 text-white/90">Komitmen Keamanan</span>
            </div>
            <blockquote className="text-sm font-normal text-white/90 leading-relaxed mb-4">
              &ldquo;Keamanan akun dan data traveler adalah prioritas utama kami. Pulihkan akses Anda dengan aman dan bersiaplah kembali menjelajahi keindahan Nusantara bersama kawan baru.&rdquo;
            </blockquote>
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <div>
                <p className="font-semibold text-white">Pusat Bantuan &amp; Keamanan Jejakawan</p>
                <p className="text-white/60">Verifikasi Multi-Faktor &amp; Perlindungan Akun</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-brand-500/30 border border-brand-500/40 text-brand-200 text-[11px] font-medium">
                50.000+ Traveler Aktif
              </span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
}
