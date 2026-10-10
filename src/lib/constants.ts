// Shared configuration constants for JejakawanApp
// Centralizes hardcoded static data to avoid duplication across files.

// --- Onboarding & Profile ---

export const INTERESTS = [
  "Pantai", "Gunung", "Air Terjun", "Danau", "Hutan", "Desa Wisata",
  "Kuliner", "Sejarah", "Budaya", "Snorkeling", "Diving", "Hiking",
  "Camping", "Fotografi", "Sunrise", "Sunset", "Wildlife", "Festival",
]

export const INTEREST_OPTIONS = [
  { id: "alam", label: "Alam" },
  { id: "pantai", label: "Pantai" },
  { id: "budaya", label: "Budaya" },
  { id: "kuliner", label: "Kuliner" },
  { id: "gunung", label: "Gunung" },
  { id: "air_terjun", label: "Air Terjun" },
  { id: "gua", label: "Gua" },
  { id: "sejarah", label: "Sejarah" },
  { id: "adventure", label: "Adventure" },
  { id: "foto", label: "Foto" },
  { id: "diving", label: "Diving" },
  { id: "camping", label: "Camping" },
]

export const TRANSPORT_MODES = ["Motor", "Mobil", "Bus", "Kereta", "Kapal", "Pesawat"]

export const PERSONAS = [
  { value: "solo", emoji: "🧭", label: "Solo Backpacker" },
  { value: "hidden-gems", emoji: "💎", label: "Hidden Gems" },
  { value: "nature", emoji: "🌲", label: "Alam & Pendaki" },
  { value: "culinary", emoji: "🍲", label: "Kuliner Autentik" },
  { value: "roadtrip", emoji: "🚗", label: "Road Tripper" },
  { value: "relaxed", emoji: "🏖️", label: "Santai & Resort" },
]

export const QUICK_CITIES = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali"]

export const STEP_LABELS = ["Identitas & Asal", "Minat Wisata", "Preferensi Perjalanan"]

// --- Landing Page Marketing ---

export const LANDING_FEATURES = [
  { icon: "\u{1F9ED}", title: "Rekomendasi Personal", desc: "Temukan destinasi yang sesuai minat dan budget kamu." },
  { icon: "\u{1F91D}", title: "Trip Matching", desc: "Cari teman perjalanan yang kompatibel dan seru." },
  { icon: "\u{1F6E1}\uFE0F", title: "Keamanan & Kepercayaan", desc: "Verifikasi KTP, trust score, dan sistem laporan." },
  { icon: "\u{1F3C6}", title: "Gamifikasi", desc: "Kumpulkan XP, badge, dan selesaikan misi seru." },
  { icon: "\u{1F4CD}", title: "Destinasi Tersembunyi", desc: "Jelajahi 50+ spot underrated di seluruh Indonesia." },
  { icon: "\u2B50", title: "Open Trip & Marketplace", desc: "Temukan dan booking open trip dari agen terpercaya." },
]

export const LANDING_STEPS = [
  { num: "1", title: "Buat Profil", desc: "Daftar gratis dan personalisasi minat petualanganmu." },
  { num: "2", title: "Temukan Destinasi", desc: "Jelajahi rekomendasi yang dipersonalisasi untukmu." },
  { num: "3", title: "Trip Match", desc: "Temukan teman perjalanan yang kompatibel." },
  { num: "4", title: "Berpetualang!", desc: "Nikmati perjalanan dan kumpulkan badge." },
]

export const GEM_FILTERS = [
  { label: "Semua", active: true },
  { label: "Pantai", active: false },
  { label: "Gunung", active: false },
  { label: "Hidden Spot", active: false },
  { label: "Budaya", active: false },
]

export const LANDING_FAQS = [
  {
    q: "Apa itu Jejakawan?",
    a: "Jejakawan adalah platform travel komunitas Indonesia yang menghubungkan traveler untuk menemukan destinasi tersembunyi, mencari teman perjalanan, dan mengumpulkan pengalaman unik melalui sistem gamifikasi.",
  },
  {
    q: "Apakah Jejakawan gratis?",
    a: "Ya! Pendaftaran dan fitur dasar Jejakawan sepenuhnya gratis. Kami juga menawarkan paket Premium dengan fitur tambahan seperti rekomendasi unlimited dan priority matching.",
  },
  {
    q: "Bagaimana Trip Matching bekerja?",
    a: "Sistem kami menganalisis minat, budget, dan gaya traveling kamu untuk mencocokkan dengan traveler lain yang kompatibel. Kamu bisa melihat profil mereka sebelum memutuskan untuk join trip.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Keamanan data adalah prioritas utama kami. Kami menggunakan enkripsi end-to-end, verifikasi KTP opsional, dan sistem trust score untuk menjaga komunitas tetap aman dan terpercaya.",
  },
]

export const GAMIFICATION_TIERS = [
  { name: "Explorer", range: "Level 1 \u2013 10", color: "from-emerald-500 to-emerald-600", border: "border-emerald-200", badgeBg: "bg-emerald-100 text-emerald-600", perks: ["Badge Pemula", "3 Rekomendasi/hari", "Trip Matching Basic"] },
  { name: "Pathfinder", range: "Level 11 \u2013 25", color: "from-brand-500 to-brand-600", border: "border-brand-200", badgeBg: "bg-brand-100 text-brand-600", perks: ["Badge Premium", "Rekomendasi Unlimited", "Priority Matching", "Profile Highlight"], popular: true },
  { name: "Legend", range: "Level 26+", color: "from-amber-500 to-amber-600", border: "border-amber-200", badgeBg: "bg-amber-100 text-amber-600", perks: ["Semua fitur Pathfinder", "Trip Organizer Badge", "Wall of Fame", "VIP Event Access"] },
]

