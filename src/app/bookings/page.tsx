"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

type BookingRow = {
  id: string
  trip_id: string
  participants: number
  status: string
  payment_status: string
  created_at: string
  trip: {
    id: string
    title: string
    price: number
    start_date: string
    end_date: string
    destination: { name: string; province: string } | null
    agency: { agency_name: string } | null
  } | null
}

type TxRow = {
  amount: number
  status: string
  payment_url: string | null
  payment_provider: string | null
  paid_at: string | null
  reference_id: string
}

type View = "all" | "pending" | "active" | "completed"

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function fmtRupiah(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID")
}

export default function BookingsPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [txByBooking, setTxByBooking] = useState<Record<string, TxRow>>({})
  const [view, setView] = useState<View>("all")
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function fetchBookings() {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("open_trip_bookings")
        .select(
          `id, trip_id, participants, status, payment_status, created_at,
           trip:open_trips (
             id, title, price, start_date, end_date,
             destination:destinations (name, province),
             agency:agency_profiles (agency_name)
           )`
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      const rows = (data || []) as BookingRow[]
      setBookings(rows)

      const ids = rows.map((b) => b.id)
      if (ids.length > 0) {
        const { data: txs } = await supabase
          .from("transactions")
          .select("amount, status, payment_url, payment_provider, paid_at, reference_id")
          .eq("reference_type", "booking")
          .in("reference_id", ids)
        const map: Record<string, TxRow> = {}
        for (const tx of (txs || []) as TxRow[]) {
          if (!map[tx.reference_id]) map[tx.reference_id] = tx
        }
        setTxByBooking(map)
      } else {
        setTxByBooking({})
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat booking")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const enriched = useMemo(
    () =>
      bookings.map((b) => {
        const tx = txByBooking[b.id]
        const end = b.trip?.end_date ? new Date(b.trip.end_date + "T23:59:59") : null
        const isCompleted = Boolean(end && end < today && b.payment_status === "paid")
        const isAwaiting = b.payment_status === "pending"
        return { ...b, tx, isCompleted, isAwaiting }
      }),
    [bookings, txByBooking, today]
  )

  const counts = useMemo(
    () => ({
      all: enriched.length,
      pending: enriched.filter((b) => b.isAwaiting).length,
      active: enriched.filter((b) => !b.isAwaiting && !b.isCompleted).length,
      completed: enriched.filter((b) => b.isCompleted).length,
    }),
    [enriched]
  )

  const visible = enriched
    .filter((b) => {
      if (view === "pending") return b.isAwaiting
      if (view === "active") return !b.isAwaiting && !b.isCompleted
      if (view === "completed") return b.isCompleted
      return true
    })
    .filter((b) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (b.trip?.title || "").toLowerCase().includes(q) ||
        (b.trip?.destination?.name || "").toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      )
    })

  const tabs: { id: View; label: string; count: number }[] = [
    { id: "all", label: "Semua Booking", count: counts.all },
    { id: "pending", label: "Menunggu Bayar", count: counts.pending },
    { id: "active", label: "Mendatang & Aktif", count: counts.active },
    { id: "completed", label: "Selesai", count: counts.completed },
  ]

  return (
    <>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-brand-600">Jejakawan</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
                <Link className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="/discover">Discover</Link>
                <Link className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="/open-trips">Open Trip</Link>
                <Link className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="/match">Trip Match</Link>
                <Link className="px-3.5 py-2 rounded-lg text-brand-600 bg-brand-50 font-semibold transition-colors" href="/bookings">Booking</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/profile" className="flex items-center space-x-2 pl-1 cursor-pointer group">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center group-hover:ring-2 group-hover:ring-brand-500 transition-all">
                  {(user?.user_metadata as any)?.display_name?.toString()?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "J"}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-slate-700">
                  {(user?.user_metadata as any)?.display_name?.toString() || user?.email || "Tamu"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5 font-medium">
              <Link className="hover:text-brand-600" href="/">Beranda</Link>
              <span>/</span>
              <span className="text-slate-800">Booking Saya</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Booking &amp; Tiket Perjalanan</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola reservasi open trip dan riwayat petualanganmu dengan aman.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all" href="/open-trips">
              Cari Open Trip Baru
            </Link>
          </div>
        </div>

        {!user ? (
          <div className="mt-10 text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900">Masuk untuk melihat booking</h2>
            <p className="text-sm text-slate-500 mt-2">Daftar atau masuk untuk mengelola reservasi trip-mu.</p>
            <Link href="/login" className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm">
              Masuk / Daftar
            </Link>
          </div>
        ) : loading ? (
          <div className="mt-6 space-y-5">
            <div className="h-40 bg-muted rounded-2xl animate-pulse" />
            <div className="h-40 bg-muted rounded-2xl animate-pulse" />
          </div>
        ) : error ? (
          <div className="mt-10 text-center py-12 bg-white border border-red-200 rounded-2xl">
            <p className="text-red-600 font-medium">Gagal memuat booking</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button onClick={fetchBookings} className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold">
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs sm:text-sm font-medium">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setView(t.id)}
                    className={
                      "px-4 py-2 rounded-lg transition-all " +
                      (view === t.id
                        ? "bg-white text-slate-900 shadow-sm font-semibold"
                        : "text-slate-600 hover:text-slate-900")
                    }
                  >
                    {t.label}{" "}
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs bg-slate-100 text-slate-700">
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Cari trip / kode booking..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                </svg>
              </div>
            </div>

            {visible.length === 0 ? (
              <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Belum ada booking</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  Jelajahi open trip pilihan dan temukan teman seperjalanan untuk mewujudkan petualangan pertamamu ke pelosok nusantara!
                </p>
                <Link className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm" href="/open-trips">
                  Jelajahi Open Trip Pilihan
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {visible.map((b) => (
                  <BookingCard key={b.id} booking={b} onPaid={fetchBookings} />
                ))}
              </div>
            )}
          </>
        )}

        <section className="mt-12 pt-8 border-t border-slate-200/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Garansi Keberangkatan Aman</h4>
                <p className="text-xs text-slate-500 mt-0.5">Semua mitra trip terverifikasi legalitasnya oleh tim Jejakawan &amp; asosiasi pariwisata.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Proteksi Pengembalian Dana</h4>
                <p className="text-xs text-slate-500 mt-0.5">Klaim refund 100% jika terjadi pembatalan sepihak karena kendala cuaca atau force majeure.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-white border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Bantuan Perjalanan 24/7</h4>
                <p className="text-xs text-slate-500 mt-0.5">Dukungan darurat melalui live chat dan kontak WhatsApp selama masa perjalananmu.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 mt-16 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                  <svg className="w-4 h-4 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-brand-600">Jejakawan</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Jelajahi</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/open-trips">Open Trip</Link></li>
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/discover">Rekomendasi Destinasi</Link></li>
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/match">Trip Match</Link></li>
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/bookings">Booking Saya</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Komunitas</h3>
              <ul className="space-y-2.5 text-sm">
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/leaderboard">Leaderboard Traveler</Link></li>
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/profile">Profil Saya</Link></li>
                <li><Link className="text-slate-600 hover:text-brand-600 transition-colors" href="/settings">Pengaturan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Bantuan</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="mailto:halo@jejakawan.id">Pusat Bantuan</a></li>
                <li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="mailto:halo@jejakawan.id">Syarat &amp; Ketentuan</a></li>
                <li className="pt-1">
                  <span className="text-xs text-slate-400 block">Hubungi Tim:</span>
                  <a className="text-brand-600 hover:underline font-medium" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
            <div className="flex space-x-6 text-xs text-slate-400">
              <a className="hover:text-slate-600" href="/settings">Kebijakan Privasi</a>
              <a className="hover:text-slate-600" href="/settings">Ketentuan Layanan</a>
              <a className="hover:text-slate-600" href="/settings">Keamanan</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

function BookingCard({
  booking,
  onPaid,
}: {
  booking: BookingRow & {
    tx: TxRow | undefined
    isCompleted: boolean
    isAwaiting: boolean
  }
  onPaid: () => void
}) {
  const b = booking
  const trip = b.trip
  const total = b.tx?.amount ?? (trip ? trip.price * b.participants : 0)

  const statusBadge = b.isAwaiting ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
      <svg className="w-3.5 h-3.5 animate-pulse text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
      Menunggu Pembayaran
    </span>
  ) : b.isCompleted ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg>
      Trip Selesai
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      Terkonfirmasi • Siap Berangkat
    </span>
  )

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-3">
          {statusBadge}
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-600 font-mono text-xs">
            No. ID: <strong className="text-slate-900 font-medium">#{b.id.slice(0, 8).toUpperCase()}</strong>
          </span>
        </div>
        <div className="text-slate-500 text-xs">Dipesan pada {fmtDate(b.created_at)}</div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-brand-600 font-semibold tracking-wide uppercase">
            <span>Open Trip</span>
            {trip?.agency?.agency_name && (
              <>
                <span>•</span>
                <span className="text-slate-600 normal-case">{trip.agency.agency_name}</span>
              </>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            <Link href={`/open-trips/${b.trip_id}`} className="hover:text-brand-600 transition-colors">
              {trip?.title || "Open Trip"}
            </Link>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 pt-2 text-xs sm:text-sm text-slate-600">
            {trip?.start_date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                <span><strong>Jadwal:</strong> {fmtDate(trip.start_date)} — {fmtDate(trip.end_date)}</span>
              </div>
            )}
            {trip?.destination && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                <span><strong>Destinasi:</strong> {trip.destination.name}{trip.destination.province ? `, ${trip.destination.province}` : ""}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              <span><strong>Peserta:</strong> {b.participants} Pax</span>
            </div>
            {b.tx?.payment_provider && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                <span><strong>Metode:</strong> {b.tx.payment_provider === "mayar" ? "Mayar (VA / QRIS)" : b.tx.payment_provider}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6 space-y-1">
          <span className="text-xs text-slate-400">{b.isAwaiting ? "Total Tagihan:" : "Total Pembayaran:"}</span>
          <div className={"text-xl font-bold tracking-tight " + (b.isAwaiting ? "text-amber-600" : "text-slate-900")}>
            {fmtRupiah(total)}
          </div>
          {b.isAwaiting ? (
            <span className="text-xs text-slate-500 block">
              {b.tx?.payment_provider ? "Segera selesaikan sebelum kedaluwarsa" : "Tagihan sedang disiapkan"}
            </span>
          ) : (
            <span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Lunas {b.tx?.paid_at ? `• ${fmtDate(b.tx.paid_at)}` : ""}
            </span>
          )}
        </div>

        <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5">
          {b.isAwaiting && b.tx?.payment_url ? (
            <a
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150"
              href={b.tx.payment_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Bayar Sekarang
            </a>
          ) : (
            <Link
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150"
              href={`/open-trips/${b.trip_id}`}
            >
              Detail Trip
            </Link>
          )}
          <Link
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all"
            href={`/open-trips/${b.trip_id}`}
          >
            Lihat Halaman Trip
          </Link>
        </div>
      </div>
    </article>
  )
}
