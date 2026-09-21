"use client"

import { ShieldCheck, Phone, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface VerificationBadgesProps {
  phoneVerified: boolean
  ktpVerified: boolean
  clickable?: boolean
}

export function VerificationBadges({ phoneVerified, ktpVerified, clickable = true }: VerificationBadgesProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => clickable && !phoneVerified && router.push("/verify")}
        disabled={phoneVerified}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
          phoneVerified
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-500 border-gray-200 cursor-pointer hover:bg-gray-100"
        )}
      >
        <Phone className="h-3.5 w-3.5" />
        {phoneVerified ? "Terverifikasi" : "Verifikasi HP"}
      </button>
      <button
        onClick={() => clickable && !ktpVerified && router.push("/verify")}
        disabled={ktpVerified}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
          ktpVerified
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-500 border-gray-200 cursor-pointer hover:bg-gray-100"
        )}
      >
        <Shield className="h-3.5 w-3.5" />
        {ktpVerified ? "KTP Terverifikasi" : "Verifikasi KTP"}
      </button>
    </div>
  )
}
