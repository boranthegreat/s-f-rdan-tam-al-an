import Link from "next/link";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { AutoSlitherStage } from "@/components/AutoSlitherStage";
import { CommandPalette } from "@/components/CommandPalette";
import { CursorEffects } from "@/components/CursorEffects";
import { FloatingTips } from "@/components/FloatingTips";
import { Navigation } from "@/components/Navigation";
import { ThemePicker } from "@/components/ThemePicker";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <CursorEffects />
      <header className="sticky top-0 z-30 border-b border-line bg-ink/75 shadow-[0_10px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Link
              href="https://instagram.com/boranthegreat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BoranTheGreat Instagram hesabını aç"
              className="group"
            >
              <div className="flex items-center gap-4">
                <span className="brand-mark">
                  <span className="brand-mark-grid" />
                  <span className="brand-crown">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="brand-chart-line" />
                  <span className="brand-monogram">BTG</span>
                  <span className="brand-mark-line" />
                </span>
                <div>
                  <div className="brand-title">
                    <span className="brand-title-main">Boran</span>
                    <span className="brand-title-accent">TheGreat</span>
                  </div>
                  <div className="brand-subtitle">Küresel Piyasalar ve Hava Radarı</div>
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-3 xl:items-end">
              <ThemePicker />
              <Navigation />
            </div>
          </div>

          <AutoSlitherStage />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <FloatingTips />
      <CommandPalette />
      <AIAssistantWidget />

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">
        <div className="glass-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span>Finansal veriler bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.</span>
          <span className="text-mint/80">BoranTheGreat Piyasa Radarı</span>
        </div>
      </footer>
    </div>
  );
}
