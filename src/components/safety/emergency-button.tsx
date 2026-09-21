"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, AlertTriangle, Siren } from "lucide-react"

export function EmergencyButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 z-50 p-0"
        size="icon"
      >
        <Siren className="h-6 w-6 text-white" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Darurat / SOS
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-auto py-4" asChild>
              <a href="tel:112">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Hubungi 112</p>
                    <p className="text-xs text-muted-foreground">Layanan darurat nasional Indonesia</p>
                  </div>
                </div>
              </a>
            </Button>

            <Button variant="outline" className="w-full justify-start h-auto py-4" onClick={() => alert("Lokasi akan dibagikan ke kontak darurat (coming soon)")}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Kirim Lokasi ke Kontak Darurat</p>
                  <p className="text-xs text-muted-foreground">Bagikan lokasi GPS ke kontak terpercaya</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start h-auto py-4" onClick={() => alert("Formulir laporan darurat (coming soon)")}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Laporkan Keadaan Darurat</p>
                  <p className="text-xs text-muted-foreground">Kirim laporan ke tim keamanan Jejakawan</p>
                </div>
              </div>
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Dalam keadaan darurat nyata, segera hubungi 112 atau layanan darurat setempat.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
