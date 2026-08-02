"use client";

import { usePathname } from "next/navigation";
import { Download, Image as ImageIcon, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { getLocaleFromPath } from "@/components/enhancements/locale";

const copy = {
  tr: {
    title: "Paylaşılabilir Piyasa Kartı",
    description: "Bir fiyat ve değişim değeri gir; Instagram hikâyesi veya X paylaşımı için markalı PNG oluştur.",
    asset: "Varlık adı",
    price: "Fiyat",
    change: "Değişim (%)",
    note: "Kısa not",
    notePlaceholder: "Piyasa takibim",
    generate: "Kartı oluştur",
    download: "PNG indir",
    preview: "Önizleme",
    disclaimer: "Bilgilendirme amaçlıdır · Yatırım tavsiyesi değildir"
  },
  en: {
    title: "Shareable Market Card",
    description: "Enter a price and change value to create a branded PNG for Instagram Stories or X.",
    asset: "Asset name",
    price: "Price",
    change: "Change (%)",
    note: "Short note",
    notePlaceholder: "My market watch",
    generate: "Generate card",
    download: "Download PNG",
    preview: "Preview",
    disclaimer: "For information only · Not investment advice"
  },
  el: {
    title: "Κάρτα αγοράς για κοινοποίηση",
    description: "Βάλε τιμή και ποσοστό μεταβολής για να δημιουργήσεις επώνυμο PNG για Instagram Stories ή X.",
    asset: "Όνομα στοιχείου",
    price: "Τιμή",
    change: "Μεταβολή (%)",
    note: "Σύντομη σημείωση",
    notePlaceholder: "Η παρακολούθηση αγοράς μου",
    generate: "Δημιουργία κάρτας",
    download: "Λήψη PNG",
    preview: "Προεπισκόπηση",
    disclaimer: "Μόνο για ενημέρωση · Δεν αποτελεί επενδυτική συμβουλή"
  }
} as const;

export function ShareCardGenerator() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = copy[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [asset, setAsset] = useState("Bitcoin");
  const [price, setPrice] = useState("$118,240");
  const [change, setChange] = useState(2.8);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#07111f");
    gradient.addColorStop(0.55, "#0f172a");
    gradient.addColorStop(1, "#022c22");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 0.24;
    context.fillStyle = "#5eead4";
    context.beginPath();
    context.arc(900, 150, 300, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    context.strokeStyle = "rgba(94,234,212,0.22)";
    context.lineWidth = 2;
    for (let x = 80; x < width; x += 80) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
    }
    for (let y = 80; y < height; y += 80) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
    }

    context.fillStyle = "#5eead4";
    context.font = "700 34px Arial";
    context.fillText("BORANTHEGREAT.XYZ", 90, 115);

    context.fillStyle = "rgba(255,255,255,0.68)";
    context.font = "600 25px Arial";
    context.fillText(new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : locale === "el" ? "el-GR" : "en-US"), 90, 170);

    context.fillStyle = "#ffffff";
    context.font = "900 78px Arial";
    context.fillText(asset.slice(0, 20), 90, 490);

    context.font = "900 116px Arial";
    context.fillText(price.slice(0, 18), 90, 650);

    const changeText = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
    context.fillStyle = change >= 0 ? "#6ee7b7" : "#fda4af";
    context.font = "900 64px Arial";
    context.fillText(changeText, 90, 760);

    context.fillStyle = "rgba(255,255,255,0.82)";
    context.font = "500 32px Arial";
    context.fillText((note || t.notePlaceholder).slice(0, 45), 90, 890);

    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.beginPath(); context.moveTo(90, 1050); context.lineTo(990, 1050); context.stroke();

    context.fillStyle = "rgba(255,255,255,0.62)";
    context.font = "500 24px Arial";
    context.fillText(t.disclaimer, 90, 1120);
    context.fillStyle = "#5eead4";
    context.font = "800 30px Arial";
    context.fillText("boranthegreat.xyz", 90, 1210);

    setReady(true);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ready) drawCard();
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.download = `boranthegreat-${asset.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "market"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, 0);
  };

  return (
    <section id="share-card" className="scroll-mt-28 rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl border border-mint/20 bg-mint/10 p-3 text-mint"><Share2 className="h-6 w-6" /></span>
        <div>
          <h2 className="text-2xl font-black text-white">{t.title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">{t.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <label className="text-sm font-semibold text-slate-300">{t.asset}<input value={asset} onChange={(event) => { setAsset(event.target.value); setReady(false); }} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-mint/60" /></label>
          <label className="text-sm font-semibold text-slate-300">{t.price}<input value={price} onChange={(event) => { setPrice(event.target.value); setReady(false); }} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-mint/60" /></label>
          <label className="text-sm font-semibold text-slate-300">{t.change}<input type="number" step="any" value={change} onChange={(event) => { setChange(Number(event.target.value)); setReady(false); }} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-mint/60" /></label>
          <label className="text-sm font-semibold text-slate-300">{t.note}<input value={note} onChange={(event) => { setNote(event.target.value); setReady(false); }} placeholder={t.notePlaceholder} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-600 focus:border-mint/60" /></label>
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1 sm:flex-row lg:flex-col xl:flex-row">
            <button type="button" onClick={drawCard} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 font-black text-slate-950 transition hover:brightness-110"><ImageIcon className="h-4 w-4" />{t.generate}</button>
            <button type="button" onClick={download} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white transition hover:border-mint/30 hover:text-mint"><Download className="h-4 w-4" />{t.download}</button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{t.preview}</p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2">
            <canvas ref={canvasRef} aria-label={t.preview} className="aspect-[4/5] w-full rounded-xl bg-slate-950" />
          </div>
        </div>
      </div>
    </section>
  );
}
