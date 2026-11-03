import type { TemplateEntry } from '../types/project'

export const TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-flow-basic',
    type: 'flowchart',
    title: 'Temel Flowchart',
    description: 'Karar akışı olan klasik bir akış şeması.',
    titleEn: 'Basic Flowchart',
    descriptionEn: 'A classic flowchart with a decision branch.',
    code: `flowchart TD
    A([Başla]) --> B{Giriş geçerli mi?}
    B -- Evet --> C[Kullanıcıyı oluştur]
    B -- Hayır --> D[Hata göster]
    D --> A
    C --> E([Bitir])`,
    codeEn: `flowchart TD
    A([Start]) --> B{Is the input valid?}
    B -- Yes --> C[Create the user]
    B -- No --> D[Show error]
    D --> A
    C --> E([Finish])`,
  },
  {
    id: 'tpl-flow-styled',
    type: 'flowchart',
    title: 'Stilli Flowchart',
    description: 'classDef ile renkli düğümler.',
    titleEn: 'Styled Flowchart',
    descriptionEn: 'Colorful nodes using classDef.',
    code: `flowchart LR
    A[Talep]:::primary --> B[Doğrula]:::warn
    B --> C[Onayla]:::ok
    classDef primary fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef warn fill:#f59e0b,stroke:#b45309,color:#fff
    classDef ok fill:#10b981,stroke:#047857,color:#fff`,
    codeEn: `flowchart LR
    A[Request]:::primary --> B[Validate]:::warn
    B --> C[Approve]:::ok
    classDef primary fill:#3b82f6,stroke:#1d4ed8,color:#fff
    classDef warn fill:#f59e0b,stroke:#b45309,color:#fff
    classDef ok fill:#10b981,stroke:#047857,color:#fff`,
  },
  {
    id: 'tpl-sequence',
    type: 'sequenceDiagram',
    title: 'Sekans Diyagramı',
    description: 'Servisler arası mesaj akışı.',
    titleEn: 'Sequence Diagram',
    descriptionEn: 'Message flow between services.',
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
    codeEn: `sequenceDiagram
    actor U as User
    participant F as Frontend
    participant A as API
    participant DB as Database

    U->>F: Click: Save
    F->>A: POST /items
    A->>DB: INSERT
    DB-->>A: ok
    A-->>F: 201 Created
    F-->>U: Success notification`,
  },
  {
    id: 'tpl-class',
    type: 'classDiagram',
    title: 'Sınıf Diyagramı',
    description: 'Kalıtım ve ilişki örneği.',
    titleEn: 'Class Diagram',
    descriptionEn: 'Inheritance and relations example.',
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
    titleEn: 'State Diagram',
    descriptionEn: 'Order lifecycle.',
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
    codeEn: `stateDiagram-v2
    state "Pending" as A
    state "Approved" as B
    state "Cancelled" as C
    state "Shipped" as D
    state "Delivered" as E

    [*] --> A
    A --> B : payment received
    A --> C : cancellation request
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
    titleEn: 'Entity Relationship',
    descriptionEn: 'Database schema example.',
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
    codeEn: `erDiagram
    USER ||--o{ ORDER : "places"
    ORDER ||--|{ LINE_ITEM : "contains"
    PRODUCT ||--o{ LINE_ITEM : "appears in"

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
    titleEn: 'Gantt Chart',
    descriptionEn: 'Project timeline.',
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
    codeEn: `gantt
    title Release Schedule
    dateFormat YYYY-MM-DD
    axisFormat %d.%m

    section Design
    Wireframe       :a1, 2025-01-01, 5d
    UI              :after a1, 7d

    section Development
    Backend API     :2025-01-08, 10d
    Frontend        :2025-01-12, 12d

    section Release
    Testing         :2025-01-25, 5d
    Go live         :milestone, 2025-02-01, 0d`,
  },
  {
    id: 'tpl-pie',
    type: 'pie',
    title: 'Pasta Grafiği',
    description: 'Dağılım örneği.',
    titleEn: 'Pie Chart',
    descriptionEn: 'Distribution example.',
    code: `pie showData
    title Kullanım oranları
    "Masaüstü" : 55
    "Mobil" : 35
    "Tablet" : 10`,
    codeEn: `pie showData
    title Usage share
    "Desktop" : 55
    "Mobile" : 35
    "Tablet" : 10`,
  },
  {
    id: 'tpl-journey',
    type: 'user-journey',
    title: 'Kullanıcı Yolculuğu',
    description: 'Deneyim haritası.',
    titleEn: 'User Journey',
    descriptionEn: 'Experience map.',
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
    codeEn: `journey
    title Shopping experience
    section Discovery
      Search: 5: User
      Inspect the product: 4: User
    section Purchase
      Add to cart: 5: User
      Pay: 3: User, System
    section Afterwards
      Track the shipment: 4: User`,
  },
  {
    id: 'tpl-git',
    type: 'gitGraph',
    title: 'Git Graph',
    description: 'Dal yapısı örneği.',
    titleEn: 'Git Graph',
    descriptionEn: 'Branching structure example.',
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
    titleEn: 'Mindmap',
    descriptionEn: 'Conceptual tree.',
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
    codeEn: `mindmap
  root((Project))
    Design
      UI
      UX
    Development
      Frontend
      Backend
    Operations
      CI/CD
      Monitoring`,
  },

  {
    id: 'tpl-flow-auth',
    type: 'flowchart',
    title: 'Giriş / Kayıt Akışı',
    description: 'Kimlik doğrulama akışı: başarı ve hata dalları.',
    titleEn: 'Sign-in / Sign-up Flow',
    descriptionEn: 'Authentication flow with success and error branches.',
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
    codeEn: `flowchart TD
    A([Open the app]) --> B{Signed in?}
    B -- Yes --> Z([Go to home screen])
    B -- No --> C[Sign-in screen]
    C --> D{Registered?}
    D -- Yes --> E[Email + password]
    D -- No --> F[Sign-up form]
    F --> G[Verify email]
    G --> E
    E --> H{Credentials correct?}
    H -- Yes --> I[Create token]
    H -- No --> J[Show error]
    J --> E
    I --> Z`,
  },
  {
    id: 'tpl-flow-cicd',
    type: 'flowchart',
    title: 'CI/CD Pipeline',
    description: 'Derleme, test, staging ve canlıya alma akışı.',
    titleEn: 'CI/CD Pipeline',
    descriptionEn: 'Build, test, staging and rollout flow.',
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
    codeEn: `flowchart LR
    A[Push commit] --> B[Build code]
    B --> C[Unit tests]
    C --> D{Tests passed?}
    D -- No --> E[Notify the developer]
    D -- Yes --> F[Build image]
    F --> G[Deploy to staging]
    G --> H[End-to-end tests]
    H --> I{Approved?}
    I -- Yes --> J[Deploy to prod]
    I -- No --> E
    J --> K([Monitor in production])`,
  },
  {
    id: 'tpl-sequence-oauth',
    type: 'sequenceDiagram',
    title: 'OAuth2 Giriş Akışı',
    description: 'Yetkilendirme koduyla çok aktörlü OAuth akışı.',
    titleEn: 'OAuth2 Sign-in Flow',
    descriptionEn: 'Multi-party OAuth flow with authorization code.',
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
    codeEn: `sequenceDiagram
    actor U as User
    participant App as App
    participant Auth as Authorization Server
    participant API as Resource API

    U->>App: Access a protected resource
    App->>U: Redirect to the authorization page
    U->>Auth: Sign in with credentials
    Auth->>U: Consent screen
    U->>Auth: Approve permissions
    Auth-->>App: Authorization code
    App->>Auth: Code + client secret
    Auth-->>App: Access token
    App->>API: Request + Bearer token
    API-->>App: Resource data
    App-->>U: Requested content`,
  },
  {
    id: 'tpl-state-bug',
    type: 'stateDiagram',
    title: 'Bug Yaşam Döngüsü',
    description: 'Hata bildiriminden kapatmaya durum geçişleri.',
    titleEn: 'Bug Lifecycle',
    descriptionEn: 'State transitions from report to close.',
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
    codeEn: `stateDiagram-v2
    state "New" as Y
    state "Assigned" as A
    state "Open" as O
    state "Resolved" as R
    state "Closed" as C
    state "Reopened" as W

    [*] --> Y : reported
    Y --> A : developer assigned
    A --> O : work started
    O --> R : fix applied
    R --> C : verified
    C --> [*]
    C --> W : happened again
    W --> A : reassigned`,
  },
  {
    id: 'tpl-class-observer',
    type: 'classDiagram',
    title: 'Observer Tasarım Deseni',
    description: 'Gözlemci deseni: interface, realisazyon ve agregasyon.',
    titleEn: 'Observer Design Pattern',
    descriptionEn: 'Observer pattern: interface, realization and aggregation.',
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
    codeEn: `classDiagram
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
    Subject ..> ConcreteObserver : notifies`,
  },
  {
    id: 'tpl-er-blog',
    type: 'erDiagram',
    title: 'Blog / CMS Şeması',
    description: 'Kullanıcı, yazı, yorum ve etiket ilişkileri.',
    titleEn: 'Blog / CMS Schema',
    descriptionEn: 'User, post, comment and tag relations.',
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
    codeEn: `erDiagram
    USER ||--o{ POST : "writes"
    POST ||--|{ COMMENT : "has"
    POST }o--o{ TAG : "tagged with"
    USER ||--o{ COMMENT : "comments"

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

  {
    id: 'tpl-timeline',
    type: 'timeline',
    title: 'Ürün Yol Haritası',
    description: 'Çeyrek bazlı kilometre taşları ve hedefler.',
    titleEn: 'Product Roadmap',
    descriptionEn: 'Quarterly milestones and goals.',
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
    codeEn: `timeline
    title Product Roadmap 2025
    section Q1
        MVP release
        Beta invitations
    section Q2
        Open beta
        Mobile app
    section Q3
        General availability
        Public API access
    section Q4
        Enterprise features
        Annual review`,
  },
  {
    id: 'tpl-quadrant',
    type: 'quadrant',
    title: 'Öncelik Matrisi',
    description: 'Efor ve etki ekseninde görev dağılımı.',
    titleEn: 'Priority Matrix',
    descriptionEn: 'Task distribution by effort and impact.',
    code: `quadrantChart
    title Görev Öncelik Matrisi
    x-axis Düşük Efor --> Yüksek Efor
    y-axis Düşük Etki --> Yüksek Etki
    quadrant-1 Stratejik Projeler
    quadrant-2 Hızlı Kazançlar
    quadrant-3 İmkanlar
    quadrant-4 Rutin İşler
    "Bug düzeltme": [0.2, 0.8]
    "Yeni temel özellik": [0.8, 0.9]
    "Dokümantasyon": [0.3, 0.3]
    "Refactoring": [0.7, 0.4]`,
    codeEn: `quadrantChart
    title Task Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Strategic Projects
    quadrant-2 Quick Wins
    quadrant-3 Opportunities
    quadrant-4 Routine Work
    "Bug fix": [0.2, 0.8]
    "New core feature": [0.8, 0.9]
    "Documentation": [0.3, 0.3]
    "Refactoring": [0.7, 0.4]`,
  },
  {
    id: 'tpl-requirement',
    type: 'requirement',
    title: 'Gereksinim Diyagramı',
    description: 'Sistem gereksinimleri ve doğrulama ilişkileri.',
    titleEn: 'Requirement Diagram',
    descriptionEn: 'System requirements and verification relations.',
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
    codeEn: `requirementDiagram
    requirement login {
      id: 1
      text: "The system must give a signed-in user access to the protected area"
      risk: high
      verifymethod: test
    }
    functionalRequirement authentication {
      id: 2
      text: "Authentication must work with email and password"
      risk: medium
      verifymethod: inspection
    }
    performanceRequirement response_time {
      id: 3
      text: "Sign-in must complete within 500 ms"
      risk: medium
      verifymethod: demonstration
    }
    element "Mobile App" {
      type: client
    }
    element "Auth Service" {
      type: service
    }
    login - contains -> authentication
    login - contains -> response_time
    "Mobile App" - satisfies -> login
    "Auth Service" - verifies -> authentication`,
  },
  {
    id: 'tpl-architecture',
    type: 'architecture',
    title: 'Mikroservis Mimarisi',
    description: 'Ön yüz, API, önbellek ve veritabanı bileşenleri.',
    titleEn: 'Microservice Architecture',
    descriptionEn: 'Frontend, API, cache and database components.',
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
    titleEn: 'Monthly Active Users',
    descriptionEn: 'Monthly growth trend as a bar chart.',
    code: `xychart-beta
    title "Aylık Aktif Kullanıcılar (bin)"
    x-axis ["Oca", "Şub", "Mar", "Nis", "May", "Haz"]
    y-axis "Kullanıcı" 0 --> 100
    bar [12, 18, 25, 34, 48, 67]`,
    codeEn: `xychart-beta
    title "Monthly Active Users (thousands)"
    x-axis ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    y-axis "Users" 0 --> 100
    bar [12, 18, 25, 34, 48, 67]`,
  },
  {
    id: 'tpl-block',
    type: 'block',
    title: 'Sistem Bileşenleri',
    description: 'İstemci, API, önbellek ve işçi blok diyagramı.',
    titleEn: 'System Components',
    descriptionEn: 'Client, API, cache and worker block diagram.',
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
    codeEn: `block-beta
    client["Client"]
    api["API Layer"]
    auth["Auth Service"]
    cache[("Cache")]
    db[("Database")]
    worker["Background Worker"]

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
    titleEn: 'Sprint Board',
    descriptionEn: 'Kanban: backlog, to-do, doing, review and done.',
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
    codeEn: `kanban
    backlog[Backlog]
        design[Design update]@{ assigned: 'Alice' }
        api[API documentation]@{ assigned: 'Mark', ticket: 'DOC-12' }
    todo[To do]
        login[Login fix]@{ assigned: 'Adam', priority: 'High' }
    doing[In progress]
        payment[Payment module]@{ assigned: 'Zoe', priority: 'Very High' }
    review[Review]
        profile[Profile page]@{ assigned: 'Ben' }
    done[Done]
        migration[Data migration]@{ assigned: 'Sam', priority: 'Low' }`,
  },
  {
    id: 'tpl-flow-leave',
    type: 'flowchart',
    title: 'İzin Talebi Onayı',
    description: 'İzin talebinin kontrol, onay ve bildirim adımları.',
    titleEn: 'Leave Request Approval',
    descriptionEn: 'Check, approval and notification steps of a leave request.',
    code: `flowchart TD
    A([Çalışan izin talep eder]) --> B{Yıllık izin hakkı yeterli mi?}
    B -- Hayır --> C[Talep reddedilir]
    B -- Evet --> D{Yönetici onayı}
    D -- Onay --> E[İK sisteme işler]
    D -- Red --> C
    E --> F([Çalışana bildirim gider])
    C --> F`,
    codeEn: `flowchart TD
    A([Employee requests leave]) --> B{Enough annual leave balance?}
    B -- No --> C[Request is rejected]
    B -- Yes --> D{Manager approval}
    D -- Approve --> E[HR records it in the system]
    D -- Reject --> C
    E --> F([Employee is notified])
    C --> F`,
  },
  {
    id: 'tpl-flow-onboarding',
    type: 'flowchart',
    title: 'Çalışan Karşılama Süreci',
    description: 'Yeni çalışanın karşılanması: İK, BT ve ekip arasında paylaşılan görevler.',
    titleEn: 'Employee Onboarding',
    descriptionEn: 'Welcoming a new hire: tasks shared between HR, IT and the team.',
    code: `flowchart LR
    subgraph IK["İK"]
        A[Sözleşme imzalanır] --> B[Hesaplar açılır]
    end
    subgraph BT["Bilgi Teknolojileri"]
        C[Laptop hazırlanır] --> D[Erişimler tanımlanır]
    end
    subgraph EK["Ekip"]
        E[Hoş geldin toplantısı] --> F[İlk hafta görevleri]
    end
    B --> C
    D --> E`,
    codeEn: `flowchart LR
    subgraph HR["HR"]
        A[Contract is signed] --> B[Accounts are created]
    end
    subgraph IT["Information Technology"]
        C[Laptop is prepared] --> D[Access is granted]
    end
    subgraph TEAM["Team"]
        E[Welcome meeting] --> F[First-week tasks]
    end
    B --> C
    D --> E`,
  },
  {
    id: 'tpl-flow-incident',
    type: 'flowchart',
    title: 'Olay Müdahale Akışı',
    description: 'Bir kesinti alarmından olay sonrası incelemeye kadar müdahale adımları.',
    titleEn: 'Incident Response',
    descriptionEn: 'Response steps from an outage alarm to the post-incident review.',
    code: `flowchart TD
    A([Alarm tetiklenir]) --> B[Nöbetçi mühendis inceler]
    B --> C{Gerçek bir kesinti mi?}
    C -- Hayır --> D[Alarmı kapat ve eşiği ayarla]
    C -- Evet --> E[Olay kanalı açılır]
    E --> F[Etki ve öncelik belirlenir]
    F --> G[Geçici çözüm uygulanır]
    G --> H{Servis düzeldi mi?}
    H -- Hayır --> F
    H -- Evet --> I[Olay sonrası inceleme planlanır]
    D --> J([Bitti])
    I --> J`,
    codeEn: `flowchart TD
    A([Alert fires]) --> B[On-call engineer investigates]
    B --> C{Is it a real outage?}
    C -- No --> D[Close the alert and tune the threshold]
    C -- Yes --> E[Open an incident channel]
    E --> F[Determine impact and priority]
    F --> G[Apply a temporary fix]
    G --> H{Is the service back?}
    H -- No --> F
    H -- Yes --> I[Schedule a post-incident review]
    D --> J([Done])
    I --> J`,
  },
  {
    id: 'tpl-sequence-checkout',
    type: 'sequenceDiagram',
    title: 'Online Ödeme Akışı',
    description: 'Müşteri, mağaza, ödeme sağlayıcı ve banka arasındaki adımlar; başarılı ve başarısız yol.',
    titleEn: 'Online Checkout Flow',
    descriptionEn: 'Steps between customer, shop, payment provider and bank, including the failure path.',
    code: `sequenceDiagram
    actor M as Müşteri
    participant S as Mağaza
    participant P as Ödeme Sağlayıcı
    participant B as Banka
    M->>S: Sepeti onayla
    S->>P: Ödeme oturumu başlat
    P-->>M: Ödeme formu
    M->>P: Kart bilgilerini gir
    P->>B: Provizyon iste
    alt Yeterli bakiye
        B-->>P: Onaylandı
        P-->>S: Ödeme başarılı
        S-->>M: Sipariş onayı
    else Yetersiz bakiye
        B-->>P: Reddedildi
        P-->>M: Ödeme başarısız
    end`,
    codeEn: `sequenceDiagram
    actor C as Customer
    participant S as Shop
    participant P as Payment Provider
    participant B as Bank
    C->>S: Confirm the cart
    S->>P: Start a payment session
    P-->>C: Payment form
    C->>P: Enter card details
    P->>B: Request authorization
    alt Sufficient funds
        B-->>P: Approved
        P-->>S: Payment succeeded
        S-->>C: Order confirmation
    else Insufficient funds
        B-->>P: Declined
        P-->>C: Payment failed
    end`,
  },
  {
    id: 'tpl-sequence-api',
    type: 'sequenceDiagram',
    title: 'API İsteği ve Önbellek',
    description: 'Bir API isteğinin önbellek ve veritabanıyla nasıl yanıtlandığı.',
    titleEn: 'API Request with Cache',
    descriptionEn: 'How an API request is answered using a cache and a database.',
    code: `sequenceDiagram
    participant C as İstemci
    participant A as API
    participant R as Önbellek
    participant D as Veritabanı
    C->>A: GET /urunler/42
    A->>R: Önbellekte ara
    alt Önbellekte var
        R-->>A: Kayıt
    else Önbellekte yok
        R-->>A: Bulunamadı
        A->>D: Kaydı sorgula
        D-->>A: Kayıt
        A->>R: Önbelleğe yaz
    end
    A-->>C: 200 OK`,
    codeEn: `sequenceDiagram
    participant C as Client
    participant A as API
    participant R as Cache
    participant D as Database
    C->>A: GET /products/42
    A->>R: Look up in cache
    alt Cache hit
        R-->>A: Record
    else Cache miss
        R-->>A: Not found
        A->>D: Query the record
        D-->>A: Record
        A->>R: Write to cache
    end
    A-->>C: 200 OK`,
  },
  {
    id: 'tpl-class-shop',
    type: 'classDiagram',
    title: 'E-ticaret Modeli',
    description: 'Müşteri, sipariş ve ürün sınıfları ile aralarındaki ilişkiler.',
    titleEn: 'E-commerce Model',
    descriptionEn: 'Customer, order and product classes and how they relate.',
    code: `classDiagram
    class Musteri {
        +String ad
        +String eposta
        +siparisVer()
    }
    class Siparis {
        +Date tarih
        +Decimal toplam
        +iptalEt()
    }
    class Urun {
        +String ad
        +Decimal fiyat
    }
    Musteri "1" --> "*" Siparis : verir
    Siparis "*" --> "*" Urun : içerir`,
    codeEn: `classDiagram
    class Customer {
        +String name
        +String email
        +placeOrder()
    }
    class Order {
        +Date date
        +Decimal total
        +cancel()
    }
    class Product {
        +String name
        +Decimal price
    }
    Customer "1" --> "*" Order : places
    Order "*" --> "*" Product : contains`,
  },
  {
    id: 'tpl-state-order',
    type: 'stateDiagram',
    title: 'Sipariş Durumları',
    description: 'Bir siparişin beklemeden teslimata ya da iptale uzanan durumları.',
    titleEn: 'Order States',
    descriptionEn: 'The states of an order, from pending to delivery or cancellation.',
    code: `stateDiagram-v2
    [*] --> Beklemede
    Beklemede --> Hazirlaniyor: Ödeme alındı
    Hazirlaniyor --> Kargoda: Kargoya verildi
    Kargoda --> TeslimEdildi: Teslim alındı
    Beklemede --> IptalEdildi: Müşteri vazgeçti
    Hazirlaniyor --> IptalEdildi: Stok yok
    TeslimEdildi --> [*]
    IptalEdildi --> [*]`,
    codeEn: `stateDiagram-v2
    [*] --> Pending
    Pending --> Preparing: Payment received
    Preparing --> Shipped: Handed to the carrier
    Shipped --> Delivered: Received
    Pending --> Cancelled: Customer changed their mind
    Preparing --> Cancelled: Out of stock
    Delivered --> [*]
    Cancelled --> [*]`,
  },
  {
    id: 'tpl-er-shop',
    type: 'erDiagram',
    title: 'Sipariş Veritabanı',
    description: 'Müşteri, sipariş ve ürün tablolarının anahtarlarıyla birlikte veritabanı şeması.',
    titleEn: 'Order Database',
    descriptionEn: 'A database schema for customers, orders and products, with keys.',
    code: `erDiagram
    MUSTERI ||--o{ SIPARIS : verir
    SIPARIS ||--|{ SIPARIS_KALEMI : icerir
    URUN ||--o{ SIPARIS_KALEMI : "satırda yer alır"
    MUSTERI {
        int id PK
        string ad
        string eposta UK
    }
    SIPARIS {
        int id PK
        int musteri_id FK
        date tarih
    }
    SIPARIS_KALEMI {
        int siparis_id FK
        int urun_id FK
        int adet
    }
    URUN {
        int id PK
        string ad
        decimal fiyat
    }`,
    codeEn: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "appears in"
    CUSTOMER {
        int id PK
        string name
        string email UK
    }
    ORDER {
        int id PK
        int customer_id FK
        date order_date
    }
    ORDER_ITEM {
        int order_id FK
        int product_id FK
        int quantity
    }
    PRODUCT {
        int id PK
        string name
        decimal price
    }`,
  },
  {
    id: 'tpl-gantt-launch',
    type: 'gantt',
    title: 'Ürün Lansman Planı',
    description: 'Hazırlıktan lansmana üç aşamalı bir ürün takvimi.',
    titleEn: 'Product Launch Plan',
    descriptionEn: 'A three-phase product schedule, from preparation to launch.',
    code: `gantt
    title Ürün Lansman Planı
    dateFormat YYYY-MM-DD
    axisFormat %d.%m

    section Hazırlık
    Pazar araştırması :done, a1, 2025-01-06, 10d
    Tasarım           :active, a2, after a1, 14d

    section Geliştirme
    Backend           :b1, after a2, 20d
    Arayüz            :b2, after a2, 20d

    section Yayın
    Test              :c1, after b1, 7d
    Lansman           :milestone, m1, after c1, 0d`,
    codeEn: `gantt
    title Product Launch Plan
    dateFormat YYYY-MM-DD
    axisFormat %d.%m

    section Preparation
    Market research :done, a1, 2025-01-06, 10d
    Design          :active, a2, after a1, 14d

    section Development
    Backend         :b1, after a2, 20d
    Frontend        :b2, after a2, 20d

    section Release
    Testing         :c1, after b1, 7d
    Launch          :milestone, m1, after c1, 0d`,
  },
  {
    id: 'tpl-pie-budget',
    type: 'pie',
    title: 'Bütçe Dağılımı',
    description: 'Aylık bütçenin kalemlere göre dağılımı.',
    titleEn: 'Budget Breakdown',
    descriptionEn: 'How a monthly budget splits across categories.',
    code: `pie showData title Aylık bütçe dağılımı
    "Kira" : 35
    "Gıda" : 20
    "Ulaşım" : 10
    "Eğlence" : 10
    "Tasarruf" : 25`,
    codeEn: `pie showData title Monthly budget breakdown
    "Rent" : 35
    "Food" : 20
    "Transport" : 10
    "Entertainment" : 10
    "Savings" : 25`,
  },
  {
    id: 'tpl-journey-support',
    type: 'user-journey',
    title: 'Destek Deneyimi',
    description: 'Bir müşterinin destek talebi açıp çözüm alana kadar yaşadığı deneyim.',
    titleEn: 'Support Experience',
    descriptionEn: 'What a customer goes through from opening a support request to getting it solved.',
    code: `journey
    title Destek talebi deneyimi
    section Talep
      Sorunu fark et: 2: Müşteri
      Destek formunu doldur: 3: Müşteri
    section Çözüm
      Otomatik yanıt al: 3: Müşteri
      Temsilciyle yazış: 4: Müşteri, Temsilci
      Sorun çözülür: 5: Müşteri, Temsilci
    section Sonrası
      Memnuniyet anketi: 4: Müşteri`,
    codeEn: `journey
    title Support request experience
    section Request
      Notice the problem: 2: Customer
      Fill in the support form: 3: Customer
    section Resolution
      Get an automatic reply: 3: Customer
      Chat with an agent: 4: Customer, Agent
      Problem is solved: 5: Customer, Agent
    section Afterwards
      Satisfaction survey: 4: Customer`,
  },
  {
    id: 'tpl-git-flow',
    type: 'gitGraph',
    title: 'Git Flow Dal Stratejisi',
    description: 'develop, feature ve release dallarıyla klasik bir sürüm stratejisi.',
    titleEn: 'Git Flow Branching',
    descriptionEn: 'A classic release strategy with develop, feature and release branches.',
    code: `gitGraph
    commit id: "ilk_surum"
    branch develop
    checkout develop
    commit
    branch feature_giris
    checkout feature_giris
    commit
    commit
    checkout develop
    merge feature_giris
    branch release_1
    checkout release_1
    commit id: "hata_duzeltme"
    checkout main
    merge release_1 tag: "v1.1"
    checkout develop
    merge release_1`,
    codeEn: `gitGraph
    commit id: "first_release"
    branch develop
    checkout develop
    commit
    branch feature_login
    checkout feature_login
    commit
    commit
    checkout develop
    merge feature_login
    branch release_1
    checkout release_1
    commit id: "bug_fix"
    checkout main
    merge release_1 tag: "v1.1"
    checkout develop
    merge release_1`,
  },
  {
    id: 'tpl-mindmap-plan',
    type: 'mindmap',
    title: 'Ürün Planlama Haritası',
    description: 'Yeni bir ürün fikrini hedef kitle, özellik, pazarlama ve bütçe diye dallandırma.',
    titleEn: 'Product Planning Map',
    descriptionEn: 'Branch a new product idea into audience, features, marketing and budget.',
    code: `mindmap
  root((Yeni ürün))
    Hedef kitle
      Yaş grubu
      İhtiyaçlar
    Özellikler
      Temel
      İleri
    Pazarlama
      Sosyal medya
      Blog
    Bütçe`,
    codeEn: `mindmap
  root((New product))
    Target audience
      Age group
      Needs
    Features
      Core
      Advanced
    Marketing
      Social media
      Blog
    Budget`,
  },
  {
    id: 'tpl-timeline-company',
    type: 'timeline',
    title: 'Şirket Tarihçesi',
    description: 'Bir şirketin ya da projenin yıllara yayılan önemli anları.',
    titleEn: 'Company History',
    descriptionEn: 'The key moments of a company or project across the years.',
    code: `timeline
    title Şirket tarihçesi
    2020 : Kuruluş : İlk 3 çalışan
    2021 : İlk ürün yayınlandı
    2022 : 10.000 kullanıcı : Yatırım alındı
    2023 : Yurt dışına açılma`,
    codeEn: `timeline
    title Company history
    2020 : Founded : First 3 employees
    2021 : First product released
    2022 : 10,000 users : Raised funding
    2023 : Expanded abroad`,
  },
  {
    id: 'tpl-quadrant-eisenhower',
    type: 'quadrant',
    title: 'Eisenhower Matrisi',
    description: 'Görevleri aciliyet ve önem eksenlerinde dört gruba ayırma.',
    titleEn: 'Eisenhower Matrix',
    descriptionEn: 'Sort tasks into four groups by urgency and importance.',
    code: `quadrantChart
    title Görev önceliklendirme
    x-axis Acil değil --> Acil
    y-axis Önemli değil --> Önemli
    quadrant-1 Hemen yap
    quadrant-2 Planla
    quadrant-3 Ele
    quadrant-4 Devret
    Müşteri şikayeti: [0.85, 0.9]
    Eğitim planı: [0.2, 0.8]
    Gereksiz toplantı: [0.7, 0.2]
    Sosyal medya: [0.2, 0.15]`,
    codeEn: `quadrantChart
    title Task prioritization
    x-axis Not urgent --> Urgent
    y-axis Not important --> Important
    quadrant-1 Do now
    quadrant-2 Schedule
    quadrant-3 Eliminate
    quadrant-4 Delegate
    Customer complaint: [0.85, 0.9]
    Training plan: [0.2, 0.8]
    Pointless meeting: [0.7, 0.2]
    Social media: [0.2, 0.15]`,
  },
  {
    id: 'tpl-xychart-sales',
    type: 'xychart',
    title: 'Aylık Satış ve Hedef',
    description: 'Aylık satışları çubuk, hedefi çizgi olarak karşılaştırma.',
    titleEn: 'Monthly Sales vs Target',
    descriptionEn: 'Compare monthly sales as bars against a target line.',
    code: `xychart-beta
    title "Aylık satışlar (bin ₺)"
    x-axis ["Oca", "Şub", "Mar", "Nis", "May", "Haz"]
    y-axis "Satış" 0 --> 100
    bar [42, 55, 61, 70, 78, 90]
    line [50, 55, 60, 70, 75, 85]`,
    codeEn: `xychart-beta
    title "Monthly sales (thousand $)"
    x-axis ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    y-axis "Sales" 0 --> 100
    bar [42, 55, 61, 70, 78, 90]
    line [50, 55, 60, 70, 75, 85]`,
  },
]

export const DEFAULT_TEMPLATE = TEMPLATES[0]
