import Link from 'next/link'
import { Compass } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">Jejakawan</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Jelajahi</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/discover" className="hover:text-brand-600 transition-colors text-slate-500">Rekomendasi</Link></li>
              <li><Link href="/explore" className="hover:text-brand-600 transition-colors text-slate-500">Peta Destinasi</Link></li>
              <li><Link href="/open-trips" className="hover:text-brand-600 transition-colors text-slate-500">Open Trip Komunitas</Link></li>
              <li><Link href="/discover" className="hover:text-brand-600 transition-colors text-slate-500">Hidden Gems Indonesia</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Komunitas</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/match" className="hover:text-brand-600 transition-colors text-slate-500">Cari Teman Jalan</Link></li>
              <li><Link href="/gamification" className="hover:text-brand-600 transition-colors text-slate-500">Misi &amp; Badge</Link></li>
              <li><Link href="/profile" className="hover:text-brand-600 transition-colors text-slate-500">Profil Traveler</Link></li>
              <li><Link href="/gamification" className="hover:text-brand-600 transition-colors text-slate-500">Panduan Komunitas</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bantuan</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/settings" className="hover:text-brand-600 transition-colors text-slate-500">Pengaturan Akun</Link></li>
              <li><Link href="/settings" className="hover:text-brand-600 transition-colors text-slate-500">Kebijakan Privasi &amp; Syarat</Link></li>
              <li className="pt-1 text-slate-400">
                Kontak: <a className="text-brand-600 font-medium hover:underline" href="mailto:halo@jejakawan.id">halo@jejakawan.id</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
          <div className="flex space-x-4">
            <Link href="/settings" className="hover:text-slate-600 transition-colors">Syarat Ketentuan</Link>
            <Link href="/settings" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="/gamification" className="hover:text-slate-600 transition-colors">Panduan Komunitas</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
