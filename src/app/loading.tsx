export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-teal-500">
      <div className="text-center text-white">
        <div className="animate-spin h-16 w-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Jejakawan</h1>
        <p className="text-white/70 text-sm mt-1">Memuat petualangan...</p>
      </div>
    </div>
  )
}