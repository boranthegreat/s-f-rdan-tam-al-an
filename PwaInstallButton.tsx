"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const handler = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone || (!prompt && !isIos)) return null;

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setIsStandalone(true);
      setPrompt(null);
      return;
    }
    if (isIos) setShowIosHint((value) => !value);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void install()}
        className="flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white/5 px-3 text-xs font-bold text-slate-200 transition hover:border-mint/35 hover:bg-white/10"
        title="Uygulama olarak yükle"
      >
        {prompt ? <Download className="h-4 w-4 text-mint" /> : <Smartphone className="h-4 w-4" />}
        <span className="hidden sm:inline">Uygulamayı yükle</span>
      </button>
      {showIosHint ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl border border-line bg-slate-950/95 p-3 text-xs leading-5 text-slate-300 shadow-2xl">
          Safari’de Paylaş düğmesine, ardından “Ana Ekrana Ekle” seçeneğine bas.
        </div>
      ) : null}
    </div>
  );
}
