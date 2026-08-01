import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-xl py-20">
      <div className="glass-card p-8 text-center">
        <WifiOff className="mx-auto h-12 w-12 text-mint" />
        <h1 className="mt-5 text-3xl font-black text-white">Şu anda çevrimdışısın</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Bağlantı geri geldiğinde canlı piyasa ve hava verileri otomatik olarak yenilenecek.</p>
      </div>
    </div>
  );
}
