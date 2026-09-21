"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MapPin, AlertTriangle, TrendingUp, Shield, Eye, Ban, CheckCircle } from "lucide-react"

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, destinations: 0, trips: 0, reports: 0, missions: 0 })
  const [reports, setReports] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAdminData() }, [])

  async function fetchAdminData() {
    const supabase = createClient()
    const [usersRes, destRes, tripsRes, reportsRes, missionsRes] = await Promise.all([
      supabase.from("user_profiles").select("id,display_name,email:xp_total,level,subscription,ktp_verified,is_banned,created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("destinations").select("id,name,province,is_underrated,rating_avg,visit_count,is_active").order("visit_count", { ascending: false }).limit(50),
      supabase.from("trip_requests").select("id", { count: "exact", head: true }),
      supabase.from("user_reports").select("*, reporter:user_profiles!reporter_id(display_name)").order("created_at", { ascending: false }).limit(20),
      supabase.from("missions").select("id", { count: "exact", head: true }),
    ])

    const userCount = await supabase.from("user_profiles").select("id", { count: "exact", head: true })
    const destCount = await supabase.from("destinations").select("id", { count: "exact", head: true })

    setStats({
      users: userCount.count || 0,
      destinations: destCount.count || 0,
      trips: tripsRes.count || 0,
      reports: reportsRes.data?.length || 0,
      missions: missionsRes.count || 0,
    })
    setUsers(usersRes.data || [])
    setDestinations(destRes.data || [])
    setReports(reportsRes.data || [])
    setLoading(false)
  }

  async function handleReport(reportId: string, action: "resolved" | "dismissed") {
    const supabase = createClient()
    await supabase.from("user_reports").update({ status: action }).eq("id", reportId)
    fetchAdminData()
  }

  async function toggleBan(userId: string, currentBan: boolean) {
    const supabase = createClient()
    await supabase.from("user_profiles").update({ is_banned: !currentBan }).eq("id", userId)
    fetchAdminData()
  }

  async function toggleDestActive(destId: string, current: boolean) {
    const supabase = createClient()
    await supabase.from("destinations").update({ is_active: !current }).eq("id", destId)
    fetchAdminData()
  }

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Users", value: stats.users, icon: Users, color: "text-blue-500" },
          { label: "Destinations", value: stats.destinations, icon: MapPin, color: "text-green-500" },
          { label: "Trip Requests", value: stats.trips, icon: TrendingUp, color: "text-purple-500" },
          { label: "Reports", value: stats.reports, icon: AlertTriangle, color: "text-red-500" },
          { label: "Missions", value: stats.missions, icon: Shield, color: "text-amber-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports"><AlertTriangle className="h-4 w-4 mr-1" /> Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
          <TabsTrigger value="destinations"><MapPin className="h-4 w-4 mr-1" /> Destinations</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader><CardTitle>Laporan User</CardTitle></CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Tidak ada laporan.</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((r: any) => (
                    <div key={r.id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={r.status === "pending" ? "destructive" : r.status === "resolved" ? "default" : "secondary"}>{r.status}</Badge>
                          <span className="text-sm font-medium">{r.reason}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Reporter: {r.reporter?.display_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">Target: {r.reported_type} ({r.reported_id?.slice(0, 8)}...)</p>
                        {r.description && <p className="text-sm mt-1">{r.description}</p>}
                      </div>
                      {r.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" onClick={() => handleReport(r.id, "resolved")}><CheckCircle className="h-4 w-4 mr-1" /> Resolve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReport(r.id, "dismissed")}>Dismiss</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Manajemen User</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">{u.display_name?.[0] || "?"}</div>
                      <div>
                        <p className="font-medium">{u.display_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Level {u.level}</span>
                          <span>{u.xp_total} XP</span>
                          <Badge variant="outline" className="text-xs capitalize">{u.subscription}</Badge>
                          {u.ktp_verified && <Badge variant="outline" className="text-xs text-green-600">KTP</Badge>}
                          {u.is_banned && <Badge variant="destructive" className="text-xs">Banned</Badge>}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant={u.is_banned ? "outline" : "destructive"} onClick={() => toggleBan(u.id, u.is_banned)}>
                      <Ban className="h-4 w-4 mr-1" /> {u.is_banned ? "Unban" : "Ban"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destinations">
          <Card>
            <CardHeader><CardTitle>Manajemen Destinasi</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {destinations.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{d.province}</span>
                        <span>{d.rating_avg?.toFixed(1)} rating</span>
                        <span>{d.visit_count} visits</span>
                        {d.is_underrated && <Badge variant="secondary" className="text-xs">Underrated</Badge>}
                        {!d.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleDestActive(d.id, d.is_active)}>
                      <Eye className="h-4 w-4 mr-1" /> {d.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}