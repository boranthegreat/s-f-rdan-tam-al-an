// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const LOCALES = {
  tr: { label: "Türkçe", flag: "🇹🇷", htmlLang: "tr", selectorLabel: "Dil seçici" },
  en: { label: "English", flag: "🇬🇧", htmlLang: "en", selectorLabel: "Language selector" },
  el: { label: "Ελληνικά", flag: "🇬🇷", htmlLang: "el", selectorLabel: "Επιλογή γλώσσας" },
};

const STORAGE_KEY = "btg-language";
const VALID_LOCALES = new Set(Object.keys(LOCALES));
const sourceText = new WeakMap();
const renderedText = new WeakMap();
const sourceAttributes = new WeakMap();
const renderedAttributes = new WeakMap();

const T = {
  // Brand, header and navigation
  "Küresel Piyasalar ve Hava Radarı": { tr: "Küresel Piyasalar ve Hava Radarı", en: "Global Markets & Weather Radar", el: "Παγκόσμιες Αγορές & Μετεωρολογικό Ραντάρ" },
  "Panel": { tr: "Panel", en: "Dashboard", el: "Πίνακας Ελέγχου" },
  "Döviz": { tr: "Döviz", en: "Currencies", el: "Ισοτιμίες" },
  "Coin": { tr: "Coin", en: "Crypto", el: "Κρυπτονομίσματα" },
  "Hava": { tr: "Hava", en: "Weather", el: "Καιρός" },
  "Portföy": { tr: "Portföy", en: "Portfolio", el: "Χαρτοφυλάκιο" },
  "Alarm": { tr: "Alarm", en: "Alerts", el: "Ειδοποιήσεις" },
  "Haber": { tr: "Haber", en: "News", el: "Ειδήσεις" },
  "Ara": { tr: "Ara", en: "Search", el: "Αναζήτηση" },
  "Ayar": { tr: "Ayar", en: "Settings", el: "Ρυθμίσεις" },
  "Ayarlar": { tr: "Ayarlar", en: "Settings", el: "Ρυθμίσεις" },
  "Favoriler": { tr: "Favoriler", en: "Favorites", el: "Αγαπημένα" },
  "İpuçları": { tr: "İpuçları", en: "Tips", el: "Συμβουλές" },
  "Mint": { tr: "Mint", en: "Mint", el: "Μέντα" },
  "Mavi": { tr: "Mavi", en: "Blue", el: "Μπλε" },
  "Mor": { tr: "Mor", en: "Purple", el: "Μωβ" },
  "Altın": { tr: "Altın", en: "Gold", el: "Χρυσός" },
  "Rose": { tr: "Rose", en: "Rose", el: "Ροζ" },
  "Beyaz": { tr: "Beyaz", en: "White", el: "Λευκό" },
  "Siyah": { tr: "Siyah", en: "Black", el: "Μαύρο" },

  // Home
  "Canli veri izleme": { tr: "Canlı veri izleme", en: "Live data monitoring", el: "Παρακολούθηση δεδομένων σε πραγματικό χρόνο" },
  "Canlı veri izleme": { tr: "Canlı veri izleme", en: "Live data monitoring", el: "Παρακολούθηση δεδομένων σε πραγματικό χρόνο" },
  "Aktif": { tr: "Aktif", en: "Active", el: "Ενεργό" },
  "Hazir": { tr: "Hazır", en: "Ready", el: "Έτοιμο" },
  "Hazır": { tr: "Hazır", en: "Ready", el: "Έτοιμο" },
  "Piyasa radarı": { tr: "Piyasa radarı", en: "Market radar", el: "Ραντάρ αγοράς" },
  "Döviz + Coin + Altın": { tr: "Döviz + Coin + Altın", en: "Currencies + Crypto + Gold", el: "Ισοτιμίες + Κρυπτονομίσματα + Χρυσός" },
  "Yerel saat": { tr: "Yerel saat", en: "Local time", el: "Τοπική ώρα" },
  "BoranTheGreat Kontrol Merkezi": { tr: "BoranTheGreat Kontrol Merkezi", en: "BoranTheGreat Control Center", el: "Κέντρο Ελέγχου BoranTheGreat" },
  "Canlı veri hattı": { tr: "Canlı veri hattı", en: "Live data feed", el: "Ροή δεδομένων σε πραγματικό χρόνο" },
  "Küresel piyasalar ve hava radarını tek koyu panelde izle.": { tr: "Küresel piyasalar ve hava radarını tek koyu panelde izle.", en: "Track global markets and weather from one dark dashboard.", el: "Παρακολούθησε τις παγκόσμιες αγορές και τον καιρό από έναν ενιαίο σκοτεινό πίνακα ελέγχου." },
  "Döviz kurları, kripto piyasa sinyalleri, altın kuru, 7 günlük dünya hava tahmini ve favori listesi tek premium panelde birleşir.": { tr: "Döviz kurları, kripto piyasa sinyalleri, altın kuru, 7 günlük dünya hava tahmini ve favori listesi tek premium panelde birleşir.", en: "Exchange rates, crypto market signals, gold prices, a 7-day global weather forecast and your favorites come together in one premium dashboard.", el: "Οι συναλλαγματικές ισοτιμίες, τα σήματα της αγοράς κρυπτονομισμάτων, οι τιμές χρυσού, η παγκόσμια πρόγνωση καιρού 7 ημερών και η λίστα αγαπημένων συγκεντρώνονται σε έναν ενιαίο προηγμένο πίνακα ελέγχου." },
  "Döviz takip": { tr: "Dövizleri takip et", en: "Track exchange rates", el: "Παρακολούθηση ισοτιμιών" },
  "Coin panelini aç": { tr: "Coin panelini aç", en: "Open crypto panel", el: "Άνοιγμα πίνακα κρυπτονομισμάτων" },
  "Hava radarını aç": { tr: "Hava radarını aç", en: "Open weather radar", el: "Άνοιγμα μετεωρολογικού ραντάρ" },
  "Radar Terminali": { tr: "Radar Terminali", en: "Radar Terminal", el: "Τερματικό Ραντάρ" },
  "Küresel Sinyal Haritası": { tr: "Küresel Sinyal Haritası", en: "Global Signal Map", el: "Παγκόσμιος Χάρτης Σημάτων" },
  "Kur radarı": { tr: "Kur radarı", en: "FX radar", el: "Ραντάρ ισοτιμιών" },
  "Kripto sinyali": { tr: "Kripto sinyali", en: "Crypto signal", el: "Σήμα κρυπτονομισμάτων" },
  "Gram takip": { tr: "Gram altın takibi", en: "Gram gold tracking", el: "Παρακολούθηση χρυσού ανά γραμμάριο" },
  "7 gün": { tr: "7 gün", en: "7 days", el: "7 ημέρες" },
  "Varlık": { tr: "Varlık", en: "Assets", el: "Περιουσιακά στοιχεία" },
  "Grafik": { tr: "Grafik", en: "Chart", el: "Γράφημα" },
  "Ons + Gram": { tr: "Ons + Gram", en: "Ounce + Gram", el: "Ουγγιά + Γραμμάριο" },
  "Saatlik": { tr: "Saatlik", en: "Hourly", el: "Ωριαία" },
  "Döviz radarı": { tr: "Döviz radarı", en: "Currency radar", el: "Ραντάρ ισοτιμιών" },
  "Kripto varlık": { tr: "Kripto varlık", en: "Crypto assets", el: "Κρυπτονομίσματα" },
  "Dünya şehirleri": { tr: "Dünya şehirleri", en: "World cities", el: "Πόλεις του κόσμου" },
  "Yerel takip listesi": { tr: "Yerel takip listesi", en: "Local watchlist", el: "Τοπική λίστα παρακολούθησης" },
  "Gizli": { tr: "Gizli", en: "Private", el: "Ιδιωτικό" },
  "Hızlı mod aktif": { tr: "Hızlı mod aktif", en: "Fast mode active", el: "Η γρήγορη λειτουργία είναι ενεργή" },
  "İlk ekran hafifletildi, canlı modüller boşta yüklenir.": { tr: "İlk ekran hafifletildi, canlı modüller boşta yüklenir.", en: "The initial screen is optimized; live modules load when the browser is idle.", el: "Η αρχική οθόνη έχει βελτιστοποιηθεί και οι ζωντανές μονάδες φορτώνονται όταν το πρόγραμμα περιήγησης είναι αδρανές." },
  "Site daha hızlı tepki verir; piyasa, hava, portföy ve haber panelleri sayfa açılışını kilitlemeden arkadan hazırlanır.": { tr: "Site daha hızlı tepki verir; piyasa, hava, portföy ve haber panelleri sayfa açılışını kilitlemeden arkadan hazırlanır.", en: "The site responds faster while market, weather, portfolio and news panels prepare in the background without blocking the first render.", el: "Ο ιστότοπος αποκρίνεται γρηγορότερα, ενώ οι πίνακες αγορών, καιρού, χαρτοφυλακίου και ειδήσεων ετοιμάζονται στο παρασκήνιο." },
  "Hızlı açılış": { tr: "Hızlı açılış", en: "Fast loading", el: "Γρήγορη φόρτωση" },
  "Hafif efektler": { tr: "Hafif efektler", en: "Lightweight effects", el: "Ελαφριά εφέ" },
  "Gecikmeli canlı panel": { tr: "Gecikmeli canlı panel", en: "Deferred live panels", el: "Ζωντανοί πίνακες με αναβαλλόμενη φόρτωση" },
  "Yayın modu": { tr: "Yayın modu", en: "Production mode", el: "Λειτουργία παραγωγής" },
  "Düşük gecikme": { tr: "Düşük gecikme", en: "Low latency", el: "Χαμηλή καθυστέρηση" },
  "Animasyonlar azaltıldı, pointer efekti seyrekleştirildi ve ağır paneller ilk render dışında bırakıldı.": { tr: "Animasyonlar azaltıldı, işaretçi efekti seyrekleştirildi ve ağır paneller ilk oluşturmanın dışında bırakıldı.", en: "Animations have been reduced, pointer effects limited and heavy panels excluded from the initial render.", el: "Τα εφέ κίνησης περιορίστηκαν, τα εφέ του δείκτη εμφανίζονται αραιότερα και οι απαιτητικοί πίνακες εξαιρούνται από την αρχική απόδοση." },
  "Canlı paneller hazırlanıyor...": { tr: "Canlı paneller hazırlanıyor...", en: "Preparing live panels...", el: "Προετοιμασία ζωντανών πινάκων..." },

  // Currency
  "Döviz Masası": { tr: "Döviz Masası", en: "Currency Desk", el: "Γραφείο Συναλλάγματος" },
  "Döviz Takip": { tr: "Döviz Takibi", en: "Exchange Rate Tracking", el: "Παρακολούθηση Ισοτιμιών" },
  "USD bazlı küresel kurları izle, favorilerine ekle ve anlık döviz çevirici ile para birimleri arasında hesaplama yap.": { tr: "USD bazlı küresel kurları izle, favorilerine ekle ve anlık döviz çeviriciyle para birimleri arasında hesaplama yap.", en: "Track global USD-based exchange rates, add favorites and convert currencies instantly.", el: "Παρακολούθησε τις παγκόσμιες ισοτιμίες με βάση το USD, πρόσθεσε νομίσματα στα αγαπημένα σου και κάνε άμεσες μετατροπές μεταξύ νομισμάτων." },
  "Döviz Çevirici": { tr: "Döviz Çevirici", en: "Currency Converter", el: "Μετατροπέας Νομισμάτων" },
  "Miktar": { tr: "Miktar", en: "Amount", el: "Ποσό" },
  "Kaynak para birimi": { tr: "Kaynak para birimi", en: "From currency", el: "Νόμισμα προέλευσης" },
  "Hedef para birimi": { tr: "Hedef para birimi", en: "To currency", el: "Νόμισμα προορισμού" },
  "Çevir": { tr: "Çevir", en: "Convert", el: "Μετατροπή" },
  "Son güncelleme": { tr: "Son güncelleme", en: "Last updated", el: "Τελευταία ενημέρωση" },
  "Alış": { tr: "Alış", en: "Buy rate", el: "Τιμή αγοράς" },
  "Satış": { tr: "Satış", en: "Sell rate", el: "Τιμή πώλησης" },
  "Değişim": { tr: "Değişim", en: "Change", el: "Μεταβολή" },
  "Favoriye ekle": { tr: "Favoriye ekle", en: "Add to favorites", el: "Προσθήκη στα αγαπημένα" },
  "Favoriden çıkar": { tr: "Favoriden çıkar", en: "Remove from favorites", el: "Αφαίρεση από τα αγαπημένα" },

  // Crypto
  "BTC, ETH, SOL, BNB, XRP ve TRX için fiyat, 24 saatlik değişim, hacim ve market cap verilerini takip et.": { tr: "BTC, ETH, SOL, BNB, XRP ve TRX için fiyat, 24 saatlik değişim, hacim ve piyasa değeri verilerini takip et.", en: "Track price, 24-hour change, trading volume and market capitalization for BTC, ETH, SOL, BNB, XRP and TRX.", el: "Παρακολούθησε την τιμή, τη μεταβολή 24ώρου, τον όγκο συναλλαγών και την κεφαλαιοποίηση αγοράς για BTC, ETH, SOL, BNB, XRP και TRX." },
  "Gelismis grafik": { tr: "Gelişmiş grafik", en: "Advanced chart", el: "Προηγμένο γράφημα" },
  "Gelişmiş grafik": { tr: "Gelişmiş grafik", en: "Advanced chart", el: "Προηγμένο γράφημα" },
  "Coin trend analizi": { tr: "Coin trend analizi", en: "Crypto trend analysis", el: "Ανάλυση τάσης κρυπτονομισμάτων" },
  "Coin Trend": { tr: "Coin Trendi", en: "Crypto Trend", el: "Τάση Κρυπτονομισμάτων" },
  "Fiyat": { tr: "Fiyat", en: "Price", el: "Τιμή" },
  "24 saatlik değişim": { tr: "24 saatlik değişim", en: "24-hour change", el: "Μεταβολή 24ώρου" },
  "Hacim": { tr: "Hacim", en: "Volume", el: "Όγκος" },
  "Piyasa değeri": { tr: "Piyasa değeri", en: "Market capitalization", el: "Κεφαλαιοποίηση αγοράς" },
  "Coin piyasa verileri alınamadı.": { tr: "Coin piyasa verileri alınamadı.", en: "Crypto market data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων της αγοράς κρυπτονομισμάτων." },
  // Weather
  "Hava Radarı": { tr: "Hava Radarı", en: "Weather Radar", el: "Μετεωρολογικό Ραντάρ" },
  "Dünya Hava Durumu": { tr: "Dünya Hava Durumu", en: "World Weather", el: "Παγκόσμιος Καιρός" },
  "Dünya genelinde şehir ara; anlık sıcaklık, rüzgar, nem, yağış ihtimali ve 7 günlük tahmini tek panelden gör.": { tr: "Dünya genelinde şehir ara; anlık sıcaklık, rüzgâr, nem, yağış ihtimali ve 7 günlük tahmini tek panelden gör.", en: "Search cities worldwide and view current temperature, wind, humidity, precipitation chance and a 7-day forecast in one panel.", el: "Αναζήτησε πόλεις παγκοσμίως και δες θερμοκρασία, άνεμο, υγρασία, πιθανότητα βροχής και πρόγνωση 7 ημερών σε έναν ενιαίο πίνακα." },
  "Şehir ara": { tr: "Şehir ara", en: "Search city", el: "Αναζήτηση πόλης" },
  "Sıcaklık": { tr: "Sıcaklık", en: "Temperature", el: "Θερμοκρασία" },
  "Hissedilen": { tr: "Hissedilen", en: "Feels like", el: "Αισθητή θερμοκρασία" },
  "Nem": { tr: "Nem", en: "Humidity", el: "Υγρασία" },
  "Rüzgar": { tr: "Rüzgâr", en: "Wind", el: "Άνεμος" },
  "Rüzgâr": { tr: "Rüzgâr", en: "Wind", el: "Άνεμος" },
  "Yağış ihtimali": { tr: "Yağış ihtimali", en: "Precipitation chance", el: "Πιθανότητα βροχής" },
  "7 günlük tahmin": { tr: "7 günlük tahmin", en: "7-day forecast", el: "Πρόγνωση 7 ημερών" },
  "Bugün": { tr: "Bugün", en: "Today", el: "Σήμερα" },
  "Yarın": { tr: "Yarın", en: "Tomorrow", el: "Αύριο" },

  // Portfolio
  "Portföy Takibi": { tr: "Portföy Takibi", en: "Portfolio Tracking", el: "Παρακολούθηση Χαρτοφυλακίου" },
  "Coin ve döviz varlıklarını LocalStorage üzerinde sakla, toplam USD portföy değerini takip et.": { tr: "Coin ve döviz varlıklarını LocalStorage'da sakla, toplam USD portföy değerini takip et.", en: "Store your crypto and currency holdings locally and track the total value of your portfolio in USD.", el: "Αποθήκευσε τοπικά τις θέσεις σου σε κρυπτονομίσματα και ξένα νομίσματα και παρακολούθησε τη συνολική αξία του χαρτοφυλακίου σου σε USD." },
  "Ekle / Güncelle": { tr: "Ekle / Güncelle", en: "Add / Update", el: "Προσθήκη / Ενημέρωση" },
  "Toplam portföy değeri": { tr: "Toplam portföy değeri", en: "Total portfolio value", el: "Συνολική αξία χαρτοφυλακίου" },
  "Portföyü temizle": { tr: "Portföyü temizle", en: "Clear portfolio", el: "Εκκαθάριση χαρτοφυλακίου" },
  "Henüz portföy varlığı eklenmedi.": { tr: "Henüz portföy varlığı eklenmedi.", en: "No portfolio holdings have been added yet.", el: "Δεν έχουν προστεθεί ακόμη θέσεις στο χαρτοφυλάκιο." },
  "pozisyon": { tr: "pozisyon", en: "position", el: "θέση" },

  // Alerts
  "Fiyat Alarmları": { tr: "Fiyat Alarmları", en: "Price Alerts", el: "Ειδοποιήσεις Τιμών" },
  "Coin veya döviz için hedef fiyat belirle; yerel alarm paneli anlık durumu kontrol eder.": { tr: "Coin veya döviz için hedef fiyat belirle; yerel alarm paneli anlık durumu kontrol eder.", en: "Set a target price for a cryptocurrency or currency; the local alert panel checks current values.", el: "Όρισε τιμή-στόχο για κρυπτονόμισμα ή νόμισμα· ο τοπικός πίνακας ειδοποιήσεων ελέγχει τις τρέχουσες τιμές." },
  "Üstüne çıkarsa": { tr: "Üstüne çıkarsa", en: "If the price rises above", el: "Αν η τιμή ανέβει πάνω από" },
  "Altına inerse": { tr: "Altına inerse", en: "If the price falls below", el: "Αν η τιμή πέσει κάτω από" },
  "Alarm ekle": { tr: "Alarm ekle", en: "Add alert", el: "Προσθήκη ειδοποίησης" },
  "Henüz alarm eklenmedi.": { tr: "Henüz alarm eklenmedi.", en: "No alerts have been added yet.", el: "Δεν έχουν προστεθεί ακόμη ειδοποιήσεις." },

  // News
  "Piyasa Nabzi": { tr: "Piyasa Nabzı", en: "Market Pulse", el: "Παλμός της Αγοράς" },
  "Piyasa Nabzı": { tr: "Piyasa Nabzı", en: "Market Pulse", el: "Παλμός της Αγοράς" },
  "Haberler ve Piyasa Özeti": { tr: "Haberler ve Piyasa Özeti", en: "News & Market Summary", el: "Ειδήσεις & Σύνοψη Αγοράς" },
  "Piyasa sinyallerini, ekonomi takvimini, kısa haber notlarını ve kendi takip notlarını tek ekranda gör.": { tr: "Piyasa sinyallerini, ekonomi takvimini, kısa haber notlarını ve kendi takip notlarını tek ekranda gör.", en: "View market signals, the economic calendar, short news notes and your own watch notes on one screen.", el: "Δες τα σήματα της αγοράς, το οικονομικό ημερολόγιο, σύντομα ενημερωτικά σημειώματα και τις δικές σου σημειώσεις παρακολούθησης σε μία οθόνη." },
  "En güçlü coin": { tr: "En güçlü coin", en: "Top-performing crypto", el: "Κρυπτονόμισμα με την καλύτερη επίδοση" },
  "En zayıf coin": { tr: "En zayıf coin", en: "Worst-performing crypto", el: "Κρυπτονόμισμα με τη χαμηλότερη επίδοση" },
  "Etki: Orta": { tr: "Etki: Orta", en: "Impact: Medium", el: "Επίδραση: Μέτρια" },
  "Etki: Düşük": { tr: "Etki: Düşük", en: "Impact: Low", el: "Επίδραση: Χαμηλή" },
  "Etki: Yüksek": { tr: "Etki: Yüksek", en: "Impact: High", el: "Επίδραση: Υψηλή" },
  "ABD piyasa açılışı": { tr: "ABD piyasa açılışı", en: "U.S. market open", el: "Άνοιγμα των αγορών των ΗΠΑ" },
  "Kripto ve dolar paritelerinde hacim artışı takip edilebilir.": { tr: "Kripto ve dolar paritelerinde hacim artışı takip edilebilir.", en: "Watch for rising trading volume in crypto and US dollar pairs.", el: "Παρακολούθησε πιθανή αύξηση του όγκου συναλλαγών στα κρυπτονομίσματα και στα ζεύγη με δολάριο ΗΠΑ." },
  "Avrupa veri akışı": { tr: "Avrupa veri akışı", en: "European data releases", el: "Ροή οικονομικών δεδομένων από την Ευρώπη" },
  "EUR ve GBP paritelerinde kısa vadeli oynaklık oluşabilir.": { tr: "EUR ve GBP paritelerinde kısa vadeli oynaklık oluşabilir.", en: "Short-term volatility may appear in EUR and GBP pairs.", el: "Ενδέχεται να εμφανιστεί βραχυπρόθεσμη μεταβλητότητα στα ζεύγη EUR και GBP." },
  "Bu hafta": { tr: "Bu hafta", en: "This week", el: "Αυτή την εβδομάδα" },
  "Küresel risk iştahı": { tr: "Küresel risk iştahı", en: "Global risk appetite", el: "Παγκόσμια διάθεση ανάληψης κινδύνου" },
  "Portföy, alarm ve takip listesi seviyelerini güncellemek için iyi bir kontrol noktası.": { tr: "Portföy, alarm ve takip listesi seviyelerini güncellemek için iyi bir kontrol noktası.", en: "A useful checkpoint for updating portfolio, alert and watchlist levels.", el: "Ένα χρήσιμο σημείο ελέγχου για την ενημέρωση του χαρτοφυλακίου, των ειδοποιήσεων και των επιπέδων της λίστας παρακολούθησης." },
  "Piyasa Radarı": { tr: "Piyasa Radarı", en: "Market Radar", el: "Ραντάρ Αγοράς" },
  "Kripto hacminde toparlanma sinyali": { tr: "Kripto hacminde toparlanma sinyali", en: "Crypto trading volume recovery signal", el: "Σήμα ανάκαμψης του όγκου συναλλαγών κρυπτονομισμάτων" },
  "Majör coinlerde hacim artışı takip ediliyor; volatilite için alarm seviyeleri izlenmeli.": { tr: "Başlıca coinlerde hacim artışı takip ediliyor; volatilite için alarm seviyeleri izlenmeli.", en: "Trading volume is rising in major cryptocurrencies; monitor alert levels for volatility.", el: "Παρατηρείται αύξηση του όγκου συναλλαγών στα βασικά κρυπτονομίσματα· παρακολούθησε τα επίπεδα ειδοποίησης για μεταβλητότητα." },
  "Döviz masasında USD bazlı izleme öne çıkıyor": { tr: "Döviz masasında USD bazlı izleme öne çıkıyor", en: "USD-based monitoring stands out in the currency market", el: "Η παρακολούθηση με βάση το USD βρίσκεται στο επίκεντρο της αγοράς συναλλάγματος" },
  "USD/EUR ve USD/TRY hareketleri panel içindeki çevirici ve favoriler ile takip edilebilir.": { tr: "USD/EUR ve USD/TRY hareketleri panel içindeki çevirici ve favorilerle takip edilebilir.", en: "Track USD/EUR and USD/TRY movements with the dashboard currency converter and favorites.", el: "Παρακολούθησε τις κινήσεις USD/EUR και USD/TRY με τον μετατροπέα νομισμάτων και τη λίστα αγαπημένων του πίνακα." },
  "Hava etkisi: seyahat ve operasyon planları": { tr: "Hava etkisi: seyahat ve operasyon planları", en: "Weather impact: travel and operational planning", el: "Επίδραση του καιρού: ταξίδια και επιχειρησιακός σχεδιασμός" },
  "Open-Meteo tahminleri şehir bazlı 7 günlük risk takibi için kullanılabilir.": { tr: "Open-Meteo tahminleri şehir bazlı 7 günlük risk takibi için kullanılabilir.", en: "Use Open-Meteo forecasts for city-level risk monitoring over the next seven days.", el: "Οι προβλέψεις του Open-Meteo μπορούν να χρησιμοποιηθούν για την παρακολούθηση κινδύνων ανά πόλη κατά τις επόμενες επτά ημέρες." },
  "Not ekle": { tr: "Not ekle", en: "Add note", el: "Προσθήκη σημείωσης" },
  "Henüz not yok. Piyasa fikirlerini ve takip seviyelerini buraya yazabilirsin.": { tr: "Henüz not yok. Piyasa fikirlerini ve takip seviyelerini buraya yazabilirsin.", en: "No notes yet. Add your market ideas and levels to watch here.", el: "Δεν υπάρχουν ακόμη σημειώσεις. Κατέγραψε εδώ τις ιδέες σου για την αγορά και τα επίπεδα που παρακολουθείς." },
  // Search
  "Arama": { tr: "Arama", en: "Search", el: "Αναζήτηση" },
  "Arama Merkezi": { tr: "Arama Merkezi", en: "Search Center", el: "Κέντρο Αναζήτησης" },
  "Coin, döviz, altın, şehir ve site sayfalarını tek arama alanından bul.": { tr: "Coin, döviz, altın, şehir ve site sayfalarını tek arama alanından bul.", en: "Find crypto, exchange rates, gold, cities and site pages from one search field.", el: "Βρες κρυπτονομίσματα, ισοτιμίες, χρυσό, πόλεις και σελίδες του ιστότοπου από ένα πεδίο αναζήτησης." },
  "Git ve detayları gör": { tr: "Git ve detayları gör", en: "View details", el: "Προβολή λεπτομερειών" },
  "Sayfa": { tr: "Sayfa", en: "Page", el: "Σελίδα" },
  "Ekonomi Takvimi": { tr: "Ekonomi Takvimi", en: "Economic Calendar", el: "Οικονομικό Ημερολόγιο" },

  // Favorites
  "LocalStorage üzerinde saklanan döviz, coin ve şehir favorilerini buradan yönet.": { tr: "LocalStorage'da saklanan döviz, coin ve şehir favorilerini buradan yönet.", en: "Manage currency, crypto and city favorites stored in your browser.", el: "Διαχειρίσου από εδώ τις ισοτιμίες, τα κρυπτονομίσματα και τις πόλεις που έχεις αποθηκεύσει στα αγαπημένα του προγράμματος περιήγησης." },
  "Favori listesi bos": { tr: "Favori listesi boş", en: "Your favorites list is empty", el: "Η λίστα αγαπημένων είναι κενή" },
  "Favori listesi boş": { tr: "Favori listesi boş", en: "Your favorites list is empty", el: "Η λίστα αγαπημένων είναι κενή" },
  "Dövizleri, coinleri ve şehirleri favorilere ekleyerek tek panelde takip edebilirsin.": { tr: "Dövizleri, coinleri ve şehirleri favorilere ekleyerek tek panelde takip edebilirsin.", en: "Add currencies, cryptocurrencies and cities to favorites and track them in one dashboard.", el: "Πρόσθεσε νομίσματα, κρυπτονομίσματα και πόλεις στα αγαπημένα σου και παρακολούθησέ τα από έναν ενιαίο πίνακα ελέγχου." },
  // Settings
  "Kişisel Panel Ayarları": { tr: "Kişisel Panel Ayarları", en: "Personal Dashboard Settings", el: "Προσωπικές Ρυθμίσεις Πίνακα Ελέγχου" },
  "Tema, varsayılan para birimi, şehir ve panel tercihlerini yönet.": { tr: "Tema, varsayılan para birimi, şehir ve panel tercihlerini yönet.", en: "Manage your theme, default currency, city and dashboard preferences.", el: "Διαχειρίσου το θέμα, το προεπιλεγμένο νόμισμα, την πόλη και τις προτιμήσεις του πίνακα ελέγχου." },
  "Tema": { tr: "Tema", en: "Theme", el: "Θέμα" },
  "Renk modu": { tr: "Renk modu", en: "Color mode", el: "Λειτουργία χρωμάτων" },
  "Panelin vurgu rengini seç.": { tr: "Panelin vurgu rengini seç.", en: "Choose the dashboard accent color.", el: "Επίλεξε το χρώμα έμφασης του πίνακα ελέγχου." },
  "Tercihler": { tr: "Tercihler", en: "Preferences", el: "Προτιμήσεις" },
  "Varsayılanlar": { tr: "Varsayılanlar", en: "Defaults", el: "Προεπιλογές" },
  "Varsayılan para birimi": { tr: "Varsayılan para birimi", en: "Default currency", el: "Προεπιλεγμένο νόμισμα" },
  "Varsayılan şehir": { tr: "Varsayılan şehir", en: "Default city", el: "Προεπιλεγμένη πόλη" },
  "Daha kompakt ana panel": { tr: "Daha kompakt ana panel", en: "More compact dashboard", el: "Πιο συμπαγής κεντρικός πίνακας" },
  // Audited dynamic labels, placeholders and weather states
  "Coin piyasa verileri alinamadi.": { tr: "Coin piyasa verileri alınamadı.", en: "Crypto market data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων της αγοράς κρυπτονομισμάτων." },
  "Piyasa notu ekle: Örnek BTC direnç seviyesi...": { tr: "Piyasa notu ekle: Örnek BTC direnç seviyesi...", en: "Add a market note: e.g. BTC resistance level...", el: "Πρόσθεσε σημείωση αγοράς: π.χ. επίπεδο αντίστασης του BTC..." },
  "Coin, döviz, altın, şehir veya sayfa ara...": { tr: "Coin, döviz, altın, şehir veya sayfa ara...", en: "Search crypto, exchange rates, gold, cities or pages...", el: "Αναζήτησε κρυπτονομίσματα, ισοτιμίες, χρυσό, πόλεις ή σελίδες..." },
  "Gram Altın": { tr: "Gram Altın", en: "Gram Gold", el: "Χρυσός ανά γραμμάριο" },
  "Pazartesi": { tr: "Pazartesi", en: "Monday", el: "Δευτέρα" },
  "Salı": { tr: "Salı", en: "Tuesday", el: "Τρίτη" },
  "Çarşamba": { tr: "Çarşamba", en: "Wednesday", el: "Τετάρτη" },
  "Perşembe": { tr: "Perşembe", en: "Thursday", el: "Πέμπτη" },
  "Cuma": { tr: "Cuma", en: "Friday", el: "Παρασκευή" },
  "Cumartesi": { tr: "Cumartesi", en: "Saturday", el: "Σάββατο" },
  "Pazar": { tr: "Pazar", en: "Sunday", el: "Κυριακή" },
  "Açık": { tr: "Açık", en: "Clear", el: "Αίθριος" },
  "Az bulutlu": { tr: "Az bulutlu", en: "Mostly clear", el: "Σχεδόν αίθριος" },
  "Parçalı bulutlu": { tr: "Parçalı bulutlu", en: "Partly cloudy", el: "Μερικώς νεφελώδης" },
  "Çok bulutlu": { tr: "Çok bulutlu", en: "Mostly cloudy", el: "Κυρίως νεφελώδης" },
  "Kapalı": { tr: "Kapalı", en: "Overcast", el: "Νεφελώδης" },
  "Sisli": { tr: "Sisli", en: "Foggy", el: "Ομίχλη" },
  "Çisenti": { tr: "Çisenti", en: "Drizzle", el: "Ψιχάλα" },
  "Hafif yağmur": { tr: "Hafif yağmur", en: "Light rain", el: "Ασθενής βροχή" },
  "Yağmur": { tr: "Yağmur", en: "Rain", el: "Βροχή" },
  "Sağanak yağış": { tr: "Sağanak yağış", en: "Rain showers", el: "Μπόρες" },
  "Kar yağışı": { tr: "Kar yağışı", en: "Snowfall", el: "Χιονόπτωση" },
  "Gök gürültülü sağanak": { tr: "Gök gürültülü sağanak", en: "Thunderstorms", el: "Καταιγίδες" },
  "Şehir bulunamadı.": { tr: "Şehir bulunamadı.", en: "City not found.", el: "Η πόλη δεν βρέθηκε." },
  "Arama sonucu bulunamadı.": { tr: "Arama sonucu bulunamadı.", en: "No search results found.", el: "Δεν βρέθηκαν αποτελέσματα αναζήτησης." },
  "Sonuç bulunamadı.": { tr: "Sonuç bulunamadı.", en: "No results found.", el: "Δεν βρέθηκαν αποτελέσματα." },
  "Veri güncelleniyor...": { tr: "Veri güncelleniyor...", en: "Updating data...", el: "Ενημέρωση δεδομένων..." },
  "Beklemede": { tr: "Beklemede", en: "Pending", el: "Σε αναμονή" },
  "Tetiklendi": { tr: "Tetiklendi", en: "Triggered", el: "Ενεργοποιήθηκε" },

  // General states, errors and footer
  "Yükleniyor...": { tr: "Yükleniyor...", en: "Loading...", el: "Φόρτωση..." },
  "Veriler yükleniyor...": { tr: "Veriler yükleniyor...", en: "Loading data...", el: "Φόρτωση δεδομένων..." },
  "Veri alınamadı": { tr: "Veri alınamadı", en: "Data could not be loaded", el: "Δεν ήταν δυνατή η φόρτωση δεδομένων" },
  "Tekrar dene": { tr: "Tekrar dene", en: "Try again", el: "Δοκίμασε ξανά" },
  "Kaydet": { tr: "Kaydet", en: "Save", el: "Αποθήκευση" },
  "Sil": { tr: "Sil", en: "Delete", el: "Διαγραφή" },
  "Temizle": { tr: "Temizle", en: "Clear", el: "Εκκαθάριση" },
  "Kapat": { tr: "Kapat", en: "Close", el: "Κλείσιμο" },
  "Finansal veriler bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.": { tr: "Finansal veriler bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.", en: "Financial data is for informational purposes only and is not investment advice.", el: "Τα χρηματοοικονομικά δεδομένα παρέχονται μόνο για ενημερωτικούς σκοπούς και δεν αποτελούν επενδυτική συμβουλή." },
  "BoranTheGreat Piyasa Radarı": { tr: "BoranTheGreat Piyasa Radarı", en: "BoranTheGreat Market Radar", el: "Ραντάρ Αγοράς BoranTheGreat" },
};


