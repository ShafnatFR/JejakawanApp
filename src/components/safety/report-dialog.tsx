"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag, CheckCircle } from "lucide-react"

interface ReportDialogProps {
  reportedId: string
  reportedType?: "user" | "content"
  trigger?: React.ReactNode
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Pelecehan / Bullying" },
  { value: "fake_profile", label: "Profil Palsu" },
  { value: "inappropriate_content", label: "Konten Tidak Pantas" },
  { value: "scam", label: "Penipuan" },
  { value: "other", label: "Lainnya" },
]

export function ReportDialog({ reportedId, reportedType = "user", trigger }: ReportDialogProps) {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!user || !reason) return
    setSubmitting(true)
    const supabase = createClient()
    await supabase.from("user_reports").insert({
      reporter_id: user.id,
      reported_type: reportedType,
      reported_id: reportedId,
      reason,
      description: description || null,
      status: "pending",
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value) {
      setReason("")
      setDescription("")
      setSubmitted(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-1" />
            Laporkan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{submitted ? "Laporan Terkirim" : "Laporkan Pengguna"}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-medium">Terima kasih atas laporanmu.</p>
            <p className="text-sm text-muted-foreground mt-1">Tim kami akan meninjau laporan ini dalam 1×24 jam.</p>
            <Button className="mt-4" onClick={() => setOpen(false)}>Tutup</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Alasan Laporan</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih alasan..." />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Detail (opsional)</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Jelaskan situasi lebih detail..."
                className="mt-1"
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} disabled={!reason || submitting} className="w-full" variant="destructive">
              {submitting ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
