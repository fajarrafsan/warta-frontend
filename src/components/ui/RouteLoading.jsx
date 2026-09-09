export default function RouteLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg-primary px-6" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-11 rounded-full border-2 border-border">
          <span className="absolute inset-[-2px] animate-spin rounded-full border-2 border-transparent border-t-accent" />
        </div>
        <p className="text-sm font-medium text-text-secondary">Menyiapkan halaman...</p>
      </div>
    </div>
  )
}

