"use client"

import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrustBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: { icon: "h-4 w-4", text: "text-xs", container: "px-1.5 py-0.5" },
  md: { icon: "h-5 w-5", text: "text-sm", container: "px-2 py-1" },
  lg: { icon: "h-7 w-7", text: "text-base", container: "px-3 py-1.5" },
}

function getColor(score: number) {
  if (score < 30) return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Rendah" }
  if (score <= 60) return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", label: "Sedang" }
  return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "Tinggi" }
}

export function TrustBadge({ score, size = "md" }: TrustBadgeProps) {
  const s = sizeMap[size]
  const c = getColor(score)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1 rounded-full border font-semibold", s.container, s.text, c.bg, c.text, c.border)}>
            <Shield className={cn(s.icon, "fill-current")} />
            <span>{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">Skor Kepercayaan: {score}/100</p>
            <p className="text-muted-foreground">Status: {c.label}</p>
            <p className="text-xs mt-1">Skor berdasarkan verifikasi, review, dan aktivitas.</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
