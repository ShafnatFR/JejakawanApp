"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"

interface ReviewFormProps {
  targetType: "destination" | "user" | "agency"
  targetId: string
  tripId?: string
  onSuccess?: () => void
}

export function ReviewForm({ targetType, targetId, tripId, onSuccess }: ReviewFormProps) {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!user || rating === 0) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: user.id,
      target_type: targetType,
      target_id: targetId,
      rating,
      comment: comment || null,
      trip_id: tripId || null,
    })
    if (!error) {
      setSubmitted(true)
      onSuccess?.()
    }
    setLoading(false)
  }

  if (!user) return null
  if (submitted) return <p className="text-sm text-green-600">Review berhasil dikirim!</p>

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <Label>Berikan Rating</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)} className="p-0.5">
            <Star className={`h-6 w-6 ${(hovered || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <Textarea placeholder="Tulis review (opsional)..." value={comment} onChange={e => setComment(e.target.value)} rows={3} />
      <Button onClick={handleSubmit} disabled={loading || rating === 0} size="sm">
        {loading ? "Mengirim..." : "Kirim Review"}
      </Button>
    </div>
  )
}
