/* =========================================================
   الهيكل المشترك: القائمة الجانبية + الشريط العلوي
   كل صفحة تكتب فقط <main class="content"> والهيكل يُبنى هنا.
   <body data-page="..." data-nav="..." data-crumb="القسم|الصفحة">
   ========================================================= */
(function () {
  const I = {
    grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    check: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
    board: '<path d="M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v13h-4z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    badge: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;
  CW.icon = icon;

  // roles: من يرى الرابط
  const NAV = [
    { label: "نظرة عامة", items: [
      { id: "dash-ceo", text: "لوحة الرئيس التنفيذي", href: "dashboard-ceo.html", icon: "grid", roles: ["ceo"] },
      { id: "dash-ops", text: "لوحة مدير التشغيل", href: "dashboard-ops.html", icon: "grid", roles: ["ceo", "ops"] },
      { id: "my-tasks", text: "مهامي", href: "my-tasks.html", icon: "target", roles: ["ops", "employee"] },
      { id: "weekly", text: "الملخص الأسبوعي", href: "weekly-summary.html", icon: "chart", roles: ["ceo", "ops"] }
    ]},
    { label: "العمل", items: [
      { id: "projects", text: "المشاريع", href: "projects.html", icon: "folder" },
      { id: "tasks", text: "المهام", href: "tasks.html", icon: "check", count: "overdue" },
      { id: "board", text: "لوحة الحالات", href: "board.html", icon: "board" },
      { id: "calendar", text: "التقويم", href: "calendar.html", icon: "cal" }
    ]},
    { label: "العملاء والخدمات", items: [
      { id: "clients", text: "العملاء", href: "clients.html", icon: "users" },
      { id: "services", text: "الأقسام والخدمات", href: "services.html", icon: "layers", roles: ["ceo", "ops"] },
      { id: "documents", text: "المستندات والقوالب", href: "documents.html", icon: "file" },
      { id: "contracts", text: "العقود", href: "contracts.html", icon: "pen", roles: ["ceo", "ops"] }
    ]},
    { label: "الإدارة", items: [
      { id: "employees", text: "الموظفون", href: "employees.html", icon: "badge", roles: ["ceo", "ops"] },
      { id: "users", text: "المستخدمون والصلاحيات", href: "users.html", icon: "shield", roles: ["ceo"] },
      { id: "attendance", text: "سجل الدخول والخروج", href: "attendance.html", icon: "clock", roles: ["ceo", "ops"] },
      { id: "settings", text: "الإعدادات", href: "settings.html", icon: "gear" }
    ]}
  ];
  CW.NAV = NAV;

  function theme(next) {
    const root = document.documentElement;
    if (next) { root.dataset.theme = next; try { localStorage.setItem("cw-theme", next); } catch (e) {} document.dispatchEvent(new Event("cw:theme")); return; }
    try { const t = localStorage.getItem("cw-theme"); if (t) root.dataset.theme = t; } catch (e) {}
  }
  theme();

  async function build() {
    const body = document.body;
    if (body.dataset.layout === "bare") { run(); return; }
    const main = document.querySelector("main.content");
    const user = CW.auth.user();
    const tasks = await CW.api.tasks.list();
    const overdue = tasks.filter(t => CW.calc.taskState(t) === "overdue").length;
    const active = body.dataset.nav || body.dataset.page;
    const [sec, page] = (body.dataset.crumb || "|").split("|");

    const nav = NAV.map(g => {
      const items = g.items.filter(i => !i.roles || i.roles.includes(user.role));
      if (!items.length) return "";
      return `<div class="nav-group"><div class="nav-label">${g.label}</div>${items.map(i =>
        `<a class="nav-link${i.id === active ? " active" : ""}" href="${i.href}"${i.id === active ? ' aria-current="page"' : ""}>${icon(i.icon)}<span>${i.text}</span>${i.count === "overdue" && overdue ? `<span class="count">${overdue}</span>` : ""}</a>`).join("")}</div>`;
    }).join("");

    const app = document.createElement("div");
    app.className = "app";
    app.innerHTML = `
      <aside class="sidebar" id="sidebar" aria-label="القائمة الرئيسية">
        <a class="brand" href="index.html" aria-label="Connect Webia — فهرس الشاشات"><img src="assets/brand/logo-slogan-light.svg" alt="Connect Webia — Connect to Succeed" width="200" height="40"><span class="brand-sub">نظام إدارة التشغيل</span></a>
        <nav>${nav}</nav>
        <div class="sidebar-foot">${CW.ui.avatar(user)}<div class="who"><b>${CW.ui.esc(user.name)}</b><span>${CW.ui.esc(user.title)}</span></div>
          <button class="icon-btn" style="margin-inline-start:auto;background:transparent;border-color:#ffffff22;color:inherit" id="logoutBtn" title="تسجيل الخروج" aria-label="تسجيل الخروج">${icon("logout")}</button></div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="icon-btn menu-btn" id="menuBtn" aria-label="فتح القائمة">${icon("menu")}</button>
          <div class="crumbs">${sec ? `<span>${sec}</span><span aria-hidden="true">/</span>` : ""}<b>${page || document.title}</b></div>
          <div class="spacer"></div>
          <label class="search">${icon("search")}<input id="globalSearch" type="search" placeholder="ابحث عن مشروع، عميل، مهمة…" aria-label="بحث"></label>
          <button class="icon-btn" id="themeBtn" aria-label="تبديل الوضع الداكن">${icon("moon")}</button>
          <a class="icon-btn" href="tasks.html?filter=overdue" aria-label="التنبيهات">${icon("bell")}${overdue ? '<span class="dot"></span>' : ""}</a>
        </header>
      </div>`;
    main.parentNode.insertBefore(app, main);
    app.querySelector(".main").appendChild(main);

    const sb = app.querySelector("#sidebar");
    app.querySelector("#menuBtn").addEventListener("click", () => {
      sb.classList.add("open");
      const s = document.createElement("div"); s.className = "scrim"; s.onclick = () => { sb.classList.remove("open"); s.remove(); };
      document.body.appendChild(s);
    });
    app.querySelector("#themeBtn").addEventListener("click", () => {
      const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      theme(cur === "dark" ? "light" : "dark");
    });
    app.querySelector("#logoutBtn").addEventListener("click", () => CW.auth.logout());
    app.querySelector("#globalSearch").addEventListener("keydown", e => {
      if (e.key === "Enter" && e.target.value.trim()) location.href = "projects.html?q=" + encodeURIComponent(e.target.value.trim());
    });
    run();
  }

  function run() {
    const fn = CW.pages && CW.pages[document.body.dataset.page];
    if (fn) fn().catch(err => { console.error(err); CW.ui.toast("تعذّر تحميل البيانات: " + err.message); });
  }

  CW.pages = CW.pages || {};
  document.addEventListener("DOMContentLoaded", build);
})();
