# Türkçe – İngilizce – Yunanca Çeviri Denetimi

## Kapsam

- Navigasyon ve üst menü
- Ana panel
- Döviz ve altın
- Coin listesi ve coin detayları
- Döviz detayları
- Hava durumu
- Favoriler, portföy, fiyat alarmları ve piyasa notları
- Haberler ve ekonomi takvimi
- Ayarlar, tema, PWA, bulut hesabı ve push bildirimi
- Hata mesajları, form etiketleri, erişilebilirlik metinleri ve dinamik sayaçlar
- Para birimi adları

## Sonuç

- 491 benzersiz arayüz çeviri girdisi
- Yinelenen anahtar: 0
- Boş Türkçe değer: 0
- Boş İngilizce değer: 0
- Boş Yunanca değer: 0
- Dinamik çeviri senaryosu: 20/20 başarılı
- Görünen TSX arayüz metni taraması: doğrulanmış eksik çeviri yok

## Dinamik olarak ele alınan yapılar

- “3 pozisyon” gibi adet ifadeleri
- “2 tetiklenen alarm” gibi çoğul yapılar
- “Son güncelleme: …” ve “Son yenileme …”
- “Bitcoin hakkında” gibi dilde kelime sırası değişen başlıklar
- “1 USD değerinin farklı para birimlerindeki…” gibi dinamik para birimi cümleleri
- Dil değiştirildiğinde iç bağlantılar, belge dili ve paylaşım metadata metinleri

## Dış içerik notu

Haber başlıkları ilgili dildeki GDELT kaynaklarından istenir. Finnhub ekonomik etkinlik başlıkları sağlayıcının sunduğu özgün dilde görünebilir. Bu metinler site arayüzü çevirisi değil, dış kaynaktan gelen yayın içeriğidir.

## Dil kalitesi notları

- Yunanca metinlerde yarım İngilizce kalan genel arayüz ifadeleri temizlendi; `cloud`, `Web Push`, Google, Supabase ve VAPID gibi yerleşik teknik adlar gerektiği yerde korundu.
- Hava durumu durumları, BorAI karşılama metni, favori türleri ve API yedek durumları ayrıca denetlendi.
- Haber ve coin açıklaması gibi dış kaynak metinleri istenen dilde sağlayıcıdan alınır; sağlayıcının özgün içeriği arayüz çevirisi olarak değiştirilmez.