const EXTRA_T = {
  "- Yağış %": { tr: "- Yağış %", en: "- Precipitation %", el: "- Βροχόπτωση %" },
  "% - Rüzgar": { tr: "% - Rüzgar", en: "% - Wind", el: "% - Άνεμος" },
  "+ başkent": { tr: "+ başkent", en: "+ capital", el: "+ πρωτεύουσα" },
  "3 Aylık": { tr: "3 Aylık", en: "3 Months", el: "3 Μήνες" },
  "6 Aylık": { tr: "6 Aylık", en: "6 Months", el: "6 Μήνες" },
  "Adın ne?": { tr: "Adın ne?", en: "What's your name?", el: "Πώς σε λένε;" },
  "Akıllı günlük özet": { tr: "Akıllı günlük özet", en: "Smart daily brief", el: "Έξυπνη ημερήσια σύνοψη" },
  "Akıllı risk radarı": { tr: "Akıllı risk radarı", en: "Smart risk radar", el: "Έξυπνο ραντάρ κινδύνου" },
  "Alarm kur": { tr: "Alarm kur", en: "Set an alert", el: "Ορισμός ειδοποίησης" },
  "Altın kuru": { tr: "Altın kuru", en: "Gold price", el: "Τιμή χρυσού" },
  "Altın Kuru": { tr: "Altın Kuru", en: "Gold Price", el: "Τιμή Χρυσού" },
  "Altın kuru yüklenemedi.": { tr: "Altın kuru yüklenemedi.", en: "Gold price data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων τιμής χρυσού." },
  "Altın sigortası": { tr: "Altın sigortası", en: "Gold hedge", el: "Αντιστάθμιση με χρυσό" },
  "Altın takip": { tr: "Altın takibi", en: "Gold tracking", el: "Παρακολούθηση χρυσού" },
  "Ana panel": { tr: "Ana panel", en: "Dashboard", el: "Πίνακας ελέγχου" },
  "Aranıyor...": { tr: "Aranıyor...", en: "Searching...", el: "Αναζήτηση..." },
  "Asistani kapat": { tr: "Asistanı kapat", en: "Close assistant", el: "Κλείσιμο βοηθού" },
  "Aylık": { tr: "Aylık", en: "Monthly", el: "Μηνιαία" },
  "başkent listeleniyor": { tr: "başkent listeleniyor", en: "capitals listed", el: "πρωτεύουσες στη λίστα" },
  "Başkent seç ve canlı tahmini aç": { tr: "Başkent seç ve canlı tahmini aç", en: "Select a capital and open the live forecast", el: "Επίλεξε πρωτεύουσα και άνοιξε τη ζωντανή πρόγνωση" },
  "Başkentler ve şehir arama": { tr: "Başkentler ve şehir arama", en: "Capitals and city search", el: "Πρωτεύουσες και αναζήτηση πόλεων" },
  "Bekleniyor": { tr: "Bekleniyor", en: "Waiting", el: "Αναμονή" },
  "BG logosunun üstünde mouse gezdir; mini slither hareket eder.": { tr: "BG logosunun üzerinde fareyi gezdir; mini slither hareket eder.", en: "Move the pointer over the BG logo to animate the mini slither.", el: "Μετακίνησε τον δείκτη πάνω από το λογότυπο BG για να κινηθεί το μικρό φιδάκι." },
  "Bir sey sor...": { tr: "Bir şey sor...", en: "Ask something...", el: "Ρώτησε κάτι..." },
  "BoranTheGreat Instagram hesabını aç": { tr: "BoranTheGreat Instagram hesabını aç", en: "Open the BoranTheGreat Instagram account", el: "Άνοιγμα του λογαριασμού BoranTheGreat στο Instagram" },
  "Bugün neye bakmalı?": { tr: "Bugün neye bakmalı?", en: "What should you watch today?", el: "Τι αξίζει να παρακολουθήσεις σήμερα;" },
  "Bugünkü piyasa modu": { tr: "Bugünkü piyasa modu", en: "Today's market mode", el: "Η σημερινή κατάσταση της αγοράς" },
  "Canlı": { tr: "Canlı", en: "Live", el: "Ζωντανά" },
  "Canlı akış verisi alınamadı.": { tr: "Canlı akış verisi alınamadı.", en: "Live feed data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων ζωντανής ροής." },
  "Canlı başkent hava durumu": { tr: "Canlı başkent hava durumu", en: "Live capital-city weather", el: "Ζωντανός καιρός πρωτευουσών" },
  "Canlı hava durumu": { tr: "Canlı hava durumu", en: "Live weather", el: "Ζωντανός καιρός" },
  "Canlı takip listesi": { tr: "Canlı takip listesi", en: "Live watchlist", el: "Ζωντανή λίστα παρακολούθησης" },
  "Canli hassas veri bandi": { tr: "Canlı hassas veri bandı", en: "Live precision data strip", el: "Ζωντανή λωρίδα δεδομένων υψηλής ακρίβειας" },
  "Canli veri bekleniyor.": { tr: "Canlı veri bekleniyor.", en: "Waiting for live data.", el: "Αναμονή ζωντανών δεδομένων." },
  "coin": { tr: "coin", en: "crypto", el: "κρυπτονόμισμα" },
  "Coin ortalaması": { tr: "Coin ortalaması", en: "Crypto average", el: "Μέσος όρος κρυπτονομισμάτων" },
  "Coin oynaklığı, altın takibi ve hava riski tek panelde okunabilir hale getirildi.": { tr: "Coin oynaklığı, altın takibi ve hava riski tek panelde okunabilir hâle getirildi.", en: "Crypto volatility, gold tracking and weather risk are combined in one easy-to-read panel.", el: "Η μεταβλητότητα των κρυπτονομισμάτων, η παρακολούθηση χρυσού και ο κίνδυνος καιρού συνδυάζονται σε έναν ευανάγνωστο πίνακα." },
  "Coin Özeti": { tr: "Coin Özeti", en: "Crypto Summary", el: "Σύνοψη Κρυπτονομισμάτων" },
  "Coin takip": { tr: "Coin takibi", en: "Crypto tracking", el: "Παρακολούθηση κρυπτονομισμάτων" },
  "Coin verileri yüklenemedi.": { tr: "Coin verileri yüklenemedi.", en: "Crypto data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων κρυπτονομισμάτων." },
  "Coin verisi": { tr: "Coin verisi", en: "Crypto data", el: "Δεδομένα κρυπτονομισμάτων" },
  "Coin, döviz, altın, hava veya sayfa ara.": { tr: "Coin, döviz, altın, hava veya sayfa ara.", en: "Search crypto, currencies, gold, weather or pages.", el: "Αναζήτησε κρυπτονομίσματα, ισοτιμίες, χρυσό, καιρό ή σελίδες." },
  "Coinler yükleniyor": { tr: "Coinler yükleniyor", en: "Loading cryptocurrencies", el: "Φόρτωση κρυπτονομισμάτων" },
  "Ctrl + K ile hızlı geçiş": { tr: "Ctrl + K ile hızlı geçiş", en: "Quick navigation with Ctrl + K", el: "Γρήγορη πλοήγηση με Ctrl + K" },
  "Detay grafiği": { tr: "Detay grafiği", en: "Detailed chart", el: "Αναλυτικό γράφημα" },
  "Doğrulanmış görsel yok": { tr: "Doğrulanmış görsel yok", en: "No verified image", el: "Δεν υπάρχει επαληθευμένη εικόνα" },
  "Doğrulanmış şehir görseli": { tr: "Doğrulanmış şehir görseli", en: "Verified city image", el: "Επαληθευμένη εικόνα πόλης" },
  "Döviz çevirisi yapılamadı. Lütfen tekrar deneyin.": { tr: "Döviz çevirisi yapılamadı. Lütfen tekrar deneyin.", en: "Currency conversion failed. Please try again.", el: "Η μετατροπή νομίσματος απέτυχε. Δοκίμασε ξανά." },
  "Döviz grafiği alınamadı.": { tr: "Döviz grafiği alınamadı.", en: "The exchange-rate chart could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση του γραφήματος ισοτιμιών." },
  "Döviz hesapla": { tr: "Döviz hesapla", en: "Convert currency", el: "Μετατροπή νομίσματος" },
  "Döviz Özeti": { tr: "Döviz Özeti", en: "Currency Summary", el: "Σύνοψη Ισοτιμιών" },
  "Döviz verileri yüklenemedi.": { tr: "Döviz verileri yüklenemedi.", en: "Exchange-rate data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων ισοτιμιών." },
  "Dünya başkent radarı": { tr: "Dünya başkent radarı", en: "World capital radar", el: "Ραντάρ πρωτευουσών του κόσμου" },
  "Dünya hava radarı": { tr: "Dünya hava radarı", en: "World weather radar", el: "Παγκόσμιο μετεωρολογικό ραντάρ" },
  "Düşük": { tr: "Düşük", en: "Low", el: "Χαμηλή" },
  "En güçlü / zayıf": { tr: "En güçlü / zayıf", en: "Strongest / weakest", el: "Ισχυρότερο / ασθενέστερο" },
  "En hareketli coin": { tr: "En hareketli coin", en: "Most active crypto", el: "Κρυπτονόμισμα με τη μεγαλύτερη κίνηση" },
  "Etki:": { tr: "Etki:", en: "Impact:", el: "Επίδραση:" },
  "Favorilerden kaldir": { tr: "Favorilerden kaldır", en: "Remove from favorites", el: "Αφαίρεση από τα αγαπημένα" },
  "Favorileri aç": { tr: "Favorileri aç", en: "Open favorites", el: "Άνοιγμα αγαπημένων" },
  "Favorileri temizle": { tr: "Favorileri temizle", en: "Clear favorites", el: "Εκκαθάριση αγαπημένων" },
  "Grafiği kapat": { tr: "Grafiği kapat", en: "Close chart", el: "Κλείσιμο γραφήματος" },
  "Gram altın": { tr: "Gram altın", en: "Gram gold", el: "Χρυσός ανά γραμμάριο" },
  "Gram altın takip et": { tr: "Gram altını takip et", en: "Track gram gold", el: "Παρακολούθηση χρυσού ανά γραμμάριο" },
  "Gram altın TRY bazlı": { tr: "Gram altın TRY bazlı", en: "Gram gold in TRY", el: "Χρυσός ανά γραμμάριο σε TRY" },
  "Gram USD": { tr: "Gram USD", en: "Gram USD", el: "Γραμμάριο σε USD" },
  "Gram ve ons altın": { tr: "Gram ve ons altın", en: "Gram and ounce gold", el: "Χρυσός ανά γραμμάριο και ουγγιά" },
  "Güncel:": { tr: "Güncel:", en: "Current:", el: "Τρέχουσα τιμή:" },
  "Günlük": { tr: "Günlük", en: "Daily", el: "Ημερήσια" },
  "Haber ve takvim": { tr: "Haber ve takvim", en: "News and calendar", el: "Ειδήσεις και ημερολόγιο" },
  "Haftalık": { tr: "Haftalık", en: "Weekly", el: "Εβδομαδιαία" },
  "Hava Durumu Özeti": { tr: "Hava Durumu Özeti", en: "Weather Summary", el: "Σύνοψη Καιρού" },
  "Hava durumu sayfasindan anlik takip edilebilir.": { tr: "Hava durumu sayfasından anlık takip edilebilir.", en: "You can track it live on the weather page.", el: "Μπορείς να το παρακολουθείς ζωντανά στη σελίδα καιρού." },
  "Hava durumu yüklenemedi.": { tr: "Hava durumu yüklenemedi.", en: "Weather data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων καιρού." },
  "Hava riski": { tr: "Hava riski", en: "Weather risk", el: "Κίνδυνος καιρού" },
  "Hedef fiyat belirle": { tr: "Hedef fiyat belirle", en: "Set a target price", el: "Ορισμός τιμής-στόχου" },
  "Hedef fiyatlar": { tr: "Hedef fiyatlar", en: "Target prices", el: "Τιμές-στόχοι" },
  "Hedef:": { tr: "Hedef:", en: "Target:", el: "Στόχος:" },
  "Her şeyi bul": { tr: "Her şeyi bul", en: "Find anything", el: "Βρες τα πάντα" },
  "Hesaplanıyor...": { tr: "Hesaplanıyor...", en: "Calculating...", el: "Υπολογισμός..." },
  "Hızlı İşlemler": { tr: "Hızlı İşlemler", en: "Quick Actions", el: "Γρήγορες Ενέργειες" },
  "İpuçlarını kapat": { tr: "İpuçlarını kapat", en: "Close tips", el: "Κλείσιμο συμβουλών" },
  "Kaldır": { tr: "Kaldır", en: "Remove", el: "Αφαίρεση" },
  "Kaynak: Wikipedia - doğrulanmış sayfa eşleşmesi": { tr: "Kaynak: Wikipedia - doğrulanmış sayfa eşleşmesi", en: "Source: Wikipedia — verified page match", el: "Πηγή: Wikipedia — επαληθευμένη αντιστοίχιση σελίδας" },
  "Kısa kullanım rehberi": { tr: "Kısa kullanım rehberi", en: "Quick user guide", el: "Σύντομος οδηγός χρήσης" },
  "Kişisel not": { tr: "Kişisel not", en: "Personal note", el: "Προσωπική σημείωση" },
  "Kişisel Piyasa Notları": { tr: "Kişisel Piyasa Notları", en: "Personal Market Notes", el: "Προσωπικές Σημειώσεις Αγοράς" },
  "Komut paletini aç, sayfalara hızlı geç.": { tr: "Komut paletini aç, sayfalara hızlı geç.", en: "Open the command palette to move quickly between pages.", el: "Άνοιξε την παλέτα εντολών για γρήγορη μετάβαση μεταξύ σελίδων." },
  "Komut paletini kapat": { tr: "Komut paletini kapat", en: "Close command palette", el: "Κλείσιμο παλέτας εντολών" },
  "Kontrol": { tr: "Kontrol", en: "Checking", el: "Έλεγχος" },
  "Kontrol merkezine dön": { tr: "Kontrol merkezine dön", en: "Return to the control center", el: "Επιστροφή στο κέντρο ελέγχου" },
  "Kullanım ipuçları": { tr: "Kullanım ipuçları", en: "Usage tips", el: "Συμβουλές χρήσης" },
  "Kur çevir": { tr: "Kur çevir", en: "Convert currencies", el: "Μετατροπή νομισμάτων" },
  "Kurlar ve çevirici": { tr: "Kurlar ve çevirici", en: "Rates and converter", el: "Ισοτιμίες και μετατροπέας" },
  "Listede yoksa dünya genelinde şehir ara...": { tr: "Listede yoksa dünya genelinde şehir ara...", en: "Search for any city worldwide if it is not listed...", el: "Αναζήτησε οποιαδήποτε πόλη παγκοσμίως αν δεν βρίσκεται στη λίστα..." },
  "Logoya tıklayınca boranthegreat Instagram hesabına gider.": { tr: "Logoya tıklayınca BoranTheGreat Instagram hesabına gider.", en: "Clicking the logo opens the BoranTheGreat Instagram account.", el: "Κάνοντας κλικ στο λογότυπο ανοίγει ο λογαριασμός BoranTheGreat στο Instagram." },
  "Merhaba nasılsın?": { tr: "Merhaba, nasılsın?", en: "Hello, how are you?", el: "Γεια σου, τι κάνεις;" },
  "Nem %": { tr: "Nem %", en: "Humidity %", el: "Υγρασία %" },
  "Ons Altın": { tr: "Ons Altın", en: "Gold Ounce", el: "Ουγγιά Χρυσού" },
  "Öne çıkan başkentleri anlık izle; alttaki listeden dünyadaki başkentlerden birini seçip detaylı 7 günlük tahmini aç.": { tr: "Öne çıkan başkentleri anlık izle; alttaki listeden dünyadaki başkentlerden birini seçip detaylı 7 günlük tahmini aç.", en: "Monitor featured capitals live, then select any world capital below to open its detailed 7-day forecast.", el: "Παρακολούθησε ζωντανά τις επιλεγμένες πρωτεύουσες και διάλεξε παρακάτω οποιαδήποτε πρωτεύουσα του κόσμου για αναλυτική πρόγνωση 7 ημερών." },
  "Önümüzdeki 12 saat": { tr: "Önümüzdeki 12 saat", en: "Next 12 hours", el: "Επόμενες 12 ώρες" },
  "Panel modülü": { tr: "Panel modülü", en: "Dashboard module", el: "Μονάδα πίνακα ελέγχου" },
  "Paneli kişiselleştir": { tr: "Paneli kişiselleştir", en: "Personalize dashboard", el: "Εξατομίκευση πίνακα" },
  "Piyasa değeri:": { tr: "Piyasa değeri:", en: "Market cap:", el: "Κεφαλαιοποίηση αγοράς:" },
  "Piyasa Haberleri": { tr: "Piyasa Haberleri", en: "Market News", el: "Ειδήσεις Αγορών" },
  "Piyasa notları": { tr: "Piyasa notları", en: "Market notes", el: "Σημειώσεις αγοράς" },
  "Piyasa özeti": { tr: "Piyasa özeti", en: "Market summary", el: "Σύνοψη αγοράς" },
  "Piyasa Özeti": { tr: "Piyasa Özeti", en: "Market Summary", el: "Σύνοψη Αγοράς" },
  "Piyasa özeti yükleniyor.": { tr: "Piyasa özeti yükleniyor.", en: "Loading market summary.", el: "Φόρτωση σύνοψης αγοράς." },
  "Portföy ekle": { tr: "Portföy ekle", en: "Add to portfolio", el: "Προσθήκη στο χαρτοφυλάκιο" },
  "Risk radarı verisi alınamadı.": { tr: "Risk radarı verisi alınamadı.", en: "Risk radar data could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των δεδομένων του ραντάρ κινδύνου." },
  "Risk skoru": { tr: "Risk skoru", en: "Risk score", el: "Βαθμολογία κινδύνου" },
  "Saatlik tahmin": { tr: "Saatlik tahmin", en: "Hourly forecast", el: "Ωριαία πρόγνωση" },
  "Sağ alttan soru sor; piyasa, hava, kod veya genel konu.": { tr: "Sağ alttan soru sor; piyasa, hava, kod veya genel konu.", en: "Ask a question from the lower-right corner about markets, weather, code or anything else.", el: "Κάνε μια ερώτηση από την κάτω δεξιά γωνία για αγορές, καιρό, κώδικα ή οποιοδήποτε άλλο θέμα." },
  "Sağ üstten Mint, Mavi, Mor, Altın veya Rose seç.": { tr: "Sağ üstten Mint, Mavi, Mor, Altın veya Rose seç.", en: "Choose Mint, Blue, Purple, Gold or Rose from the upper-right corner.", el: "Επίλεξε Μέντα, Μπλε, Μωβ, Χρυσό ή Ροζ από την επάνω δεξιά γωνία." },
  "Sayfa, coin, döviz, hava veya ayar ara...": { tr: "Sayfa, coin, döviz, hava veya ayar ara...", en: "Search pages, crypto, currencies, weather or settings...", el: "Αναζήτησε σελίδες, κρυπτονομίσματα, ισοτιμίες, καιρό ή ρυθμίσεις..." },
  "Seçilen şehir için tanıtıcı görsel alanı": { tr: "Seçilen şehir için tanıtıcı görsel alanı", en: "Featured image area for the selected city", el: "Περιοχή χαρακτηριστικής εικόνας για την επιλεγμένη πόλη" },
  "Site içinde ara": { tr: "Site içinde ara", en: "Search the site", el: "Αναζήτηση στον ιστότοπο" },
  "Siteyi daha hızlı kullan": { tr: "Siteyi daha hızlı kullan", en: "Use the site faster", el: "Χρησιμοποίησε τον ιστότοπο πιο γρήγορα" },
  "Sonuç": { tr: "Sonuç", en: "Result", el: "Αποτέλεσμα" },
  "Şehir aranamadı.": { tr: "Şehir aranamadı.", en: "City search failed.", el: "Η αναζήτηση πόλης απέτυχε." },
  "Şehir görseli": { tr: "Şehir görseli", en: "City image", el: "Εικόνα πόλης" },
  "Şehir görseli doğrulanıyor...": { tr: "Şehir görseli doğrulanıyor...", en: "Verifying city image...", el: "Επαλήθευση εικόνας πόλης..." },
  "Tahmin": { tr: "Tahmin", en: "Forecast", el: "Πρόγνωση" },
  "Tahmin bekleniyor": { tr: "Tahmin bekleniyor", en: "Waiting for forecast", el: "Αναμονή πρόγνωσης" },
  "Tahmin yükleniyor": { tr: "Tahmin yükleniyor", en: "Loading forecast", el: "Φόρτωση πρόγνωσης" },
  "Tam değer:": { tr: "Tam değer:", en: "Exact value:", el: "Ακριβής τιμή:" },
  "Tema ve panel ayarları": { tr: "Tema ve panel ayarları", en: "Theme and dashboard settings", el: "Ρυθμίσεις θέματος και πίνακα" },
  "tetiklenen alarm": { tr: "tetiklenen alarm", en: "triggered alert", el: "ενεργοποιημένη ειδοποίηση" },
  "TRY bazlı gram fiyat": { tr: "TRY bazlı gram fiyat", en: "Gram price in TRY", el: "Τιμή γραμμαρίου σε TRY" },
  "Tüm başkentler": { tr: "Tüm başkentler", en: "All capitals", el: "Όλες οι πρωτεύουσες" },
  "USD / EUR 14 Günlük Eğilim": { tr: "USD / EUR 14 Günlük Eğilim", en: "USD / EUR 14-Day Trend", el: "Τάση USD / EUR 14 Ημερών" },
  "Varlık değerini takip et": { tr: "Varlık değerini takip et", en: "Track asset value", el: "Παρακολούθηση αξίας στοιχείων" },
  "varlık takipte": { tr: "varlık takipte", en: "assets tracked", el: "στοιχεία υπό παρακολούθηση" },
  "Varlıklarını takip et": { tr: "Varlıklarını takip et", en: "Track your assets", el: "Παρακολούθησε τα στοιχεία σου" },
  "Veri bekleniyor": { tr: "Veri bekleniyor", en: "Waiting for data", el: "Αναμονή δεδομένων" },
  "Veri geçici olarak bekliyor": { tr: "Veri geçici olarak bekliyor", en: "Data is temporarily pending", el: "Τα δεδομένα βρίσκονται προσωρινά σε αναμονή" },
  "Veri Kalitesi": { tr: "Veri Kalitesi", en: "Data Quality", el: "Ποιότητα Δεδομένων" },
  "XAU/USD yaklaşık ons fiyat": { tr: "XAU/USD yaklaşık ons fiyat", en: "Approximate XAU/USD ounce price", el: "Κατά προσέγγιση τιμή ουγγιάς XAU/USD" },
  "Yağış": { tr: "Yağış", en: "Precipitation", el: "Βροχόπτωση" },
  "Yanlış şehir fotoğrafı göstermemek için bu alan boş bırakıldı.": { tr: "Yanlış şehir fotoğrafı göstermemek için bu alan boş bırakıldı.", en: "This area was left blank to avoid showing an incorrect city image.", el: "Η περιοχή έμεινε κενή ώστε να μην εμφανιστεί λανθασμένη εικόνα πόλης." },
  "Yapay Zeka Asistanı": { tr: "Yapay Zekâ Asistanı", en: "AI Assistant", el: "Βοηθός Τεχνητής Νοημοσύνης" },
  "Yeni özellikleri kaçırma": { tr: "Yeni özellikleri kaçırma", en: "Don't miss new features", el: "Μην χάσεις τις νέες λειτουργίες" },
  "Yerel akilli mod": { tr: "Yerel akıllı mod", en: "Local smart mode", el: "Τοπική έξυπνη λειτουργία" },
  "Yıllık": { tr: "Yıllık", en: "Yearly", el: "Ετήσια" },
  "Yükleniyor": { tr: "Yükleniyor", en: "Loading", el: "Φόρτωση" },
  "Yüksek": { tr: "Yüksek", en: "High", el: "Υψηλή" },
  "1 USD karsiligi": { tr: "1 USD karşılığı", en: "Equivalent to 1 USD", el: "Αντιστοιχεί σε 1 USD" },
  "24s Hacim (M USD)": { tr: "24s Hacim (M USD)", en: "24h Volume (M USD)", el: "Όγκος 24ώρου (εκατ. USD)" },
  "Baz 1,00": { tr: "Baz 1,00", en: "Base 1.00", el: "Βάση 1,00" },
  "Kisaltma yok, degerler detayli formatta.": { tr: "Kısaltma yok, değerler ayrıntılı biçimde gösterilir.", en: "No abbreviations; values are shown in full detail.", el: "Χωρίς συντομεύσεις· οι τιμές εμφανίζονται αναλυτικά." },
  "24s": { tr: "24s", en: "24h", el: "24ω" },
  "Genel AI modu": { tr: "Genel AI modu", en: "General AI mode", el: "Γενική λειτουργία AI" },
  "Cevap araniyor...": { tr: "Cevap aranıyor...", en: "Searching for an answer...", el: "Αναζήτηση απάντησης..." },
  "Soruyu gonder": { tr: "Soruyu gönder", en: "Send question", el: "Αποστολή ερώτησης" },
  "Instagram adresin ne?": { tr: "Instagram adresin ne?", en: "What's your Instagram address?", el: "Ποια είναι η διεύθυνσή σου στο Instagram;" },
  "Genel arama": { tr: "Genel arama", en: "Global search", el: "Γενική αναζήτηση" },
  "BorAI su anda cevap veremedi. Biraz sonra tekrar dene.": { tr: "BorAI şu anda cevap veremedi. Biraz sonra tekrar dene.", en: "BorAI cannot answer right now. Please try again shortly.", el: "Το BorAI δεν μπορεί να απαντήσει αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο." },
  "Sakin radar": { tr: "Sakin radar", en: "Calm radar", el: "Ήρεμη εικόνα" },
  "Dengeli takip": { tr: "Dengeli takip", en: "Balanced watch", el: "Ισορροπημένη παρακολούθηση" },
  "Yüksek dikkat": { tr: "Yüksek dikkat", en: "High caution", el: "Υψηλή προσοχή" },
  "Oynaklık": { tr: "Oynaklık", en: "Volatility", el: "Μεταβλητότητα" },
  "Son yenileme": { tr: "Son yenileme", en: "Last refresh", el: "Τελευταία ανανέωση" },
  "Uygulamayı yükle": { tr: "Uygulamayı yükle", en: "Install app", el: "Εγκατάσταση εφαρμογής" },
  "Safari’de Paylaş düğmesine, ardından “Ana Ekrana Ekle” seçeneğine bas.": { tr: "Safari’de Paylaş düğmesine, ardından “Ana Ekrana Ekle” seçeneğine bas.", en: "In Safari, tap Share and then Add to Home Screen.", el: "Στο Safari, πάτησε Κοινοποίηση και έπειτα Προσθήκη στην οθόνη Αφετηρίας." },
  "Google ile giriş": { tr: "Google ile giriş", en: "Sign in with Google", el: "Σύνδεση με Google" },
  "Google ile giriş yap": { tr: "Google ile giriş yap", en: "Sign in with Google", el: "Σύνδεση με Google" },
  "Bulut kurulumu": { tr: "Bulut kurulumu", en: "Cloud setup", el: "Ρύθμιση cloud" },
  "Bulut hesabı": { tr: "Bulut hesabı", en: "Cloud account", el: "Λογαριασμός cloud" },
  "Bulutla eşitlendi": { tr: "Bulutla eşitlendi", en: "Synced to cloud", el: "Συγχρονίστηκε στο cloud" },
  "Kaydediliyor...": { tr: "Kaydediliyor...", en: "Saving...", el: "Αποθήκευση..." },
  "Senkronizasyon kontrol ediliyor": { tr: "Senkronizasyon kontrol ediliyor", en: "Checking sync", el: "Έλεγχος συγχρονισμού" },
  "Şimdi eşitle": { tr: "Şimdi eşitle", en: "Sync now", el: "Συγχρονισμός τώρα" },
  "Çıkış yap": { tr: "Çıkış yap", en: "Sign out", el: "Αποσύνδεση" },
  "Cihazlar arası senkronizasyon": { tr: "Cihazlar arası senkronizasyon", en: "Cross-device sync", el: "Συγχρονισμός μεταξύ συσκευών" },
  "Portföy, favoriler, alarmlar, notlar, tema ve dil tercihi hesabına kaydedilir.": { tr: "Portföy, favoriler, alarmlar, notlar, tema ve dil tercihi hesabına kaydedilir.", en: "Your portfolio, favorites, alerts, notes, theme and language preference are saved to your account.", el: "Το χαρτοφυλάκιο, τα αγαπημένα, οι ειδοποιήσεις, οι σημειώσεις, το θέμα και η γλώσσα αποθηκεύονται στον λογαριασμό σου." },
  "Her şey bulutla eşitlendi": { tr: "Her şey bulutla eşitlendi", en: "Everything is synced to the cloud", el: "Όλα έχουν συγχρονιστεί στο cloud" },
  "Değişiklikler kaydediliyor": { tr: "Değişiklikler kaydediliyor", en: "Saving changes", el: "Αποθήκευση αλλαγών" },
  "Gerçek bildirim": { tr: "Gerçek bildirim", en: "Push notifications", el: "Ειδοποιήσεις push" },
  "Site kapalıyken fiyat alarmı": { tr: "Site kapalıyken fiyat alarmı", en: "Price alerts while the site is closed", el: "Ειδοποιήσεις τιμής όταν ο ιστότοπος είναι κλειστός" },
  "Google hesabın ve push altyapısı bağlandığında hedef gerçekleşince cihazına bildirim gelir.": { tr: "Google hesabın ve push altyapısı bağlandığında hedef gerçekleşince cihazına bildirim gelir.", en: "Once your Google account and push service are connected, your device is notified when a target is reached.", el: "Όταν συνδεθούν ο λογαριασμός Google και η υπηρεσία push, η συσκευή σου ειδοποιείται μόλις επιτευχθεί ένας στόχος." },
  "Bildirimleri aç": { tr: "Bildirimleri aç", en: "Enable notifications", el: "Ενεργοποίηση ειδοποιήσεων" },
  "Bildirimleri kapat": { tr: "Bildirimleri kapat", en: "Disable notifications", el: "Απενεργοποίηση ειδοποιήσεων" },
  "Arka plan fiyat bildirimleri açıldı.": { tr: "Arka plan fiyat bildirimleri açıldı.", en: "Background price notifications are enabled.", el: "Οι ειδοποιήσεις τιμών στο παρασκήνιο ενεργοποιήθηκαν." },
  "Arka plan bildirimleri kapatıldı.": { tr: "Arka plan bildirimleri kapatıldı.", en: "Background notifications are disabled.", el: "Οι ειδοποιήσεις στο παρασκήνιο απενεργοποιήθηκαν." },
  "Bu tarayıcı Web Push özelliğini desteklemiyor.": { tr: "Bu tarayıcı Web Push özelliğini desteklemiyor.", en: "This browser does not support Web Push.", el: "Αυτό το πρόγραμμα περιήγησης δεν υποστηρίζει Web Push." },
  "Detay sayfasını aç": { tr: "Detay sayfasını aç", en: "Open details", el: "Άνοιγμα λεπτομερειών" },
  "Güncel fiyat": { tr: "Güncel fiyat", en: "Current price", el: "Τρέχουσα τιμή" },
  "24s değişim": { tr: "24s değişim", en: "24h change", el: "Μεταβολή 24ώρου" },
  "24s en yüksek": { tr: "24s en yüksek", en: "24h high", el: "Υψηλό 24ώρου" },
  "24s en düşük": { tr: "24s en düşük", en: "24h low", el: "Χαμηλό 24ώρου" },
  "Tüm zamanlar zirvesi": { tr: "Tüm zamanlar zirvesi", en: "All-time high", el: "Ιστορικό υψηλό" },
  "Dolaşımdaki arz": { tr: "Dolaşımdaki arz", en: "Circulating supply", el: "Κυκλοφορούσα προσφορά" },
  "Portföye 1 adet ekle": { tr: "Portföye 1 adet ekle", en: "Add 1 unit to portfolio", el: "Προσθήκη 1 μονάδας στο χαρτοφυλάκιο" },
  "Portföye ekle": { tr: "Portföye ekle", en: "Add to portfolio", el: "Προσθήκη στο χαρτοφυλάκιο" },
  "USD alarmı kur": { tr: "USD alarmı kur", en: "Set USD alert", el: "Ορισμός ειδοποίησης USD" },
  "Fiyat geçmişi": { tr: "Fiyat geçmişi", en: "Price history", el: "Ιστορικό τιμής" },
  "hakkında": { tr: "hakkında", en: "About", el: "Σχετικά με" },
  "Resmî site": { tr: "Resmî site", en: "Official website", el: "Επίσημος ιστότοπος" },
  "Son güncelleme:": { tr: "Son güncelleme:", en: "Last updated:", el: "Τελευταία ενημέρωση:" },
  "Hedef fiyat": { tr: "Hedef fiyat", en: "Target price", el: "Τιμή-στόχος" },
  "değerinin farklı para birimlerindeki güncel karşılığı.": { tr: "değerinin farklı para birimlerindeki güncel karşılığı.", en: "current value in different currencies.", el: "τρέχουσα αξία σε διαφορετικά νομίσματα." },
  "Ekonomi": { tr: "Ekonomi", en: "Economy", el: "Οικονομία" },
  "Kripto": { tr: "Kripto", en: "Crypto", el: "Κρυπτονομίσματα" },
  "Dünya": { tr: "Dünya", en: "World", el: "Κόσμος" },
  "Yenile": { tr: "Yenile", en: "Refresh", el: "Ανανέωση" },
  "Haberi aç": { tr: "Haberi aç", en: "Open article", el: "Άνοιγμα άρθρου" },
  "Canlı ekonomi takvimi için Vercel’e": { tr: "Canlı ekonomi takvimi için Vercel’e", en: "For a live economic calendar, add", el: "Για ζωντανό οικονομικό ημερολόγιο, πρόσθεσε" },
  "eklenmeli. Şu an güvenli örnek görünüm gösteriliyor.": { tr: "eklenmeli. Şu an güvenli örnek görünüm gösteriliyor.", en: "to Vercel. A safe sample view is currently shown.", el: "στο Vercel. Προς το παρόν εμφανίζεται ασφαλές δείγμα." },
  "Gerçekleşen": { tr: "Gerçekleşen", en: "Actual", el: "Πραγματικό" },
  "Beklenti": { tr: "Beklenti", en: "Forecast", el: "Πρόβλεψη" },
  "Önceki": { tr: "Önceki", en: "Previous", el: "Προηγούμενο" },
  "Şu anda çevrimdışısın": { tr: "Şu anda çevrimdışısın", en: "You are offline", el: "Βρίσκεσαι εκτός σύνδεσης" },
  "Bağlantı geri geldiğinde canlı piyasa ve hava verileri otomatik olarak yenilenecek.": { tr: "Bağlantı geri geldiğinde canlı piyasa ve hava verileri otomatik olarak yenilenecek.", en: "Live market and weather data will refresh automatically when your connection returns.", el: "Τα ζωντανά δεδομένα αγοράς και καιρού θα ανανεωθούν αυτόματα όταν επανέλθει η σύνδεση." },
  "Bulut hesabı ve senkronizasyon": { tr: "Bulut hesabı ve senkronizasyon", en: "Cloud account and sync", el: "Λογαριασμός cloud και συγχρονισμός" },
  "Supabase kurulumu tamamlanınca aktif olur": { tr: "Supabase kurulumu tamamlanınca aktif olur", en: "Available after Supabase setup is complete", el: "Ενεργοποιείται μόλις ολοκληρωθεί η ρύθμιση του Supabase" },
  "Bağlantı kontrol ediliyor": { tr: "Bağlantı kontrol ediliyor", en: "Checking connection", el: "Έλεγχος σύνδεσης" },
  "Supabase anahtarları Vercel’e eklenince Google giriş sistemi otomatik aktif olur. Kurulum adımları ZIP içindeki": { tr: "Supabase anahtarları Vercel’e eklenince Google giriş sistemi otomatik aktif olur. Kurulum adımları ZIP içindeki", en: "Google sign-in is enabled automatically after the Supabase keys are added to Vercel. Setup steps are in", el: "Η σύνδεση με Google ενεργοποιείται αυτόματα μόλις προστεθούν τα κλειδιά Supabase στο Vercel. Τα βήματα εγκατάστασης βρίσκονται στο" },
  "KURULUM.md": { tr: "KURULUM.md", en: "KURULUM.md", el: "KURULUM.md" },
  "dosyasında hazır.": { tr: "dosyasında hazır.", en: "inside the ZIP.", el: "μέσα στο αρχείο ZIP." },
  "Bildirim izni verilmedi.": { tr: "Bildirim izni verilmedi.", en: "Notification permission was not granted.", el: "Δεν δόθηκε άδεια για ειδοποιήσεις." },
  "VAPID anahtarları henüz Vercel’e eklenmemiş.": { tr: "VAPID anahtarları henüz Vercel’e eklenmemiş.", en: "The VAPID keys have not been added to Vercel yet.", el: "Τα κλειδιά VAPID δεν έχουν προστεθεί ακόμη στο Vercel." },
  "Bildirim kaydedilemedi.": { tr: "Bildirim kaydedilemedi.", en: "The notification subscription could not be saved.", el: "Δεν ήταν δυνατή η αποθήκευση της εγγραφής ειδοποιήσεων." },
  "Bildirim açılamadı.": { tr: "Bildirim açılamadı.", en: "Notifications could not be enabled.", el: "Δεν ήταν δυνατή η ενεργοποίηση των ειδοποιήσεων." },
  "Uygulama olarak yükle": { tr: "Uygulama olarak yükle", en: "Install as an app", el: "Εγκατάσταση ως εφαρμογή" },
  "Coin detayı yüklenemedi.": { tr: "Coin detayı yüklenemedi.", en: "Crypto details could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των λεπτομερειών του κρυπτονομίσματος." },
  "Döviz detayı yüklenemedi.": { tr: "Döviz detayı yüklenemedi.", en: "Currency details could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των λεπτομερειών του νομίσματος." },
  "Favorilerden kaldır": { tr: "Favorilerden kaldır", en: "Remove from favorites", el: "Αφαίρεση από τα αγαπημένα" },
  "24s hacim": { tr: "24s hacim", en: "24h volume", el: "Όγκος 24ώρου" },
  "Haberler yüklenemedi.": { tr: "Haberler yüklenemedi.", en: "News could not be loaded.", el: "Δεν ήταν δυνατή η φόρτωση των ειδήσεων." },
  "Orta": { tr: "Orta", en: "Medium", el: "Μέτρια" },
  "Google hesabı bağlanıyor...": { tr: "Google hesabı bağlanıyor...", en: "Connecting your Google account...", el: "Σύνδεση του λογαριασμού Google..." },
  "Giriş bilgisi alınamadı. Lütfen tekrar deneyin.": { tr: "Giriş bilgisi alınamadı. Lütfen tekrar deneyin.", en: "Sign-in information could not be received. Please try again.", el: "Δεν ήταν δυνατή η λήψη των στοιχείων σύνδεσης. Δοκίμασε ξανά." },
  "Hesap doğrulanamadı. Lütfen tekrar giriş yapın.": { tr: "Hesap doğrulanamadı. Lütfen tekrar giriş yapın.", en: "The account could not be verified. Please sign in again.", el: "Δεν ήταν δυνατή η επαλήθευση του λογαριασμού. Συνδέσου ξανά." },
  "Cloud sync failed.": { tr: "Bulut senkronizasyonu başarısız oldu.", en: "Cloud sync failed.", el: "Ο συγχρονισμός με το cloud απέτυχε." },
  "Cloud sign-in expired.": { tr: "Bulut oturumunun süresi doldu.", en: "Cloud sign-in expired.", el: "Η σύνδεση στο cloud έληξε." },
  "Cloud session could not be verified.": { tr: "Bulut oturumu doğrulanamadı.", en: "Cloud session could not be verified.", el: "Δεν ήταν δυνατή η επαλήθευση της συνεδρίας cloud." },
  "Cloud session could not be refreshed.": { tr: "Bulut oturumu yenilenemedi.", en: "Cloud session could not be refreshed.", el: "Δεν ήταν δυνατή η ανανέωση της συνεδρίας cloud." },
  "Cloud data could not be downloaded.": { tr: "Bulut verileri indirilemedi.", en: "Cloud data could not be downloaded.", el: "Δεν ήταν δυνατή η λήψη των δεδομένων cloud." },
  "Cloud data could not be saved.": { tr: "Bulut verileri kaydedilemedi.", en: "Cloud data could not be saved.", el: "Δεν ήταν δυνατή η αποθήκευση των δεδομένων cloud." },
  "ABD makro veri akışı": { tr: "ABD makro veri akışı", en: "US macroeconomic data releases", el: "Μακροοικονομικές ανακοινώσεις των ΗΠΑ" },
  "Avrupa ekonomik veri akışı": { tr: "Avrupa ekonomik veri akışı", en: "European economic data releases", el: "Οικονομικές ανακοινώσεις της Ευρώπης" },
  "Türkiye piyasa gündemi": { tr: "Türkiye piyasa gündemi", en: "Türkiye market agenda", el: "Ατζέντα αγορών της Τουρκίας" },
  "Canlı haber servisine geçici olarak ulaşılamıyor": { tr: "Canlı haber servisine geçici olarak ulaşılamıyor", en: "The live news service is temporarily unavailable", el: "Η υπηρεσία ζωντανών ειδήσεων είναι προσωρινά μη διαθέσιμη" },
  "Arama merkezi": { tr: "Arama merkezi", en: "Search center", el: "Κέντρο αναζήτησης" },
  "Takip listesi": { tr: "Takip listesi", en: "Watchlist", el: "Λίστα παρακολούθησης" },
  "Logo efekti": { tr: "Logo efekti", en: "Logo effect", el: "Εφέ λογοτύπου" },
  "Komut paleti": { tr: "Komut paleti", en: "Command palette", el: "Παλέτα εντολών" },
  "Hacim:": { tr: "Hacim:", en: "Volume:", el: "Όγκος:" },
  "Coin bulunamadı.": { tr: "Coin bulunamadı.", en: "Cryptocurrency not found.", el: "Το κρυπτονόμισμα δεν βρέθηκε." },
  "Döviz geçmiş verileri alınamadı.": { tr: "Döviz geçmiş verileri alınamadı.", en: "Historical exchange-rate data could not be retrieved.", el: "Δεν ήταν δυνατή η λήψη ιστορικών δεδομένων ισοτιμιών." },
  "Döviz servisine ulaşılamadı.": { tr: "Döviz servisine ulaşılamadı.", en: "The currency service could not be reached.", el: "Δεν ήταν δυνατή η σύνδεση με την υπηρεσία ισοτιμιών." },
  "Döviz verileri alınamadı.": { tr: "Döviz verileri alınamadı.", en: "Exchange-rate data could not be retrieved.", el: "Δεν ήταν δυνατή η λήψη δεδομένων ισοτιμιών." },
  "Döviz çevirisi sonucu alınamadı.": { tr: "Döviz çevirisi sonucu alınamadı.", en: "The currency conversion result could not be retrieved.", el: "Δεν ήταν δυνατή η λήψη του αποτελέσματος μετατροπής νομίσματος." },
  "Döviz çevirisi yapılamadı.": { tr: "Döviz çevirisi yapılamadı.", en: "Currency conversion failed.", el: "Η μετατροπή νομίσματος απέτυχε." },
  "Şehir adı gerekli.": { tr: "Şehir adı gerekli.", en: "A city name is required.", el: "Απαιτείται όνομα πόλης." },
  "Bu şehir için doğrulanmış görsel bulunamadı.": { tr: "Bu şehir için doğrulanmış görsel bulunamadı.", en: "No verified image was found for this city.", el: "Δεν βρέθηκε επαληθευμένη εικόνα για αυτή την πόλη." },
  "Görsel servisine ulaşılamadı.": { tr: "Görsel servisine ulaşılamadı.", en: "The image service could not be reached.", el: "Δεν ήταν δυνατή η σύνδεση με την υπηρεσία εικόνων." },
  "Şehir araması yapılamadı.": { tr: "Şehir araması yapılamadı.", en: "City search failed.", el: "Η αναζήτηση πόλης απέτυχε." },
  "Open-Meteo arama servisine ulaşılamadı.": { tr: "Open-Meteo arama servisine ulaşılamadı.", en: "The Open-Meteo search service could not be reached.", el: "Δεν ήταν δυνατή η σύνδεση με την υπηρεσία αναζήτησης Open-Meteo." },
  "Geçerli koordinat bulunamadı.": { tr: "Geçerli koordinat bulunamadı.", en: "Valid coordinates could not be found.", el: "Δεν βρέθηκαν έγκυρες συντεταγμένες." },
  "Hava durumu verileri alınamadı.": { tr: "Hava durumu verileri alınamadı.", en: "Weather data could not be retrieved.", el: "Δεν ήταν δυνατή η λήψη δεδομένων καιρού." },
  "Open-Meteo servisine ulaşılamadı.": { tr: "Open-Meteo servisine ulaşılamadı.", en: "The Open-Meteo service could not be reached.", el: "Δεν ήταν δυνατή η σύνδεση με την υπηρεσία Open-Meteo." },
  "Google hesabıyla giriş yapmalısınız.": { tr: "Google hesabıyla giriş yapmalısınız.", en: "You must sign in with your Google account.", el: "Πρέπει να συνδεθείς στον λογαριασμό σου Google." },
  "Geçersiz bildirim aboneliği.": { tr: "Geçersiz bildirim aboneliği.", en: "Invalid notification subscription.", el: "Μη έγκυρη εγγραφή ειδοποιήσεων." },
  "Bildirim aboneliği kaydedilemedi.": { tr: "Bildirim aboneliği kaydedilemedi.", en: "The notification subscription could not be saved.", el: "Δεν ήταν δυνατή η αποθήκευση της εγγραφής ειδοποιήσεων." },
  "Oturum gerekli.": { tr: "Oturum gerekli.", en: "A signed-in session is required.", el: "Απαιτείται ενεργή σύνδεση." },
  "Endpoint gerekli.": { tr: "Endpoint gerekli.", en: "A notification endpoint is required.", el: "Απαιτείται endpoint ειδοποιήσεων." },
  "US Dollar": { tr: "ABD Doları", en: "US Dollar", el: "Δολάριο ΗΠΑ" },
  "Euro": { tr: "Euro", en: "Euro", el: "Ευρώ" },
  "British Pound": { tr: "İngiliz Sterlini", en: "British Pound", el: "Βρετανική Λίρα" },
  "Japanese Yen": { tr: "Japon Yeni", en: "Japanese Yen", el: "Ιαπωνικό Γιεν" },
  "Swiss Franc": { tr: "İsviçre Frangı", en: "Swiss Franc", el: "Ελβετικό Φράγκο" },
  "Turkish Lira": { tr: "Türk Lirası", en: "Turkish Lira", el: "Τουρκική Λίρα" },
  "Canadian Dollar": { tr: "Kanada Doları", en: "Canadian Dollar", el: "Καναδικό Δολάριο" },
  "Australian Dollar": { tr: "Avustralya Doları", en: "Australian Dollar", el: "Αυστραλιανό Δολάριο" },
  "Norwegian Krone": { tr: "Norveç Kronu", en: "Norwegian Krone", el: "Νορβηγική Κορόνα" },
  "Swedish Krona": { tr: "İsveç Kronu", en: "Swedish Krona", el: "Σουηδική Κορόνα" },
  "Danish Krone": { tr: "Danimarka Kronu", en: "Danish Krone", el: "Δανική Κορόνα" },
  "Polish Zloty": { tr: "Polonya Zlotisi", en: "Polish Zloty", el: "Πολωνικό Ζλότι" },
  "Chinese Yuan": { tr: "Çin Yuanı", en: "Chinese Yuan", el: "Κινεζικό Γουάν" },
  "Indian Rupee": { tr: "Hindistan Rupisi", en: "Indian Rupee", el: "Ινδική Ρουπία" },
  "South Korean Won": { tr: "Güney Kore Wonu", en: "South Korean Won", el: "Γουόν Νότιας Κορέας" },
  "South African Rand": { tr: "Güney Afrika Randı", en: "South African Rand", el: "Ραντ Νότιας Αφρικής" },
  "Merhaba, ben BorAI. Günlük sohbet, tüm dillerde basit konuşmalar, matematik, fizik, yazılım, piyasa ve hava durumu dahil aklına gelen her konuda soru sorabilirsin.": { tr: "Merhaba, ben BorAI. Günlük sohbet, tüm dillerde basit konuşmalar, matematik, fizik, yazılım, piyasa ve hava durumu dahil aklına gelen her konuda soru sorabilirsin.", en: "Hi, I'm BorAI. Ask me anything, from everyday conversation and simple multilingual chats to math, physics, software, markets and weather.", el: "Γεια σου, είμαι το BorAI. Μπορείς να με ρωτήσεις οτιδήποτε, από καθημερινή συζήτηση και απλές συνομιλίες σε πολλές γλώσσες έως μαθηματικά, φυσική, προγραμματισμό, αγορές και καιρό." },
  "Şehir": { tr: "Şehir", en: "City", el: "Πόλη" },
  "Açık ve güneşli": { tr: "Açık ve güneşli", en: "Clear and sunny", el: "Αίθριος και ηλιόλουστος" },
  "Yağışlı": { tr: "Yağışlı", en: "Rainy", el: "Βροχερός" },
  "Gök gürültülü": { tr: "Gök gürültülü", en: "Thunderstorms", el: "Με καταιγίδες" },
  "Değişken hava": { tr: "Değişken hava", en: "Variable weather", el: "Μεταβλητός καιρός" },
  "Yedek altın verisi": { tr: "Yedek altın verisi", en: "Fallback gold data", el: "Εφεδρικά δεδομένα χρυσού" },
  "önde": { tr: "önde", en: "leads", el: "προηγείται" },
  "24S": { tr: "24S", en: "24H", el: "24ω" },
  "7G": { tr: "7G", en: "7D", el: "7η" },
  "1A": { tr: "1A", en: "1M", el: "1μ" },
  "3A": { tr: "3A", en: "3M", el: "3μ" },
  "1Y": { tr: "1Y", en: "1Y", el: "1έ" },
};

