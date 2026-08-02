"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, ExternalLink, ShieldCheck } from "lucide-react";
import { getLocaleFromPath, localizedHref, type BtgLocale } from "@/components/enhancements/locale";
import { PageHero } from "@/components/enhancements/PageHero";
import { DataPrivacyControls } from "@/components/enhancements/DataPrivacyControls";

export type InfoKind = "privacy" | "terms" | "sources" | "contact" | "guide";

type Section = { title: string; paragraphs?: string[]; bullets?: string[] };
type Content = { eyebrow: string; title: string; description: string; sections: Section[] };

const content: Record<BtgLocale, Record<InfoKind, Content>> = {
  tr: {
    privacy: {
      eyebrow: "Şeffaflık",
      title: "Gizlilik Politikası",
      description: "BoranTheGreat'in hangi verileri cihazda sakladığını, isteğe bağlı bulut özelliklerini ve verilerini nasıl temizleyebileceğini açıklar.",
      sections: [
        { title: "Cihazda saklanan veriler", paragraphs: ["Favoriler, portföy, alarm taslakları, tema, dil, şehir ve panel tercihleri tarayıcının LocalStorage alanında saklanabilir. Bu veriler varsayılan olarak cihazından ayrılmaz."] },
        { title: "İsteğe bağlı bulut hesabı", paragraphs: ["Google ile giriş ve Supabase yapılandırıldığında seçtiğin veriler cihazlar arasında eşitlenebilir. Bulut özelliği kurulmamışsa veya giriş yapmazsan yerel kullanım devam eder."] },
        { title: "Dış veri sağlayıcıları", paragraphs: ["Piyasa, haber ve hava verisi alınırken üçüncü taraf API sağlayıcılarına ağ isteği gönderilir. Bu sağlayıcılar kendi gizlilik politikalarına göre IP adresi ve teknik istek bilgilerini işleyebilir."] },
        { title: "Çerezler ve tarayıcı depolaması", paragraphs: ["Dil tercihi ve oturum gibi gerekli işlevler için çerez veya tarayıcı depolaması kullanılabilir. Reklam amaçlı takip çerezi bu sürümün temel işlevi değildir."] },
        { title: "Verilerini silme", bullets: ["Ayarlar veya ilgili ekranlardan yerel verileri temizle.", "Tarayıcının site verilerini silme seçeneğini kullan.", "Bulut hesabı etkinse hesabından çıkış yap ve senkronize verilerin silinmesi için iletişim kanalını kullan."] },
        { title: "Güncellemeler", paragraphs: ["Özellikler değiştiğinde bu politika güncellenebilir. Önemli değişiklikler bu sayfada yayımlanır."] }
      ]
    },
    terms: {
      eyebrow: "Kullanım çerçevesi",
      title: "Kullanım Şartları",
      description: "Siteyi kullanırken geçerli olan temel koşullar ve finansal veri sorumluluk sınırları.",
      sections: [
        { title: "Bilgilendirme hizmeti", paragraphs: ["BoranTheGreat piyasa, hava, haber, portföy ve hesaplama araçlarını bilgilendirme amacıyla sunar."] },
        { title: "Yatırım tavsiyesi değildir", paragraphs: ["Sitedeki fiyatlar, özetler, hesaplamalar, BorAI yanıtları ve alarmlar yatırım, kredi, vergi veya hukuk tavsiyesi değildir. Finansal kararların sorumluluğu kullanıcıya aittir."] },
        { title: "Veri doğruluğu ve gecikme", paragraphs: ["Üçüncü taraf sağlayıcılardan gelen veriler gecikebilir, eksik olabilir veya geçici olarak kullanılamayabilir. İşlem yapmadan önce resmi ve yetkili kaynaklardan doğrulama yapmalısın."] },
        { title: "Kullanıcı sorumluluğu", bullets: ["Hesap ve cihaz güvenliğini korumak.", "Alarm ve hesaplama sonuçlarını bağımsız olarak kontrol etmek.", "Siteyi hukuka aykırı, yanıltıcı veya sistemi zorlayıcı biçimde kullanmamak."] },
        { title: "Hizmet sürekliliği", paragraphs: ["Bakım, API sınırları, bağlantı sorunları veya teknik arızalar nedeniyle özellikler geçici olarak kesilebilir. Kesintisiz erişim garantisi verilmez."] },
        { title: "Değişiklikler", paragraphs: ["Bu şartlar özellik ve mevzuat değişikliklerine göre güncellenebilir. Siteyi kullanmaya devam etmek güncel şartların kabul edildiği anlamına gelir."] }
      ]
    },
    sources: {
      eyebrow: "Veri güveni",
      title: "Veri Kaynakları ve Güncellik",
      description: "Kartlarda gördüğün fiyatların, hava verilerinin ve haberlerin hangi sağlayıcılardan geldiğini gösterir.",
      sections: [
        { title: "Döviz", bullets: ["Frankfurter API: temel döviz kurları ve tarihsel seriler.", "Kartlarda mümkün olduğunda son güncelleme zamanı gösterilir."] },
        { title: "Kripto", bullets: ["CoinGecko: fiyat, değişim, hacim, piyasa değeri ve grafik verileri.", "CoinLore: CoinGecko erişilemediğinde bazı ekranlarda yedek veri."] },
        { title: "Altın", bullets: ["Yahoo Finance veya projedeki sunucu katmanı: yaklaşık ons verisi.", "Gram altın hesaplaması kur ve ons verisinden türetilebilir; kuyumcu alış/satış fiyatıyla birebir aynı olmayabilir."] },
        { title: "Hava", bullets: ["Open-Meteo Geocoding: şehir arama.", "Open-Meteo Forecast: anlık durum ve tahmin."] },
        { title: "Haber ve takvim", bullets: ["GDELT: dil ve kategori bazlı haber akışı.", "Finnhub: API anahtarı eklendiğinde ekonomi takvimi."] },
        { title: "Yapay zekâ", bullets: ["OpenAI: anahtar eklendiğinde BorAI'nin bulut yanıt modu.", "Anahtar yoksa proje yerel yardımcı metinlerle çalışabilir."] },
        { title: "Gecikme ve hata politikası", paragraphs: ["Kaynak erişilemezse sahte canlı veri gösterilmemeli; son bilinen değer, hata durumu veya yedek kaynak açık biçimde belirtilmelidir."] }
      ]
    },
    contact: {
      eyebrow: "İletişim",
      title: "BoranTheGreat'e Ulaş",
      description: "Hata bildirimi, özellik önerisi veya veri kaynağı geri bildirimi için resmi sosyal kanal.",
      sections: [
        { title: "Instagram", paragraphs: ["Mesajında kullandığın cihazı, sayfanın adresini ve gördüğün sorunu mümkün olduğunca net belirt. Ekran görüntüsü eklemek çözümü hızlandırır."] },
        { title: "Hata bildirirken", bullets: ["Sorunun oluştuğu sayfa adresi.", "Telefon veya bilgisayar ve tarayıcı adı.", "Sorunun yaklaşık zamanı.", "Kişisel veya gizli bilgi içermeyen ekran görüntüsü."] }
      ]
    },
    guide: {
      eyebrow: "Öğrenme merkezi",
      title: "Finans Rehberi ve Sözlük",
      description: "Piyasa ekranlarında geçen temel kavramları kısa ve anlaşılır biçimde açıklar.",
      sections: [
        { title: "Stopaj", paragraphs: ["Faiz veya yatırım gelirinden yasal olarak kesilen vergidir. Net kazanç, brüt kazançtan stopaj düşüldükten sonra kalan tutardır."] },
        { title: "Piyasa değeri", paragraphs: ["Bir varlığın dolaşımdaki adedi ile güncel fiyatının çarpımıdır. Tek başına ucuzluk veya pahalılık göstergesi değildir."] },
        { title: "Hacim", paragraphs: ["Belirli sürede gerçekleşen işlem büyüklüğüdür. Yüksek hacim genellikle daha fazla işlem ilgisine işaret eder."] },
        { title: "Alış–satış farkı", paragraphs: ["Bir varlığı alabileceğin fiyat ile satabileceğin fiyat arasındaki farktır. Bu fark işlem maliyetinin bir parçasıdır."] },
        { title: "Volatilite", paragraphs: ["Fiyatın ne kadar hızlı ve geniş aralıkta değiştiğini anlatır. Yüksek volatilite daha yüksek risk anlamına gelebilir."] },
        { title: "Portföy çeşitlendirmesi", paragraphs: ["Tüm birikimi tek varlığa bağlamak yerine farklı risklere dağıtmaktır. Çeşitlendirme zararı tamamen engellemez."] },
        { title: "Fiyat alarmı", paragraphs: ["Belirlediğin fiyat koşulu gerçekleştiğinde kontrol veya bildirim sağlayan araçtır. Alarm, emrin otomatik gerçekleştiği anlamına gelmez."] },
        { title: "Güvenli kullanım", bullets: ["Tek bir veri kaynağına güvenme.", "Yüksek getiri vaadini yüksek riskten ayrı düşünme.", "Krediyle veya acil ihtiyaç parasıyla riskli işlem yapmadan önce profesyonel görüş al."] }
      ]
    }
  },
  en: {
    privacy: { eyebrow: "Transparency", title: "Privacy Policy", description: "Explains what BoranTheGreat stores on your device, optional cloud features and how to clear your data.", sections: [
      { title: "Data stored on your device", paragraphs: ["Favorites, portfolio items, alert drafts, theme, language, city and dashboard preferences may be stored in browser LocalStorage. By default, this data does not leave your device."] },
      { title: "Optional cloud account", paragraphs: ["When Google sign-in and Supabase are configured, selected data may sync across devices. Local use continues when cloud services are not configured or you do not sign in."] },
      { title: "External data providers", paragraphs: ["Network requests are sent to third-party APIs for market, news and weather data. Those providers may process IP addresses and technical request information under their own policies."] },
      { title: "Cookies and browser storage", paragraphs: ["Cookies or browser storage may be used for necessary functions such as language and sessions. Advertising tracking is not a core function of this version."] },
      { title: "Deleting your data", bullets: ["Clear local data from settings or the related screen.", "Delete site data in your browser.", "When cloud sync is enabled, sign out and use the contact channel to request deletion of synchronized data."] },
      { title: "Updates", paragraphs: ["This policy may be updated when features change. Important changes will be published on this page."] }
    ] },
    terms: { eyebrow: "Usage framework", title: "Terms of Use", description: "Core conditions for using the site and the limits of responsibility for financial data.", sections: [
      { title: "Information service", paragraphs: ["BoranTheGreat provides market, weather, news, portfolio and calculator tools for information purposes."] },
      { title: "Not financial advice", paragraphs: ["Prices, summaries, calculations, BorAI answers and alerts are not investment, credit, tax or legal advice. Users are responsible for their decisions."] },
      { title: "Accuracy and delay", paragraphs: ["Third-party data may be delayed, incomplete or temporarily unavailable. Verify important information with official sources before acting."] },
      { title: "User responsibility", bullets: ["Protect account and device security.", "Independently verify alert and calculation results.", "Do not use the service unlawfully or in ways that overload the system."] },
      { title: "Availability", paragraphs: ["Features may be interrupted by maintenance, API limits, network issues or technical faults. Continuous access is not guaranteed."] },
      { title: "Changes", paragraphs: ["Terms may change with features or regulation. Continued use means acceptance of the current terms."] }
    ] },
    sources: { eyebrow: "Data trust", title: "Data Sources and Freshness", description: "Shows where prices, weather data and news come from.", sections: [
      { title: "Foreign exchange", bullets: ["Frankfurter API for core rates and historical series.", "Cards show an update time whenever possible."] },
      { title: "Crypto", bullets: ["CoinGecko for prices, changes, volume, market cap and charts.", "CoinLore as a fallback on selected screens."] },
      { title: "Gold", bullets: ["Yahoo Finance or the project server layer for approximate ounce data.", "Gram gold can be derived from FX and ounce values and may differ from retail quotes."] },
      { title: "Weather", bullets: ["Open-Meteo Geocoding for city search.", "Open-Meteo Forecast for current conditions and forecasts."] },
      { title: "News and calendar", bullets: ["GDELT for language and category-based news.", "Finnhub for the economic calendar when a key is configured."] },
      { title: "Artificial intelligence", bullets: ["OpenAI for BorAI cloud responses when a key is configured.", "The project may use local helper responses without a key."] },
      { title: "Failure policy", paragraphs: ["When a source is unavailable, the site should show a clear error, last known value or labeled fallback—not fabricated live data."] }
    ] },
    contact: { eyebrow: "Contact", title: "Contact BoranTheGreat", description: "Use the official social channel for bug reports, feature ideas or data feedback.", sections: [
      { title: "Instagram", paragraphs: ["Include the device, page address and a clear description. A screenshot without private information can speed up diagnosis."] },
      { title: "For bug reports", bullets: ["Affected page URL.", "Device and browser.", "Approximate time.", "Screenshot without personal or secret data."] }
    ] },
    guide: { eyebrow: "Learning center", title: "Finance Guide and Glossary", description: "Short explanations of common terms used on market screens.", sections: [
      { title: "Withholding tax", paragraphs: ["Tax withheld from interest or investment income. Net return is what remains after withholding is deducted from gross return."] },
      { title: "Market capitalization", paragraphs: ["Circulating supply multiplied by current price. It does not by itself prove that an asset is cheap or expensive."] },
      { title: "Volume", paragraphs: ["The amount traded over a period. Higher volume often indicates greater trading activity."] },
      { title: "Bid–ask spread", paragraphs: ["The difference between a buying and selling quote. It is part of transaction cost."] },
      { title: "Volatility", paragraphs: ["How quickly and widely price changes. Higher volatility can mean higher risk."] },
      { title: "Diversification", paragraphs: ["Spreading savings across different risks rather than relying on one asset. It cannot eliminate losses."] },
      { title: "Price alert", paragraphs: ["A tool that checks or notifies when a price condition is met. It does not execute a trade automatically."] },
      { title: "Safer use", bullets: ["Do not rely on one source.", "Consider risk together with return.", "Seek professional advice before using borrowed or essential money for risky activity."] }
    ] }
  },
  el: {
    privacy: { eyebrow: "Διαφάνεια", title: "Πολιτική απορρήτου", description: "Εξηγεί τι αποθηκεύεται στη συσκευή, τις προαιρετικές λειτουργίες cloud και τον τρόπο διαγραφής δεδομένων.", sections: [
      { title: "Δεδομένα στη συσκευή", paragraphs: ["Αγαπημένα, χαρτοφυλάκιο, προσχέδια ειδοποιήσεων, θέμα, γλώσσα, πόλη και προτιμήσεις μπορούν να αποθηκεύονται στο LocalStorage. Από προεπιλογή δεν εγκαταλείπουν τη συσκευή."] },
      { title: "Προαιρετικός λογαριασμός cloud", paragraphs: ["Με Google και Supabase, επιλεγμένα δεδομένα μπορούν να συγχρονιστούν. Χωρίς ρύθμιση ή σύνδεση, η τοπική χρήση συνεχίζεται."] },
      { title: "Εξωτερικοί πάροχοι", paragraphs: ["Για αγορές, ειδήσεις και καιρό γίνονται αιτήματα σε τρίτα API, τα οποία μπορεί να επεξεργάζονται IP και τεχνικά στοιχεία σύμφωνα με τις πολιτικές τους."] },
      { title: "Cookies και αποθήκευση", paragraphs: ["Μπορεί να χρησιμοποιούνται για απαραίτητες λειτουργίες όπως γλώσσα και συνεδρία. Η διαφημιστική παρακολούθηση δεν είναι βασική λειτουργία αυτής της έκδοσης."] },
      { title: "Διαγραφή δεδομένων", bullets: ["Καθάρισε τοπικά δεδομένα από τις ρυθμίσεις.", "Διέγραψε τα δεδομένα ιστοτόπου από τον browser.", "Με ενεργό cloud, αποσυνδέσου και χρησιμοποίησε το κανάλι επικοινωνίας για αίτημα διαγραφής."] },
      { title: "Ενημερώσεις", paragraphs: ["Η πολιτική μπορεί να ενημερωθεί όταν αλλάζουν οι λειτουργίες."] }
    ] },
    terms: { eyebrow: "Πλαίσιο χρήσης", title: "Όροι χρήσης", description: "Βασικοί όροι και όρια ευθύνης για οικονομικά δεδομένα.", sections: [
      { title: "Υπηρεσία ενημέρωσης", paragraphs: ["Το BoranTheGreat παρέχει εργαλεία αγοράς, καιρού, ειδήσεων, χαρτοφυλακίου και υπολογισμών για ενημέρωση."] },
      { title: "Δεν αποτελεί συμβουλή", paragraphs: ["Τιμές, περιλήψεις, υπολογισμοί, απαντήσεις BorAI και ειδοποιήσεις δεν αποτελούν επενδυτική, πιστωτική, φορολογική ή νομική συμβουλή."] },
      { title: "Ακρίβεια και καθυστέρηση", paragraphs: ["Δεδομένα τρίτων μπορεί να καθυστερούν, να είναι ελλιπή ή προσωρινά μη διαθέσιμα. Επιβεβαίωσε σημαντικά στοιχεία από επίσημες πηγές."] },
      { title: "Ευθύνη χρήστη", bullets: ["Προστάτευσε λογαριασμό και συσκευή.", "Έλεγξε ανεξάρτητα ειδοποιήσεις και υπολογισμούς.", "Μη χρησιμοποιείς την υπηρεσία παράνομα ή με τρόπο που επιβαρύνει το σύστημα."] },
      { title: "Διαθεσιμότητα", paragraphs: ["Συντήρηση, όρια API ή τεχνικά προβλήματα μπορεί να διακόψουν λειτουργίες. Δεν εγγυάται συνεχής πρόσβαση."] },
      { title: "Αλλαγές", paragraphs: ["Οι όροι μπορεί να ενημερωθούν. Η συνέχιση χρήσης σημαίνει αποδοχή των τρεχόντων όρων."] }
    ] },
    sources: { eyebrow: "Εμπιστοσύνη δεδομένων", title: "Πηγές δεδομένων και ενημέρωση", description: "Δείχνει από πού προέρχονται τιμές, καιρός και ειδήσεις.", sections: [
      { title: "Συνάλλαγμα", bullets: ["Frankfurter API για ισοτιμίες και ιστορικά δεδομένα.", "Οι κάρτες εμφανίζουν ώρα ενημέρωσης όπου είναι δυνατό."] },
      { title: "Κρυπτονομίσματα", bullets: ["CoinGecko για τιμές, μεταβολές, όγκο, κεφαλαιοποίηση και γραφήματα.", "CoinLore ως εφεδρική πηγή σε ορισμένες οθόνες."] },
      { title: "Χρυσός", bullets: ["Yahoo Finance ή το επίπεδο server για ενδεικτική τιμή ουγγιάς.", "Η τιμή γραμμαρίου μπορεί να διαφέρει από λιανικές τιμές."] },
      { title: "Καιρός", bullets: ["Open-Meteo Geocoding για αναζήτηση πόλης.", "Open-Meteo Forecast για τρέχοντα στοιχεία και πρόγνωση."] },
      { title: "Ειδήσεις και ημερολόγιο", bullets: ["GDELT για ειδήσεις ανά γλώσσα και κατηγορία.", "Finnhub για οικονομικό ημερολόγιο όταν υπάρχει κλειδί."] },
      { title: "Τεχνητή νοημοσύνη", bullets: ["OpenAI για απαντήσεις cloud του BorAI όταν υπάρχει κλειδί.", "Χωρίς κλειδί μπορεί να λειτουργεί τοπική βοήθεια."] },
      { title: "Πολιτική σφάλματος", paragraphs: ["Όταν μια πηγή δεν είναι διαθέσιμη πρέπει να εμφανίζεται σφάλμα, τελευταία γνωστή τιμή ή σαφώς σημειωμένη εφεδρική πηγή—όχι ψεύτικα ζωντανά δεδομένα."] }
    ] },
    contact: { eyebrow: "Επικοινωνία", title: "Επικοινωνία με το BoranTheGreat", description: "Χρησιμοποίησε το επίσημο κοινωνικό κανάλι για σφάλματα, ιδέες ή σχόλια δεδομένων.", sections: [
      { title: "Instagram", paragraphs: ["Ανάφερε συσκευή, διεύθυνση σελίδας και σαφή περιγραφή. Ένα στιγμιότυπο χωρίς ιδιωτικές πληροφορίες βοηθά."] },
      { title: "Για αναφορά σφάλματος", bullets: ["URL σελίδας.", "Συσκευή και browser.", "Περίπου ώρα.", "Στιγμιότυπο χωρίς προσωπικά ή μυστικά δεδομένα."] }
    ] },
    guide: { eyebrow: "Κέντρο μάθησης", title: "Οδηγός και λεξικό οικονομικών", description: "Σύντομες εξηγήσεις βασικών όρων των αγορών.", sections: [
      { title: "Παρακράτηση φόρου", paragraphs: ["Φόρος που αφαιρείται από τόκους ή επενδυτικό εισόδημα. Η καθαρή απόδοση μένει μετά την αφαίρεση."] },
      { title: "Κεφαλαιοποίηση αγοράς", paragraphs: ["Κυκλοφορούσα ποσότητα επί τρέχουσα τιμή. Δεν αποδεικνύει μόνη της ότι ένα στοιχείο είναι φθηνό ή ακριβό."] },
      { title: "Όγκος", paragraphs: ["Η αξία συναλλαγών σε μια περίοδο. Υψηλότερος όγκος συνήθως σημαίνει περισσότερη δραστηριότητα."] },
      { title: "Διαφορά αγοράς–πώλησης", paragraphs: ["Η διαφορά μεταξύ τιμής αγοράς και πώλησης και μέρος του κόστους συναλλαγής."] },
      { title: "Μεταβλητότητα", paragraphs: ["Πόσο γρήγορα και έντονα αλλάζει η τιμή. Μεγαλύτερη μεταβλητότητα μπορεί να σημαίνει μεγαλύτερο κίνδυνο."] },
      { title: "Διαφοροποίηση", paragraphs: ["Κατανομή αποταμιεύσεων σε διαφορετικούς κινδύνους. Δεν εξαλείφει τις ζημίες."] },
      { title: "Ειδοποίηση τιμής", paragraphs: ["Εργαλείο ελέγχου ή ειδοποίησης όταν εκπληρωθεί μια συνθήκη. Δεν εκτελεί αυτόματα συναλλαγή."] },
      { title: "Ασφαλέστερη χρήση", bullets: ["Μη βασίζεσαι σε μία πηγή.", "Σκέψου τον κίνδυνο μαζί με την απόδοση.", "Ζήτησε επαγγελματική γνώμη πριν χρησιμοποιήσεις δανεικά ή απαραίτητα χρήματα σε υψηλό κίνδυνο."] }
    ] }
  }
};

export function StaticInfoPage({ kind }: { kind: InfoKind }) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const page = content[locale][kind];

  return (
    <div className="space-y-6">
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description}>
        {kind === "contact" ? (
          <a href="https://instagram.com/boranthegreat" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-3 font-black text-slate-950 transition hover:brightness-110">
            Instagram<ExternalLink className="h-4 w-4" />
          </a>
        ) : kind === "sources" ? (
          <Link href={localizedHref(pathname, "/tools")} className="inline-flex items-center gap-2 rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 font-black text-mint transition hover:bg-mint/15">
            <Database className="h-4 w-4" />{locale === "tr" ? "Hesaplama araçlarını aç" : locale === "el" ? "Άνοιγμα εργαλείων" : "Open calculators"}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl border border-mint/20 bg-mint/10 px-4 py-3 text-sm font-bold text-mint"><ShieldCheck className="h-4 w-4" />boranthegreat.xyz</span>
        )}
      </PageHero>

      {kind === "privacy" ? <DataPrivacyControls /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {page.sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 sm:p-6">
            <h2 className="text-lg font-black text-white">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-300">{paragraph}</p>)}
            {section.bullets ? <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />{bullet}</li>)}</ul> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
