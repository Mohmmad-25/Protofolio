# Connect Webia — نظام إدارة التشغيل (HTML)

تحويل ملف Figma «Connect Webia — Operations UX/UI» (3 صفحات، الشاشات 00–30 + Design system) إلى نظام HTML/CSS/JS قابل للبرمجة، بدون أدوات بناء.

ابدأ من `index.html` (فهرس كل الشاشات). يعمل بفتح الملف مباشرة أو من أي خادم ثابت.

## الهيكل

```
operations/
├── *.html                  شاشة لكل إطار في Figma (31 شاشة + design-system.html)
└── assets/
    ├── css/tokens.css      الألوان والخطوط والمسافات (غيّر الهوية من هنا فقط)
    ├── css/app.css         المكوّنات والتخطيط (RTL، جوال، وضع داكن)
    ├── js/data.js          بيانات تجريبية + CW.config
    ├── js/api.js           طبقة البيانات CW.api و CW.auth (تجريبي ← REST)
    ├── js/ui.js            جداول، شارات، نماذج، فلترة، حسابات CW.calc
    ├── js/layout.js        القائمة الجانبية والشريط العلوي + الصلاحيات حسب الدور
    ├── js/charts.js        رسوم Chart.js بألوان الهوية + عرض كجدول
    ├── js/pages/*.js       منطق كل شاشة (dashboards, work, admin, auth)
    └── vendor/             Chart.js 4.4.1 (MIT) محلياً
```

## الربط بالباك-إند

1. في `assets/js/data.js` عيّن `CW.config.apiBase = "https://api.example.com/v1"`.
2. كل الشاشات تستدعي `CW.api.<resource>.list/get/create/update/remove`، فتتحول تلقائياً إلى:
   `GET/POST /{resource}` و `GET/PATCH/DELETE /{resource}/{id}`.
   الموارد: employees, departments, clients, projects, tasks, events, services, documents, contracts, attendance, loginLog.
3. تسجيل الدخول: `POST /auth/login` يرجع `{ token, user: { id, name, role, title } }`، ويُرسل التوكن كـ `Authorization: Bearer`.
4. احذف `CW.config.today` لاستخدام تاريخ اليوم الفعلي.

## الأدوار
`ceo` · `ops` · `employee` — القائمة الجانبية تُفلتر حسب `roles` في `layout.js`. الصلاحيات الفعلية يجب أن تُفرض في الباك-إند أيضاً.

## الأرقام في اللوحات
لا توجد أرقام مكتوبة يدوياً في اللوحات: كلها تُحسب من البيانات (`CW.calc.weekStats`)، مثلاً نسبة الإنجاز = المنجزة ÷ مهام الأسبوع (20 ÷ 27 = 74%).

## الهوية (من CONNECT_WEBIA_LOGO.pdf)
- الألوان الرسمية: الكحلي `#112144` · البرتقالي `#F36C39` · الرمادي `#DADADB` — في `assets/css/tokens.css`.
- الشعار: `assets/brand/*.svg` مستخرجة كرسم متجه من ملف الشعار الأصلي (نفس الاسم وطريقة الرسم، بدون إعادة رسم):
  `logo-slogan.svg` (على الفاتح) · `logo-slogan-light.svg` (على الكحلي) · `logo.svg` · `logo-mark.svg` (أيقونة المتصفح).
- الخطوط: خط الشعار الرسمي Myriad Pro (مدفوع من Adobe)، فالواجهة تستخدم البديل المجاني Source Sans 3، و IBM Plex Sans Arabic للعربي. خط Gabryla يظهر فقط داخل الشعار اللفظي لأنه جزء من ملف الـ SVG.
- ملف الشعار مصمم بألوان طباعة CMYK، لذلك اعتمدنا رموز HEX المكتوبة في لوحة الألوان داخل الملف للشاشة.