Object.assign(T, EXTRA_T);

const ATTRIBUTES = ["placeholder", "title", "aria-label", "data-tooltip"];

const PAGE_META = {
  "/": {
    tr: ["Ana Panel | BoranTheGreat", "Küresel piyasaları, kriptoyu, altını ve dünya hava durumunu tek panelden takip et."],
    en: ["Dashboard | BoranTheGreat", "Track global markets, crypto, gold and world weather from one dashboard."],
    el: ["Πίνακας Ελέγχου | BoranTheGreat", "Παρακολούθησε παγκόσμιες αγορές, κρυπτονομίσματα, χρυσό και καιρό από έναν πίνακα ελέγχου."],
  },
  "/currency": {
    tr: ["Döviz ve Altın Takip | BoranTheGreat", "Küresel döviz kurlarını ve altın fiyatlarını takip et."],
    en: ["Currencies & Gold | BoranTheGreat", "Track global exchange rates and gold prices."],
    el: ["Συνάλλαγμα & Χρυσός | BoranTheGreat", "Παρακολούθησε παγκόσμιες ισοτιμίες και τιμές χρυσού."],
  },
  "/coins": {
    tr: ["Coin Takip | BoranTheGreat", "Kripto fiyatlarını, değişimi, hacmi ve piyasa değerini takip et."],
    en: ["Crypto Tracking | BoranTheGreat", "Track crypto prices, change, volume and market capitalization."],
    el: ["Παρακολούθηση Κρυπτονομισμάτων | BoranTheGreat", "Παρακολούθησε τιμές, μεταβολές, όγκο συναλλαγών και κεφαλαιοποίηση αγοράς κρυπτονομισμάτων."],
  },
  "/weather": {
    tr: ["Dünya Hava Durumu | BoranTheGreat", "Şehirler için anlık hava durumu ve 7 günlük tahmin."],
    en: ["World Weather | BoranTheGreat", "Current weather and 7-day forecasts for cities worldwide."],
    el: ["Παγκόσμιος Καιρός | BoranTheGreat", "Τρέχων καιρός και πρόγνωση 7 ημερών για πόλεις παγκοσμίως."],
  },
  "/portfolio": {
    tr: ["Portföy Takibi | BoranTheGreat", "Yerel portföyünü takip et."],
    en: ["Portfolio Tracking | BoranTheGreat", "Track your locally stored portfolio."],
    el: ["Παρακολούθηση Χαρτοφυλακίου | BoranTheGreat", "Παρακολούθησε το χαρτοφυλάκιο που είναι αποθηκευμένο τοπικά στο πρόγραμμα περιήγησης."],
  },
  "/alerts": {
    tr: ["Fiyat Alarmları | BoranTheGreat", "Coin ve döviz için yerel fiyat alarmları oluştur."],
    en: ["Price Alerts | BoranTheGreat", "Create local price alerts for crypto and currencies."],
    el: ["Ειδοποιήσεις Τιμών | BoranTheGreat", "Δημιούργησε τοπικές ειδοποιήσεις τιμών για κρυπτονομίσματα και νομίσματα."],
  },
  "/news": {
    tr: ["Haberler ve Piyasa Özeti | BoranTheGreat", "Piyasa sinyallerini ve ekonomi takvimini takip et."],
    en: ["News & Market Summary | BoranTheGreat", "Follow market signals and the economic calendar."],
    el: ["Ειδήσεις & Σύνοψη Αγοράς | BoranTheGreat", "Παρακολούθησε σήματα αγοράς και το οικονομικό ημερολόγιο."],
  },
  "/search": {
    tr: ["Arama Merkezi | BoranTheGreat", "Site içindeki varlıkları, şehirleri ve sayfaları ara."],
    en: ["Search Center | BoranTheGreat", "Search assets, cities and pages across the site."],
    el: ["Κέντρο Αναζήτησης | BoranTheGreat", "Αναζήτησε χρηματοοικονομικά στοιχεία, πόλεις και σελίδες στον ιστότοπο."],
  },
  "/settings": {
    tr: ["Ayarlar | BoranTheGreat", "Kişisel panel ayarlarını yönet."],
    en: ["Settings | BoranTheGreat", "Manage personal dashboard settings."],
    el: ["Ρυθμίσεις | BoranTheGreat", "Διαχειρίσου τις προσωπικές ρυθμίσεις του πίνακα ελέγχου."],
  },
  "/favorites": {
    tr: ["Favoriler | BoranTheGreat", "Favori varlıklarını ve şehirlerini yönet."],
    en: ["Favorites | BoranTheGreat", "Manage your favorite assets and cities."],
    el: ["Αγαπημένα | BoranTheGreat", "Διαχειρίσου τα αγαπημένα στοιχεία και τις πόλεις σου."],
  },
};

