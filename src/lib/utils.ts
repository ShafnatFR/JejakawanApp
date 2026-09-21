import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function getLevelFromXP(xp: number): number {
  if (xp < 100) return 1
  if (xp < 300) return 2
  if (xp < 600) return 3
  if (xp < 1000) return 4
  if (xp < 1500) return 5
  if (xp < 2500) return 6
  if (xp < 4000) return 7
  if (xp < 6000) return 8
  if (xp < 10000) return 9
  return 10
}

export function getXPForNextLevel(level: number): number {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000, 999999]
  return thresholds[level] || 999999
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function formatXP(xp: number): string {
  if (xp >= 10000) return `${(xp / 1000).toFixed(0)}K`
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`
  return xp.toString()
}

export function getLevelThreshold(level: number): number {
  const thresholds = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000]
  return thresholds[level - 1] ?? 0
}

export function getTrustScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500'
  if (score >= 50) return 'text-blue-500'
  if (score >= 30) return 'text-yellow-500'
  return 'text-red-500'
}

export function getCompatibilityColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 60) return 'text-blue-600 bg-blue-50'
  if (score >= 40) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}
