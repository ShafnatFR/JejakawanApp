"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

type FavoriteRow = {
  id: string
  destination_id: string
  created_at: string
  destination: {
    id: string
    name: string
    province: string
    regency: string | null
    rating_avg: number
    entry_fee_min: number
    entry_fee_max: number
    cover_image_url: string | null
    is_underrated: boolean | null
    category: string[] | null
  } | null
}

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

export default function FavoritesPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<FavoriteRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function fetchFavorites() {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("user_favorites")
        .select(
          `id, destination_id, created_at,
           destination:destinations (
             id, name, province, regency, rating_avg,
             entry_fee_min, entry_fee_max, cover_image_url,
             is_underrated, category
           )`
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      setFavorites((data || []) as FavoriteRow[])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat favorit")
    } finally {
      setLoading(false)
    }
  }

  async function removeFavorite(favId: string) {
    setRemoving(favId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("id", favId)
      if (error) throw error
      setFavorites((prev) => prev.filter((f) => f.id !== favId))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus favorit")
    } finally {
      setRemoving(null)
    }
  }

  const feeLabel = (d: FavoriteRow["destination"]): string => {
    if (!d) return ""
    if (d.entry_fee_max > 0 && d.entry_fee_min > 0 && d.entry_fee_min !== d.entry_fee_max) {
      return `Rp ${d.entry_fee_min.toLocaleString("id-ID")} — Rp ${d.entry_fee_max.toLocaleString("id-ID")}`
    }
    if (d.entry_fee_max > 0) return `Rp ${d.entry_fee_max.toLocaleString("id-ID")}`
    return "Gratis"
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 text-brand-600 font-bold text-xl tracking-tight">
                <svg className="w-7 h-7 text-brand-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                </svg>
                <span className="text-brand-600 text-2xl font-extrabold tracking-tight">Jejakawan</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link className="hover:text-brand-600 transition-colors" href="/discover">Discover</Link>
                <Link className="hover:text-brand-600 transition-colors" href="/open-trips">Open Trip</Link>
                <Link className="hover:text-brand-600 transition-colors" href="/match">Trip Match</Link>
                <Link className="hover:text-brand-600 transition-colors" href="/bookings">Booking</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center border border-brand-200 text-sm">
                  {(user?.user_metadata as any)?.display_name?.toString()?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "J"}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 gap-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Favorit Saya</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Destinasi impian dan rencana petualangan yang telah kamu simpan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all" href="/discover">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              Jelajahi Destinasi
            </Link>
          </div>
        </div>

        {!user ? (
          <div className="mt-10 text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900">Masuk untuk melihat favorit</h2>
            <p className="text-sm text-slate-500 mt-2">Simpan destinasi favoritmu dan akses kapan saja.</p>
            <Link href="/login" className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm">
              Masuk / Daftar
            </Link>
          </div>
        ) : loading ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 text-center py-12 bg-white border border-red-200 rounded-2xl max-w-xl mx-auto">
            <p className="text-red-600 font-medium">Gagal memuat favorit</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
            <button onClick={fetchFavorites} className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold">
              Coba Lagi
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <section className="mt-10 border border-dashed border-slate-200 rounded-2xl bg-white p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum ada favorit</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">Simpan destinasi yang kamu suka untuk melihatnya kembali sewaktu-waktu.</p>
            <Link className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm" href="/discover">
              Jelajahi Destinasi
            </Link>
          </section>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{favorites.length}</span> destinasi tersimpan
              <span className="text-slate-300">•</span>
              <span>Diurutkan: baru disimpan</span>
            </div>
            <section className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => {
                const d = fav.destination
                return (
                  <article key={fav.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition duration-200">
                    <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-brand-100 to-emerald-100">
                      {d?.cover_image_url ? (
                        <img
                          alt={d.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          src={d.cover_image_url}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                          </svg>
                        </div>
                      )}
                      {d?.category && d.category.length > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white capitalize">
                            {d.category[0]}
                          </span>
                        </div>
                      )}
                      <button
                        aria-label="Hapus dari favorit"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-rose-500 flex items-center justify-center hover:bg-white transition-colors shadow-sm disabled:opacity-50"
                        disabled={removing === fav.id}
                        onClick={() => removeFavorite(fav.id)}
                        title="Hapus dari favorit"
                      >
                        <svg className="w-5 h-5 fill-rose-500 text-rose-500" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            </svg>
                            {d?.province || "Indonesia"}
                          </span>
                          <div className="flex items-center gap-1 text-slate-700 font-semibold">
                            <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            {(d?.rating_avg || 0).toFixed(1)}
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                          {d?.name || "Destinasi"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          {d?.regency ? `${d.regency}, ` : ""}
                          {d?.is_underrated ? "Hidden gem — masih sepi!" : "Destinasi populer"}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="block text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Tiket Masuk</span>
                          <span className="text-sm font-bold text-slate-900">{feeLabel(d)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Disimpan {fmtDate(fav.created_at)}</span>
                          <Link
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                            href={`/destinations/${d?.id || ""}`}
                          >
                            Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">Jejakawan</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-3">Jelajahi</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link className="hover:text-brand-600 transition-colors" href="/discover">Rekomendasi</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/open-trips">Open Trip</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/favorites">Favorit Saya</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-3">Komunitas</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link className="hover:text-brand-600 transition-colors" href="/match">Trip Match</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/leaderboard">Leaderboard</Link></li>
                <li><Link className="hover:text-brand-600 transition-colors" href="/profile">Profil</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-3">Bantuan</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link className="hover:text-brand-600 transition-colors" href="/settings">Pengaturan</Link></li>
                <li>
                  <a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">Kontak: halo@jejakawan.id</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-6 text-center text-xs text-slate-500">© 2026 Jejakawan. Semua hak dilindungi.</div>
        </div>
      </footer>
    </>
  )
}
