"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, localizedHref } from "@/components/enhancements/locale";

const text = {
  tr: {
    tools: "Finans Araçları",
    guide: "Finans Rehberi",
    sources: "Veri Kaynakları",
    privacy: "Gizlilik",
    terms: "Kullanım Şartları",
    contact: "İletişim"
  },
  en: {
    tools: "Finance Tools",
    guide: "Finance Guide",
    sources: "Data Sources",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact"
  },
  el: {
    tools: "Οικονομικά εργαλεία",
    guide: "Οδηγός οικονομικών",
    sources: "Πηγές δεδομένων",
    privacy: "Απόρρητο",
    terms: "Όροι χρήσης",
    contact: "Επικοινωνία"
  }
} as const;

export function FooterUpgradeLinks() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const labels = text[locale];
  const links = [
    ["/tools", labels.tools],
    ["/guide", labels.guide],
    ["/data-sources", labels.sources],
    ["/privacy", labels.privacy],
    ["/terms", labels.terms],
    ["/contact", labels.contact]
  ] as const;

  return (
    <nav aria-label="Alt bilgi bağlantıları" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-3">
      {links.map(([href, label]) => (
        <Link key={href} href={localizedHref(pathname, href)} className="transition hover:text-mint">
          {label}
        </Link>
      ))}
      <a
        href="https://instagram.com/boranthegreat"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-mint"
      >
        Instagram
      </a>
    </nav>
  );
}
