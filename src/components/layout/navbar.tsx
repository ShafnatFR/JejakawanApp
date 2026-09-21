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
import { Compass, Menu, X, Trophy, MapPin, Users, User, Settings, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const { user, profile, setUser, setProfile, signOut } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

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
    }
  }, [user])

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
                <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        </div>
      )}
    </header>
  )
}