function normalizeLocale(value) {
  return VALID_LOCALES.has(value) ? value : "tr";
}

function localeFromBrowser() {
  if (typeof window === "undefined") return "tr";
  const pathLocale = window.location.pathname.split("/").filter(Boolean)[0];
  if (VALID_LOCALES.has(pathLocale)) return pathLocale;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (VALID_LOCALES.has(saved)) return saved;
  } catch {
    // Storage may be unavailable in strict privacy modes.
  }

  const browser = String(window.navigator.language || "tr").toLowerCase();
  if (browser.startsWith("el")) return "el";
  if (browser.startsWith("en")) return "en";
  return "tr";
}

function splitWhitespace(value) {
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  return { leading, trailing, key: value.trim() };
}

function translateTextValue(source, locale) {
  const { leading, trailing, key } = splitWhitespace(source);
  if (!key) return source;

  const direct = T[key]?.[locale];
  if (direct) return `${leading}${direct}${trailing}`;

  const aboutMatch = key.match(/^(.+)\s+hakkında$/i);
  if (aboutMatch) {
    const item = aboutMatch[1];
    const translated = locale === "en"
      ? `About ${item}`
      : locale === "el"
        ? `Σχετικά με το ${item}`
        : `${item} hakkında`;
    return `${leading}${translated}${trailing}`;
  }

  const currencyValueMatch = key.match(/^1\s+([A-Z]{3})\s+değerinin farklı para birimlerindeki güncel karşılığı\.$/);
  if (currencyValueMatch) {
    const code = currencyValueMatch[1];
    const translated = locale === "en"
      ? `Current value of 1 ${code} in different currencies.`
      : locale === "el"
        ? `Η τρέχουσα αξία 1 ${code} σε διαφορετικά νομίσματα.`
        : `1 ${code} değerinin farklı para birimlerindeki güncel karşılığı.`;
    return `${leading}${translated}${trailing}`;
  }

  const positionMatch = key.match(/^(\d+)\s+pozisyon$/i);
  if (positionMatch) {
    const count = Number(positionMatch[1]);
    const translated = locale === "en"
      ? `${count} ${count === 1 ? "position" : "positions"}`
      : locale === "el"
        ? `${count} ${count === 1 ? "θέση" : "θέσεις"}`
        : `${count} pozisyon`;
    return `${leading}${translated}${trailing}`;
  }

  const updatedMatch = key.match(/^Son güncelleme:\s*(.+)$/i);
  if (updatedMatch) {
    const label = locale === "en"
      ? "Last updated"
      : locale === "el"
        ? "Τελευταία ενημέρωση"
        : "Son güncelleme";
    return `${leading}${label}: ${updatedMatch[1]}${trailing}`;
  }

  const refreshMatch = key.match(/^Son yenileme\s+(.+)$/i);
  if (refreshMatch) {
    const label = locale === "en" ? "Last refresh" : locale === "el" ? "Τελευταία ανανέωση" : "Son yenileme";
    return `${leading}${label} ${refreshMatch[1]}${trailing}`;
  }

  const assetCountMatch = key.match(/^(\d+)\s+varlık takipte$/i);
  if (assetCountMatch) {
    const count = Number(assetCountMatch[1]);
    const translated = locale === "en"
      ? `${count} ${count === 1 ? "asset" : "assets"} tracked`
      : locale === "el"
        ? `${count} ${count === 1 ? "στοιχείο υπό παρακολούθηση" : "στοιχεία υπό παρακολούθηση"}`
        : `${count} varlık takipte`;
    return `${leading}${translated}${trailing}`;
  }

  const triggeredCountMatch = key.match(/^(\d+)\s+tetiklenen alarm$/i);
  if (triggeredCountMatch) {
    const count = Number(triggeredCountMatch[1]);
    const translated = locale === "en"
      ? `${count} triggered ${count === 1 ? "alert" : "alerts"}`
      : locale === "el"
        ? `${count} ${count === 1 ? "ενεργοποιημένη ειδοποίηση" : "ενεργοποιημένες ειδοποιήσεις"}`
        : `${count} tetiklenen alarm`;
    return `${leading}${translated}${trailing}`;
  }

  const themeModeMatch = key.match(/^(.+)\s+font ve renk modu$/i);
  if (themeModeMatch) {
    const theme = T[themeModeMatch[1]]?.[locale] || themeModeMatch[1];
    const translated = locale === "en"
      ? `${theme} font and color mode`
      : locale === "el"
        ? `Λειτουργία γραμματοσειράς και χρωμάτων: ${theme}`
        : `${theme} font ve renk modu`;
    return `${leading}${translated}${trailing}`;
  }

  const favoriteMatch = key.match(/^(.+)\s+favori$/i);
  if (favoriteMatch) {
    const item = favoriteMatch[1];
    const translated = locale === "en"
      ? `${item} favorite`
      : locale === "el"
        ? `${item} — αγαπημένο`
        : `${item} favori`;
    return `${leading}${translated}${trailing}`;
  }

  const volatilityMatch = key.match(/^Oynaklık\s+(.+)$/i);
  if (volatilityMatch) {
    const label = locale === "en" ? "Volatility" : locale === "el" ? "Μεταβλητότητα" : "Oynaklık";
    return `${leading}${label} ${volatilityMatch[1]}${trailing}`;
  }

  const leadMatch = key.match(/^(.+)\s+önde$/i);
  if (leadMatch) {
    const translated = locale === "en"
      ? `${leadMatch[1]} leads`
      : locale === "el"
        ? `${leadMatch[1]} προηγείται`
        : `${leadMatch[1]} önde`;
    return `${leading}${translated}${trailing}`;
  }

  const rainChanceMatch = key.match(/^(.+)\s+yağış ihtimali$/i);
  if (rainChanceMatch) {
    const translated = locale === "en"
      ? `${rainChanceMatch[1]} precipitation probability`
      : locale === "el"
        ? `${rainChanceMatch[1]} — πιθανότητα βροχόπτωσης`
        : `${rainChanceMatch[1]} yağış ihtimali`;
    return `${leading}${translated}${trailing}`;
  }

  const humidityRainMatch = key.match(/^Nem %(\d+)\s*-\s*yağış %(\d+)$/i);
  if (humidityRainMatch) {
    const translated = locale === "en"
      ? `Humidity ${humidityRainMatch[1]}% - precipitation ${humidityRainMatch[2]}%`
      : locale === "el"
        ? `Υγρασία ${humidityRainMatch[1]}% - βροχόπτωση ${humidityRainMatch[2]}%`
        : `Nem %${humidityRainMatch[1]} - yağış %${humidityRainMatch[2]}`;
    return `${leading}${translated}${trailing}`;
  }

  const humidityMatch = key.match(/^Nem %(\d+)$/i);
  if (humidityMatch) {
    const translated = locale === "en"
      ? `Humidity ${humidityMatch[1]}%`
      : locale === "el"
        ? `Υγρασία ${humidityMatch[1]}%`
        : `Nem %${humidityMatch[1]}`;
    return `${leading}${translated}${trailing}`;
  }

  const dailyLeaderMatch = key.match(/^(.+) bugün (.+) ile takip listesinin en hareketli varlığı\.$/i);
  if (dailyLeaderMatch) {
    const translated = locale === "en"
      ? `${dailyLeaderMatch[1]} is today's most active watchlist asset at ${dailyLeaderMatch[2]}.`
      : locale === "el"
        ? `${dailyLeaderMatch[1]} είναι σήμερα το στοιχείο με τη μεγαλύτερη κίνηση στη λίστα παρακολούθησης, με ${dailyLeaderMatch[2]}.`
        : `${dailyLeaderMatch[1]} bugün ${dailyLeaderMatch[2]} ile takip listesinin en hareketli varlığı.`;
    return `${leading}${translated}${trailing}`;
  }

  const currencyChartMatch = key.match(/^(.+) bazlı (.+) fiyat grafiği\. Fiyatın üzerine gelince hassas değerleri görebilirsin\.$/i);
  if (currencyChartMatch) {
    const translated = locale === "en"
      ? `${currencyChartMatch[2]} price chart in ${currencyChartMatch[1]}. Hover over the price to view precise values.`
      : locale === "el"
        ? `Γράφημα τιμής ${currencyChartMatch[2]} σε ${currencyChartMatch[1]}. Πέρασε τον δείκτη πάνω από την τιμή για ακριβείς τιμές.`
        : key;
    return `${leading}${translated}${trailing}`;
  }

  const fxHistoryMatch = key.match(/^(.+) için (.+) aralıklı döviz grafiği\.$/i);
  if (fxHistoryMatch) {
    const translated = locale === "en"
      ? `${fxHistoryMatch[2]} exchange-rate chart for ${fxHistoryMatch[1]}.`
      : locale === "el"
        ? `Γράφημα ισοτιμίας ${fxHistoryMatch[2]} για ${fxHistoryMatch[1]}.`
        : key;
    return `${leading}${translated}${trailing}`;
  }

  const goldHistoryMatch = key.match(/^(.+) için (.+) altın grafiği\.$/i);
  if (goldHistoryMatch) {
    const translated = locale === "en"
      ? `${goldHistoryMatch[2]} gold chart for ${goldHistoryMatch[1]}.`
      : locale === "el"
        ? `Γράφημα χρυσού ${goldHistoryMatch[2]} για ${goldHistoryMatch[1]}.`
        : key;
    return `${leading}${translated}${trailing}`;
  }

  return source;
}

