import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <CardTitle className="text-3xl">404</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Halaman tidak ditemukan. Mungkin destinasi ini belum ada di peta kami.</p>
          <Link href="/"><Button>Kembali ke Beranda</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}