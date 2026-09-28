"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, CheckCircle, XCircle, Eye, Image, FileText } from "lucide-react"

export default function AdminModerationPage() {
  const supabase = createClient()
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchContent() }, [])

  async function fetchContent() {
    setLoading(true)
    const { data } = await supabase
      .from("user_content")
      .select("*, user:user_profiles(display_name,avatar_url), destination:destinations(name)")
      .eq("is_verified", false)
      .order("created_at", { ascending: false })
      .limit(50)
    setContent(data || [])
    setLoading(false)
  }

  async function approveContent(id: string) {
    await supabase.from("user_content").update({ is_verified: true }).eq("id", id)
    fetchContent()
  }

  async function rejectContent(id: string) {
    await supabase.from("user_content").delete().eq("id", id)
    fetchContent()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Moderasi Konten</h1>
        <p className="text-muted-foreground">Review konten yang dikirim pengguna</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}</div>
      ) : content.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">Tidak ada konten untuk dimoderasi</h3>
          <p className="text-muted-foreground">Semua konten sudah diproses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {content.map(c => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{c.type}</Badge>
                      <span className="text-sm font-medium">{c.user?.display_name || "Anonim"}</span>
                      {c.destination && <span className="text-sm text-muted-foreground">&bull; {c.destination.name}</span>}
                    </div>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline flex items-center gap-1 mb-2">
                        <Eye className="h-3 w-3" /> Lihat Konten
                      </a>
                    )}
                    {c.caption && <p className="text-sm text-muted-foreground">{c.caption}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" onClick={() => approveContent(c.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Setujui
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectContent(c.id)}>
                      <XCircle className="h-4 w-4 mr-1" /> Tolak
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
