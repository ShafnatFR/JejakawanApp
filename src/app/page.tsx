import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, Users, Shield, Trophy, MapPin, Star } from "lucide-react"

export default function LandingPage() {
  const features = [
    { icon: Compass, title: "Rekomendasi Personal", desc: "Temukan destinasi yang sesuai minat dan budget kamu." },
    { icon: Users, title: "Trip Matching", desc: "Cari teman perjalanan yang kompatibel dan seru." },
    { icon: Shield, title: "Keamanan & Kepercayaan", desc: "Verifikasi KTP, trust score, dan sistem laporan." },
    { icon: Trophy, title: "Gamifikasi", desc: "Kumpulkan XP, badge, dan selesaikan misi seru." },
    { icon: MapPin, title: "Destinasi Tersembunyi", desc: "Jelajahi 50+ spot underrated di seluruh Indonesia." },
    { icon: Star, title: "Open Trip & Marketplace", desc: "Temukan dan booking open trip dari agen terpercaya." },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Temukan Jejak<br />
              <span className="text-teal-200">Petualanganmu</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Jelajahi Indonesia bersama komunitas traveler. Temukan destinasi tersembunyi, cari teman jalan, dan kumpulkan pengalaman tak terlupakan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 text-lg px-8">
                  Mulai Petualangan
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Jelajahi Destinasi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Berpetualang?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Bergabunglah dengan ribuan traveler Indonesia dan mulai petualanganmu sekarang.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">Daftar Gratis</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