function shouldIgnore(element) {
  if (!element) return true;
  return Boolean(
    element.closest(
      "[data-btg-i18n-ignore], script, style, noscript, code, pre, textarea, [contenteditable='true']"
    )
  );
}

function translateTextNode(node, locale) {
  const parent = node.parentElement;
  if (!parent || shouldIgnore(parent)) return;

  const currentValue = node.nodeValue || "";
  const lastRendered = renderedText.get(node);
  if (!sourceText.has(node) || (lastRendered !== undefined && currentValue !== lastRendered)) {
    sourceText.set(node, currentValue);
  }

  const source = sourceText.get(node) || currentValue;
  const next = translateTextValue(source, locale);
  renderedText.set(node, next);
  if (currentValue !== next) node.nodeValue = next;
}

function translateElementAttributes(element, locale) {
  if (shouldIgnore(element)) return;

  if (!sourceAttributes.has(element)) sourceAttributes.set(element, {});
  if (!renderedAttributes.has(element)) renderedAttributes.set(element, {});
  const sourceCache = sourceAttributes.get(element);
  const renderedCache = renderedAttributes.get(element);

  for (const attribute of ATTRIBUTES) {
    if (!element.hasAttribute(attribute)) continue;
    const currentValue = element.getAttribute(attribute) || "";
    const lastRendered = renderedCache[attribute];
    if (!(attribute in sourceCache) || (lastRendered !== undefined && currentValue !== lastRendered)) {
      sourceCache[attribute] = currentValue;
    }

    const next = translateTextValue(sourceCache[attribute], locale);
    renderedCache[attribute] = next;
    if (currentValue !== next) element.setAttribute(attribute, next);
  }
}

