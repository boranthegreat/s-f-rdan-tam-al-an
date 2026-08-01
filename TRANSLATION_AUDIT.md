# BoranTheGreat Çoklu Dil Denetimi

## Kapsam

- Türkçe (`tr`)
- İngilizce (`en`)
- Yunanca (`el`)
- Ana panel, döviz, altın, coin, hava durumu, favoriler, portföy, alarmlar, haberler, arama, ayarlar, komut paleti, ipuçları ve BorAI arayüzü
- Düğmeler, başlıklar, açıklamalar, form alanları, hata durumları, erişilebilirlik etiketleri ve dinamik durum metinleri

## Sonuçlar

- 358 benzersiz çeviri girdisi
- Yinelenen çeviri anahtarı: 0
- Boş Türkçe/İngilizce/Yunanca değer: 0
- İncelenen TypeScript/TSX dosyası: 88
- Sözdizimi hatası: 0
- Eksik yerel import: 0
- Statik taramada çevrilmeden kalan muhtemel kullanıcı arayüzü metni: 0
- Dinamik çeviri testleri: 10/10 başarılı

## Dil Davranışı

- Dil seçici sitenin üst bölümüne yerleştirildi.
- Seçim LocalStorage ve çerezde saklanır.
- Sayfa değişimlerinde seçilen dil korunur.
- `?lang=en` ve `?lang=el` doğrudan bağlantıları desteklenir.
- Belge dili, başlık ve temel paylaşım açıklamaları seçime göre güncellenir.
- Canlı API verileri sonradan yüklendiğinde yeni arayüz metinleri otomatik çevrilir.

## Build Notu

Bu çalışma ortamındaki paket deposu, projede kullanılan `@types/node@26.0.0` paketini sunmadığı için burada bağımlılık kurulumu ve tam `next build` çalıştırılamadı. Kaynak kod sözdizimi, yerel importlar, çeviri bütünlüğü ve dinamik çeviri fonksiyonları ayrı kontrollerden geçirilmiştir. GitHub/Vercel dağıtımında normal paket deposu üzerinden `pnpm install` ve `pnpm build` çalıştırılmalıdır.
