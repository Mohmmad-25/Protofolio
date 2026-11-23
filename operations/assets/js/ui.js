/* =========================================================
   أدوات الواجهة المشتركة — CW.ui و CW.calc
   ========================================================= */
(function () {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const STATUS = {
    project: { active: ["قيد التنفيذ", "info"], late: ["متأخر", "bad"], done: ["مكتمل", "good"], paused: ["متوقف", "muted"] },
    task: { todo: ["جديدة", "muted"], progress: ["قيد العمل", "info"], review: ["بانتظار المراجعة", "warn"], done: ["منجزة", "good"], overdue: ["متأخرة", "bad"] },
    client: { active: ["نشط", "good"], paused: ["متوقف", "muted"] },
    employee: { active: ["على رأس العمل", "good"], leave: ["إجازة", "warn"] },
    contract: { active: ["سارٍ", "good"], renewal: ["بانتظار التجديد", "warn"], ending: ["ينتهي قريباً", "bad"], draft: ["مسودة", "muted"] },
    event: { meeting: ["اجتماع", "info"], delivery: ["تسليم", "accent"], internal: ["داخلي", "good"] },
    role: { ceo: ["الرئيس التنفيذي", "accent"], ops: ["مدير التشغيل", "info"], employee: ["موظف", "muted"] }
  };
  const PRIORITY = { high: "عالية", mid: "متوسطة", low: "منخفضة" };
  const AV_COLORS = ["#3B4A9E", "#E8602C", "#17998A", "#7A4FB5", "#B7791F", "#2D3157"];

  const today = () => new Date((CW.config.today || new Date().toISOString().slice(0, 10)) + "T12:00:00");

  CW.calc = {
    today,
    taskState(t) { return t.status !== "done" && new Date(t.due + "T23:59:59") < today() ? "overdue" : t.status; },
    weekStats(tasks, week) {
      const w = tasks.filter(t => t.week === (week || CW.config.currentWeek));
      const done = w.filter(t => t.status === "done").length;
      const overdue = w.filter(t => CW.calc.taskState(t) === "overdue").length;
      const review = w.filter(t => CW.calc.taskState(t) === "review").length;
      return { total: w.length, done, overdue, review, open: w.length - done, rate: w.length ? Math.round(done / w.length * 100) : 0 };
    },
    byAssignee(tasks, employees, week) {
      const w = tasks.filter(t => !week || t.week === week);
      return employees.filter(e => w.some(t => t.assignee === e.id)).map(e => {
        const mine = w.filter(t => t.assignee === e.id);
        const done = mine.filter(t => t.status === "done").length;
        const overdue = mine.filter(t => CW.calc.taskState(t) === "overdue").length;
        return { emp: e, total: mine.length, done, overdue, open: mine.length - done - overdue };
      }).sort((a, b) => b.total - a.total);
    },
    sum: (arr, k) => arr.reduce((s, r) => s + (Number(k ? r[k] : r) || 0), 0)
  };

  CW.ui = {
    esc,
    $: (s, el) => (el || document).querySelector(s),
    $$: (s, el) => Array.from((el || document).querySelectorAll(s)),
    STATUS, PRIORITY,
    badge(kind, key) {
      const s = (STATUS[kind] || {})[key] || [key, "muted"];
      return `<span class="badge ${s[1]}">${esc(s[0])}</span>`;
    },
    prio: (p) => `<span class="prio ${p}">${PRIORITY[p] || p}</span>`,
    initials: (name) => String(name || "?").replace(/^(د\.|م\.)\s*/, "").split(/\s+/).slice(0, 2).map(w => w[0]).join(" "),
    avatar(emp, cls) {
      if (!emp) return "";
      const i = parseInt(String(emp.id).replace(/\D/g, ""), 10) || 0;
      return `<span class="avatar ${cls || ""}" style="background:${AV_COLORS[i % AV_COLORS.length]}" title="${esc(emp.name)}">${esc(CW.ui.initials(emp.name))}</span>`;
    },
    who(emp, sub) {
      if (!emp) return `<span class="muted">—</span>`;
      return `<div class="who-cell">${CW.ui.avatar(emp)}<div><div class="cell-main">${esc(emp.name)}</div>${sub ? `<div class="cell-sub">${esc(sub)}</div>` : ""}</div></div>`;
    },
    progress(p) { return `<div class="progress-row"><div class="progress" style="flex:1"><span style="width:${Math.max(0, Math.min(100, p))}%"></span></div><span class="num">${p}%</span></div>`; },
    date(d, opts) {
      if (!d) return "—";
      return new Date(d + (d.length === 10 ? "T12:00:00" : "")).toLocaleDateString(CW.config.locale, opts || { day: "numeric", month: "short", year: "numeric" });
    },
    money: (v) => new Intl.NumberFormat(CW.config.locale, { maximumFractionDigits: 0 }).format(v) + " د.أ",
    num: (v) => new Intl.NumberFormat(CW.config.locale).format(v),
    qs: (k) => new URLSearchParams(location.search).get(k),
    index: (rows) => Object.fromEntries(rows.map(r => [r.id, r])),

    /* جدول عام: columns = [{label, render(row), cls}] */
    table(el, rows, columns, opts) {
      opts = opts || {};
      if (!rows.length) { el.innerHTML = `<div class="empty">${opts.empty || "لا توجد بيانات بعد."}</div>`; return; }
      el.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr>${columns.map(c => `<th>${c.label}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(r => `<tr${opts.href ? ` data-href="${esc(opts.href(r))}" tabindex="0"` : ""}>${columns.map(c => `<td class="${c.cls || ""}">${c.render(r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      if (opts.href) CW.ui.$$("tr[data-href]", el).forEach(tr => {
        const go = () => location.href = tr.dataset.href;
        tr.addEventListener("click", go);
        tr.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      });
    },

    /* فلترة + بحث على جدول */
    filterable({ input, chips, rows, render, match, chipKey }) {
      let active = "all", term = "";
      const run = () => render(rows.filter(r => (active === "all" || chipKey(r) === active) && (!term || match(r).toLowerCase().includes(term))));
      if (input) input.addEventListener("input", () => { term = input.value.trim().toLowerCase(); run(); });
      (chips || []).forEach(b => b.addEventListener("click", () => {
        chips.forEach(x => x.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true");
        active = b.dataset.filter; run();
      }));
      run();
    },

    formData(form) { return Object.fromEntries(new FormData(form).entries()); },
    validate(form) {
      let ok = true;
      CW.ui.$$("[required]", form).forEach(f => {
        const bad = !String(f.value).trim();
        f.classList.toggle("invalid", bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      return ok;
    },
    toast(msg) {
      const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
      document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
    },
    options(rows, selected, label) {
      return rows.map(r => `<option value="${esc(r.id)}"${r.id === selected ? " selected" : ""}>${esc(label ? label(r) : r.name)}</option>`).join("");
    },
    /* يملأ كل <select data-source="clients|employees|projects|departments|services"> من الـ API */
    async fillSelects(root) {
      const sels = CW.ui.$$("select[data-source]", root);
      await Promise.all(sels.map(async s => {
        const rows = await CW.api[s.dataset.source].list();
        const keep = s.innerHTML;
        s.innerHTML = keep + CW.ui.options(rows, s.dataset.value || CW.ui.qs(s.name), r => r.name || r.title);
      }));
    },
    /* نموذج إنشاء/تعديل عام: data-resource="projects" data-redirect="project.html?id=" */
    bindForm(form, opts) {
      opts = opts || {};
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!CW.ui.validate(form)) { CW.ui.toast("أكمل الحقول المطلوبة المعلّمة بالأحمر"); return; }
        const data = Object.assign(CW.ui.formData(form), opts.defaults || {});
        if (opts.transform) opts.transform(data);
        const res = CW.api[form.dataset.resource];
        const row = opts.id ? await res.update(opts.id, data) : await res.create(data);
        CW.ui.toast(opts.id ? "تم حفظ التعديلات" : "تمت الإضافة");
        if (form.dataset.redirect) setTimeout(() => location.href = form.dataset.redirect + (form.dataset.redirect.endsWith("=") ? row.id : ""), 700);
      });
    },
    tabs(root) {
      const tabs = CW.ui.$$("[role=tab]", root);
      tabs.forEach(t => t.addEventListener("click", () => {
        tabs.forEach(x => { x.setAttribute("aria-selected", x === t); const p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = x !== t; });
      }));
    }
  };
})();
