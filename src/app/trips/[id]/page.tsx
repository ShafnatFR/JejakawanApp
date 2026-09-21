"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth"
import { TripRequest, TripMatch, UserProfile } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  Shield,
  MessageCircle,
  ArrowLeft,
  UserMinus,
  XCircle,
} from "lucide-react"

interface TripMember {
  user_id: string
  role: string
  user_profiles: UserProfile
}

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as string
  const { user } = useAuthStore()
  const [trip, setTrip] = useState<TripRequest | null>(null)
  const [members, setMembers] = useState<TripMember[]>([])
  const [candidates, setCandidates] = useState<(TripMatch & { invitee?: UserProfile })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tripId) fetchTrip()
  }, [tripId])

  async function fetchTrip() {
    const supabase = createClient()

    const { data: tripData } = await supabase
      .from("trip_requests")
      .select("*, creator:user_profiles!creator_id(*), destination:destinations(*)")
      .eq("id", tripId)
      .single()

    setTrip(tripData)

    // Fetch trip group members
    const { data: group } = await supabase
      .from("trip_groups")
      .select("id")
      .eq("trip_request_id", tripId)
      .single()

    if (group) {
      const { data: memberData } = await supabase
        .from("trip_group_members")
        .select("user_id, role, user_profiles(*)")
        .eq("group_id", group.id)
      setMembers(memberData || [])

      // Fetch chat room for this trip
      // Store group.id for chat navigation
    }

    // Fetch matching candidates if creator
    if (tripData && user?.id === tripData.creator_id && tripData.status === "open") {
      const { data: matchData } = await supabase
        .from("trip_matches")
        .select("*, invitee:user_profiles!invitee_id(*)")
        .eq("trip_request_id", tripId)
        .order("compatibility", { ascending: false })
      setCandidates(matchData || [])
    }

    setLoading(false)
  }

  async function handleCancelTrip() {
    if (!confirm("Yakin ingin membatalkan trip ini?")) return
    const supabase = createClient()
    await supabase.from("trip_requests").update({ status: "cancelled" }).eq("id", tripId)
    fetchTrip()
  }

  async function handleLeaveTrip() {
    if (!confirm("Yakin ingin keluar dari trip ini?")) return
    const supabase = createClient()

    const { data: group } = await supabase
      .from("trip_groups")
      .select("id")
      .eq("trip_request_id", tripId)
      .single()

    if (group && user) {
      await supabase
        .from("trip_group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", user.id)

      // Update member count
      const { count } = await supabase
        .from("trip_group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id)

      await supabase
        .from("trip_requests")
        .update({ current_members: count || 0 })
        .eq("id", tripId)
    }
    router.push("/match")
  }

  async function openChat() {
    // Find chat room linked to this trip's group
    const supabase = createClient()
    const { data: group } = await supabase
      .from("trip_groups")
      .select("id")
      .eq("trip_request_id", tripId)
      .single()

    if (group) {
      const { data: room } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("trip_group_id", group.id)
        .single()

      if (room) {
        router.push(`/chat/${room.id}`)
        return
      }
    }
    // No chat room yet, go to general chat
    router.push("/chat")
  }

  function statusColor(status: string) {
    switch (status) {
      case "open": return "bg-green-100 text-green-700"
      case "matched": return "bg-blue-100 text-blue-700"
      case "in_progress": return "bg-yellow-100 text-yellow-700"
      case "completed": return "bg-gray-100 text-gray-700"
      case "cancelled": return "bg-red-100 text-red-700"
      default: return ""
    }
  }

  const isCreator = user?.id === trip?.creator_id
  const isMember = members.some((m) => m.user_id === user?.id)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h3 className="text-lg font-medium">Trip tidak ditemukan</h3>
        <Button variant="link" onClick={() => router.push("/match")}>
          Kembali ke Trip Match
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/match")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
      </Button>

      {/* Trip Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {(trip as any).destination?.name || "Destinasi"}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {(trip as any).destination?.province || ""}
              </p>
            </div>
            <Badge className={statusColor(trip.status)}>
              {trip.status === "open"
                ? "Terbuka"
                : trip.status === "matched"
                ? "Matched"
                : trip.status === "in_progress"
                ? "Berlangsung"
                : trip.status === "completed"
                ? "Selesai"
                : "Dibatalkan"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">
                  {new Date(trip.date_from).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(trip.date_to).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">
                  Rp {trip.budget_min.toLocaleString("id-ID")} -{" "}
                  {trip.budget_max.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Anggota</p>
                <p className="font-medium">
                  {trip.current_members}/{trip.max_members} orang
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Transport</p>
                <p className="font-medium">
                  {trip.transport_modes?.join(", ") || "-"}
                </p>
              </div>
            </div>
          </div>

          {trip.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Catatan</p>
                <p className="text-sm">{trip.notes}</p>
              </div>
            </>
          )}

          {/* Creator */}
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={(trip as any).creator?.avatar_url || ""} />
                <AvatarFallback>
                  {(trip as any).creator?.display_name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {(trip as any).creator?.display_name || "Anonim"}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{(trip as any).creator?.rating_avg?.toFixed(1) || "0.0"}</span>
                  {(trip as any).creator?.ktp_verified && (
                    <Shield className="h-3 w-3 text-green-500 ml-1" />
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Pembuat Trip</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={openChat}>
          <MessageCircle className="h-4 w-4 mr-2" /> Buka Chat
        </Button>
        {isCreator && trip.status === "open" && (
          <Button variant="destructive" onClick={handleCancelTrip}>
            <XCircle className="h-4 w-4 mr-2" /> Batalkan Trip
          </Button>
        )}
        {isMember && !isCreator && (
          <Button variant="outline" onClick={handleLeaveTrip}>
            <UserMinus className="h-4 w-4 mr-2" /> Keluar dari Trip
          </Button>
        )}
      </div>

      {/* Members List */}
      {members.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Anggota Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={(member as any).user_profiles?.avatar_url || ""} />
                      <AvatarFallback>
                        {(member as any).user_profiles?.display_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {(member as any).user_profiles?.display_name || "Anonim"}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>
                          {(member as any).user_profiles?.rating_avg?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role === "host" ? "Host" : "Anggota"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Candidates (creator only) */}
      {isCreator && trip.status === "open" && candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kandidat Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.invitee?.avatar_url || ""} />
                      <AvatarFallback>{c.invitee?.display_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {c.invitee?.display_name || "Anonim"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Kecocokan: {c.compatibility}%</span>
                        {c.invitee?.ktp_verified && (
                          <Shield className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      c.status === "accepted"
                        ? "default"
                        : c.status === "declined"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {c.status === "pending"
                      ? "Menunggu"
                      : c.status === "accepted"
                      ? "Diterima"
                      : "Ditolak"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
