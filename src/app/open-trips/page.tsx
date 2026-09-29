"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

export default function OpentripsPage() {
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  })

  return (

<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex items-center justify-between h-16">

<div className="flex items-center gap-10">
<a className="flex items-center gap-2.5 group" href="#">
<div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200">

<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="9" strokeWidth="2"></circle>
<polygon fill="currentColor" points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
</svg>
</div>
<span className="text-xl font-bold tracking-tight text-slate-900">Jejakawan</span>
</a>

<nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1">
<a className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="#">Discover</a>
<a className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="#">Explore</a>
<a className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="#">Trip Match</a>
<a aria-current="page" className="px-3.5 py-2 text-sm font-semibold text-brand-600 bg-brand-50/80 rounded-lg relative" href="#">
              Open Trip
              <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-brand-600 rounded-full"></span>
</a>
<a className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors" href="#">Gamifikasi</a>
</nav>
</div>

<div className="flex items-center gap-3">

<button aria-label="Pesan dan Komunitas" className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors" type="button">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
</button>

<button aria-label="Notifikasi" className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors" type="button">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</button>
<div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

<button className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200" type="button">
<div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs">
              S
            </div>
<span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">Sandi Pratama</span>
</button>
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
              Jadwal Eksplorasi Musim Kemarau 2026
            </div>
<h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Open Trip Petualangan</h1>
<p className="text-slate-500 text-sm sm:text-base max-w-2xl">
              Temukan dan gabung trip gabungan seru keliling Indonesia bersama agen travel terpercaya dan teman baru.
            </p>
</div>

<div className="flex items-center gap-3">
<button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/25 transition-all" type="button">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
<path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
<span>Daftarkan Open Trip</span>
<span className="text-[11px] font-normal opacity-80">(Agen / Host)</span>
</button>
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
<input className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50/50 hover:bg-white transition-all text-slate-900 placeholder:text-slate-400" placeholder="Cari open trip, destinasi, gunung, pantai..." type="text"/>
</div>

<div className="md:col-span-3">
<select className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-700 font-medium">
<option value="">Semua Lokasi / Provinsi</option>
<option value="jatim">Jawa Timur (Bromo, Ijen, Sewu)</option>
<option value="bali">Bali &amp; Nusa Penida</option>
<option value="ntt">Nusa Tenggara Timur (Labuan Bajo)</option>
<option value="diy">DI Yogyakarta &amp; Pacitan</option>
<option value="jateng">Jawa Tengah (Dieng, Merbabu)</option>
</select>
</div>

<div className="md:col-span-2">
<select className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white text-slate-700 font-medium">
<option value="">Kapan Saja</option>
<option value="weekend">Weekend Ini</option>
<option value="month">Bulan Juni 2026</option>
<option value="holiday">Libur Long Weekend</option>
</select>
</div>

<div className="md:col-span-2">
<button className="w-full py-2.5 px-4 text-sm font-medium rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center gap-2 transition-colors" type="button">
<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
<span>Filter Lanjutan</span>
</button>
</div>
</div>

<div className="flex items-center gap-2 mt-4 pt-3 overflow-x-auto hide-scrollbar text-xs font-medium">
<span className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold mr-1">Kategori:</span>
<button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white shrink-0">Semua Trip</button>
<button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 shrink-0">Gunung &amp; Hiking 🥾</button>
<button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 shrink-0">Pantai &amp; Snorkeling 🌊</button>
<button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 shrink-0">Liveaboard / Kapal ⛵</button>
<button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 shrink-0">Roadtrip &amp; Caving 🚙</button>
<div className="h-4 w-px bg-slate-200 mx-2 shrink-0"></div>
<label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0 text-slate-600">
<input checked="" className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500" type="checkbox"/>
<span>Pasti Berangkat</span>
</label>
<label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0 text-slate-600 ml-2">
<input checked="" className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500" type="checkbox"/>
<span>Agen Terverifikasi</span>
</label>
</div>
</div>
</div>
</section>

<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-purpose="trip-catalog">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
<div>
<h2 className="text-lg font-bold text-slate-900">Pilihan Open Trip Populer</h2>
<p className="text-xs sm:text-sm text-slate-500">Menampilkan 4 dari 24 trip siap daftar untuk musim liburan</p>
</div>

<div className="inline-flex p-1 bg-slate-200/80 rounded-xl self-start text-xs font-semibold">
<button className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition-all" type="button">
            Semua Open Trip (24)
          </button>
<button className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all" type="button">
            Trip Saya / Diikuti (0)
          </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<article className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
<div>

<div className="relative bg-slate-100 p-4 border-b border-slate-100">
<div className="flex items-center justify-between mb-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<svg className="w-3 h-3 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
                  Pasti Berangkat
                </span>
<span className="text-xs font-semibold text-slate-500">2D1N</span>
</div>
<div className="text-xs font-medium text-slate-500 flex items-center gap-1">
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Banyuwangi, Jawa Timur
              </div>
</div>

<div className="p-4 sm:p-5">
<h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                Ekspedisi Kawah Ijen &amp; Blue Fire Midnight
              </h3>

<div className="flex items-center gap-2 mb-4 text-xs text-slate-600">
<span className="font-medium text-slate-800">Bromo Adventure Tour</span>
<span className="text-slate-300">•</span>
<span className="inline-flex items-center text-amber-600 font-semibold">
                  ★ 4.9 <span className="text-slate-400 font-normal ml-0.5">(128)</span>
</span>
</div>

<div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>30 Mei - 1 Juni 2026</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="truncate">Mepo: Stasiun Banyuwangi Kota</span>
</div>
</div>

<div className="mb-4">
<div className="flex justify-between text-xs mb-1">
<span className="text-slate-500 font-medium">Kuota Terisi</span>
<span className="font-bold text-rose-600">Sisa 3 slot</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-rose-500 h-2 rounded-full" style="width: 75%"></div>
</div>
<span className="text-[11px] text-slate-400 mt-1 block">9 dari 12 orang telah mendaftar</span>
</div>

<div className="flex flex-wrap gap-1 mb-2">
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Transport</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Masker Gas</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Homestay</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Guide</span>
</div>
</div>
</div>

<div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
<div className="flex items-baseline justify-between pt-3 mb-3">
<div>
<span className="text-[11px] text-slate-400 block font-medium">Biaya per Orang</span>
<span className="text-lg font-extrabold text-slate-900">Rp 650.000</span>
</div>
<span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">All-in</span>
</div>
<button className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold tracking-wide transition-colors">
              Detail &amp; Booking
            </button>
</div>
</article>

<article className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
<div>

<div className="relative bg-slate-100 p-4 border-b border-slate-100">
<div className="flex items-center justify-between mb-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
<svg className="w-3 h-3 mr-1 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
</svg>
                  SuperHost Agen
                </span>
<span className="text-xs font-semibold text-slate-500">3D2N</span>
</div>
<div className="text-xs font-medium text-slate-500 flex items-center gap-1">
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Labuan Bajo, NTT
              </div>
</div>

<div className="p-4 sm:p-5">
<h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                Sailing Komodo Liveaboard - Padar &amp; Pink Beach
              </h3>

<div className="flex items-center gap-2 mb-4 text-xs text-slate-600">
<span className="font-medium text-slate-800">Flores Sea Odyssey</span>
<span className="text-slate-300">•</span>
<span className="inline-flex items-center text-amber-600 font-semibold">
                  ★ 5.0 <span className="text-slate-400 font-normal ml-0.5">(86)</span>
</span>
</div>

<div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>5 - 7 Juni 2026</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="truncate">Mepo: Labuan Bajo Marina</span>
</div>
</div>

<div className="mb-4">
<div className="flex justify-between text-xs mb-1">
<span className="text-slate-500 font-medium">Kuota Terisi</span>
<span className="font-bold text-rose-600">Sisa 2 slot</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-rose-500 h-2 rounded-full" style="width: 85%"></div>
</div>
<span className="text-[11px] text-slate-400 mt-1 block">12 dari 14 orang telah mendaftar</span>
</div>

<div className="flex flex-wrap gap-1 mb-2">
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Phinisi AC</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Makan 3x</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Dokumentasi Drone</span>
</div>
</div>
</div>

<div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
<div className="flex items-baseline justify-between pt-3 mb-3">
<div>
<span className="text-[11px] text-slate-400 block font-medium">Biaya per Orang</span>
<span className="text-lg font-extrabold text-slate-900">Rp 2.450.000</span>
</div>
<span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Promo Kabin</span>
</div>
<button className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold tracking-wide transition-colors">
              Detail &amp; Booking
            </button>
</div>
</article>

<article className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
<div>

<div className="relative bg-slate-100 p-4 border-b border-slate-100">
<div className="flex items-center justify-between mb-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<svg className="w-3 h-3 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
                  Pasti Berangkat
                </span>
<span className="text-xs font-semibold text-slate-500">2D1N</span>
</div>
<div className="text-xs font-medium text-slate-500 flex items-center gap-1">
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Wonosobo, Jawa Tengah
              </div>
</div>

<div className="p-4 sm:p-5">
<h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                Summit Attack Gunung Prau &amp; Sunset Camping
              </h3>

<div className="flex items-center gap-2 mb-4 text-xs text-slate-600">
<span className="font-medium text-slate-800">Sahabat Rimba</span>
<span className="text-slate-300">•</span>
<span className="inline-flex items-center text-amber-600 font-semibold">
                  ★ 4.8 <span className="text-slate-400 font-normal ml-0.5">(94)</span>
</span>
</div>

<div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>12 - 13 Juni 2026</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="truncate">Mepo: Basecamp Patakbanteng</span>
</div>
</div>

<div className="mb-4">
<div className="flex justify-between text-xs mb-1">
<span className="text-slate-500 font-medium">Kuota Terisi</span>
<span className="font-bold text-brand-600">Sisa 5 slot</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-brand-500 h-2 rounded-full" style="width: 66%"></div>
</div>
<span className="text-[11px] text-slate-400 mt-1 block">10 dari 15 orang telah mendaftar</span>
</div>

<div className="flex flex-wrap gap-1 mb-2">
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Tenda Tim</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Simaksi</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Porter Tim</span>
</div>
</div>
</div>

<div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
<div className="flex items-baseline justify-between pt-3 mb-3">
<div>
<span className="text-[11px] text-slate-400 block font-medium">Biaya per Orang</span>
<span className="text-lg font-extrabold text-slate-900">Rp 375.000</span>
</div>
<span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Reguler</span>
</div>
<button className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold tracking-wide transition-colors">
              Detail &amp; Booking
            </button>
</div>
</article>

<article className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
<div>

<div className="relative bg-slate-100 p-4 border-b border-slate-100">
<div className="flex items-center justify-between mb-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
<svg className="w-3 h-3 mr-1 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
<path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
</svg>
                  Pasti Berangkat
                </span>
<span className="text-xs font-semibold text-slate-500">1 Hari (Day Trip)</span>
</div>
<div className="text-xs font-medium text-slate-500 flex items-center gap-1">
<svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                Lumajang / Malang, Jatim
              </div>
</div>

<div className="p-4 sm:p-5">
<h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                Hidden Paradise Tumpak Sewu &amp; Goa Tetes
              </h3>

<div className="flex items-center gap-2 mb-4 text-xs text-slate-600">
<span className="font-medium text-slate-800">Malang Wanderlust</span>
<span className="text-slate-300">•</span>
<span className="inline-flex items-center text-amber-600 font-semibold">
                  ★ 4.9 <span className="text-slate-400 font-normal ml-0.5">(52)</span>
</span>
</div>

<div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span>Weekend Setiap Sabtu</span>
</div>
<div className="flex items-center gap-2">
<svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
<span className="truncate">Mepo: Stasiun Malang Kota Baru</span>
</div>
</div>

<div className="mb-4">
<div className="flex justify-between text-xs mb-1">
<span className="text-slate-500 font-medium">Kuota Terisi</span>
<span className="font-bold text-brand-600">Sisa 4 slot</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-brand-500 h-2 rounded-full" style="width: 60%"></div>
</div>
<span className="text-[11px] text-slate-400 mt-1 block">6 dari 10 orang telah mendaftar</span>
</div>

<div className="flex flex-wrap gap-1 mb-2">
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Jeep / Elf</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Tiket All In</span>
<span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Safety Gear</span>
</div>
</div>
</div>

<div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
<div className="flex items-baseline justify-between pt-3 mb-3">
<div>
<span className="text-[11px] text-slate-400 block font-medium">Biaya per Orang</span>
<span className="text-lg font-extrabold text-slate-900">Rp 280.000</span>
</div>
<span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Best Deal</span>
</div>
<button className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold tracking-wide transition-colors">
              Detail &amp; Booking
            </button>
</div>
</article>
</div>
</section>

<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" data-purpose="user-state-preview">
<div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm">

<div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 transition-transform hover:scale-105">
<svg className="w-8 h-8 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24">

<rect height="13" rx="3" strokeLinecap="round" width="14" x="5" y="8"></rect>
<path d="M9 8V5a3 3 0 0 1 6 0v3" strokeLinecap="round"></path>
<path d="M9 13h6" strokeLinecap="round"></path>
<path d="M12 11v4" strokeLinecap="round"></path>
<path d="M5 14h2" strokeLinecap="round"></path>
<path d="M17 14h2" strokeLinecap="round"></path>
</svg>
</div>
<h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
          Belum Ada Open Trip yang Kamu Ikuti
        </h3>
<p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Mulai langkah petualanganmu hari ini! Jelajahi jadwal trip di atas, booking slot bersama teman baru, atau pasang pengingat keberangkatan.
        </p>
<div className="flex flex-wrap items-center justify-center gap-3">
<button className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 transition-all" type="button">
            Jelajahi Rekomendasi Terpopuler
          </button>
<a className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors" href="#">
            Panduan Ikut Open Trip
          </a>
</div>
</div>
</section>


<section className="border-t border-slate-200/80 bg-white py-10" data-purpose="trust-safety">
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
                Pembayaran aman dengan sistem escrow bersama. Pengembalian 100% jika trip dibatalkan oleh pihak agen.
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
                Terhubung dengan sesama solo traveler sebelum keberangkatan lewat fitur grup diskusi eksklusif Jejakawan.
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
<li><a className="hover:text-brand-600 transition-colors" href="#">Rekomendasi</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Peta</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Open Trip</a></li>
</ul>
</div>

<div className="md:col-span-2 space-y-3">
<h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Komunitas</h4>
<ul className="space-y-2 text-xs text-slate-600 font-medium">
<li><a className="hover:text-brand-600 transition-colors" href="#">Cari Teman</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Misi &amp; Badge</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Profil</a></li>
</ul>
</div>

<div className="md:col-span-3 space-y-3">
<h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">Bantuan</h4>
<ul className="space-y-2 text-xs text-slate-600 font-medium">
<li><a className="hover:text-brand-600 transition-colors" href="#">Pengaturan</a></li>
<li>
<span className="text-slate-500">Kontak: </span>
<a className="text-brand-600 hover:underline" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a>
</li>
</ul>
</div>
</div>

<div className="border-t border-slate-100 pt-6 text-center">
<p className="text-xs text-slate-400 font-normal">
          © 2026 Jejakawan. Semua hak dilindungi.
        </p>
</div>
</div>
</footer>

  )
}