export const LANDING_TESTIMONIALS = [
  { text: "Menemukan teman trip ke Labuan Bajo dalam 2 hari lewat Jejakawan. Pengalaman berlibur terbaik yang pernah saya rasakan!", name: "Rian F.", origin: "Bandung", tag: "Trip Match Traveler", avatar: "RF", color: "bg-brand-600" },
  { text: "Berkat fitur gamifikasi, saya jadi semangat explore tempat-tempat baru. Sekarang sudah dapat 12 badge dan level 5!", name: "Sari W.", origin: "Surabaya", tag: "Explorer Level 5", avatar: "SW", color: "bg-emerald-600" },
  { text: "Open trip ke Raja Ampat yang saya posting langsung full dalam 3 hari. Marketplace Jejakawan luar biasa!", name: "Budi P.", origin: "Jakarta", tag: "Trip Organizer", avatar: "BP", color: "bg-amber-600" },
]

export const LANDING_BADGES = [
  { icon: "MountainSnow", color: "bg-emerald-100 text-emerald-600", label: "Peak Climber" },
  { icon: "Waves", color: "bg-sky-100 text-sky-600", label: "Ocean Explorer" },
  { icon: "TreePine", color: "bg-green-100 text-green-700", label: "Jungle Trekker" },
  { icon: "Gem", color: "bg-purple-100 text-purple-600", label: "Gem Hunter" },
  { icon: "Camera", color: "bg-amber-100 text-amber-600", label: "Shutterbug" },
  { icon: "Flame", color: "bg-red-100 text-red-600", label: "Fire Starter" },
]

// --- Destinations ---

export const DESTINATION_CATEGORIES = ["alam", "pantai", "budaya", "kuliner", "gunung", "air_terjun", "gua", "sejarah"]

export const PROVINCES = ["Jawa Barat", "Jawa Tengah", "Jawa Timur", "DIY", "Bali"]

// --- Content ---

export const CONTENT_TAGS = ["#SpotSunrise", "#HiddenSpot", "#AmanUntukSolo", "#BudgetFriendly", "#AestheticPhoto"]

// --- Safety / Reporting ---

export const REPORT_REASONS = [
  { value: "spam", label: "Spam atau iklan" },
  { value: "inappropriate", label: "Konten tidak pantas" },
  { value: "fake", label: "Informasi palsu" },
  { value: "harassment", label: "Pelecehan atau intimidasi" },
  { value: "scam", label: "Penipuan" },
  { value: "other", label: "Lainnya" },
]

// --- Donations ---

export const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 1000000]

export const DONATION_TIERS = [
  { name: "Bronze", min: 10000, color: "amber", xp: "+50 XP", perk: "Supporter" },
  { name: "Silver", min: 50000, color: "indigo", xp: "+250 XP", perk: "Diskusi Privat", popular: true },
  { name: "Gold", min: 200000, color: "yellow", xp: "+1.000 XP", perk: "Merchandise" },
  { name: "Platinum", min: 500000, color: "purple", xp: "+3.000 XP", perk: "Wall of Fame" },
]

export const SETTINGS_TABS = [
  { id: "profile", label: "Profil" },
  { id: "notifications", label: "Notifikasi" },
  { id: "safety", label: "Keamanan" },
  { id: "subscription", label: "Langganan" },
]

export const GAMIFICATION_FILTERS = [
  { id: "gunung", label: "Gunung & Dataran Tinggi" },
  { id: "pantai", label: "Pantai & Laut" },
  { id: "hidden", label: "Hidden Gem" },
  { id: "komunitas", label: "Komunitas Jejakawan" },
]

// --- Chat ---

export const AVATAR_COLORS = [
  "bg-indigo-100 text-brand-600",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
]

export const QUICK_REPLIES = [
  "Siap, sudah dipacking! 👍",
  "Mau share lokasi sekarang?",
  "Berapa split bill logistik?",
]

export const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/explore", label: "Explore" },
  { href: "/match", label: "Trip Match" },
  { href: "/open-trips", label: "Open Trip" },
  { href: "/gamification", label: "Gamifikasi" },
]

// --- Gamification ---

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000]

export const XP_FOR_NEXT_LEVEL = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000, 999999]

// --- Subscription ---

export const SUBSCRIPTION_PLANS = [
  { name: "Free", price: "Rp 0", period: "Selamanya", features: ["3 rekomendasi/hari", "Trip matching", "Iklan ditampilkan", "XP 1x multiplier"], color: "border-gray-200" },
  { name: "Weekly", price: "Rp 9.900", period: "/minggu", features: ["10 rekomendasi/hari", "Bebas iklan", "XP 1.5x multiplier"], color: "border-blue-200" },
  { name: "Monthly", price: "Rp 29.000", period: "/bulan", features: ["Rekomendasi unlimited", "Priority matching", "Filter partner detail", "XP 1.5x multiplier", "Bebas iklan"], color: "border-primary", popular: true },
  { name: "Exclusive", price: "Rp 299.000", period: "/tahun", features: ["Semua fitur Monthly", "Early access open trip", "Diskon 5% partner travel", "XP 2x multiplier", "Badge premium"], color: "border-amber-300" },
]