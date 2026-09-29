"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleGoogleRegister = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: fullName, phone },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess("Cek email kamu untuk verifikasi!")
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 text-slate-800 antialiased min-h-screen">
      <main className="flex-grow py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Showcase Visual Column */}
            <div className="lg:col-span-5 hidden lg:block sticky top-28">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 h-[720px]">
                <img alt="Kepulauan Eksotis Nusantara Jejakawan" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1W0Jd9GRtRse37AqCbLBvjVipMs0K1f7T59VCrgnbhsNbzo9FW9fCgSXxseuNKSIEDCHFG2w6N9z-2ZslL9m21ALSyaLPYmvtELS3yUolaTC4UENdX04d-LcGwsqJKVTyy7awrxYf7YTMUznPVR-rk9rQa23uI5vdwNzDHVMq-0LrQVWGCzYfcGaznqeW7FwJQh9RwFkPw_aC8JQBXiy_Afo6w_wviwc-7fuKtsngla4WYPQzd2Q8Qs0g" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-black/10" />
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-brand-900 backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Raja Ampat, Papua Barat Daya
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-slate-900/65 backdrop-blur-[14px] border border-white/20 p-6 rounded-2xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 font-bold text-sm tracking-wide">★★★★★</span>
                    <span className="text-xs text-slate-200 font-medium">4.9/5 Trust Rating</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                    Bergabung dengan 50.000+ Penjelajah Nusantara
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    Jelajahi keindahan Indonesia lebih dalam, berbagi rute rahasia, dan buat memori perjalanan yang tak terlupakan bersama kawan baru.
                  </p>
                  <ul className="space-y-3 mb-6 text-xs text-slate-200">
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-brand-500/40 text-brand-200 flex items-center justify-center shrink-0 mt-0.5 border border-brand-400/30">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                      <span><strong>100 XP &amp; Badge Perdana</strong> instan untuk profil barumu</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-brand-500/40 text-brand-200 flex items-center justify-center shrink-0 mt-0.5 border border-brand-400/30">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                      <span>Akses direktori <strong>150+ spot hidden gems</strong> belum terjamah</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-brand-500/40 text-brand-200 flex items-center justify-center shrink-0 mt-0.5 border border-brand-400/30">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                      <span>Temukan kawan se-frekuensi via <strong>Trip Matching AI</strong></span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-slate-900 bg-brand-600 text-[10px] font-bold text-white">BS</span>
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-slate-900 bg-emerald-600 text-[10px] font-bold text-white">AR</span>
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-slate-900 bg-amber-600 text-[10px] font-bold text-white">DA</span>
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-slate-900 bg-slate-700 text-[9px] font-medium text-slate-200">+50k</span>
                    </div>
                    <span className="text-xs text-slate-300 font-medium">Terverifikasi Penjelajah Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Registration Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-10 lg:p-12">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 mb-3 border border-brand-100">
                    Pendaftaran Gratis
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Akun Jejakawan</h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Mulai petualanganmu dan temukan teman satu tujuan di seluruh penjuru Indonesia.
                  </p>
                </div>

                {/* Google Register */}
                <div className="mb-6">
                  <button
                    onClick={handleGoogleRegister}
                    className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500"
                    type="button"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Daftar dengan Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">atau daftar dengan email</span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="full_name">Nama Lengkap</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all shadow-sm"
                      id="full_name"
                      name="full_name"
                      placeholder="e.g. Bagus Setiawan"
                      required
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Alamat Email</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all shadow-sm"
                        id="email"
                        name="email"
                        placeholder="nama@email.com"
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="phone">Nomor WhatsApp</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all shadow-sm"
                        id="phone"
                        name="phone"
                        placeholder="0812-3456-7890"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Kata Sandi</label>
                    <div className="relative">
                      <input
                        className="w-full pr-11 px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all shadow-sm"
                        id="password"
                        name="password"
                        placeholder="Minimal 8 karakter"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button
                        aria-label="Lihat kata sandi"
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password_confirm">Konfirmasi Kata Sandi</label>
                    <div className="relative">
                      <input
                        className="w-full pr-11 px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none transition-all shadow-sm"
                        id="password_confirm"
                        name="password_confirm"
                        placeholder="Ulangi kata sandi"
                        required
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                      {confirmPassword && password === confirmPassword && (
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                  {success && <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">{success}</p>}

                  <div className="pt-3">
                    <button
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm tracking-wide shadow-md shadow-brand-600/30 transition-all hover:shadow-lg hover:shadow-brand-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600"
                      type="submit"
                      disabled={loading}
                    >
                      <span>{loading ? "Mendaftar..." : "Daftar Sekarang"}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Switch to Login */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-600">
                    Sudah memiliki akun Jejakawan?{" "}
                    <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
