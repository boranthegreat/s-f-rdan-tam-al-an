"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { localizedHref } from "@/components/enhancements/locale";

export function LocalizedBrandLink({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  return (
    <Link href={localizedHref(pathname, "/")} aria-label="BoranTheGreat ana sayfasına dön" className={className}>
      {children}
    </Link>
  );
}
