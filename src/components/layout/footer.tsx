import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Jejakawan</h3>
            <p className="text-sm text-muted-foreground">
              Platform perjalanan Indonesia yang menghubungkan traveler, menemukan destinasi tersembunyi, dan menciptakan petualangan tak terlupakan.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-3">Jelajahi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/discover" className="hover:text-foreground">Rekomendasi</Link></li>
              <li><Link href="/explore" className="hover:text-foreground">Peta</Link></li>
              <li><Link href="/open-trips" className="hover:text-foreground">Open Trip</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Komunitas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/match" className="hover:text-foreground">Cari Teman</Link></li>
              <li><Link href="/gamification" className="hover:text-foreground">Misi &amp; Badge</Link></li>
              <li><Link href="/profile" className="hover:text-foreground">Profil</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3">Bantuan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/settings" className="hover:text-foreground">Pengaturan</Link></li>
              <li><span>Kontak: halo@jejakawan.id</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 Jejakawan. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
