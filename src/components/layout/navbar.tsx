"use client"

import Link from "next/link"
import { useAuthStore } from "@/stores/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Compass, Menu, X, Trophy, MapPin, Users, User, Settings, LogOut, MessageCircle, Bell, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const { user, profile, setUser, setProfile, signOut } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadChat, setUnreadChat] = useState(0)
  const [unreadNotif, setUnreadNotif] = useState(0)

  useEffect(() => {
    if (!user) return
    const timer = setTimeout(() => fetchUnreadCounts(), 1000)
    return () => clearTimeout(timer)
  }, [user?.id])

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
    <header className="sticky top-0 z-50 w-full bg-white/95 glass-nav border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
              Jejakawan
            </span>
          </Link>

          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button aria-label="Buka Pencarian Cepat" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" type="button">
            <Search className="w-5 h-5" />
          </button>

          {user ? (
            <>
              <Link href="/chat" aria-label="Pesan" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
                <MessageCircle className="w-5 h-5" />
                {unreadChat > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </Link>

              <button aria-label="Notifikasi" className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" type="button">
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                <Bell className="w-5 h-5" />
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-1 cursor-pointer" type="button">
                    <div className="relative">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-tr from-brand-600 to-indigo-400 text-white font-bold text-sm">
                          {profile?.display_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {profile?.display_name || "Traveler"}
                      </div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </div>
                  </button>
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
              <Link href="/login" className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Masuk</Link>
              <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm shadow-indigo-200 transition-colors">Daftar</Link>
            </div>
          )}

          <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 glass-nav p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          ))}
          {user && (
            <>
              <Link href="/chat" className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>
                <MessageCircle className="h-4 w-4" /> Pesan
              </Link>
              <Link href="/notifications" className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>
                <Bell className="h-4 w-4" /> Notifikasi
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
