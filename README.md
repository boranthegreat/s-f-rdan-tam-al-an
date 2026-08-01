# BoranTheGreat V3

BoranTheGreat; döviz, kripto, altın, ekonomi haberleri, fiyat alarmları ve dünya hava durumunu tek panelde birleştiren çok dilli bir Next.js uygulamasıdır.

Canlı domain: `https://boranthegreat.xyz`

## V3 ile eklenenler

- Gerçek dil adresleri: `/tr`, `/en`, `/el`
- Her dil için canonical ve `hreflang` metadata
- Coin detay sayfaları ve saatlik 24 saat / 7 gün / 1 ay / 1 yıl grafikleri
- Döviz detay sayfaları ve 7 gün / 1 ay / 3 ay / 1 yıl grafikleri
- Coin ve döviz detayından favori, portföy ve alarm işlemleri
- GDELT tabanlı canlı ekonomi, kripto, döviz ve dünya haberleri
- Opsiyonel Finnhub canlı ekonomi takvimi
- Google giriş ve Supabase tabanlı cihazlar arası senkronizasyon altyapısı
- Site kapalıyken çalışabilen Web Push fiyat alarmı altyapısı
- Kurulabilir PWA, çevrimdışı ekranı ve service worker
- Üst menüde sade tema seçici
- Türkçe, İngilizce ve Yunanca arayüz çevirileri

## Hemen çalışan özellikler

GitHub'a yüklenip Vercel deploy olduğunda; dil adresleri, detay sayfaları, grafikler, canlı haberler, PWA, çevrimdışı ekranı, tema menüsü ve mevcut yerel portföy/favori/alarm sistemi ek ayar gerektirmeden çalışır.

Google giriş, bulut senkronizasyonu, arka plan push bildirimleri ve canlı ekonomi takvimi için dış servis anahtarları gerekir. Anahtarlar yokken bu bölümler siteyi bozmaz; arayüz açık biçimde kurulum gerektiğini belirtir.

## Yerel kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` açılır ve otomatik olarak `/tr` adresine yönlendirilir.

## Kontrol

```bash
npm run lint
npm run build
```

VAPID anahtarı üretmek için:

```bash
npm run generate:vapid
```

Dış servislerin kurulumu için `KURULUM.md`, GitHub'a yükleme için `YUKLEME.txt` dosyasını açın.

## Temel teknoloji

- Next.js App Router
- React ve TypeScript
- Tailwind CSS
- Recharts
- Supabase REST/Auth altyapısı
- Web Push + Service Worker
- GDELT haber API'si
- Finnhub ekonomi takvimi (opsiyonel)

## Güvenlik notları

- `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `FINNHUB_API_KEY` ve `OPENAI_API_KEY` yalnızca Vercel Environment Variables alanında tutulmalıdır.
- Gerçek anahtarlar GitHub'a veya `.env.example` dosyasına yazılmamalıdır.
- Fiyat ve piyasa verileri bilgilendirme amaçlıdır; yatırım tavsiyesi değildir.
