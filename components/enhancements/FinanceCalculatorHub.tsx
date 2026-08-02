"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Banknote, Calculator, CreditCard, Landmark, PiggyBank, Scale, TrendingUp } from "lucide-react";
import { getLocaleFromPath, type BtgLocale } from "@/components/enhancements/locale";

type ToolKey = "deposit" | "compound" | "goal" | "fx" | "inflation" | "card" | "gold";

const translations = {
  tr: {
    title: "Finans Hesaplama Merkezi",
    description: "Mevduat, bileşik getiri, birikim hedefi, kur kârı, enflasyon ve kart faizini tek yerde yaklaşık olarak hesapla.",
    disclaimer: "Sonuçlar yaklaşık ve bilgilendirme amaçlıdır. Banka, vergi, fon, kesinti ve yuvarlama kuralları gerçek sonucu değiştirebilir.",
    calculate: "Sonuç",
    principal: "Ana para",
    annualRate: "Yıllık brüt oran (%)",
    days: "Gün",
    withholding: "Stopaj (%)",
    gross: "Brüt kazanç",
    net: "Net kazanç",
    final: "Vade sonu toplam",
    months: "Ay",
    monthlyContribution: "Aylık ekleme",
    target: "Hedef tutar",
    estimatedMonths: "Tahmini süre",
    buyRate: "Alış fiyatı",
    sellRate: "Güncel/satış fiyatı",
    quantity: "Miktar",
    profit: "Kâr / zarar",
    futureValue: "Gelecekteki tutar",
    inflation: "Yıllık enflasyon (%)",
    years: "Yıl",
    realValue: "Bugünkü satın alma gücü",
    balance: "Kart borcu",
    monthlyRate: "Aylık faiz (%)",
    estimatedInterest: "Yaklaşık bir aylık faiz",
    grams: "Gram",
    cost: "Toplam maliyet",
    currentValue: "Güncel değer",
    deposit: "Mevduat",
    compound: "Bileşik getiri",
    goal: "Birikim hedefi",
    fx: "Döviz kârı",
    inflationTool: "Enflasyon",
    card: "Kart faizi",
    gold: "Altın maliyeti",
    unreachable: "Bu girdilerle hedefe ulaşma süresi hesaplanamadı.",
    monthSuffix: "ay"
  },
  en: {
    title: "Finance Calculator Center",
    description: "Estimate deposits, compound growth, savings goals, FX profit, inflation and card interest in one place.",
    disclaimer: "Results are estimates for information only. Bank, tax, fee and rounding rules can change the actual result.",
    calculate: "Result",
    principal: "Principal",
    annualRate: "Annual gross rate (%)",
    days: "Days",
    withholding: "Withholding tax (%)",
    gross: "Gross return",
    net: "Net return",
    final: "Final amount",
    months: "Months",
    monthlyContribution: "Monthly contribution",
    target: "Target amount",
    estimatedMonths: "Estimated time",
    buyRate: "Buy price",
    sellRate: "Current/sell price",
    quantity: "Quantity",
    profit: "Profit / loss",
    futureValue: "Future amount",
    inflation: "Annual inflation (%)",
    years: "Years",
    realValue: "Present purchasing power",
    balance: "Card balance",
    monthlyRate: "Monthly rate (%)",
    estimatedInterest: "Estimated one-month interest",
    grams: "Grams",
    cost: "Total cost",
    currentValue: "Current value",
    deposit: "Deposit",
    compound: "Compound growth",
    goal: "Savings goal",
    fx: "FX profit",
    inflationTool: "Inflation",
    card: "Card interest",
    gold: "Gold cost",
    unreachable: "The target could not be reached with these inputs.",
    monthSuffix: "months"
  },
  el: {
    title: "Κέντρο οικονομικών υπολογισμών",
    description: "Υπολόγισε κατά προσέγγιση καταθέσεις, σύνθετη απόδοση, στόχους αποταμίευσης, κέρδος συναλλάγματος, πληθωρισμό και τόκους κάρτας.",
    disclaimer: "Τα αποτελέσματα είναι ενδεικτικά. Τραπεζικοί, φορολογικοί και λοιποί κανόνες μπορεί να αλλάξουν το πραγματικό αποτέλεσμα.",
    calculate: "Αποτέλεσμα",
    principal: "Αρχικό κεφάλαιο",
    annualRate: "Ετήσιο μικτό επιτόκιο (%)",
    days: "Ημέρες",
    withholding: "Παρακράτηση (%)",
    gross: "Μικτή απόδοση",
    net: "Καθαρή απόδοση",
    final: "Τελικό ποσό",
    months: "Μήνες",
    monthlyContribution: "Μηνιαία συνεισφορά",
    target: "Στόχος",
    estimatedMonths: "Εκτιμώμενος χρόνος",
    buyRate: "Τιμή αγοράς",
    sellRate: "Τρέχουσα/τιμή πώλησης",
    quantity: "Ποσότητα",
    profit: "Κέρδος / ζημία",
    futureValue: "Μελλοντικό ποσό",
    inflation: "Ετήσιος πληθωρισμός (%)",
    years: "Έτη",
    realValue: "Σημερινή αγοραστική δύναμη",
    balance: "Υπόλοιπο κάρτας",
    monthlyRate: "Μηνιαίο επιτόκιο (%)",
    estimatedInterest: "Εκτιμώμενος τόκος ενός μήνα",
    grams: "Γραμμάρια",
    cost: "Συνολικό κόστος",
    currentValue: "Τρέχουσα αξία",
    deposit: "Κατάθεση",
    compound: "Σύνθετη απόδοση",
    goal: "Στόχος αποταμίευσης",
    fx: "Κέρδος συναλλάγματος",
    inflationTool: "Πληθωρισμός",
    card: "Τόκος κάρτας",
    gold: "Κόστος χρυσού",
    unreachable: "Ο στόχος δεν μπορεί να υπολογιστεί με αυτά τα δεδομένα.",
    monthSuffix: "μήνες"
  }
} as const;

