"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"

export default function VerifyPage() {
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  })

  return (

<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

<div className="flex items-center space-x-10">
<a className="flex items-center space-x-3 group" href="#" title="Beranda Jejakawan">
<div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-700 transition-all duration-300">

<svg className="w-6 h-6 transform group-hover:rotate-45 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm3.8 6.2l-2.4 6.2-6.2 2.4 2.4-6.2 6.2-2.4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">Jejakawan</span>
</a>

<nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
<a className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="#">Discover</a>
<a className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="#">Explore</a>
<a className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="#">Trip Match</a>
<a className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="#">Open Trip</a>
<a className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors" href="#">Gamifikasi</a>
</nav>
</div>

<div className="flex items-center space-x-4">

<button aria-label="Pesan" className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span className="absolute top-2 right-2 w-2 h-2 bg-brand-600 rounded-full ring-2 ring-white"></span>
</button>

<button aria-label="Notifikasi" className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</button>

<div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
<div className="relative group cursor-pointer flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors">
<div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-brand-200 text-brand-700 font-bold flex items-center justify-center text-sm shadow-sm">
              S
            </div>
<div className="hidden xl:block text-left pr-1">
<p className="text-xs font-semibold text-slate-800 leading-tight">Shafnat Fuaini</p>
<p className="text-[11px] text-slate-500 font-medium">Traveler Tingkat 2</p>
</div>
<svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
</div>
</div>
</div>
</header>


<main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">

<div className="mb-6">
<a className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors group" href="#">
<svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
</svg>
        Kembali ke Pengaturan Akun
      </a>
</div>

<section className="mb-8" data-purpose="page-title-section">
<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">

<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
</div>
<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Verifikasi KTP</h1>
</div>

<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
<svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
</svg>
<span>Enkripsi Bank-Grade 256-Bit SSL</span>
</div>
</div>
<p className="text-slate-600 text-base max-w-2xl">
        Verifikasi identitas resmi kamu untuk meningkatkan <span className="font-semibold text-slate-900">Skor Kepercayaan (Trust Score)</span>, meraih lencana verifikasi, dan membuka akses menjadi Trip Leader.
      </p>
</section>

<div className="mb-10 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-subtle" data-purpose="stepper">
<div className="grid grid-cols-3 gap-2 relative">

<div className="flex flex-col items-center sm:items-start text-center sm:text-left">
<div className="flex items-center space-x-2.5">
<span className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">1</span>
<span className="text-sm font-bold text-brand-600 hidden sm:inline">Upload KTP</span>
</div>
<span className="text-xs font-bold text-brand-600 sm:hidden mt-1">Upload</span>
<div className="w-full h-1 bg-brand-600 rounded-full mt-3"></div>
</div>

<div className="flex flex-col items-center sm:items-start text-center sm:text-left">
<div className="flex items-center space-x-2.5 opacity-60">
<span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">2</span>
<span className="text-sm font-medium text-slate-600 hidden sm:inline">Konfirmasi Data Diri</span>
</div>
<span className="text-xs font-medium text-slate-500 sm:hidden mt-1">Data Diri</span>
<div className="w-full h-1 bg-slate-200 rounded-full mt-3"></div>
</div>

<div className="flex flex-col items-center sm:items-start text-center sm:text-left">
<div className="flex items-center space-x-2.5 opacity-60">
<span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">3</span>
<span className="text-sm font-medium text-slate-600 hidden sm:inline">Tinjauan &amp; Review</span>
</div>
<span className="text-xs font-medium text-slate-500 sm:hidden mt-1">Review</span>
<div className="w-full h-1 bg-slate-200 rounded-full mt-3"></div>
</div>
</div>
</div>

<div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden" data-purpose="verification-card">
<div className="p-6 sm:p-8 lg:p-10">

<div className="mb-6">
<h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Foto KTP Asli</h2>
<p className="text-slate-500 text-sm mt-1">
            Unggah foto depan e-KTP kamu dalam format fisik. Pastikan seluruh sisi kartu berada di dalam bingkai dan teks dapat dibaca jelas.
          </p>
</div>

<div className="relative border-2 border-dashed border-brand-300 hover:border-brand-600 bg-brand-50/30 hover:bg-brand-50/70 rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer group" data-purpose="file-upload-zone" id="dropzone">
<input accept="image/jpeg,image/png,image/webp" className="hidden" id="ktpFileInput" type="file"/>
<div className="flex flex-col items-center justify-center space-y-4">

<div className="w-16 h-16 rounded-2xl bg-white border border-brand-200 text-brand-600 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:border-brand-500 group-hover:text-brand-700 transition-all duration-300">
<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"></path>
</svg>
</div>

<div>
<p className="text-base font-bold text-slate-900">
                Tarik &amp; lepas file foto KTP di sini, atau 
                <span className="text-brand-600 underline decoration-2 underline-offset-2 group-hover:text-brand-700">pilih dari perangkat</span>
</p>
<p className="text-xs text-slate-500 font-medium mt-1.5">
                Mendukung format JPG, PNG, atau WEBP (Ukuran file maksimal 5 MB)
              </p>
</div>

<div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
<svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
</svg>
<span>Scan Otomatis NIK &amp; Nama Terintegrasi OCR</span>
</div>
</div>
</div>

<div className="mt-8 bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6" data-purpose="guidelines-box">
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
<button className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-300" type="button">
            Batal / Nanti Saja
          </button>
<button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2" type="button">
<span>Selanjutnya</span>
<svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
</svg>
</button>
</div>
</div>
</div>

</main>


<footer className="mt-16 bg-white border-t border-slate-200">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

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
<li><a className="hover:text-brand-600 transition-colors" href="#">Rekomendasi</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Peta Destinasi</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Open Trip</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Event Wisata</a></li>
</ul>
</div>

<div>
<h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Komunitas</h4>
<ul className="space-y-3 text-sm text-slate-500 font-medium">
<li><a className="hover:text-brand-600 transition-colors" href="#">Cari Teman</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Misi &amp; Badge</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Peringkat Traveler</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Profil Saya</a></li>
</ul>
</div>

<div>
<h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Bantuan</h4>
<ul className="space-y-3 text-sm text-slate-500 font-medium">
<li><a className="hover:text-brand-600 transition-colors" href="#">Pusat Bantuan</a></li>
<li><a className="hover:text-brand-600 transition-colors" href="#">Pengaturan</a></li>
<li><a className="text-brand-600 hover:text-brand-700 font-semibold break-all" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a></li>
</ul>
</div>
</div>

<div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
<p>© 2026 Jejakawan. Semua hak dilindungi.</p>
<div className="flex space-x-6">
<a className="hover:text-slate-900 transition-colors" href="#">Kebijakan Privasi</a>
<a className="hover:text-slate-900 transition-colors" href="#">Syarat &amp; Ketentuan</a>
<a className="hover:text-slate-900 transition-colors" href="#">Keamanan Data</a>
</div>
</div>
</div>
</footer>


  )
}