function translateTree(root, locale) {
  if (!root || typeof document === "undefined") return;

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, locale);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body) return;
  if (root.nodeType === Node.ELEMENT_NODE) translateElementAttributes(root, locale);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE && shouldIgnore(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) translateTextNode(current, locale);
    else translateElementAttributes(current, locale);
    current = walker.nextNode();
  }
}


function localizeInternalLinks(locale) {
  if (typeof document === "undefined") return;
  for (const anchor of document.querySelectorAll("a[href]")) {
    if (anchor.closest("[data-btg-i18n-ignore]")) continue;
    const raw = anchor.getAttribute("href");
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    let url;
    try {
      url = new URL(raw, window.location.href);
    } catch {
      continue;
    }
    if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) continue;
    const parts = url.pathname.split("/").filter(Boolean);
    if (VALID_LOCALES.has(parts[0])) parts.shift();
    const cleanPath = `/${parts.join("/")}`;
    url.pathname = cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
    url.searchParams.delete("lang");
    anchor.setAttribute("href", `${url.pathname}${url.search}${url.hash}`);
  }
}

function updateMetadata(locale) {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (VALID_LOCALES.has(parts[0])) parts.shift();
  const path = (`/${parts.join("/")}`).replace(/\/$/, "") || "/";
  if (path.startsWith("/coins/") || path.startsWith("/currency/")) {
    document.documentElement.lang = LOCALES[locale].htmlLang;
    return;
  }
  const meta = PAGE_META[path] || PAGE_META["/"];
  const [title, description] = meta[locale];

  document.documentElement.lang = LOCALES[locale].htmlLang;
  document.title = title;

  const targets = [
    ["meta[name='description']", "content", description],
    ["meta[property='og:title']", "content", title],
    ["meta[property='og:description']", "content", description],
    ["meta[name='twitter:title']", "content", title],
    ["meta[name='twitter:description']", "content", description],
  ];

  for (const [selector, attribute, value] of targets) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  }
}

