"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle, XCircle, Shield, User, FileText } from "lucide-react"

export default function AdminReportsPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    setLoading(true)
    const { data } = await supabase
      .from("user_reports")
      .select("*, reporter:user_profiles!reporter_id(display_name,avatar_url)")
      .order("created_at", { ascending: false })
      .limit(100)
    setReports(data || [])
    setLoading(false)
  }

  async function resolveReport(id: string, status: "resolved" | "dismissed") {
    await supabase.from("user_reports").update({ status }).eq("id", id)
    fetchReports()
  }

  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter)
  const pendingCount = reports.filter(r => r.status === "pending").length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Laporan Pengguna</h1>
          <p className="text-muted-foreground">{pendingCount} laporan menunggu review</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Selesai</SelectItem>
            <SelectItem value="dismissed">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Tidak ada laporan</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={r.status === "pending" ? "destructive" : r.status === "resolved" ? "default" : "secondary"}>
                        {r.status}
                      </Badge>
                      <Badge variant="outline">{r.reported_type === "user" ? <User className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}{r.reported_type}</Badge>
                      <span className="text-sm font-medium">{r.reason}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Reporter: {r.reporter?.display_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">Target ID: {r.reported_id?.slice(0, 8)}...</p>
                    {r.description && <p className="text-sm mt-2 p-2 bg-muted rounded">{r.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" onClick={() => resolveReport(r.id, "resolved")}><CheckCircle className="h-4 w-4 mr-1" /> Selesai</Button>
                      <Button size="sm" variant="outline" onClick={() => resolveReport(r.id, "dismissed")}><XCircle className="h-4 w-4 mr-1" /> Abaikan</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
