# BoranTheGreat

Modern, koyu temalı, mobil uyumlu finans ve hava durumu takip sitesi. Next.js App Router, TypeScript, Tailwind CSS ve Recharts ile hazırlandı.

Canlı domain hedefi: `https://boranthegreat.xyz`

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Build Kontrolü

```bash
npm run lint
npm run build
```

## Yayına Almadan Önce Kontrol Listesi

- `npm run lint` ve `npm run build` hatasız geçmeli.
- `.env.local` veya Vercel Environment Variables içinde `NEXT_PUBLIC_SITE_URL=https://boranthegreat.xyz` olmalı.
- BorAI'nin güçlü cevap modu için Vercel'e `OPENAI_API_KEY` eklenmeli.
- Vercel domain ayarlarında `boranthegreat.xyz` ve istenirse `www.boranthegreat.xyz` eklenmeli.
- DNS kayıtları Vercel'in verdiği değerlerle eşleşmeli.
- Vercel deploy sonrası otomatik SSL aktif görünmeli.
- Ana sayfa, Döviz, Coin, Hava Durumu, Favoriler ve Ayarlar sayfaları mobilde test edilmeli.
- Coin, döviz, altın ve hava durumu API hata mesajları kullanıcıya düzgün görünüyor mu kontrol edilmeli.
- Footer'daki "yatırım tavsiyesi değildir" uyarısı yayında görünür kalmalı.
- Logoya tıklayınca Instagram yönlendirmesi çalışmalı.

## Ortam Değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayabilirsiniz:

```bash
NEXT_PUBLIC_APP_NAME=BoranTheGreat
NEXT_PUBLIC_SITE_URL=https://boranthegreat.xyz
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Seçilen piyasa ve hava durumu API'leri API key gerektirmez. `OPENAI_API_KEY` boş kalırsa AI Asistan yerel akıllı modda çalışır; anahtar eklerseniz OpenAI destekli cevap moduna geçer.

## Sayfalar

- Ana Panel
- Döviz ve Altın Takip
- Coin Takip
- Dünya Hava Durumu
- Favoriler
- Portföy
- Alarmlar
- Haberler
- Genel Arama
- Ayarlar

## Kullanılan API'ler

- Frankfurter API: döviz kurları, geçmiş döviz grafikleri ve döviz çevirici
- CoinGecko API: coin fiyatları, hacim, market cap ve sparkline verileri
- CoinLore API: CoinGecko erişilemezse yedek coin verisi
- Open-Meteo Geocoding API: şehir arama
- Open-Meteo Forecast API: anlık hava durumu ve 7 günlük tahmin
- Yahoo Finance: yaklaşık altın ons verisi
- OpenAI Responses API: opsiyonel AI Asistan cevapları

## Vercel Deploy

1. Projeyi GitHub'a gönderin.
2. Vercel panelinde `New Project` ile repoyu seçin.
3. Framework olarak Next.js otomatik algılanır.
4. Build komutu: `npm run build`
5. Environment Variables alanına gerekiyorsa şunları ekleyin:
   - `NEXT_PUBLIC_APP_NAME=BoranTheGreat`
   - `NEXT_PUBLIC_SITE_URL=https://boranthegreat.xyz`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL=gpt-4o-mini`
6. `Deploy` butonuna basın.

## boranthegreat.xyz Domain Bağlama

Vercel'de proje içinden:

1. `Settings > Domains` bölümüne gidin.
2. `boranthegreat.xyz` domainini ekleyin.
3. Vercel'in verdiği DNS kayıtlarını domain aldığınız panelde girin.
4. Genelde apex domain için `A` kaydı, `www` için `CNAME` kaydı verilir.
5. DNS yayıldıktan sonra Vercel otomatik SSL sertifikası verir.

## Yayın İçin Eklenenler

- SEO metadata
- Open Graph ve Twitter paylaşım kartları
- `sitemap.xml`
- `robots.txt`
- PWA manifest
- SVG site ikonu
- `boranthegreat.xyz` canonical ayarları

## Notlar

- Favoriler tarayıcı LocalStorage üzerinde saklanır.
- Finansal veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
- API hatalarında kullanıcıya okunabilir hata mesajı gösterilir.
- Veriler yüklenirken skeleton kartları kullanılır.

## Çoklu Dil Desteği

Site Türkçe, İngilizce ve Yunanca arayüz seçeneklerini destekler.

- Türkçe: `?lang=tr` veya parametresiz varsayılan görünüm
- İngilizce: `?lang=en`
- Yunanca: `?lang=el`
- Dil seçimi üst menüdeki dil düğmesinden yapılır.
- Seçim tarayıcıda saklanır ve sayfalar arasında korunur.
- Sonradan yüklenen piyasa ve hava verilerindeki arayüz ifadeleri de çevrilir.

Çoklu dil sistemi `components/BtgLanguageSystem.tsx` dosyasındadır ve `components/AppShell.tsx` içinden çağrılır.
