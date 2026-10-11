"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

type TripRow = {
  id: string
  title: string
  price: number
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  includes: string[] | null
  is_active: boolean
  destination: { name: string; province: string } | null
  agency: { agency_name: string; is_verified: boolean | null } | null
}

type MyBooking = { trip_id: string }

function fmtDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function tripDuration(start: string, end: string): string {
  try {
    const s = new Date(start + "T00:00:00")
    const e = new Date(end + "T00:00:00")
    const days = Math.round((e.getTime() - s.getTime()) / 86400000) + 1
    if (days === 1) return "1 Hari (Day Trip)"
    return `${days}H${days - 1}N`
  } catch {
    return ""
  }
}

export default function OpentripsPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<TripRow[]>([])
  const [myTripIds, setMyTripIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [province, setProvince] = useState("")
  const [tab, setTab] = useState<"all" | "mine">("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("open_trips")
        .select(
          `id, title, price, start_date, end_date, max_participants, current_participants, includes, is_active,
           destination:destinations (name, province),
           agency:agency_profiles (agency_name, is_verified)`
        )
        .eq("is_active", true)
        .order("start_date", { ascending: true })
      if (error) throw error
      setTrips((data || []) as unknown as TripRow[])

      if (user) {
        const { data: bks } = await supabase
          .from("open_trip_bookings")
          .select("trip_id")
          .eq("user_id", user.id)
        setMyTripIds(new Set(((bks || []) as MyBooking[]).map((b) => b.trip_id)))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat open trip")
    } finally {
      setLoading(false)
    }
  }

  const provinces = useMemo(
    () => Array.from(new Set(trips.map((t) => t.destination?.province).filter(Boolean))) as string[],
    [trips]
  )

  const visible = trips.filter((t) => {
    if (tab === "mine" && !myTripIds.has(t.id)) return false
    if (province && t.destination?.province !== province) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const hay =
        (t.title || "").toLowerCase() +
        " " +
        (t.destination?.name || "").toLowerCase() +
        " " +
        (t.destination?.province || "").toLowerCase() +
        " " +
        (t.agency?.agency_name || "").toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2"></circle>
                    <polygon fill="currentColor" points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Jejakawan</span>
              </Link>
              <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1">
                <Link className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="/discover">Discover</Link>
                <Link className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="/match">Trip Match</Link>
                <Link aria-current="page" className="px-3.5 py-2 text-sm font-semibold text-brand-600 bg-brand-50/80 rounded-lg relative" href="/open-trips">
                  Open Trip
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-600 rounded-full"></span>
                </Link>
                <Link className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="/bookings">Booking</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">
                  {(user?.user_metadata as any)?.display_name?.toString()?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "J"}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
                  {(user?.user_metadata as any)?.display_name?.toString() || user?.email || "Tamu"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="border-b border-slate-200/80 bg-white pt-8 pb-7">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span>
                  Jadwal Eksplorasi Terkini
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Open Trip Petualangan</h1>
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
                  Temukan dan gabung trip gabungan seru keliling Indonesia bersama agen travel terpercaya dan teman baru.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/25 transition-all" href="/agency/packages">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span>Daftarkan Open Trip</span>
                  <span className="text-[11px] font-normal opacity-80">(Agen / Host)</span>
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50/50 hover:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Cari open trip, destinasi, gunung, pantai..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <select
                    className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-700 font-medium"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    <option value="">Semua Lokasi / Provinsi</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold w-full">
                    <button
                      className={"flex-1 px-3.5 py-1.5 rounded-lg transition-all " + (tab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
                      onClick={() => setTab("all")}
                    >
                      Semua Open Trip ({trips.length})
                    </button>
                    <button
                      className={"flex-1 px-3.5 py-1.5 rounded-lg transition-all " + (tab === "mine" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}
                      onClick={() => setTab("mine")}
                    >
                      Trip Saya / Diikuti ({myTripIds.size})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {tab === "mine" ? "Trip yang Kamu Ikuti" : "Pilihan Open Trip"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Menampilkan {visible.length} dari {trips.length} trip aktif
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded-2xl p-8 text-center">
              <p className="text-red-600 font-medium">Gagal memuat open trip</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
              <button onClick={fetchData} className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold">
                Coba Lagi
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-900">Tidak ada trip ditemukan</h3>
              <p className="text-sm text-slate-500 mt-2">
                {tab === "mine"
                  ? "Kamu belum mengikuti open trip mana pun. Gabung trip pertama-mu sekarang!"
                  : "Coba ubah kata kunci atau filter provinsi."}
              </p>
              {tab === "all" && (
                <button onClick={() => { setSearch(""); setProvince("") }} className="mt-5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold">
                  Hapus Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visible.map((t) => {
                const filled = t.max_participants > 0 ? Math.min(100, Math.round((t.current_participants / t.max_participants) * 100)) : 0
                const slotsLeft = t.max_participants - t.current_participants
                const pct = slotsLeft <= 3 ? "bg-rose-500" : filled >= 60 ? "bg-amber-500" : "bg-brand-500"
                return (
                  <article key={t.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                    <div>
                      <div className="relative bg-gradient-to-br from-brand-50 to-emerald-50 p-4 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          {t.agency?.is_verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <svg className="w-3 h-3 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
                              </svg>
                              Agen Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                              Open Trip
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-500">
                            {tripDuration(t.start_date, t.end_date)}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                          {t.destination ? `${t.destination.name}${t.destination.province ? `, ${t.destination.province}` : ""}` : "Destinasi Indonesia"}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                          {t.title}
                        </h3>

                        {t.agency?.agency_name && (
                          <div className="flex items-center gap-2 mb-4 text-xs text-slate-600">
                            <span className="font-medium text-slate-800">{t.agency.agency_name}</span>
                          </div>
                        )}

                        <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <span>{fmtDate(t.start_date)} — {fmtDate(t.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            <span>{t.current_participants} peserta terdaftar</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500 font-medium">Kuota Terisi</span>
                            <span className={"font-bold " + (slotsLeft <= 3 ? "text-rose-600" : "text-brand-600")}>
                              {slotsLeft <= 0 ? "Penuh" : `Sisa ${slotsLeft} slot`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={pct + " h-2 rounded-full"} style={{ width: `${filled}%` }}></div>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            {t.current_participants} dari {t.max_participants} orang telah mendaftar
                          </span>
                        </div>

                        {t.includes && t.includes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {t.includes.slice(0, 4).map((inc, i) => (
                              <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{inc}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
                      <div className="flex items-baseline justify-between pt-3 mb-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">Biaya per Orang</span>
                          <span className="text-lg font-extrabold text-slate-900">
                            {t.price > 0 ? `Rp ${t.price.toLocaleString("id-ID")}` : "Gratis"}
                          </span>
                        </div>
                        {myTripIds.has(t.id) && (
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Kamu Ikut
                          </span>
                        )}
                      </div>
                      <Link
                        className={"w-full py-2.5 px-3 rounded-xl text-white text-xs font-semibold tracking-wide transition-colors text-center block " + (slotsLeft <= 0 ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-brand-600")}
                        href={`/open-trips/${t.id}`}
                      >
                        {slotsLeft <= 0 ? "Trip Penuh" : "Detail & Booking"}
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200/80 bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">100% Agen Terverifikasi</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Semua penyelenggara melalui kurasi identitas KTP, legalitas usaha, dan rekam jejak keselamatan di lapangan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Garansi Dana Kembali</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pembayaran aman dengan sistem verifikasi ulang. Pengembalian 100% jika trip dibatalkan oleh pihak agen.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Komunitas Traveler Ramah</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Terhubung dengan sesama solo traveler sebelum keberangkatan lewat fitur Trip Match Jejakawan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2"></circle>
                    <polygon fill="currentColor" points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-900 tracking-tight">Jejakawan</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.
              </p>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Jelajahi</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link className="hover:text-brand-600 transition-colors" href="/discover">Rekomendasi</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/open-trips">Open Trip</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/bookings">Booking Saya</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Komunitas</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link className="hover:text-brand-600 transition-colors" href="/match">Trip Match</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/leaderboard">Leaderboard</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/profile">Profil</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Bantuan</h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link className="hover:text-brand-600 transition-colors" href="/settings">Pengaturan</Link></li>
                <li>
                  <span className="text-slate-500">Kontak: </span>
                  <a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400 font-normal">© 2026 Jejakawan. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
