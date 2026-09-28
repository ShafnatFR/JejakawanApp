"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Plus, Users, Calculator } from "lucide-react"

interface Expense {
  id: string
  description: string
  amount: number
  paid_by: string
  split_among: number
  created_at: string
  payer_name?: string
}

export default function TripExpensesPage() {
  const params = useParams()
  const tripId = params.id as string
  const { user } = useAuthStore()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ description: "", amount: "", split_among: "all" })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [tripId])

  async function fetchData() {
    const supabase = createClient()
    const { data: group } = await supabase
      .from("trip_groups")
      .select("id, members:trip_group_members(user_id, user:user_profiles(display_name))")
      .eq("trip_request_id", tripId)
      .single()

    if (group) {
      setMembers(group.members || [])
    }
    setLoading(false)
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const perPerson = members.length > 0 ? Math.ceil(totalExpenses / members.length) : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Split Bill</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Tambah
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card><CardContent className="p-4 text-center">
          <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold">Rp{totalExpenses.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold">{members.length}</p>
          <p className="text-xs text-muted-foreground">Anggota</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Calculator className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold">Rp{perPerson.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground">Per Orang</p>
        </CardContent></Card>
      </div>

      {/* Add expense form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <div><Label>Deskripsi</Label><Input placeholder="Makan siang" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div><Label>Nominal (Rp)</Label><Input type="number" placeholder="150000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
            <Button className="w-full" onClick={() => setShowForm(false)}>Simpan</Button>
          </CardContent>
        </Card>
      )}

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada pengeluaran. Tambah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(e => (
            <Card key={e.id}><CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{e.description}</p>
                <p className="text-sm text-muted-foreground">Dibayar {e.payer_name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Rp{e.amount.toLocaleString("id-ID")}</p>
                <p className="text-xs text-muted-foreground">÷{e.split_among} = Rp{Math.ceil(e.amount / e.split_among).toLocaleString("id-ID")}/org</p>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  )
}
