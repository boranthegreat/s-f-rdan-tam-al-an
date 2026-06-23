"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 text-sm transition",
        isActive
          ? "border-mint/40 bg-mint/15 text-white shadow-[0_0_28px_rgba(94,234,212,0.12)]"
          : "border-line bg-white/5 text-slate-300 hover:border-mint/40 hover:bg-white/10 hover:text-white"
      )}
    >
      <span className="absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-mint to-transparent opacity-0 transition group-hover:opacity-100" />
      <Icon className={clsx("h-4 w-4", isActive ? "text-mint" : "text-slate-400 group-hover:text-mint")} />
      {label}
    </Link>
  );
}
