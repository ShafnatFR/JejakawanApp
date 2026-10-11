"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

async function sha256Hex(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const digest = await crypto.subtle.digest("SHA-256", buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export default function VerifyPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [ktpVerified, setKtpVerified] = useState<boolean | null>(null)
  const [ktpHash, setKtpHash] = useState<string | null>(null)
  const [existingFiles, setExistingFiles] = useState<{ name: string; created_at: string }[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function fetchState() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("ktp_verified, ktp_hash")
        .eq("id", user!.id)
        .maybeSingle()
      setKtpVerified(profile?.ktp_verified ?? null)
      setKtpHash(profile?.ktp_hash ?? null)

      const { data: files } = await supabase.storage
        .from("ktp")
        .list(`${user!.id}`, { limit: 5, sortBy: { column: "created_at", order: "desc" } })
      setExistingFiles(
        (files || []).map((f) => ({ name: f.name, created_at: f.created_at }))
      )
    } catch {
      // abaikan — halaman tetap bisa diisi
    } finally {
      setLoading(false)
    }
  }

  function validate(f: File): string | null {
    if (!ALLOWED.includes(f.type)) {
      return "Format tidak didukung. Gunakan JPG, PNG, atau WEBP."
    }
    if (f.size > MAX_SIZE) {
      return "File terlalu besar. Ukuran maksimal 5 MB."
    }
    return null
  }

  function handleFile(f: File | null | undefined) {
    setError(null)
    setSuccess(null)
    if (!f) return
    const err = validate(f)
    if (err) {
      setError(err)
      return
    }
    setFile(f)
  }

  async function submit() {
    if (!user || !file) return
    setUploading(true)
    setError(null)
    setSuccess(null)
    try {
      // 1. Hitung hash SHA-256 (integritas berkas)
      const hash = await sha256Hex(file)

      // 2. Upload ke storage (folder khusus per user)
      const supabase = createClient()
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`
      const { error: uploadError } = await supabase.storage
        .from("ktp")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        })
      if (uploadError) throw uploadError

      // 3. Simpan hash ke profil (status: menunggu tinjauan admin)
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ ktp_hash: hash })
        .eq("id", user.id)
      if (profileError) throw profileError

      setKtpHash(hash)
      await fetchState()
      setSuccess(
        "KTP berhasil dikirim! Tim Jejakawan akan meninjau verifikasi kamu dalam 1x24 jam."
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah KTP")
    } finally {
      setUploading(false)
    }
  }

  const status =
    ktpVerified === true
      ? { label: "Terverifikasi", cls: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: "✓" }
      : ktpHash
        ? { label: "Menunggu Tinjauan", cls: "bg-amber-50 border-amber-200 text-amber-800", icon: "⏳" }
        : null

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-700 transition-all duration-300">
                <svg className="w-6 h-6 transform group-hover:rotate-45 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm3.8 6.2l-2.4 6.2-6.2 2.4 2.4-6.2 6.2-2.4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">Jejakawan</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="/discover">Discover</Link>
              <Link className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="/match">Trip Match</Link>
              <Link className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="/open-trips">Open Trip</Link>
              <Link className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="/bookings">Booking</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-brand-200 text-brand-700 font-bold flex items-center justify-center text-sm shadow-sm">
                {(user?.user_metadata as any)?.display_name?.toString()?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "J"}
              </div>
              <div className="hidden xl:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {(user?.user_metadata as any)?.display_name?.toString() || user?.email || "Tamu"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Traveler</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors group" href="/settings">
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            </svg>
            Kembali ke Pengaturan Akun
          </Link>
        </div>

        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Verifikasi KTP</h1>
            </div>
            {status && (
              <div className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold " + status.cls}>
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </div>
            )}
          </div>
          <p className="text-slate-600 text-base max-w-2xl">
            Verifikasi identitas resmi kamu untuk meningkatkan <span className="font-semibold text-slate-900">Skor Kepercayaan (Trust Score)</span>, meraih lencana verifikasi, dan membuka akses menjadi Trip Leader.
          </p>
        </section>

        {!user ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">Masuk untuk verifikasi</h2>
            <p className="text-sm text-slate-500 mt-2">Kamu perlu masuk terlebih dahulu.</p>
            <Link href="/login" className="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm">
              Masuk
            </Link>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10"><div className="h-64 bg-muted rounded-xl animate-pulse" /></div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">

              {ktpVerified === true && (
                <div className="mb-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-start space-x-3.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">KTP kamu sudah terverifikasi</h3>
                    <p className="text-xs text-emerald-800 mt-1">Lencana verifikasi aktif di profil kamu. Trust Score meningkat otomatis.</p>
                  </div>
                </div>
              )}

              {ktpHash && ktpVerified !== true && (
                <div className="mb-6 bg-amber-50/70 border border-amber-200 rounded-2xl p-5 flex items-start space-x-3.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Menunggu tinjauan tim Jejakawan</h3>
                    <p className="text-xs text-amber-800 mt-1">
                      KTP kamu sudah kami terima dan sedang diperiksa (maks. 1x24 jam).
                      {ktpHash && (
                        <span className="block mt-1 font-mono text-[11px] text-amber-700 break-all">
                          SHA-256: {ktpHash.slice(0, 24)}…
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Foto KTP Asli</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Unggah foto depan e-KTP kamu dalam format fisik. Pastikan seluruh sisi kartu berada di dalam bingkai dan teks dapat dibaca jelas.
                </p>
              </div>

              <div
                className={"relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer group " + (dragOver ? "border-brand-600 bg-brand-50/70" : "border-brand-300 hover:border-brand-600 bg-brand-50/30 hover:bg-brand-50/70")}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  handleFile(e.dataTransfer.files?.[0])
                }}
              >
                <input
                  ref={inputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  type="file"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-brand-200 text-brand-600 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:border-brand-500 group-hover:text-brand-700 transition-all duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      Tarik &amp; lepas file foto KTP di sini, atau
                      <span className="text-brand-600 underline decoration-2 underline-offset-2 group-hover:text-brand-700"> pilih dari perangkat</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1.5">
                      Mendukung format JPG, PNG, atau WEBP (Ukuran file maksimal 5 MB)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span>Hash SHA-256 dihitung otomatis untuk integritas berkas</span>
                  </div>
                </div>
              </div>

              {file && (
                <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <svg className="w-8 h-8 text-brand-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"></path>
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setFile(null) }}
                    type="button"
                  >
                    Ganti file
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 font-medium">{error}</div>
              )}
              {success && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 font-medium">{success}</div>
              )}

              <div className="mt-8 bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2">Panduan Pengambilan Foto KTP yang Benar</h3>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-amber-950 font-medium">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                        </svg>
                        <span>Gunakan e-KTP fisik asli (bukan fotokopi)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                        </svg>
                        <span>Keempat sudut KTP terlihat utuh</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                        </svg>
                        <span>Bebas dari pantulan flash atau bayangan</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                        </svg>
                        <span>Data NIK &amp; Nama wajib tajam dan terbaca</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-3 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <p>
                  <strong className="font-semibold text-slate-700">Perlindungan Privasi:</strong> Jejakawan tunduk pada regulasi UU Perlindungan Data Pribadi. Berkas identitas Anda hanya digunakan untuk validasi kredibilitas traveler dan tidak akan dibagikan ke pihak ketiga.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <button
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-all"
                  type="button"
                  onClick={() => { setFile(null); setError(null) }}
                >
                  Batal / Nanti Saja
                </button>
                <button
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md hover:shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
                  type="button"
                  disabled={!file || uploading}
                  onClick={submit}
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Mengunggah…</span>
                    </>
                  ) : (
                    <>
                      <span>Upload &amp; Kirim Verifikasi</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm3.8 6.2l-2.4 6.2-6.2 2.4 2.4-6.2 6.2-2.4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Jejakawan</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 max-w-sm">
                Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan bersama teman sefrekuensi.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Jelajahi</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><Link className="hover:text-brand-600 transition-colors" href="/discover">Rekomendasi</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/open-trips">Open Trip</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/match">Trip Match</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/bookings">Booking Saya</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Komunitas</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><Link className="hover:text-brand-600 transition-colors" href="/leaderboard">Peringkat Traveler</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/profile">Profil Saya</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/settings">Pengaturan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Bantuan</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a className="hover:text-brand-600 transition-colors" href="mailto:halo@jejakawan.id">Pusat Bantuan</a></li>
                <li>
                  <a className="text-brand-600 hover:text-brand-700 font-semibold break-all" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
            <div className="flex space-x-6">
              <a className="hover:text-slate-900 transition-colors" href="/settings">Kebijakan Privasi</a>
              <a className="hover:text-slate-900 transition-colors" href="/settings">Syarat &amp; Ketentuan</a>
              <a className="hover:text-slate-900 transition-colors" href="/settings">Keamanan Data</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
