# My Flowchart

> Tarayıcıda çalışan, **çevrimdışı** ve **sunucusuz** Mermaid diyagram editörü.
> Yaz, canlı önizle, dışa aktar. Hiçbir veri cihazından çıkmaz.

[![CI](https://github.com/ibrhalil/my-flowchart/actions/workflows/ci.yml/badge.svg)](https://github.com/ibrhalil/my-flowchart/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

My Flowchart, [Mermaid](https://mermaid.js.org/) sözdizimiyle akış şemaları, sekans diyagramları ve daha fazlasını oluşturmak için tasarlanmış, sade ve hızlı bir arayüzdür. Tüm işlemler tarayıcıda yapılır — kurulum, hesap veya arka uç gerekmez.

---

## Özellikler

- **Canlı önizleme** — yazdıkça diyagram anında güncellenir
- **17+ diyagram türü** — flowchart, sequence, class, state, ER, gantt, pie, journey, git, mindmap, timeline, quadrant, requirement, architecture, xychart, block, kanban
- **26 hazır şablon** ile hızlı başlangıç
- **5 formatta dışa aktarım** — PNG, SVG, Markdown, `.mmd`, JSON
- **İçe aktarım** — `.mmd`, `.json` ve `.md` (frontmatter + kod bloğu) dosyaları
- **Otomatik taslak kaydı** + **geçmiş anlık görüntüleri** (tarayıcı deposunda)
- **Söz dizimi linter'ı** — ASCII olmayan düğüm kimliklerini ve tırnaksız etiketleri yakalar, tek tıkla düzeltir
- **Zoom / pan / tam ekran** ve ekrana sığdır
- **Açık & koyu tema**, TR / EN dil seçenekleri
- CodeMirror 6 tabanlı editör (katlama, arama, satır numaraları)
- **Çevrimdışı çalışır** — yükledikten sonra internet bağlantısı gerekmez

---

## Hızlı Başlangıç (Geliştirme)

Gereksinimler: [Node.js](https://nodejs.org/) 18+ ve npm.

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

### Port değiştirme (çoklu uygulama)

Hizmet portu, `PORT` ortam değişkeni ile runtime'da ayarlanır (varsayılan `8765`; `8080`/`3000` gibi yaygın portlardan kaçınır). Aynı sunucuda birden fazla UI uygulaması çalıştırıyorsanız, her örneğe farklı bir port verin:

```bash
# İkinci bir örneği 9090 portunda çalıştır
docker run -e PORT=9090 -p 9090:9090 my-flowchart
```

> `-e PORT=<port>` konteynerin dinlediği portu, `-p <port>:<port>` ise host'a yayınlanan portu belirler. İkisi aynı olmalıdır.

> Image, çok aşamalı (multi-stage) derleme kullanır: Node ile derlenir, ardından ~65 MB'lık `nginx:alpine` üzerinde sunulur. SPA yönlendirmesi, gzip sıkıştırması, yapılandırılabilir port ve sağlık kontrolü içerir.

---

## Üretim Dağıtımı

`npm run build` sonrası `dist/` klasörü herhangi bir statik sunucuya konabilir:

- **Statik sunucular:** GitHub Pages, Netlify, Vercel, Cloudflare Pages
- **Kendi sunucun:** `nginx` (örnek yapılandırma için `nginx.conf.template` dosyasına bakın) veya `caddy`
- **Docker:** Yukarıdaki yöntem

> Not: Uygulama kök dizinde servis edilecek şekilde yapılandırılmıştır. Alt dizine dağıtmak için `vite.config.ts` içindeki `base` ayarını değiştirin.

---

## Proje Yapısı

```
src/
├── components/     # UI bileşenleri (Editor, Preview, Gallery, Layout, Settings)
├── data/           # Şablonlar ve TR/EN çeviri sözlükleri
├── hooks/          # Yeniden kullanılabilir React hook'ları
├── lib/            # i18n (React context + runtime aynası)
├── services/       # Mermaid render, dışa/içe aktarım, depolama, dönüştürme
├── store/          # Zustand store'ları (diagram + ayarlar)
└── types/          # Paylaşılan TypeScript tipleri
```

### Mimari notlar

- **Durum yönetimi:** İki Zustand store'u — `diagramStore` (belge içeriği, geçmiş) ve `settingsStore` (tema, dil, dışa aktarım ayarları; kalıcı).
- **i18n:** İki katmanlı — React bileşenleri `useTranslation()` hook'unu, React dışı kod (store'lar) ise `rt()` runtime çevirisini kullanır.
- **PNG güvenliği:** Mermaid `htmlLabels: false` ile yapılandırılır; böylece SVG canvas'a çizilirken kirlenmez (tainted canvas) ve `toBlob()` güvenle çalışır.

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
