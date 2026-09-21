"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Upload, CheckCircle, Clock, XCircle, ArrowLeft, ArrowRight, FileText, Loader2 } from "lucide-react"

type VerifyStep = 1 | 2 | 3
type VerifyStatus = "unverified" | "pending" | "verified" | "rejected"

export default function VerifyPage() {
  const { user, profile, updateProfile } = useAuthStore()
  const router = useRouter()
  const [step, setStep] = useState<VerifyStep>(1)
  const [status, setStatus] = useState<VerifyStatus>("unverified")
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [ktpPreview, setKtpPreview] = useState<string | null>(null)
  const [nik, setNik] = useState("")
  const [namaSesuai, setNamaSesuai] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    if (profile?.ktp_verified) setStatus("verified")
  }, [user, profile])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setKtpFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setKtpPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!nik || !namaSesuai) return
    setSubmitting(true)
    setStatus("pending")
    // Mock: wait 3 seconds then mark as verified
    await new Promise(r => setTimeout(r, 3000))
    await updateProfile({ ktp_verified: true })
    setStatus("verified")
    setSubmitting(false)
  }

  const nikValid = /^\d{16}$/.test(nik)
  const canProceedStep1 = !!ktpFile
  const canProceedStep2 = nikValid && namaSesuai.length > 2
  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100

  if (status === "verified") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">KTP Terverifikasi!</h2>
            <p className="text-muted-foreground mb-6">Identitas kamu sudah diverifikasi. Profilmu sekarang menampilkan badge terverifikasi.</p>
            <Button onClick={() => router.push("/profile")}>Kembali ke Profil</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card>
          <CardContent className="p-8 text-center">
            {submitting ? (
              <>
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold mb-2">Memverifikasi...</h2>
                <p className="text-muted-foreground">Sedang memproses verifikasi KTP kamu. Mohon tunggu...</p>
              </>
            ) : (
              <>
                <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Menunggu Verifikasi</h2>
                <p className="text-muted-foreground mb-6">KTP kamu sedang ditinjau oleh tim kami. Proses ini biasanya membutuhkan waktu 1×24 jam.</p>
                <Button onClick={() => router.push("/profile")}>Kembali ke Profil</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Verifikasi KTP
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Verifikasi identitas untuk meningkatkan kepercayaan.</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Upload KTP</span>
          <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Data Diri</span>
          <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Review</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Upload KTP */}
          {step === 1 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Upload Foto KTP</CardTitle>
              <p className="text-sm text-muted-foreground">Upload foto depan KTP kamu. Pastikan foto jelas dan semua informasi terbaca.</p>

              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                {ktpPreview ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img src={ktpPreview} alt="Preview KTP" className="max-h-48 rounded-lg mx-auto" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => { setKtpFile(null); setKtpPreview(null) }}
                      >
                        Hapus
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{ktpFile?.name}</p>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Klik untuk upload</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (maks 5MB)</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <p className="font-medium">Tips foto KTP:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                  <li>Pastikan seluruh KTP terlihat, tidak terpotong</li>
                  <li>Hindari pantulan cahaya atau bayangan</li>
                  <li>Semua teks harus terbaca dengan jelas</li>
                </ul>
              </div>

              <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full">
                Selanjutnya <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 2: NIK + Nama */}
          {step === 2 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Data Diri KTP</CardTitle>
              <p className="text-sm text-muted-foreground">Masukkan data sesuai yang tertera di KTP kamu.</p>

              <div>
                <Label>NIK (Nomor Induk Kependudukan)</Label>
                <Input
                  value={nik}
                  onChange={e => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="16 digit NIK"
                  className="mt-1"
                  maxLength={16}
                />
                {nik.length > 0 && !nikValid && (
                  <p className="text-xs text-red-500 mt-1">NIK harus tepat 16 digit angka</p>
                )}
              </div>

              <div>
                <Label>Nama Sesuai KTP</Label>
                <Input
                  value={namaSesuai}
                  onChange={e => setNamaSesuai(e.target.value.toUpperCase())}
                  placeholder="Sesuai ejaan di KTP"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">
                  Selanjutnya <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <CardTitle className="text-lg">Review & Kirim</CardTitle>
              <p className="text-sm text-muted-foreground">Pastikan semua data sudah benar sebelum mengirim.</p>

              {ktpPreview && (
                <div className="text-center">
                  <img src={ktpPreview} alt="KTP" className="max-h-32 rounded-lg mx-auto" />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">NIK</span>
                  <span className="text-sm font-mono">{nik.replace(/(\d{4})/g, "$1 ").trim()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nama</span>
                  <span className="text-sm font-medium">{namaSesuai}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <FileText className="h-4 w-4 inline mr-1" />
                Data KTP akan diverifikasi dan disimpan secara aman. Hanya status verifikasi yang ditampilkan di profil.
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                  {submitting ? "Memverifikasi..." : "Kirim Verifikasi"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
