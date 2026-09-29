"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "../../../lib/supabase/client"
import { Destination, Review } from "../../../types/database"
import { submitReport, blockUser, getTrustScore } from "../../../lib/safety"
import { getTrustScoreColor } from "../../../lib/utils"
import { useAuthStore } from "../../../stores/auth"
import { MapPin, Star, Wifi, Calendar, DollarSign, Sparkles, Heart, Share2, MessageCircle, Flag, MoreVertical, Ban, Shield, ArrowLeft, Camera, Check, ChevronRight, Compass, Users, Mountain, Info, MessageSquare, User } from "lucide-react"

const REPORT_REASONS = [
  { value: "spam", label: "Spam atau iklan" },
  { value: "inappropriate", label: "Konten tidak pantas" },
  { value: "fake", label: "Informasi palsu" },
  { value: "harassment", label: "Pelecehan atau intimidasi" },
  { value: "scam", label: "Penipuan" },
  { value: "other", label: "Lainnya" },
]

export default function DestinationDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const supabase = createClient()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewerTrustScores, setReviewerTrustScores] = useState<Record<string, number>>({})
  const [newReview, setNewReview] = useState("")
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(true)
  const [reportDialog, setReportDialog] = useState({ open: false, targetType: "destination" as "user" | "content", targetId: "" })
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [reporting, setReporting] = useState(false)
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    if (params.id) fetchDestination(params.id as string)
  }, [params.id])

  async function fetchDestination(id: string) {
    const { data: dest } = await supabase.from("destinations").select("*").eq("id", id).single()
    setDestination(dest)
    const { data: revs } = await supabase
      .from("reviews")
      .select("*, reviewer:user_profiles!reviewer_id(id,display_name,avatar_url,ktp_verified,rating_avg)")
      .eq("target_id", id)
      .eq("target_type", "destination")
      .order("created_at", { ascending: false })
      .limit(10)
    setReviews(revs || [])

    if (revs && revs.length > 0) {
      const scores: Record<string, number> = {}
      for (const rev of revs) {
        const reviewerId = (rev.reviewer as any)?.id
        if (reviewerId) {
          scores[reviewerId] = await getTrustScore(reviewerId)
        }
      }
      setReviewerTrustScores(scores)
    }
    setLoading(false)
  }

  async function submitReview() {
    if (!user || !newReview.trim()) return
    await supabase.from("reviews").insert({
      reviewer_id: user.id,
      target_type: "destination",
      target_id: params.id as string,
      rating,
      comment: newReview,
    })
    setNewReview("")
    fetchDestination(params.id as string)
  }

  async function handleReport() {
    if (!user || !reportReason) return
    setReporting(true)
    const result = await submitReport(user.id, "content", params.id as string, reportReason, reportDescription || undefined)
    if (result.success) {
      alert("Laporan berhasil dikirim. Tim kami akan meninjau.")
      setReportDialog({ open: false, targetType: "content", targetId: "" })
      setReportReason("")
      setReportDescription("")
    } else {
      alert(result.error)
    }
    setReporting(false)
  }

  async function handleBlockUser(userId: string) {
    if (!user) return
    if (!confirm("Yakin ingin memblokir pengguna ini?")) return
    setBlocking(true)
    const result = await blockUser(user.id, userId)
    if (result.success) alert("Pengguna berhasil diblokir.")
    else alert(result.error)
    setBlocking(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 bg-slate-200 rounded-2xl animate-pulse" /></div>
    </div>
  )
  if (!destination) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500">Destinasi tidak ditemukan.</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center justify-between text-xs sm:text-sm text-slate-500 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap py-1">
            <a className="hover:text-brand-600 transition-colors" href="/explore">Jelajahi Destinasi</a>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-medium">{destination.name}</span>
          </div>
          <a className="inline-flex items-center text-brand-600 font-semibold hover:text-brand-700 text-xs sm:text-sm transition-colors ml-4 shrink-0" href="/explore">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Direktori
          </a>
        </nav>

        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {destination.is_underrated && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Shield className="w-3.5 h-3.5 mr-1 fill-current" />
                    Hidden Gem Terverifikasi
                  </span>
                )}
                {destination.category?.slice(0, 2).map((c) => (
                  <span key={c} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                    {c.replace("_", " ")}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{destination.name}</h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-rose-500 mr-1.5 shrink-0" />
                  <span>{destination.address || `${destination.regency}, ${destination.province}`}</span>
                </div>
                <div className="flex items-center text-amber-500 font-semibold">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span>{destination.rating_avg?.toFixed(1) || "0.0"}</span>
                  <span className="text-slate-400 font-normal ml-1">({reviews.length} ulasan)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-2 lg:pt-0">
              <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                <Heart className="w-4 h-4 mr-1.5 text-rose-500" />
                Simpan ke Favorit
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                <Share2 className="w-4 h-4 mr-1.5 text-slate-500" />
                Bagikan
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                <Users className="w-4 h-4 mr-1.5" />
                Ajak Teman
              </button>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[440px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <div className="relative md:col-span-2 h-full group overflow-hidden bg-slate-100">
              {destination.cover_image_url ? (
                <img src={destination.cover_image_url} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-teal-400">
                  <Camera className="h-16 w-16 text-white/50" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Panorama Utama {destination.name}
              </div>
            </div>
            <div className="relative h-full group overflow-hidden bg-slate-100 hidden md:flex flex-col items-center justify-center">
              <Camera className="h-12 w-12 text-slate-300 mb-2" />
              <div className="absolute top-4 right-4 bg-slate-900/75 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                <Camera className="w-3.5 h-3.5" />
                Lihat Semua Foto
              </div>
            </div>
          </div>
        </section>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT */}
          <section className="lg:col-span-8 space-y-8">
            {/* Ringkasan */}
            <article className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-2 h-6 bg-brand-600 rounded-full mr-3"></span>
                Ringkasan & Pesona Keunikan
              </h2>
              <div className="text-slate-600 leading-relaxed text-sm sm:text-base space-y-3">
                <p>{destination.description || "Belum ada deskripsi untuk destinasi ini."}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                  <span className="block text-xs text-slate-500">Rating</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5">{destination.rating_avg?.toFixed(1) || "0.0"}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                  <span className="block text-xs text-slate-500">Tiket Masuk</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5">Rp {destination.entry_fee_min?.toLocaleString("id-ID") || "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                  <span className="block text-xs text-slate-500">Sinyal</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 capitalize">{destination.signal_strength || "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                  <span className="block text-xs text-slate-500">Pengunjung</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5">{destination.visit_count || 0}</span>
                </div>
              </div>
            </article>

            {/* Reviews */}
            <article className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ulasan & Pengalaman Traveler</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{reviews.length} ulasan dari komunitas Jejakawan</p>
                </div>
              </div>

              {/* Write Review */}
              {user && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRating(s)}>
                        <Star className={`h-5 w-5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Tulis review..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500 p-3 mb-2"
                    rows={3}
                  />
                  <button onClick={submitReview} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition">
                    Kirim Review
                  </button>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-4">
                {reviews.map((r) => {
                  const reviewer = r.reviewer as any
                  const trustScore = reviewer?.id ? reviewerTrustScores[reviewer.id] || 0 : 0
                  return (
                    <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                            {reviewer?.display_name?.[0] || "?"}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{reviewer?.display_name || "Anonim"}</h5>
                            <div className="flex items-center gap-2">
                              <div className="flex text-amber-400 text-xs">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                ))}
                              </div>
                              {reviewer?.ktp_verified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Shield className="h-3 w-3" /> KTP
                                </span>
                              )}
                              {trustScore > 0 && (
                                <span className={`text-xs font-medium ${getTrustScoreColor(trustScore)}`}>Trust: {trustScore}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {user && reviewer?.id && reviewer.id !== user.id && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setReportDialog({ open: true, targetType: "user", targetId: reviewer.id })} className="p-1 text-slate-400 hover:text-slate-600" title="Laporkan">
                              <Flag className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleBlockUser(reviewer.id)} className="p-1 text-slate-400 hover:text-rose-600" title="Blokir">
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    </div>
                  )
                })}
                {reviews.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">Belum ada review.</p>}
              </div>
            </article>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Booking Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500">Estimasi Tiket & Retribusi</span>
              <div className="flex items-baseline mt-1 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">Rp {destination.entry_fee_min?.toLocaleString("id-ID") || "10.000"}</span>
                <span className="text-xs text-slate-500 ml-1.5">/ orang</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">Buka Normal</span>
                </div>
                <div className="flex justify-between">
                  <span>Rekomendasi Waktu:</span>
                  <span className="font-medium text-slate-800">Pagi (07.00 - 10.00)</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu Kunjungan:</span>
                  <span className="font-medium text-slate-800">3 - 4 Jam</span>
                </div>
              </div>
              <button className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all text-center mb-3">
                Cari Open Trip Terdekat
              </button>
              <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-colors">
                Rencanakan Itinerary Mandiri
              </button>
            </div>

            {/* Trip Match */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trip Match Aktif</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                <strong>2 Traveler</strong> sedang merencanakan trip ke {destination.name} dan mencari teman patungan transportasi.
              </p>
              <div className="flex items-center -space-x-2 mb-4 overflow-hidden py-1">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">AN</div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-500 text-white font-bold text-xs flex items-center justify-center">KR</div>
                <div className="h-8 px-2.5 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 font-semibold text-xs flex items-center justify-center">+1 lainnya</div>
              </div>
              <button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-brand-700 font-bold text-xs rounded-lg transition-colors">
                Gabung Diskusi Trip
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Report Dialog */}
      {reportDialog.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {reportDialog.targetType === "user" ? "Laporkan Pengguna" : "Laporkan Destinasi"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Alasan</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500"
                >
                  <option value="">Pilih alasan</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Detail (opsional)</label>
                <textarea
                  placeholder="Jelaskan lebih detail..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full rounded-xl border-slate-300 text-sm focus:border-brand-500 focus:ring-brand-500 p-3"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setReportDialog({ ...reportDialog, open: false })} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Batal
                </button>
                <button onClick={handleReport} disabled={!reportReason || reporting} className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                  {reporting ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Jejakawan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Jelajahi</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Rekomendasi</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Peta Destinasi</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Open Trip</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Komunitas</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Cari Teman</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Misi & Badge</a></li>
                <li><a className="hover:text-brand-600 transition-colors" href="#">Profil</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Bantuan</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a className="hover:text-brand-600 transition-colors" href="#">Pengaturan</a></li>
                <li><a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">Kontak: halo@jejakawan.id</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">© 2026 Jejakawan. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}