function persistLocale(locale) {
  try {
    const changed = window.localStorage.getItem(STORAGE_KEY) !== locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
    if (changed) window.dispatchEvent(new Event("boranthegreat:language-updated"));
  } catch {
    // Keep the language switcher functional even when storage is blocked.
  }
  try {
    document.cookie = `${STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Cookie access may also be blocked by the browser.
  }
}

export default function BtgLanguageSystem() {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState("tr");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const current = useMemo(() => LOCALES[locale], [locale]);

  useEffect(() => {
    const initial = normalizeLocale(localeFromBrowser());
    setLocale(initial);
    setReady(true);
  }, [pathname]);

  useEffect(() => {
    if (!ready || typeof document === "undefined") return undefined;

    persistLocale(locale);
    updateMetadata(locale);

    let frame = requestAnimationFrame(() => {
      translateTree(document.body, locale);
      localizeInternalLinks(locale);
    });
    const observer = new MutationObserver((mutations) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") translateTree(mutation.target, locale);
          if (mutation.type === "attributes") translateElementAttributes(mutation.target, locale);
          for (const node of mutation.addedNodes) translateTree(node, locale);
        }
        localizeInternalLinks(locale);
        updateMetadata(locale);
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTES,
    });

    const onPopState = () => {
      const next = window.location.pathname.split("/").filter(Boolean)[0];
      setLocale(VALID_LOCALES.has(next) ? next : "tr");
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("popstate", onPopState);
    };
  }, [locale, ready, pathname]);

  useEffect(() => {
    const applyStoredLanguage = () => {
      let stored;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        return;
      }
      if (!VALID_LOCALES.has(stored) || stored === locale) return;
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (VALID_LOCALES.has(parts[0])) parts.shift();
      const cleanPath = `/${parts.join("/")}`;
      const nextPath = cleanPath === "/" ? `/${stored}` : `/${stored}${cleanPath}`;
      setLocale(stored);
      router.replace(`${nextPath}${window.location.search}${window.location.hash}`);
    };
    window.addEventListener("storage", applyStoredLanguage);
    window.addEventListener("boranthegreat:language-updated", applyStoredLanguage);
    return () => {
      window.removeEventListener("storage", applyStoredLanguage);
      window.removeEventListener("boranthegreat:language-updated", applyStoredLanguage);
    };
  }, [locale, router]);

  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest?.("[data-btg-language-root]")) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div
      data-btg-language-root
      data-btg-i18n-ignore
      className="btg-language-root"
      aria-label={current.selectorLabel}
    >
      <style>{`
        .btg-language-root {
          position: relative;
          z-index: 2147483000;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .btg-language-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 13px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 12px;
          background: rgba(15,17,21,.92);
          color: #fff;
          box-shadow: 0 12px 34px rgba(0,0,0,.28);
          backdrop-filter: blur(14px);
          cursor: pointer;
          font-weight: 700;
          letter-spacing: -.01em;
        }
        .btg-language-button:hover,
        .btg-language-button:focus-visible {
          border-color: rgba(255,159,67,.75);
          outline: none;
          transform: translateY(-1px);
        }
        .btg-language-chevron { opacity: .65; font-size: 11px; }
        .btg-language-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 170px;
          padding: 6px;
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 14px;
          background: rgba(15,17,21,.97);
          box-shadow: 0 18px 48px rgba(0,0,0,.38);
          backdrop-filter: blur(18px);
        }
        .btg-language-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: rgba(255,255,255,.85);
          cursor: pointer;
          font: inherit;
          text-align: left;
        }
        .btg-language-option:hover { background: rgba(255,255,255,.07); color: #fff; }
        .btg-language-option[data-active="true"] {
          background: rgba(255,159,67,.14);
          color: #ffb46b;
        }
        .btg-language-check { margin-left: auto; color: #ff9f43; }
        @media (max-width: 720px) {
          .btg-language-button { min-height: 38px; padding: 0 10px; }
          .btg-language-label { display: none; }
          .btg-language-menu { width: 165px; }
        }
        @media (prefers-reduced-motion: no-preference) {
          .btg-language-button { transition: transform .18s ease, border-color .18s ease; }
        }
      `}</style>

      <button
        type="button"
        className="btg-language-button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="btg-language-label">{current.label}</span>
        <span className="btg-language-chevron" aria-hidden="true">▼</span>
      </button>

      {open && (
        <div className="btg-language-menu" role="menu">
          {Object.entries(LOCALES).map(([code, item]) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={locale === code}
              data-active={locale === code}
              className="btg-language-option"
              onClick={() => {
                const parts = window.location.pathname.split("/").filter(Boolean);
                if (VALID_LOCALES.has(parts[0])) parts.shift();
                const cleanPath = `/${parts.join("/")}`;
                const nextPath = cleanPath === "/" ? `/${code}` : `/${code}${cleanPath}`;
                setLocale(code);
                setOpen(false);
                router.push(`${nextPath}${window.location.search}${window.location.hash}`);
              }}
            >
              <span aria-hidden="true">{item.flag}</span>
              <span>{item.label}</span>
              {locale === code && <span className="btg-language-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
