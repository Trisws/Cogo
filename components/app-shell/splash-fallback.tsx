export function SplashFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-brand-green to-brand-green-dark text-primary-foreground">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-white/15 text-4xl font-black tracking-tight backdrop-blur">
        Co
      </div>
      <div className="text-center">
        <p className="text-xl font-bold tracking-tight">CoGo</p>
        <p className="text-xs opacity-80">Share road · Share future</p>
      </div>
    </div>
  );
}
