"use client"

import Link from "next/link"
import { useAuthStore } from "@/stores/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Compass, Menu, X, Trophy, MapPin, Users, User, Settings, LogOut, MessageCircle, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const { user, profile, setUser, setProfile, signOut } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadChat, setUnreadChat] = useState(0)
  const [unreadNotif, setUnreadNotif] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    if (user) {
      useAuthStore.getState().fetchProfile()
      fetchUnreadCounts()
    }
  }, [user])

  async function fetchUnreadCounts() {
    if (!user) return
    const supabase = createClient()
    const { count: notifCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null)
    setUnreadNotif(notifCount || 0)

    const { data: memberships } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", user.id)
    if (memberships && memberships.length > 0) {
      const roomIds = memberships.map((m) => m.room_id)
      const { count: chatCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .in("room_id", roomIds)
        .neq("sender_id", user.id)
      setUnreadChat(chatCount || 0)
    }
  }

  const navLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/explore", label: "Explore", icon: MapPin },
    { href: "/match", label: "Trip Match", icon: Users },
    { href: "/open-trips", label: "Open Trip", icon: MapPin },
    { href: "/gamification", label: "Gamifikasi", icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Compass className="h-6 w-6" />
          Jejakawan
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/chat">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                  {unreadChat > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                      {unreadChat > 9 ? "9+" : unreadChat}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotif > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {unreadNotif > 9 ? "9+" : unreadNotif}
                    </span>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback>{profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{profile?.display_name || "Traveler"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/discover" className="flex items-center gap-2"><Compass className="h-4 w-4" /> Discover</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><User className="h-4 w-4" /> Profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/gamification" className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Gamifikasi</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/chat" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Pesan</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/notifications" className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifikasi</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
            ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">Masuk</Button></Link>
              <Link href="/register"><Button size="sm">Daftar</Button></Link>
            </div>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-2 text-sm font-medium p-2 rounded hover:bg-muted" onClick={() => setMobileOpen(false)}>
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link href="/chat" className="flex items-center gap-2 text-sm font-medium p-2 rounded hover:bg-muted" onClick={() => setMobileOpen(false)}>
                <MessageCircle className="h-4 w-4" /> Pesan
              </Link>
              <Link href="/notifications" className="flex items-center gap-2 text-sm font-medium p-2 rounded hover:bg-muted" onClick={() => setMobileOpen(false)}>
                <Bell className="h-4 w-4" /> Notifikasi
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}