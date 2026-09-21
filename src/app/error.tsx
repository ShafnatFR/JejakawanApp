"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
          <CardTitle>Terjadi Kesalahan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error.message || "Maaf, terjadi kesalahan. Silakan coba lagi."}</p>
          <Button onClick={reset}>Coba Lagi</Button>
        </CardContent>
      </Card>
    </div>
  )
}