import type { Metadata } from "next";
import { AlertWizard } from "@/components/enhancements/AlertWizard";
import { FinanceCalculatorHub } from "@/components/enhancements/FinanceCalculatorHub";
import { PageHero } from "@/components/enhancements/PageHero";
import { ShareCardGenerator } from "@/components/enhancements/ShareCardGenerator";

export const metadata: Metadata = { title: "Finans Araçları | BoranTheGreat", description: "BoranTheGreat finans hesaplama ve paylaşım araçları." };
export default function Page() { return <div className="space-y-6"><PageHero eyebrow="BoranTheGreat Lab" title="Hesapla, planla ve paylaş." description="Finans hesaplamaları, kolay alarm taslağı ve paylaşım kartı tek ekranda." /><FinanceCalculatorHub /><AlertWizard /><ShareCardGenerator /></div>; }
