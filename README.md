# My Flowchart

> Tarayıcıda çalışan, **sunucusuz** Mermaid diyagram editörü.
> Yaz, canlı önizle, dışa aktar. Hiçbir veri cihazından çıkmaz.

[![CI](https://github.com/ibrhalil/my-flowchart/actions/workflows/ci.yml/badge.svg)](https://github.com/ibrhalil/my-flowchart/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

My Flowchart, [Mermaid](https://mermaid.js.org/) sözdizimiyle akış şemaları, sekans diyagramları ve daha fazlasını oluşturmak için tasarlanmış, sade ve hızlı bir arayüzdür. Tüm işlemler tarayıcıda yapılır — kurulum, hesap veya arka uç gerekmez.

---

## Özellikler

**Yazma ve önizleme**

- **Canlı önizleme** — yazdıkça diyagram anında güncellenir; geçici söz dizimi hatasında son geçerli diyagram ekranda kalır
- **17+ diyagram türü** — flowchart, sequence, class, state, ER, gantt, pie, journey, git, mindmap, timeline, quadrant, requirement, architecture, xychart, block, kanban
- CodeMirror 6 tabanlı editör (katlama, arama, satır numaraları)
- **Söz dizimi linter'ı** — ASCII olmayan düğüm kimliklerini ve tırnaksız etiketleri yakalar, tek tıkla düzeltir
- **Zoom / pan / tam ekran** ve ekrana sığdır (`Ctrl/⌘ + tekerlek` ile zoom)

**Şablonlar ve yeni belge**

- **40 hazır şablon**, her biri Türkçe ve İngilizce içerikli; arama, tür filtresi ve her türün **ne için kullanıldığını** anlatan ipuçlarıyla
- **Yeni diyagram** — şablon seçerek ya da boş belgeyle başla; logoya basmak doğrudan boş bir diyagram açar. Kaydedilmemiş çalışman önce geçmişe alınır

**Dışa ve içe aktarım**

- **5 formatta dışa aktarım** — PNG, SVG, Markdown, `.mmd`, JSON. PNG, önizlemeyle birebir aynı görünür (kenar boşluğu ve tema zemini dahil)
- **İçe aktarım** — `.mmd`, `.json` ve `.md` (frontmatter + kod bloğu). `.mmd` dosyasının başındaki `%%` yorum satırları açıklama olarak okunur; dışa aktarırken açıklama aynı şekilde dosyanın başına yazılır

**Paylaşım**

- **Paylaşım bağlantısı** — Paylaş butonu diyagramı (başlık, açıklama, kod) tek bir bağlantıya kodlar; sunucu gerekmez. Masaüstünde bağlantı panoya kopyalanır, mobilde sistem paylaşım menüsü açılır. Bağlantıyı açan kişide diyagram otomatik yüklenir; kendi çalışması önce geçmişe kaydedilir

**Kayıt ve geçmiş**

- **Otomatik taslak kaydı** + **geçmiş anlık görüntüleri** (en fazla 50 kayıt, tarayıcı deposunda). Geri yüklemek için satırın herhangi bir yerine tıklamak yeterli
- **Çoklu sekme güvenliği** — iki sekme aynı belgeyi düzenlerse biri diğerinin işini ezmez; ezilecek sürüm geçmişe kaydedilir. Geçmiş ve ayarlar sekmeler arasında canlı eşitlenir

**Arayüz**

- **Açık tema varsayılandır**, koyu tema isteğe bağlı; arayüz dili tarayıcı dilinden algılanır (TR / EN), Ayarlar'dan değiştirilebilir
- **Hakkında** — uygulama sürümü, commit, derleme tarihi ve önemli bağımlılıkların sürümleri (header'daki sürüm düğmesi ya da Ayarlar'dan)

---

## Veri ve Gizlilik

Diyagramlar **yalnızca tarayıcının `localStorage` alanında** tutulur, hiçbir sunucuya gönderilmez. Uygulama şu anahtarları kullanır:

| Anahtar                       | İçerik                                    |
| ----------------------------- | ----------------------------------------- |
| `mermaid-studio:draft:v1`     | Çalışılan belge (başlık, açıklama, kod)   |
| `mermaid-studio:history:v1`   | Geçmiş anlık görüntüleri                  |
| `my-flowchart-settings`       | Tema, yazı boyutu, PNG çözünürlüğü, otomatik kayıt |
| `my-flowchart-locale`         | Seçilen arayüz dili                       |

Hepsini silmek için **Ayarlar → Veriler → Tüm verileri sil** (iki adımlı onay ister, geri alınamaz). Yalnızca bu uygulamanın anahtarları silinir; aynı alan adındaki başka verilere dokunulmaz. Silmeden önce belgeni dışa aktarabilirsin.

**Paylaşım bağlantıları:** içerik adresin `#` kısmında taşınır; tarayıcı bu kısmı sunucuya göndermez, yani sunucu ve erişim kayıtları diyagramı görmez. Bağlantı o anın bir **kopyasıdır** (sonradan değişmez, geri çekilemez) ve bağlantıya sahip herkes içeriği okuyabilir; gizli bilgi içeren diyagramları paylaşırken bunu göz önünde bulundurun. Bağlantı, uygulamanın çalıştığı adresten üretilir; alan adı ya da alt alan adı değişse de aynı bağlantı biçimi her yerde açılır.

> Sayfa açıkken internet gerekmez; sayfayı yeniden yüklemek için gerekir (service worker yoktur).

---

## Hızlı Başlangıç (Geliştirme)

Gereksinimler: [Node.js](https://nodejs.org/) 20.19+ (ya da 22.12+) ve npm. CI ve Docker imajı Node 24 ile derler.

```bash
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat (http://localhost:5173)
npm run dev
```

### Kullanılabilir komutlar

| Komut            | Açıklama                                  |
| ---------------- | ----------------------------------------- |
| `npm run dev`    | Vite geliştirme sunucusu (HMR)            |
| `npm run build`  | Tip kontrolü + üretim derlemesi → `dist/` |
| `npm run preview`| Üretim derlemesini yerelde önizle         |
| `npm run lint`   | [oxlint](https://oxc.rs/) ile kod denetimi |

---

## Docker ile Çalıştırma

Proje tamamen statik bir SPA'dır. Tek komutla ayağa kaldırabilirsiniz:

```bash
# İmajı derle
docker build -t my-flowchart .

# Varsayılan port (8765) üzerinde çalıştır
docker run -e PORT=8765 -p 8765:8765 my-flowchart
```

Tarayıcıda **http://localhost:8765** adresini açın. Hepsi bu kadar.

### Docker Compose ile

Aynı kurulumu `compose.yaml` ile de çalıştırabilirsiniz (yeniden başlatma politikası dahil):

```bash
# Derle ve arka planda başlat (http://localhost:8765)
docker compose up -d --build

# Farklı port ve commit bilgisiyle
PORT=9090 GIT_COMMIT=$(git rev-parse --short HEAD) docker compose up -d --build

# Durdur ve kaldır
docker compose down
```

`PORT` hem konteynerin dinlediği hem de host'a yayınlanan portu belirler (varsayılan `8765`). `GIT_COMMIT` verilmezse Hakkında modalında commit görünmez.

### Commit bilgisini imaja ekleme

`.git` klasörü imaja girmediği için Hakkında modalındaki commit numarası varsayılan olarak boş kalır. Göstermek için build argümanı verin:

```bash
docker build --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) -t my-flowchart .
```

### Port değiştirme (çoklu uygulama)

Hizmet portu, `PORT` ortam değişkeni ile runtime'da ayarlanır (varsayılan `8765`; `8080`/`3000` gibi yaygın portlardan kaçınır). Aynı sunucuda birden fazla UI uygulaması çalıştırıyorsanız, her örneğe farklı bir port verin:

```bash
# İkinci bir örneği 9090 portunda çalıştır
docker run -e PORT=9090 -p 9090:9090 my-flowchart
```

> `-e PORT=<port>` konteynerin dinlediği portu, `-p <port>:<port>` ise host'a yayınlanan portu belirler. İkisi aynı olmalıdır.

> Image, çok aşamalı (multi-stage) derleme kullanır: `node:24-alpine` ile derlenir, ardından `nginx:stable-alpine` üzerinde sunulur (toplam ~71 MB). SPA yönlendirmesi, gzip sıkıştırması, hash'li dosyalar için uzun süreli önbellek, yapılandırılabilir port ve sağlık kontrolü içerir.

---

## Üretim Dağıtımı

`npm run build` sonrası `dist/` klasörü herhangi bir statik sunucuya konabilir:

- **Statik sunucular:** GitHub Pages, Netlify, Vercel, Cloudflare Pages
- **Cloudflare (Workers statik varlıklar):** `wrangler.jsonc` hazırdır; `dist/` klasörünü SPA yönlendirmesiyle sunar
- **Kendi sunucun:** `nginx` (örnek yapılandırma için `nginx.conf.template` dosyasına bakın) veya `caddy`
- **Docker:** Yukarıdaki yöntem

> Not: Uygulama kök dizinde servis edilecek şekilde yapılandırılmıştır. Alt dizine dağıtmak için `vite.config.ts` içindeki `base` ayarını değiştirin.

---

## Proje Yapısı

```
src/
├── components/     # UI bileşenleri (Editor, Preview, Gallery, History, Layout, Settings, ui)
├── data/           # Şablonlar (TR/EN kaynaklı) ve TR/EN çeviri sözlükleri
├── hooks/          # Yeniden kullanılabilir React hook'ları (otomatik kayıt, sekmeler arası eşitleme vb.)
├── lib/            # i18n (React context + runtime aynası), derleme zamanı sürüm bilgisi
├── services/       # Mermaid render, dışa/içe aktarım, depolama, dönüştürme
├── store/          # Zustand store'ları (diagram + ayarlar)
└── types/          # Paylaşılan TypeScript tipleri
```

### Mimari notlar

- **Durum yönetimi:** İki Zustand store'u — `diagramStore` (belge içeriği, geçmiş) ve `settingsStore` (tema, yazı boyutu, dışa aktarım ve otomatik kayıt ayarları; kalıcı). Taslak, tuş vuruşlarından sonra kısa bir gecikmeyle yazılır; sayfa kapanırken bekleyen kayıt hemen yazılır.
- **i18n:** İki katmanlı — React bileşenleri `useTranslation()` hook'unu, React dışı kod (store'lar) ise `rt()` runtime çevirisini kullanır. Şablonların başlığı, açıklaması ve diyagram kaynağı her iki dilde de tutulur.
- **Çoklu sekme:** Başka bir sekmenin yazdığı taslak ezilmeden önce geçmişe alınır; geçmiş ve ayarlar `storage` olayıyla eşitlenir. "Tüm verileri sil" çalışınca bekleyen yazmalar engellenir ve diğer sekmeler yenilenir.
- **PNG güvenliği:** Mermaid `htmlLabels: false` ile yapılandırılır (ELK düzeni için kök seviyede verilmesi gerekir); etiketler `<foreignObject>` yerine `<text>` olur, böylece SVG canvas'a çizilirken kirlenmez (tainted canvas) ve `toBlob()` güvenle çalışır. Tek istisna mindmap'tir: HTML etiketle çizilir ve PNG alınırken `<foreignObject>` öğeleri `<text>`'e çevrilir.
- **Paylaşım biçimi:** `#s=1.<veri>`. Veri, `{t: başlık, d: açıklama, c: kod}` JSON'unun tarayıcının yerleşik `CompressionStream('deflate-raw')` ile sıkıştırılıp base64url'e çevrilmiş halidir (`1` = sıkıştırmalı, `0` = sıkıştırmasız yedek; bilinmeyen sürüm "desteklenmiyor" sayılır). Açarken çözülmüş boyut 256 KB ile sınırlanır (sıkıştırma bombasına karşı), alanlar doğrulanır ve render zaten `securityLevel: 'strict'` ile yapılır. Bağlantı, Safari'nin `await` sonrası paylaş/kopyala çağrılarını reddetmesi yüzünden arka planda önceden hesaplanır. Bağlantı 8.000 karakteri aşarsa kullanıcı uyarılır.
- **Sürüm bilgisi:** `vite.config.ts`, derleme sırasında `package.json`'dan sürümü, `node_modules`'tan **kurulu** bağımlılık sürümlerini ve git'ten commit'i okuyup `define` ile uygulamaya gömer. Hakkında modalında hangi bağımlılıkların gösterileceği `SHOWN_DEPENDENCIES` listesinde tutulur.

---

## Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Basit akış:

1. Repoyu fork'layın
2. Bir özellik dalı açın (`git checkout -b ozellik/harika-bir-sey`)
3. Değişikliklerinizi commit'leyin (`npm run lint` ve `npm run build`'ün geçtiğinden emin olun)
4. Pull Request açın

Lütfen commit'ten önce `npm run lint && npm run build` çalıştırarak kodun temiz ve derlenebilir olduğunu doğrulayın.

---

## Lisans

[MIT](LICENSE) © Halil AYDIN

Bu proje [Mermaid](https://mermaid.js.org/), [React](https://react.dev/), [Vite](https://vite.dev/), [CodeMirror](https://codemirror.net/) ve [Tailwind CSS](https://tailwindcss.com/) kullanır.
