import { AlertTriangle } from "lucide-react";

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass-card flex items-center gap-3 border-rose-400/20 bg-rose-950/20 p-4 text-rose-100">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
