"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Shield, Ban, UserCheck, Search, Star } from "lucide-react"

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data: u } = await supabase
      .from("user_profiles")
      .select("id,display_name,avatar_url,level,xp_total,subscription,ktp_verified,is_banned,created_at")
      .order("created_at", { ascending: false })
      .limit(100)
    setUsers(u || [])

    const { data: r } = await supabase.from("user_roles").select("*")
    setRoles(r || [])
    setLoading(false)
  }

  async function toggleBan(userId: string, currentBan: boolean) {
    const action = currentBan ? "unban" : "ban"
    if (!confirm(`Yakin ${action} user ini?`)) return
    await supabase.from("user_profiles").update({ is_banned: !currentBan }).eq("id", userId)
    fetchUsers()
  }

  async function assignRole(userId: string, role: string) {
    const existing = roles.find(r => r.user_id === userId && r.role === role)
    if (existing) return alert("User sudah memiliki role ini")

    await supabase.from("user_roles").insert({ user_id: userId, role, status: "active" })
    fetchUsers()
  }

  async function removeRole(roleId: string) {
    await supabase.from("user_roles").delete().eq("id", roleId)
    fetchUsers()
  }

  function getUserRoles(userId: string) {
    return roles.filter(r => r.user_id === userId)
  }

  const filtered = users.filter(u =>
    !search || u.display_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manajemen User</h1>
          <p className="text-muted-foreground">{users.length} total user</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => {
            const userRoles = getUserRoles(u.id)
            return (
              <Card key={u.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full" /> : u.display_name?.[0] || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{u.display_name}</p>
                          {u.is_banned && <Badge variant="destructive">Banned</Badge>}
                          {u.ktp_verified && <Badge variant="outline" className="text-green-600">KTP</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Level {u.level}</span>
                          <span>{u.xp_total} XP</span>
                          <Badge variant="secondary" className="text-xs capitalize">{u.subscription}</Badge>
                          {userRoles.map(r => (
                            <Badge key={r.id} variant="outline" className="text-xs">
                              {r.role}
                              <button onClick={() => removeRole(r.id)} className="ml-1 text-red-500 hover:text-red-700">&times;</button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={role => assignRole(u.id, role)}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Tambah Role" /></SelectTrigger>
                        <SelectContent>
                          {["guide", "agency", "admin"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant={u.is_banned ? "outline" : "destructive"} onClick={() => toggleBan(u.id, u.is_banned)}>
                        <Ban className="h-4 w-4 mr-1" /> {u.is_banned ? "Unban" : "Ban"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