function useNumericState(initial: number) {
  const [value, setValue] = useState(initial);
  return [value, (raw: string) => setValue(Number.isFinite(Number(raw)) ? Number(raw) : 0)] as const;
}

function money(value: number, locale: BtgLocale, currency = "TRY") {
  const localeCode = locale === "tr" ? "tr-TR" : locale === "el" ? "el-GR" : "en-US";
  return new Intl.NumberFormat(localeCode, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
}

function Field({ label, value, onChange, min = 0, step = "any" }: { label: string; value: number; onChange: (value: string) => void; min?: number; step?: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      {label}
      <input type="number" min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-3 text-white outline-none transition focus:border-mint/60" />
    </label>
  );
}

function ResultBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-mint/20 bg-mint/[0.07] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">{title}</p>
      <div className="mt-3 space-y-2 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export function FinanceCalculatorHub() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = translations[locale];
  const [active, setActive] = useState<ToolKey>("deposit");

  const [principal, setPrincipal] = useNumericState(150000);
  const [annualRate, setAnnualRate] = useNumericState(40);
  const [days, setDays] = useNumericState(30);
  const [withholding, setWithholding] = useNumericState(17.5);
  const [months, setMonths] = useNumericState(12);
  const [monthlyContribution, setMonthlyContribution] = useNumericState(5000);
  const [target, setTarget] = useNumericState(250000);
  const [buyRate, setBuyRate] = useNumericState(35);
  const [sellRate, setSellRate] = useNumericState(40);
  const [quantity, setQuantity] = useNumericState(1000);
  const [futureValue, setFutureValue] = useNumericState(250000);
  const [inflation, setInflation] = useNumericState(30);
  const [years, setYears] = useNumericState(1);
  const [balance, setBalance] = useNumericState(10000);
  const [monthlyRate, setMonthlyRate] = useNumericState(4.25);
  const [grams, setGrams] = useNumericState(10);

  const deposit = useMemo(() => {
    const gross = principal * (annualRate / 100) * (days / 365);
    const net = gross * (1 - withholding / 100);
    return { gross, net, final: principal + net };
  }, [annualRate, days, principal, withholding]);

  const compound = useMemo(() => {
    const monthly = annualRate / 100 / 12;
    let total = principal;
    for (let month = 0; month < Math.max(0, Math.floor(months)); month += 1) {
      total = total * (1 + monthly) + monthlyContribution;
    }
    return { total, gain: total - principal - monthlyContribution * Math.max(0, Math.floor(months)) };
  }, [annualRate, monthlyContribution, months, principal]);

  const goalMonths = useMemo(() => {
    if (target <= principal) return 0;
    const monthly = annualRate / 100 / 12;
    let total = principal;
    for (let month = 1; month <= 1200; month += 1) {
      total = total * (1 + monthly) + monthlyContribution;
      if (total >= target) return month;
    }
    return null;
  }, [annualRate, monthlyContribution, principal, target]);

  const fxProfit = (sellRate - buyRate) * quantity;
  const fxCost = buyRate * quantity;
  const fxValue = sellRate * quantity;
  const purchasingPower = futureValue / Math.pow(1 + inflation / 100, Math.max(0, years));
  const cardInterest = balance * monthlyRate / 100;
  const goldCost = grams * buyRate;
  const goldValue = grams * sellRate;
  const goldProfit = goldValue - goldCost;

  const tools: Array<{ key: ToolKey; label: string; icon: typeof Calculator }> = [
    { key: "deposit", label: t.deposit, icon: Landmark },
    { key: "compound", label: t.compound, icon: TrendingUp },
    { key: "goal", label: t.goal, icon: PiggyBank },
    { key: "fx", label: t.fx, icon: Banknote },
    { key: "inflation", label: t.inflationTool, icon: Scale },
    { key: "card", label: t.card, icon: CreditCard },
    { key: "gold", label: t.gold, icon: Calculator }
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-card sm:p-7">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-black text-white sm:text-3xl">{t.title}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-400">{t.description}</p>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {tools.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setActive(key)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${active === key ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {active === "deposit" ? <>
            <Field label={t.principal} value={principal} onChange={setPrincipal} />
            <Field label={t.annualRate} value={annualRate} onChange={setAnnualRate} />
            <Field label={t.days} value={days} onChange={setDays} step="1" />
            <Field label={t.withholding} value={withholding} onChange={setWithholding} />
          </> : null}
          {active === "compound" ? <>
            <Field label={t.principal} value={principal} onChange={setPrincipal} />
            <Field label={t.annualRate} value={annualRate} onChange={setAnnualRate} />
            <Field label={t.months} value={months} onChange={setMonths} step="1" />
            <Field label={t.monthlyContribution} value={monthlyContribution} onChange={setMonthlyContribution} />
          </> : null}
          {active === "goal" ? <>
            <Field label={t.principal} value={principal} onChange={setPrincipal} />
            <Field label={t.target} value={target} onChange={setTarget} />
            <Field label={t.monthlyContribution} value={monthlyContribution} onChange={setMonthlyContribution} />
            <Field label={t.annualRate} value={annualRate} onChange={setAnnualRate} />
          </> : null}
          {active === "fx" ? <>
            <Field label={t.buyRate} value={buyRate} onChange={setBuyRate} />
            <Field label={t.sellRate} value={sellRate} onChange={setSellRate} />
            <Field label={t.quantity} value={quantity} onChange={setQuantity} />
          </> : null}
          {active === "inflation" ? <>
            <Field label={t.futureValue} value={futureValue} onChange={setFutureValue} />
            <Field label={t.inflation} value={inflation} onChange={setInflation} />
            <Field label={t.years} value={years} onChange={setYears} />
          </> : null}
          {active === "card" ? <>
            <Field label={t.balance} value={balance} onChange={setBalance} />
            <Field label={t.monthlyRate} value={monthlyRate} onChange={setMonthlyRate} />
          </> : null}
          {active === "gold" ? <>
            <Field label={t.grams} value={grams} onChange={setGrams} />
            <Field label={t.buyRate} value={buyRate} onChange={setBuyRate} />
            <Field label={t.sellRate} value={sellRate} onChange={setSellRate} />
          </> : null}
        </div>

        <ResultBox title={t.calculate}>
          {active === "deposit" ? <>
            <p className="flex justify-between gap-4"><span>{t.gross}</span><strong className="text-white">{money(deposit.gross, locale)}</strong></p>
            <p className="flex justify-between gap-4"><span>{t.net}</span><strong className="text-emerald-300">{money(deposit.net, locale)}</strong></p>
            <p className="flex justify-between gap-4 border-t border-white/10 pt-2"><span>{t.final}</span><strong className="text-white">{money(deposit.final, locale)}</strong></p>
          </> : null}
          {active === "compound" ? <>
            <p className="flex justify-between gap-4"><span>{t.net}</span><strong className="text-emerald-300">{money(compound.gain, locale)}</strong></p>
            <p className="flex justify-between gap-4 border-t border-white/10 pt-2"><span>{t.final}</span><strong className="text-white">{money(compound.total, locale)}</strong></p>
          </> : null}
          {active === "goal" ? <p className="text-lg font-black text-white">{goalMonths === null ? t.unreachable : `${goalMonths} ${t.monthSuffix}`}</p> : null}
          {active === "fx" ? <>
            <p className="flex justify-between gap-4"><span>{t.cost}</span><strong className="text-white">{money(fxCost, locale)}</strong></p>
            <p className="flex justify-between gap-4"><span>{t.currentValue}</span><strong className="text-white">{money(fxValue, locale)}</strong></p>
            <p className="flex justify-between gap-4 border-t border-white/10 pt-2"><span>{t.profit}</span><strong className={fxProfit >= 0 ? "text-emerald-300" : "text-rose-300"}>{money(fxProfit, locale)}</strong></p>
          </> : null}
          {active === "inflation" ? <p className="flex justify-between gap-4"><span>{t.realValue}</span><strong className="text-white">{money(purchasingPower, locale)}</strong></p> : null}
          {active === "card" ? <p className="flex justify-between gap-4"><span>{t.estimatedInterest}</span><strong className="text-rose-300">{money(cardInterest, locale)}</strong></p> : null}
          {active === "gold" ? <>
            <p className="flex justify-between gap-4"><span>{t.cost}</span><strong className="text-white">{money(goldCost, locale)}</strong></p>
            <p className="flex justify-between gap-4"><span>{t.currentValue}</span><strong className="text-white">{money(goldValue, locale)}</strong></p>
            <p className="flex justify-between gap-4 border-t border-white/10 pt-2"><span>{t.profit}</span><strong className={goldProfit >= 0 ? "text-emerald-300" : "text-rose-300"}>{money(goldProfit, locale)}</strong></p>
          </> : null}
        </ResultBox>
      </div>
      <p className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-xs leading-5 text-amber-100/75">{t.disclaimer}</p>
    </section>
  );
}
