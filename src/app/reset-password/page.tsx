"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
      }
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.")
      return
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const passwordStrength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strength = passwordStrength()
  const strengthLabel = strength <= 1 ? "Lemah" : strength === 2 ? "Sedang" : strength === 3 ? "Kuat" : "Sangat Kuat"
  const strengthColor = strength <= 1 ? "bg-red-500" : strength === 2 ? "bg-amber-500" : strength === 3 ? "bg-emerald-500" : "bg-emerald-500"

  if (!ready && !success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Link Tidak Valid</h2>
                <p className="text-sm text-slate-500">
                  Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru.
                </p>
                <Link href="/forgot-password">
                  <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition">
                    Minta Link Baru
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Password Berhasil Diubah!</h2>
                <p className="text-sm text-slate-500">
                  Sekarang kamu bisa login dengan password baru.
                </p>
                <Link href="/login">
                  <button className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2">
                    Login Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 transition-all">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Reset Kata Sandi</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-sm mx-auto">
                Buat kata sandi baru yang kuat untuk melindungi akun petualanganmu di Jejakawan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Baru */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Password Baru</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-medium">Min. 8 karakter</span>
                </div>
                <div className="relative rounded-xl">
                  <input
                    className="w-full pl-4 pr-11 py-3 text-sm rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter (kombinasi angka & huruf)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Kekuatan Kata Sandi:</span>
                      <span className={`font-semibold ${strength >= 3 ? "text-emerald-600" : strength === 2 ? "text-amber-600" : "text-red-600"}`}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`rounded-full ${i < strength ? strengthColor : "bg-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Criteria */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-700" : "text-slate-400"}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>Minimal 8 karakter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-emerald-700" : "text-slate-400"}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>Huruf besar & kecil</span>
                  </div>
                  <div className={`flex items-center gap-1.5 sm:col-span-2 ${/[0-9]/.test(password) ? "text-emerald-700" : "text-slate-400"}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>Mengandung angka dan simbol unik</span>
                  </div>
                </div>
              </div>

              {/* Konfirmasi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Konfirmasi Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  {confirmPassword && password === confirmPassword && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Sesuai
                    </span>
                  )}
                </div>
                <div className="relative rounded-xl">
                  <input
                    className="w-full pl-4 pr-11 py-3 text-sm rounded-xl border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi password baru kamu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Pastikan kedua kata sandi cocok dan tidak mudah ditebak oleh orang lain.</p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 group disabled:opacity-60"
                >
                  <span>{loading ? "Menyimpan..." : "Simpan Password Baru"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200/70 p-3.5 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Sesi ini dilindungi dengan enkripsi end-to-end 256-bit. Setelah kata sandi diperbarui, kamu akan diminta masuk kembali ke akunmu.
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Halaman Masuk</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
