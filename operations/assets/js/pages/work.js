/* المشاريع والمهام: 07 · 08 · 09 · 10 · 11 · 12 · 13 · 14 · 29 */
(function () {
  const { $, $$, esc, badge, who, progress, date, money, index, prio, qs } = CW.ui;

  async function refs() {
    const [employees, clients, projects, departments] = await Promise.all([CW.api.employees.list(), CW.api.clients.list(), CW.api.projects.list(), CW.api.departments.list()]);
    return { E: index(employees), Cl: index(clients), P: index(projects), D: index(departments), employees, clients, projects, departments };
  }

  /* ---------- 07 · Projects list ---------- */
  CW.pages["projects"] = async function () {
    const r = await refs();
    const input = $("#q"); if (qs("q")) input.value = qs("q");
    const counts = { all: r.projects.length };
    r.projects.forEach(p => counts[p.status] = (counts[p.status] || 0) + 1);
    $$(".chip-filter").forEach(b => { const n = counts[b.dataset.filter] || 0; b.textContent += ` (${n})`; });
    CW.ui.filterable({
      input, chips: $$(".chip-filter"), rows: r.projects, chipKey: p => p.status,
      match: p => p.name + " " + (r.Cl[p.client] || {}).name,
      render: rows => {
        CW.ui.table($("#list"), rows, [
          { label: "المشروع", render: p => `<div class="cell-main">${esc(p.name)}</div><div class="cell-sub">${esc((r.D[p.dept] || {}).name || "")}</div>` },
          { label: "العميل", render: p => esc((r.Cl[p.client] || {}).name || "—") },
          { label: "المسؤول", render: p => who(r.E[p.owner]) },
          { label: "التسليم", render: p => date(p.due), cls: "num" },
          { label: "التقدّم", render: p => progress(Number(p.progress) || 0) },
          { label: "الحالة", render: p => badge("project", p.status) }
        ], { href: p => "project.html?id=" + p.id, empty: "لا توجد مشاريع تطابق البحث." });
        $("#count").textContent = rows.length + " مشروع";
      }
    });
    if (qs("q")) input.dispatchEvent(new Event("input"));
  };

  /* ---------- 08 · New project ---------- */
  CW.pages["project-new"] = async function () {
    const form = $("#projectForm");
    await CW.ui.fillSelects(form);
    CW.ui.bindForm(form, { defaults: { status: "active", progress: 0 }, transform: d => { d.budget = Number(d.budget) || 0; } });
  };

  /* ---------- 09 · Project detail ---------- */
  CW.pages["project"] = async function () {
    const r = await refs();
    const p = await CW.api.projects.get(qs("id") || "p1");
    if (!p) { $("main").innerHTML = '<div class="empty">المشروع غير موجود. <a href="projects.html" style="color:var(--accent)">العودة للمشاريع</a></div>'; return; }
    const tasks = (await CW.api.tasks.list()).filter(t => t.project === p.id);
    const done = tasks.filter(t => t.status === "done").length;
    $("#pName").textContent = p.name;
    $("#pSub").textContent = (r.Cl[p.client] || {}).name + " · " + (r.D[p.dept] || {}).name;
    $("#pStatus").innerHTML = badge("project", p.status);
    $("#meta").innerHTML = [
      ["العميل", esc((r.Cl[p.client] || {}).name)], ["القسم", esc((r.D[p.dept] || {}).name)],
      ["مدير المشروع", esc((r.E[p.owner] || {}).name)], ["الميزانية", money(p.budget || 0)],
      ["تاريخ البدء", date(p.start)], ["تاريخ التسليم", date(p.due)]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    CW.charts.gauge("#chProgress", Number(p.progress) || 0, "s1");
    $("#progVal").textContent = (p.progress || 0) + "%";
    $("#taskSummary").textContent = `${done} من ${tasks.length} مهام منجزة`;
    const team = [...new Set(tasks.map(t => t.assignee).concat(p.owner))].map(id => r.E[id]).filter(Boolean);
    $("#team").innerHTML = team.map(e => `<div class="row between">${who(e, e.title)}<span class="muted num">${tasks.filter(t => t.assignee === e.id).length} مهام</span></div>`).join("");
    CW.ui.table($("#pTasks"), tasks, [
      { label: "المهمة", render: t => `<div class="cell-main">${esc(t.title)}</div>` },
      { label: "المنفّذ", render: t => who(r.E[t.assignee]) },
      { label: "الأولوية", render: t => prio(t.priority) },
      { label: "الموعد", render: t => date(t.due), cls: "num" },
      { label: "الحالة", render: t => badge("task", CW.calc.taskState(t)) }
    ], { href: t => "task.html?id=" + t.id, empty: "لا مهام بعد لهذا المشروع." });
    $("#addTask").href = "task-new.html?project=" + p.id;
    CW.ui.tabs($("#pTabs"));
  };

  /* ---------- 10 · Tasks list ---------- */
  CW.pages["tasks"] = async function () {
    const r = await refs();
    const tasks = (await CW.api.tasks.list()).map(t => Object.assign(t, { state: CW.calc.taskState(t) }));
    const chips = $$(".chip-filter");
    const pre = qs("filter");
    if (pre) chips.forEach(c => c.setAttribute("aria-pressed", c.dataset.filter === pre));
    const counts = { all: tasks.length }; tasks.forEach(t => counts[t.state] = (counts[t.state] || 0) + 1);
    chips.forEach(b => b.textContent += ` (${counts[b.dataset.filter] || 0})`);
    CW.ui.filterable({
      input: $("#q"), chips, rows: tasks, chipKey: t => t.state,
      match: t => t.title + " " + (r.P[t.project] || {}).name + " " + (r.E[t.assignee] || {}).name,
      render: rows => CW.ui.table($("#list"), rows, [
        { label: "المهمة", render: t => `<div class="cell-main">${esc(t.title)}</div><div class="cell-sub">${esc((r.P[t.project] || {}).name || "")}</div>` },
        { label: "المنفّذ", render: t => who(r.E[t.assignee]) },
        { label: "الأولوية", render: t => prio(t.priority) },
        { label: "الموعد", render: t => date(t.due), cls: "num" },
        { label: "الحالة", render: t => badge("task", t.state) }
      ], { href: t => "task.html?id=" + t.id, empty: "لا مهام هنا." })
    });
    if (pre) chips.find(c => c.dataset.filter === pre)?.click();
  };

  /* ---------- 11 · Task detail ---------- */
  CW.pages["task"] = async function () {
    const r = await refs();
    const t = await CW.api.tasks.get(qs("id") || "t2");
    if (!t) { $("main").innerHTML = '<div class="empty">المهمة غير موجودة.</div>'; return; }
    const state = CW.calc.taskState(t);
    $("#tTitle").textContent = t.title;
    $("#tProject").innerHTML = `<a href="project.html?id=${t.project}" style="color:var(--accent-ink);font-weight:600">${esc((r.P[t.project] || {}).name || "")}</a>`;
    $("#tStatus").innerHTML = badge("task", state);
    $("#tMeta").innerHTML = [["المنفّذ", esc((r.E[t.assignee] || {}).name)], ["الأولوية", prio(t.priority)], ["تاريخ التسليم", date(t.due)], ["أسبوع العمل", t.week]]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    if (state === "overdue") $("#overdueAlert").hidden = false;
    const sel = $("#statusSel"); sel.value = t.status;
    $("#saveStatus").addEventListener("click", async () => {
      const due = $("#newDue").value;
      await CW.api.tasks.update(t.id, Object.assign({ status: sel.value }, due ? { due } : {}));
      CW.ui.toast("تم تحديث المهمة"); setTimeout(() => location.reload(), 600);
    });
    const form = $("#commentForm");
    form.addEventListener("submit", e => {
      e.preventDefault(); const v = form.comment.value.trim(); if (!v) return;
      const me = CW.auth.user();
      $("#comments").insertAdjacentHTML("afterbegin", `<li><div><div class="cell-main">${esc(me.name)}</div><div>${esc(v)}</div><div class="t-time">الآن</div></div></li>`);
      form.reset();
    });
  };

  /* ---------- 12 · Kanban board ---------- */
  CW.pages["board"] = async function () {
    const r = await refs();
    const tasks = await CW.api.tasks.list();
    const cols = [["todo", "جديدة"], ["progress", "قيد العمل"], ["review", "بانتظار المراجعة"], ["done", "منجزة"]];
    const draw = () => {
      $("#board").innerHTML = cols.map(([k, label]) => {
        const all = tasks.filter(t => t.status === k);
        const items = k === "done" ? all.slice(0, 6) : all; // المنجزة: آخر 6 فقط
        return `<section class="k-col" data-status="${k}" aria-label="${label}"><div class="k-head"><span>${label}</span><span class="n">${all.length}</span></div>
          ${items.map(t => { const s = CW.calc.taskState(t); return `<article class="k-card" draggable="true" data-id="${t.id}">
            <div class="row between">${prio(t.priority)}${s === "overdue" ? badge("task", "overdue") : ""}</div>
            <h4><a href="task.html?id=${t.id}">${esc(t.title)}</a></h4>
            <div class="row between"><span>${esc((r.P[t.project] || {}).name || "")}</span></div>
            <div class="row between"><span class="num">${date(t.due, { day: "numeric", month: "short" })}</span>${CW.ui.avatar(r.E[t.assignee])}</div></article>`; }).join("")}
          ${all.length > items.length ? `<a class="btn btn-sm btn-ghost" href="tasks.html?filter=done">عرض كل المنجزة (${all.length})</a>` : ""}</section>`;
      }).join("");
      $$(".k-card").forEach(c => c.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", c.dataset.id)));
      $$(".k-col").forEach(col => {
        col.addEventListener("dragover", e => { e.preventDefault(); col.classList.add("drag-over"); });
        col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
        col.addEventListener("drop", async e => {
          e.preventDefault(); col.classList.remove("drag-over");
          const id = e.dataTransfer.getData("text/plain"); const t = tasks.find(x => x.id === id);
          if (!t || t.status === col.dataset.status) return;
          t.status = col.dataset.status; await CW.api.tasks.update(id, { status: t.status });
          CW.ui.toast("نُقلت المهمة إلى: " + cols.find(c => c[0] === t.status)[1]); draw();
        });
      });
    };
    draw();
  };

  /* ---------- 13 · Calendar ---------- */
  CW.pages["calendar"] = async function () {
    const events = await CW.api.events.list();
    const tasks = await CW.api.tasks.list();
    const t0 = CW.calc.today();
    let y = t0.getFullYear(), m = t0.getMonth();
    const DOW = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const draw = () => {
      const first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
      $("#monthLabel").textContent = first.toLocaleDateString(CW.config.locale, { month: "long", year: "numeric" });
      let html = DOW.map(d => `<div class="cal-dow">${d}</div>`).join("");
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i); const k = iso(d);
        const ev = events.filter(e => e.date === k);
        const dl = tasks.filter(t => t.due === k && t.status !== "done").length;
        html += `<div class="cal-day${d.getMonth() !== m ? " out" : ""}${k === iso(t0) ? " today" : ""}"><span class="d">${d.getDate()}</span>
          ${ev.map(e => `<span class="ev ${e.type}" title="${esc(e.title)} · ${e.time}">${e.time} ${esc(e.title)}</span>`).join("")}
          ${dl ? `<span class="ev delivery">${dl} مهام مستحقة</span>` : ""}</div>`;
      }
      $("#cal").innerHTML = html;
      const list = events.filter(e => e.date >= iso(t0)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
      $("#agenda").innerHTML = `<ul class="timeline">${list.map(e => `<li><div><div class="row between"><span class="cell-main">${esc(e.title)}</span>${badge("event", e.type)}</div><div class="t-time">${date(e.date, { weekday: "long", day: "numeric", month: "short" })} · ${e.time}</div></div></li>`).join("")}</ul>`;
    };
    $("#prev").addEventListener("click", () => { m--; if (m < 0) { m = 11; y--; } draw(); });
    $("#next").addEventListener("click", () => { m++; if (m > 11) { m = 0; y++; } draw(); });
    $("#todayBtn").addEventListener("click", () => { y = t0.getFullYear(); m = t0.getMonth(); draw(); });
    draw();
  };

  /* ---------- 14 · New appointment ---------- */
  CW.pages["event-new"] = async function () {
    const form = $("#eventForm");
    await CW.ui.fillSelects(form);
    form.date.value = qs("date") || CW.config.today;
    CW.ui.bindForm(form);
  };

  /* ---------- 29 · New task ---------- */
  CW.pages["task-new"] = async function () {
    const form = $("#taskForm");
    await CW.ui.fillSelects(form);
    form.due.value = CW.config.today;
    CW.ui.bindForm(form, { defaults: { status: "todo", week: CW.config.currentWeek } });
  };
})();
