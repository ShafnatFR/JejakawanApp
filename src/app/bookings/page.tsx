"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

export default function BookingsPage() {
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  })

  return (

<header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm" data-purpose="primary-navigation">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">

<div className="flex items-center space-x-8">

<a className="flex items-center gap-2.5 group" href="#">
<div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform duration-200">

<svg className="w-5 h-5 stroke-current" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="10"></circle>
<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
</svg>
</div>
<span className="text-xl font-bold tracking-tight text-brand-600">Jejakawan</span>
</a>

<nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
<a className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="#">Discover</a>
<a className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="#">Explore</a>
<a className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="#">Trip Match</a>
<a className="px-3.5 py-2 rounded-lg text-brand-600 bg-brand-50 font-semibold transition-colors" href="#">Open Trip</a>
<a className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors" href="#">Gamifikasi</a>
</nav>
</div>

<div className="flex items-center space-x-3 sm:space-x-4">

<button aria-label="Pesan dan Obrolan" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" type="button">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</button>

<button aria-label="Notifikasi" className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors" type="button">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
<span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
</button>

<div className="h-6 w-px bg-slate-200"></div>

<div className="flex items-center space-x-2 pl-1 cursor-pointer group">
<div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center group-hover:ring-2 group-hover:ring-brand-500 transition-all">
              S
            </div>
<span className="hidden lg:inline text-xs font-semibold text-slate-700">Shafnat</span>
<svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
</div>
</div>
</div>
</header>


<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
<div>
<nav className="flex items-center space-x-2 text-xs text-slate-500 mb-1.5 font-medium">
<a className="hover:text-brand-600" href="#">Beranda</a>
<span>/</span>
<span className="text-slate-800">Booking Saya</span>
</nav>
<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Booking &amp; Tiket Perjalanan</h1>
<p className="text-sm text-slate-500 mt-1">Kelola reservasi open trip, tiket destinasi, dan riwayat petualanganmu dengan aman.</p>
</div>

<div className="flex items-center gap-3">
<a className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 group" href="#">
<svg className="w-4 h-4 mr-1.5 transition-transform group-hover:rotate-90 duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
<line x1="12" x2="12" y1="5" y2="19"></line>
<line x1="5" x2="19" y1="12" y2="12"></line>
</svg>
          Cari Open Trip Baru
        </a>
</div>
</div>

<div className="mt-6 flex flex-wrap items-center justify-between gap-4">

<div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs sm:text-sm font-medium">
<button className="px-4 py-2 rounded-lg bg-white text-slate-900 shadow-sm font-semibold transition-all" id="tab-all" onclick="switchBookingView('all')">
          Semua Booking <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">3</span>
</button>
<button className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center" id="tab-pending" onclick="switchBookingView('pending')">
          Menunggu Bayar <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">1</span>
</button>
<button className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center" id="tab-active" onclick="switchBookingView('active')">
          Mendatang &amp; Aktif <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">1</span>
</button>
<button className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 transition-all" id="tab-completed" onclick="switchBookingView('completed')">
          Selesai <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs bg-slate-100 text-slate-600">1</span>
</button>
<button className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all" id="tab-empty" onclick="switchBookingView('empty')">
          Pratinjau Kosong (0)
        </button>
</div>

<div className="relative w-full sm:w-64">
<input className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" placeholder="Cari kode booking / trip..." type="text"/>
<svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<circle cx="11" cy="11" r="8"></circle>
<line x1="21" x2="16.65" y1="21" y2="16.65"></line>
</svg>
</div>
</div>

<div className="mt-6 space-y-5" data-purpose="booking-card-list" id="booking-items-list">

<article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-brand-200 hover:shadow-md transition-all duration-200 overflow-hidden" data-purpose="booking-card">

<div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
<div className="flex items-center space-x-3">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Terkonfirmasi • Siap Berangkat
            </span>
<span className="text-slate-400 hidden sm:inline">•</span>
<span className="text-slate-600 font-mono text-xs">No. ID: <strong className="text-slate-900 font-medium">#JKW-2026-8941</strong></span>
</div>
<div className="text-slate-500 text-xs">
            Dipesan pada 12 Mar 2026
          </div>
</div>

<div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

<div className="lg:col-span-6 space-y-2">
<div className="flex items-center space-x-2 text-xs text-brand-600 font-semibold tracking-wide uppercase">
<span>Open Trip Eksklusif</span>
<span>•</span>
<span className="flex items-center gap-1 text-slate-600">
<svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
                Pesona Bahari Tour (Mitra ASITA)
              </span>
</div>
<h3 className="text-xl font-bold text-slate-900 hover:text-brand-600 transition-colors">
<a href="#">Ekspedisi 3H2M Raja Ampat &amp; Surga Bawah Laut Wayag</a>
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 pt-2 text-xs sm:text-sm text-slate-600">
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span><strong>Jadwal:</strong> 14 - 16 Mei 2026 (3 Hari)</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span><strong>Meeting Point:</strong> Bandara Sorong (SOQ)</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span><strong>Peserta:</strong> 2 Pax (Dewasa)</span>
</div>
<div className="flex items-center gap-2 text-emerald-700 font-medium">
<svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>Sudah Termasuk Asuransi Perjalanan</span>
</div>
</div>
</div>

<div className="lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6 space-y-1">
<span className="text-xs text-slate-400">Total Pembayaran:</span>
<div className="text-xl font-bold text-slate-900 tracking-tight">Rp 6.850.000</div>
<span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Lunas via BCA VA</span>
<div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
<span>Tour Leader:</span>
<span className="font-semibold text-slate-700">Raka Bramantyo</span>
</div>
</div>

<div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5">
<button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150" type="button">
<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              E-Tiket &amp; Panduan Trip
            </button>
<button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all" type="button">
              Hubungi Tour Leader
            </button>
<button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition-all" type="button">
              Detail Perjalanan &amp; Rute
            </button>
</div>
</div>
</article>


<article className="bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" data-purpose="booking-card">

<div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
<div className="flex items-center space-x-3">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
<svg className="w-3.5 h-3.5 animate-pulse text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Menunggu Pembayaran (Sisa Waktu: 01:45:12)
            </span>
<span className="text-slate-400 hidden sm:inline">•</span>
<span className="text-slate-600 font-mono text-xs">No. ID: <strong className="text-slate-900 font-medium">#JKW-2026-9104</strong></span>
</div>
<div className="text-amber-800 text-xs font-medium">
            Segera selesaikan sebelum kursi dialihkan
          </div>
</div>

<div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

<div className="lg:col-span-6 space-y-2">
<div className="flex items-center space-x-2 text-xs text-brand-600 font-semibold tracking-wide uppercase">
<span>Open Trip Weekend</span>
<span>•</span>
<span className="text-slate-600">Bromo Adventure Tour</span>
</div>
<h3 className="text-xl font-bold text-slate-900 hover:text-brand-600 transition-colors">
<a href="#">Sunrise Trekking Bromo &amp; Air Terjun Madakaripura</a>
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 pt-2 text-xs sm:text-sm text-slate-600">
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span><strong>Jadwal:</strong> 28 April 2026 (1 Hari)</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span><strong>Meeting Point:</strong> Stasiun Malang Kota Baru</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span><strong>Peserta:</strong> 1 Pax</span>
</div>
<div className="flex items-center gap-2 text-slate-500">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>Jeep 4x4 &amp; Tiket TNBTS Termasuk</span>
</div>
</div>
</div>

<div className="lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6 space-y-1">
<span className="text-xs text-slate-400">Total Tagihan:</span>
<div className="text-xl font-bold text-amber-600 tracking-tight">Rp 450.000</div>
<span className="text-xs text-slate-500 block">Metode: Mandiri Virtual Account</span>
<span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 select-all block mt-1">8870-8910-2391-44</span>
</div>

<div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5">
<button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150" type="button">
<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Bayar Sekarang
            </button>
<button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-rose-600 font-medium text-xs sm:text-sm transition-all" type="button">
              Batalkan Pesanan
            </button>
</div>
</div>
</article>


<article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden opacity-95" data-purpose="booking-card">

<div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
<div className="flex items-center space-x-3">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
<svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path></svg>
              Trip Selesai
            </span>
<span className="text-slate-400 hidden sm:inline">•</span>
<span className="text-slate-600 font-mono text-xs">No. ID: <strong className="text-slate-800 font-medium">#JKW-2026-7281</strong></span>
</div>
<div className="text-slate-400 text-xs">
            Perjalanan selesai pada 18 Feb 2026
          </div>
</div>

<div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

<div className="lg:col-span-6 space-y-2">
<div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
<span>Day Trip Bali</span>
<span>•</span>
<span>Bali Coral Explorer</span>
</div>
<h3 className="text-xl font-bold text-slate-800">
<a href="#">Snorkeling Keliling Nusa Penida: Manta Point &amp; Crystal Bay</a>
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 pt-2 text-xs sm:text-sm text-slate-500">
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>18 Februari 2026 (Selesai)</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>Pelabuhan Sanur, Denpasar</span>
</div>
</div>
</div>

<div className="lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6 space-y-1">
<span className="text-xs text-slate-400">Total Harga:</span>
<div className="text-lg font-bold text-slate-700">Rp 550.000</div>
<div className="inline-flex items-center text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
              +120 XP Jejakawan Didapat
            </div>
</div>

<div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5">
<button className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-150" type="button">
<svg className="w-4 h-4 mr-1.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              Beri Ulasan (+50 XP)
            </button>
<button className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all" type="button">
              Pesan Lagi Serupa
            </button>
</div>
</div>
</article>

</div>

<div className="hidden mt-8 bg-white border border-slate-200/80 rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-sm" data-purpose="empty-state" id="booking-empty-state">
<div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-5 shadow-inner">

<svg className="w-10 h-10 stroke-current text-slate-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"></path>
<path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
<path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"></path>
<path d="M8 10h8"></path>
<path d="M10 13h4"></path>
</svg>
</div>
<h3 className="text-xl font-bold text-slate-900 tracking-tight">Belum ada booking</h3>
<p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
        Jelajahi open trip pilihan dan temukan teman seperjalanan untuk mewujudkan petualangan pertamamu ke pelosok nusantara!
      </p>
<div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
<a className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all duration-150" href="#">
          Jelajahi Open Trip Pilihan
        </a>
<button className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all" onclick="switchBookingView('all')" type="button">
          Kembali ke Semua Pesanan
        </button>
</div>
</div>


<section className="mt-12 pt-8 border-t border-slate-200/80" data-purpose="guarantee-features">
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


<footer className="bg-white border-t border-slate-100 mt-16 text-slate-600 text-sm" data-purpose="primary-footer">
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
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Rekomendasi</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Peta Destinasi</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Open Trip</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Hidden Gems</a></li>
</ul>
</div>

<div>
<h3 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Komunitas</h3>
<ul className="space-y-2.5 text-sm">
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Cari Teman</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Misi &amp; Badge</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Leaderboard Traveler</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Profil Saya</a></li>
</ul>
</div>

<div>
<h3 className="font-bold text-slate-900 mb-3.5 text-sm uppercase tracking-wider">Bantuan</h3>
<ul className="space-y-2.5 text-sm">
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Pusat Bantuan</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Pengaturan Akun</a></li>
<li><a className="text-slate-600 hover:text-brand-600 transition-colors" href="#">Syarat &amp; Ketentuan</a></li>
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
<a className="hover:text-slate-600" href="#">Kebijakan Privasi</a>
<a className="hover:text-slate-600" href="#">Ketentuan Layanan</a>
<a className="hover:text-slate-600" href="#">Keamanan</a>
</div>
</div>
</div>
</footer>




  )
}
