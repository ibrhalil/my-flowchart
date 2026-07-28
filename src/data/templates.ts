import type { TemplateEntry } from '../types/project'

export const TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-flow-basic',
    type: 'flowchart',
    title: 'Temel Flowchart',
    description: 'Karar akışı olan klasik bir akış şeması.',
    code: `flowchart TD
    A([Başla]) --> B{Giriş geçerli mi?}
    B -- Evet --> C[Kullanıcıyı oluştur]
    B -- Hayır --> D[Hata göster]
    D --> A
    C --> E([Bitir])`,
  },
  {
    id: 'tpl-flow-styled',
    type: 'flowchart',
    title: 'Stilli Flowchart',
    description: 'classDef ile renkli düğümler.',
    code: `flowchart LR
    A[Talep]:::primary --> B[Doğrula]:::warn
    B --> C[Onayla]:::ok
    classDef primary fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef warn fill:#f59e0b,stroke:#b45309,color:#fff
    classDef ok fill:#10b981,stroke:#047857,color:#fff`,
  },
  {
    id: 'tpl-sequence',
    type: 'sequenceDiagram',
    title: 'Sekans Diyagramı',
    description: 'Servisler arası mesaj akışı.',
    code: `sequenceDiagram
    actor U as Kullanıcı
    participant F as Frontend
    participant A as API
    participant DB as Veritabanı

    U->>F: Tıkla: Kaydet
    F->>A: POST /items
    A->>DB: INSERT
    DB-->>A: ok
    A-->>F: 201 Created
    F-->>U: Başarılı bildirimi`,
  },
  {
    id: 'tpl-class',
    type: 'classDiagram',
    title: 'Sınıf Diyagramı',
    description: 'Kalıtım ve ilişki örneği.',
    code: `classDiagram
    class Animal {
      +String name
      +int age
      +makeSound() String
    }
    class Dog {
      +fetch()
    }
    class Cat {
      +purr()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  {
    id: 'tpl-state',
    type: 'stateDiagram',
    title: 'Durum Diyagramı',
    description: 'Sipariş yaşam döngüsü.',
    code: `stateDiagram-v2
    state "Beklemede" as A
    state "Onaylandı" as B
    state "İptal" as C
    state "Kargoda" as D
    state "Teslim Edildi" as E

    [*] --> A
    A --> B : ödeme alındı
    A --> C : iptal talebi
    B --> D
    D --> E
    E --> [*]
    C --> [*]`,
  },
  {
    id: 'tpl-er',
    type: 'erDiagram',
    title: 'Varlık-İlişki',
    description: 'Veritabanı şeması örneği.',
    code: `erDiagram
    USER ||--o{ ORDER : "verir"
    ORDER ||--|{ LINE_ITEM : "içerir"
    PRODUCT ||--o{ LINE_ITEM : "yer alır"

    USER {
      bigint id PK
      string email
    }
    ORDER {
      bigint id PK
      bigint user_id FK
      date created_at
    }
    PRODUCT {
      bigint id PK
      string name
      decimal price
    }`,
  },
  {
    id: 'tpl-gantt',
    type: 'gantt',
    title: 'Gantt Şeması',
    description: 'Proje zaman çizelgesi.',
    code: `gantt
    title Yayın Takvimi
    dateFormat YYYY-MM-DD
    axisFormat %d.%m

    section Tasarım
    Wireframe       :a1, 2025-01-01, 5d
    UI              :after a1, 7d

    section Geliştirme
    Backend API     :2025-01-08, 10d
    Frontend        :2025-01-12, 12d

    section Yayın
    Test            :2025-01-25, 5d
    Yayına alma     :milestone, 2025-02-01, 0d`,
  },
  {
    id: 'tpl-pie',
    type: 'pie',
    title: 'Pasta Grafiği',
    description: 'Dağılım örneği.',
    code: `pie showData
    title Kullanım oranları
    "Masaüstü" : 55
    "Mobil" : 35
    "Tablet" : 10`,
  },
  {
    id: 'tpl-journey',
    type: 'user-journey',
    title: 'Kullanıcı Yolculuğu',
    description: 'Deneyim haritası.',
    code: `journey
    title Alışveriş deneyimi
    section Keşif
      Arama yap: 5: Kullanıcı
      Ürünü incele: 4: Kullanıcı
    section Satın alma
      Sepete ekle: 5: Kullanıcı
      Ödeme yap: 3: Kullanıcı, Sistem
    section Sonrası
      Kargo takibi: 4: Kullanıcı`,
  },
  {
    id: 'tpl-git',
    type: 'gitGraph',
    title: 'Git Graph',
    description: 'Dal yapısı örneği.',
    code: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    branch feature_login
    checkout feature_login
    commit
    commit
    checkout develop
    merge feature_login
    checkout main
    merge develop
    commit`,
  },
  {
    id: 'tpl-mindmap',
    type: 'mindmap',
    title: 'Zihin Haritası',
    description: 'Kavramsal ağaç.',
    code: `mindmap
  root((Proje))
    Tasarım
      UI
      UX
    Geliştirme
      Frontend
      Backend
    Operasyon
      CI/CD
      İzleme`,
  },

  // --- Pratik senaryolar ---
  {
    id: 'tpl-flow-auth',
    type: 'flowchart',
    title: 'Giriş / Kayıt Akışı',
    description: 'Kimlik doğrulama akışı: başarı ve hata dalları.',
    code: `flowchart TD
    A([Uygulamayı aç]) --> B{Oturum açık?}
    B -- Evet --> Z([Ana ekrana git])
    B -- Hayır --> C[Giriş ekranı]
    C --> D{Kayıtlı mı?}
    D -- Evet --> E[Email + şifre]
    D -- Hayır --> F[Kayıt formu]
    F --> G[Email doğrula]
    G --> E
    E --> H{Bilgiler doğru?}
    H -- Evet --> I[Token oluştur]
    H -- Hayır --> J[Hata göster]
    J --> E
    I --> Z`,
  },
  {
    id: 'tpl-flow-cicd',
    type: 'flowchart',
    title: 'CI/CD Pipeline',
    description: 'Derleme, test, staging ve canlıya alma akışı.',
    code: `flowchart LR
    A[Commit push] --> B[Kod derle]
    B --> C[Birim test]
    C --> D{Test geçti?}
    D -- Hayır --> E[Geliştiriciyi bilgilendir]
    D -- Evet --> F[İmaj oluştur]
    F --> G[Staging deploy]
    G --> H[Uçtan uca test]
    H --> I{Onay?}
    I -- Evet --> J[Prod deploy]
    I -- Hayır --> E
    J --> K([Canlıda izle])`,
  },
  {
    id: 'tpl-sequence-oauth',
    type: 'sequenceDiagram',
    title: 'OAuth2 Giriş Akışı',
    description: 'Yetkilendirme koduyla çok aktörlü OAuth akışı.',
    code: `sequenceDiagram
    actor U as Kullanıcı
    participant App as Uygulama
    participant Auth as Yetki Sunucusu
    participant API as Kaynak API

    U->>App: Korumalı kaynağa eriş
    App->>U: Yetki sayfasına yönlendir
    U->>Auth: Kimlik bilgileriyle giriş
    Auth->>U: Onay ekranı
    U->>Auth: Yetkileri onayla
    Auth-->>App: Yetkilendirme kodu
    App->>Auth: Kod + gizli anahtar
    Auth-->>App: Access token
    App->>API: İstek + Bearer token
    API-->>App: Kaynak verisi
    App-->>U: İstenen içerik`,
  },
  {
    id: 'tpl-state-bug',
    type: 'stateDiagram',
    title: 'Bug Yaşam Döngüsü',
    description: 'Hata bildiriminden kapatmaya durum geçişleri.',
    code: `stateDiagram-v2
    state "Yeni" as Y
    state "Atanmış" as A
    state "Açık" as O
    state "Çözümlendi" as R
    state "Kapatıldı" as C
    state "Yeniden açıldı" as W

    [*] --> Y : raporlandı
    Y --> A : geliştirici atandı
    A --> O : çalışma başladı
    O --> R : düzeltme yapıldı
    R --> C : doğrulandı
    C --> [*]
    C --> W : tekrar oluştu
    W --> A : yeniden atandı`,
  },
  {
    id: 'tpl-class-observer',
    type: 'classDiagram',
    title: 'Observer Tasarım Deseni',
    description: 'Gözlemci deseni: interface, realisazyon ve agregasyon.',
    code: `classDiagram
    class Subject {
      -List~Observer~ observers
      +attach(o Observer)
      +detach(o Observer)
      +notify()
    }
    class Observer {
      <<interface>>
      +update()
    }
    class ConcreteSubject {
      +getState() State
    }
    class ConcreteObserver {
      -State state
      +update()
    }

    Subject o-- Observer
    ConcreteSubject --|> Subject
    ConcreteObserver --|> Observer
    Subject ..> ConcreteObserver : bildirir`,
  },
  {
    id: 'tpl-er-blog',
    type: 'erDiagram',
    title: 'Blog / CMS Şeması',
    description: 'Kullanıcı, yazı, yorum ve etiket ilişkileri.',
    code: `erDiagram
    USER ||--o{ POST : "yazar"
    POST ||--|{ COMMENT : "sahip"
    POST }o--o{ TAG : "etiketli"
    USER ||--o{ COMMENT : "yorumlar"

    USER {
      bigint id PK
      string username
      string email
    }
    POST {
      bigint id PK
      bigint author_id FK
      string title
      text body
      timestamp published_at
    }
    COMMENT {
      bigint id PK
      bigint post_id FK
      bigint user_id FK
      text content
    }
    TAG {
      bigint id PK
      string name
    }`,
  },

  // --- Yeni Mermaid türleri ---
  {
    id: 'tpl-timeline',
    type: 'timeline',
    title: 'Ürün Yol Haritası',
    description: 'Çeyrek bazlı kilometre taşları ve hedefler.',
    code: `timeline
    title Ürün Yol Haritası 2025
    section Q1
        MVP yayını
        Beta davetiyeleri
    section Q2
        Açık beta
        Mobil uygulama
    section Q3
        Genel kullanım
        API genel erişim
    section Q4
        Kurumsal özellikler
        Yıllık değerlendirme`,
  },
  {
    id: 'tpl-quadrant',
    type: 'quadrant',
    title: 'Öncelik Matrisi',
    description: 'Efor ve etki ekseninde görev dağılımı.',
    code: `quadrantChart
    title Görev Öncelik Matrisi
    x-axis Düşük Efor --> Yüksek Efor
    y-axis Düşük Etki --> Yüksek Etki
    quadrant-1 Hızlı Kazançlar
    quadrant-2 Stratejik Projeler
    quadrant-3 İmkanlar
    quadrant-4 Rutin İşler
    "Bug düzeltme": [0.2, 0.8]
    "Yeni temel özellik": [0.8, 0.9]
    "Dokümantasyon": [0.3, 0.3]
    "Refactoring": [0.7, 0.4]`,
  },
  {
    id: 'tpl-requirement',
    type: 'requirement',
    title: 'Gereksinim Diyagramı',
    description: 'Sistem gereksinimleri ve doğrulama ilişkileri.',
    code: `requirementDiagram
    requirement giris {
      id: 1
      text: Sistem giriş yapmış kullanıcıyı korumalı alana eriştirmeli
      risk: high
      verifymethod: test
    }
    functionalRequirement kimlik_dogrulama {
      id: 2
      text: Email ve şifre ile kimlik doğrulama yapılmalı
      risk: medium
      verifymethod: inspection
    }
    performanceRequirement yanit_suresi {
      id: 3
      text: Giriş işlemi 500 ms içinde tamamlanmalı
      risk: medium
      verifymethod: demonstration
    }
    element "Mobil Uygulama" {
      type: client
    }
    element "Auth Servisi" {
      type: service
    }
    giris - contains -> kimlik_dogrulama
    giris - contains -> yanit_suresi
    "Mobil Uygulama" - satisfies -> giris
    "Auth Servisi" - verifies -> kimlik_dogrulama`,
  },
  {
    id: 'tpl-architecture',
    type: 'architecture',
    title: 'Mikroservis Mimarisi',
    description: 'Ön yüz, API, önbellek ve veritabanı bileşenleri.',
    code: `architecture-beta
    group frontend(cloud)[Frontend]
    group backend(cloud)[Backend]
    service db(database)[Database] in backend
    service cache(server)[Cache] in backend
    service api(server)[API Gateway] in backend
    service web(internet)[Web App] in frontend

    web:R --> L:api
    api:T --> B:cache
    api:R --> L:db`,
  },
  {
    id: 'tpl-xychart',
    type: 'xychart',
    title: 'Aylık Aktif Kullanıcı',
    description: 'Sütun grafikle aylık büyüme trendi.',
    code: `xychart-beta
    title "Aylık Aktif Kullanıcılar (bin)"
    x-axis ["Oca", "Şub", "Mar", "Nis", "May", "Haz"]
    y-axis "Kullanıcı" 0 --> 100
    bar [12, 18, 25, 34, 48, 67]`,
  },
  {
    id: 'tpl-block',
    type: 'block',
    title: 'Sistem Bileşenleri',
    description: 'İstemci, API, önbellek ve işçi blok diyagramı.',
    code: `block-beta
    client["İstemci"]
    api["API Katmanı"]
    auth["Auth Servisi"]
    cache[("Önbellek")]
    db[("Veritabanı")]
    worker["Arka Plan İşçi"]

    client --> api
    api --> auth
    api --> cache
    cache --> db
    api --> worker
    worker --> db`,
  },
  {
    id: 'tpl-kanban',
    type: 'kanban',
    title: 'Sprint Panosu',
    description: 'Kanban: backlog, yapılacak, devam, inceleme ve tamamlandı.',
    code: `kanban
    backlog[Backlog]
        tasarim[Tasarım güncellemesi]@{ assigned: 'Ayşe' }
        api[API dokümantasyonu]@{ assigned: 'Mustafa', ticket: 'DOC-12' }
    todo[Yapılacak]
        giris[Giriş düzeltmesi]@{ assigned: 'Ali', priority: 'High' }
    doing[Devam Ediyor]
        odeme[Ödeme modülü]@{ assigned: 'Zeynep', priority: 'Very High' }
    review[İnceleme]
        profil[Profil sayfası]@{ assigned: 'Burak' }
    done[Tamamlandı]
        gecis[Veri geçişi]@{ assigned: 'Can', priority: 'Low' }`,
  },
]

export const DEFAULT_TEMPLATE = TEMPLATES[0]
