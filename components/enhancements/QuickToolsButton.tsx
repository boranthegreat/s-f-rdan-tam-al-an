"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, localizedHref } from "@/components/enhancements/locale";

const labels = {
  tr: "Araçlar",
  en: "Tools",
  el: "Εργαλεία"
} as const;

export function QuickToolsButton() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  return (
    <Link
      href={localizedHref(pathname, "/tools")}
      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-mint/25 bg-mint/10 px-3 py-2 text-sm font-semibold text-mint transition hover:border-mint/50 hover:bg-mint/15"
    >
      <Calculator className="h-4 w-4" aria-hidden="true" />
      <span>{labels[locale]}</span>
    </Link>
  );
}
