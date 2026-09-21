"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Trash2, Image, CheckCircle } from "lucide-react"

export default function ContentPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [destinations, setDestinations] = useState<any[]>([])
  const [myContent, setMyContent] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ destination_id: "", caption: "", url: "" })

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    fetchData()
  }, [user])

  async function fetchData() {
    const supabase = createClient()
    const { data: dests } = await supabase.from("destinations").select("id,name,province").eq("is_active", true).order("name")
    setDestinations(dests || [])
    if (user) {
      const { data: content } = await supabase.from("user_content").select("*, destination:destinations(name,province)").eq("user_id", user.id).order("created_at", { ascending: false })
      setMyContent(content || [])
    }
  }

  async function uploadContent() {
    if (!user || !form.destination_id) return
    setUploading(true)
    const supabase = createClient()
    await supabase.from("user_content").insert({ user_id: user.id, destination_id: form.destination_id, type: "photo", url: form.url || "https://placehold.co/600x400", caption: form.caption })
    // Add XP for upload
    await supabase.from("user_xp_logs").insert({ user_id: user.id, action: "upload_content", xp_amount: 100, reference_type: "content" })
    setForm({ destination_id: "", caption: "", url: "" })
    setUploading(false)
    fetchData()
  }

  async function deleteContent(id: string) {
    const supabase = createClient()
    await supabase.from("user_content").delete().eq("id", id)
    fetchData()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Konten Saya</h1>
      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-1" /> Upload</TabsTrigger>
          <TabsTrigger value="gallery"><Image className="h-4 w-4 mr-1" /> Galeri ({myContent.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader><CardTitle>Upload Foto Destinasi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Destinasi</Label>
                <Select value={form.destination_id} onValueChange={v => setForm({...form, destination_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih destinasi" /></SelectTrigger>
                  <SelectContent>{destinations.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - {d.province}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL Foto (atau placeholder)</Label>
                <Input value={form.url} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." />
              </div>
              <div>
                <Label>Caption</Label>
                <Textarea value={form.caption} onChange={e => setForm({...form, caption: e.target.value})} placeholder="Ceritakan pengalamanmu..." />
              </div>
              <Button onClick={uploadContent} disabled={uploading || !form.destination_id} className="w-full">
                {uploading ? "Mengupload..." : "Upload (+100 XP)"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          {myContent.length === 0 ? (
            <div className="text-center py-12"><Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Belum ada konten. Upload foto pertamamu!</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {myContent.map((c: any) => (
                <Card key={c.id} className="overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-indigo-300 to-teal-300 flex items-center justify-center"><Camera className="h-8 w-8 text-white" /></div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{c.destination?.name || "Destinasi"}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.caption}</p>
                    <div className="flex items-center justify-between mt-2">
                      {c.is_verified ? <Badge className="text-xs"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge> : <Badge variant="outline" className="text-xs">Pending</Badge>}
                      <Button variant="ghost" size="icon" onClick={() => deleteContent(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}