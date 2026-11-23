/* العملاء والخدمات والإدارة: 15 → 27 · 30 */
(function () {
  const { $, $$, esc, badge, who, progress, date, money, index, qs } = CW.ui;
  const DOC_TYPES = { template: ["قالب", "accent"], brief: ["موجز", "info"], deliverable: ["تسليم", "good"], minutes: ["محضر", "muted"], report: ["تقرير", "info"] };

  async function refs() {
    const [employees, clients, projects, departments, services, contracts] = await Promise.all([
      CW.api.employees.list(), CW.api.clients.list(), CW.api.projects.list(), CW.api.departments.list(), CW.api.services.list(), CW.api.contracts.list()]);
    return { employees, clients, projects, departments, services, contracts, E: index(employees), Cl: index(clients), D: index(departments), S: index(services) };
  }

  /* ---------- 15 · Clients ---------- */
  CW.pages["clients"] = async function () {
    const r = await refs();
    const rows = r.clients.map(c => Object.assign(c, {
      nProjects: r.projects.filter(p => p.client === c.id && p.status !== "done").length,
      value: CW.calc.sum(r.contracts.filter(k => k.client === c.id && k.status !== "draft"), "value")
    }));
    CW.ui.filterable({
      input: $("#q"), chips: $$(".chip-filter"), rows, chipKey: c => c.status, match: c => c.name + c.sector + c.contact,
      render: list => CW.ui.table($("#list"), list, [
        { label: "العميل", render: c => `<div class="who-cell">${CW.ui.avatar({ id: c.id, name: c.name })}<div><div class="cell-main">${esc(c.name)}</div><div class="cell-sub">${esc(c.sector)} · ${esc(c.city)}</div></div></div>` },
        { label: "جهة الاتصال", render: c => esc(c.contact) },
        { label: "مشاريع جارية", render: c => c.nProjects, cls: "num" },
        { label: "قيمة العقود", render: c => money(c.value), cls: "num" },
        { label: "عميل منذ", render: c => date(c.since, { month: "short", year: "numeric" }), cls: "num" },
        { label: "الحالة", render: c => badge("client", c.status) }
      ], { href: c => "client.html?id=" + c.id })
    });
  };

  /* ---------- 16 · Client profile ---------- */
  CW.pages["client"] = async function () {
    const r = await refs();
    const c = r.Cl[qs("id") || "c1"];
    if (!c) { $("main").innerHTML = '<div class="empty">العميل غير موجود.</div>'; return; }
    const projects = r.projects.filter(p => p.client === c.id);
    const contracts = r.contracts.filter(k => k.client === c.id);
    $("#cName").textContent = c.name; $("#cAvatar").outerHTML = CW.ui.avatar({ id: c.id, name: c.name }, "lg");
    $("#cSub").textContent = c.sector + " · " + c.city; $("#cStatus").innerHTML = badge("client", c.status);
    $("#cMeta").innerHTML = [["جهة الاتصال", esc(c.contact)], ["عميل منذ", date(c.since)], ["المشاريع", projects.length], ["إجمالي العقود", money(CW.calc.sum(contracts.filter(k => k.status !== "draft"), "value"))]]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    CW.ui.table($("#cProjects"), projects, [
      { label: "المشروع", render: p => `<div class="cell-main">${esc(p.name)}</div>` },
      { label: "التسليم", render: p => date(p.due), cls: "num" },
      { label: "التقدّم", render: p => progress(p.progress) },
      { label: "الحالة", render: p => badge("project", p.status) }
    ], { href: p => "project.html?id=" + p.id });
    CW.ui.table($("#cContracts"), contracts, [
      { label: "العقد", render: k => `<div class="cell-main">${esc(k.title)}</div>` },
      { label: "القيمة", render: k => money(k.value), cls: "num" },
      { label: "ينتهي", render: k => date(k.end), cls: "num" },
      { label: "الحالة", render: k => badge("contract", k.status) }
    ], { href: k => "contract-form.html?id=" + k.id });
    CW.ui.tabs($("#cTabs"));
  };

  /* ---------- 17 · Departments & services ---------- */
  CW.pages["services"] = async function () {
    const r = await refs();
    $("#depts").innerHTML = r.departments.map(d => {
      const sv = r.services.filter(s => s.dept === d.id);
      const team = r.employees.filter(e => e.dept === d.id);
      return `<div class="card"><div class="card-head"><div><h3>${esc(d.name)}</h3><div class="sub">${sv.length} خدمات · ${team.length} موظفين</div></div><div class="avatars">${team.map(e => CW.ui.avatar(e)).join("")}</div></div>
        <div class="card-body stack">${sv.map(s => `<div class="row between"><div><div class="cell-main">${esc(s.name)}</div><div class="cell-sub">${s.steps} مراحل · ${s.unit}</div></div><div class="row"><span class="num cell-main">${money(s.price)}</span>${s.active ? "" : '<span class="badge muted">موقوفة</span>'}<a class="btn btn-sm btn-ghost" href="service-flow.html?id=${s.id}">المسار</a></div></div>`).join("")}</div></div>`;
    }).join("");
  };

  /* ---------- 18 · Service flow setup ---------- */
  CW.pages["service-flow"] = async function () {
    const r = await refs();
    const s = r.S[qs("id") || "s4"];
    const ov = await CW.api.overview();
    const steps = ov.flow.slice();
    $("#sName").textContent = s.name; $("#sDept").textContent = (r.D[s.dept] || {}).name;
    const draw = () => {
      $("#flow").innerHTML = steps.map((st, i) => `<div class="flow-step"><span class="n">${i + 1}</span>
        <div><input class="input" value="${esc(st.name)}" aria-label="اسم المرحلة ${i + 1}" data-i="${i}" data-k="name"><div class="row wrap" style="margin-top:8px">
        <select class="select" style="max-width:220px;height:36px" data-i="${i}" data-k="owner" aria-label="المسؤول">${CW.ui.options(r.employees, st.owner)}</select>
        <label class="row hint">المدة <input class="input num" type="number" min="1" style="width:80px;height:36px" value="${st.days}" data-i="${i}" data-k="days"> يوم</label></div></div>
        <button class="btn btn-sm btn-ghost" data-del="${i}" aria-label="حذف المرحلة">حذف</button></div>`).join("");
      $("#totalDays").textContent = CW.calc.sum(steps, "days") + " يوم عمل";
      $$("[data-k]").forEach(f => f.addEventListener("change", () => { steps[f.dataset.i][f.dataset.k] = f.dataset.k === "days" ? Number(f.value) : f.value; draw(); }));
      $$("[data-del]").forEach(b => b.addEventListener("click", () => { steps.splice(Number(b.dataset.del), 1); draw(); }));
    };
    $("#addStep").addEventListener("click", () => { steps.push({ name: "مرحلة جديدة", owner: "e2", days: 1 }); draw(); });
    $("#saveFlow").addEventListener("click", () => CW.ui.toast("تم حفظ مسار الخدمة"));
    draw();
  };

  /* ---------- 19 · Documents ---------- */
  CW.pages["documents"] = async function () {
    const r = await refs();
    const docs = await CW.api.documents.list();
    CW.ui.filterable({
      input: $("#q"), chips: $$(".chip-filter"), rows: docs, chipKey: d => d.type, match: d => d.name,
      render: list => CW.ui.table($("#list"), list, [
        { label: "المستند", render: d => `<div class="row">${CW.icon("file").replace("<svg", '<svg width="20" height="20" style="color:var(--ink-3)"')}<span class="cell-main">${esc(d.name)}</span></div>` },
        { label: "النوع", render: d => `<span class="badge ${DOC_TYPES[d.type][1]}">${DOC_TYPES[d.type][0]}</span>` },
        { label: "المالك", render: d => who(r.E[d.owner]) },
        { label: "آخر تعديل", render: d => date(d.updated), cls: "num" },
        { label: "الحجم", render: d => d.size, cls: "num" }
      ], { href: d => "document-edit.html?id=" + d.id })
    });
  };

  /* ---------- 20 · Document editor ---------- */
  CW.pages["document-edit"] = async function () {
    const doc = await CW.api.documents.get(qs("id") || "f1");
    if (doc) { $("#docName").value = doc.name; }
    const ed = $("#editor");
    try { const draft = localStorage.getItem("cw-doc-" + (doc && doc.id)); if (draft) ed.innerHTML = draft; } catch (e) {}
    $$(".editor-bar button").forEach(b => b.addEventListener("click", () => { document.execCommand(b.dataset.cmd, false, b.dataset.val || null); ed.focus(); }));
    $$("[data-var]").forEach(b => b.addEventListener("click", () => { ed.focus(); document.execCommand("insertText", false, "{{" + b.dataset.var + "}}"); }));
    $("#saveDoc").addEventListener("click", async () => {
      try { localStorage.setItem("cw-doc-" + (doc && doc.id), ed.innerHTML); } catch (e) {}
      if (doc) await CW.api.documents.update(doc.id, { name: $("#docName").value, updated: CW.config.today });
      CW.ui.toast("تم حفظ المستند");
    });
  };

  /* ---------- 22 · Users & permissions ---------- */
  CW.pages["users"] = async function () {
    const r = await refs();
    const log = await CW.api.loginLog.list();
    CW.ui.table($("#list"), r.employees, [
      { label: "المستخدم", render: e => who(e, e.email) },
      { label: "الدور", render: e => badge("role", e.role) },
      { label: "القسم", render: e => esc((r.D[e.dept] || {}).name || "كل الأقسام") },
      { label: "آخر دخول", render: e => { const l = log.filter(x => x.user === e.id && x.ok).sort((a, b) => b.at.localeCompare(a.at))[0]; return l ? `<span class="num">${l.at.slice(11)}</span> <span class="cell-sub">${esc(l.device)}</span>` : '<span class="muted">—</span>'; } },
      { label: "الحالة", render: e => badge("employee", e.status) }
    ], { href: e => "user.html?id=" + e.id });
    const perms = [["عرض لوحة الرئيس التنفيذي", 1, 0, 0], ["إنشاء وتعديل المشاريع", 1, 1, 0], ["تعديل حالة المهام", 1, 1, 1], ["عرض العقود والقيم المالية", 1, 1, 0], ["إدارة المستخدمين", 1, 0, 0], ["سجل الدخول والخروج", 1, 1, 0]];
    $("#perms").innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>الصلاحية</th><th>الرئيس التنفيذي</th><th>مدير التشغيل</th><th>موظف</th></tr></thead><tbody>${perms.map((p, i) => `<tr><td class="cell-main">${p[0]}</td>${[1, 2, 3].map(j => `<td><label class="switch"><input type="checkbox" id="perm-${i}-${j}" ${p[j] ? "checked" : ""} ${j === 1 ? "disabled" : ""} aria-label="${p[0]}"><span></span></label></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  };

  /* ---------- 23 / 30-detail · Employee account ---------- */
  CW.pages["user"] = async function () {
    const r = await refs();
    const e = r.E[qs("id") || "e3"];
    if (!e) { $("main").innerHTML = '<div class="empty">الحساب غير موجود.</div>'; return; }
    const form = $("#userForm");
    ["name", "title", "email", "phone"].forEach(k => form[k].value = e[k] || "");
    form.role.value = e.role; form.status.value = e.status;
    $("#deptSel").dataset.value = e.dept || "";
    await CW.ui.fillSelects(form);
    $("#uHead").innerHTML = `${CW.ui.avatar(e, "lg")}<div><h1 style="font-size:var(--fs-xl)">${esc(e.name)}</h1><p class="muted">${esc(e.title)} · انضم ${date(e.joined)}</p></div>`;
    const tasks = (await CW.api.tasks.list()).filter(t => t.assignee === e.id);
    const done = tasks.filter(t => t.status === "done").length;
    $("#uStats").innerHTML = [["مهام هذا الأسبوع", tasks.filter(t => t.week === CW.config.currentWeek).length], ["منجزة", done], ["متأخرة", tasks.filter(t => CW.calc.taskState(t) === "overdue").length]]
      .map(([k, v]) => `<div class="stat-row"><span class="lbl">${k}</span><span class="val">${v}</span></div>`).join("");
    CW.ui.bindForm(form, { id: e.id });
  };

  /* ---------- 24 · Attendance ---------- */
  CW.pages["attendance"] = async function () {
    const r = await refs();
    const rows = (await CW.api.attendance.list()).sort((a, b) => (b.date + b.in).localeCompare(a.date + a.in));
    const mins = (a, b) => { const [h1, m1] = a.split(":").map(Number), [h2, m2] = b.split(":").map(Number); return h2 * 60 + m2 - (h1 * 60 + m1); };
    const todayRows = rows.filter(a => a.date === CW.config.today);
    $("#present").textContent = todayRows.length;
    $("#remote").textContent = todayRows.filter(a => a.mode === "remote").length;
    $("#late").textContent = todayRows.filter(a => a.in > "09:15").length;
    CW.ui.table($("#list"), rows, [
      { label: "الموظف", render: a => who(r.E[a.emp], (r.E[a.emp] || {}).title) },
      { label: "التاريخ", render: a => date(a.date, { weekday: "short", day: "numeric", month: "short" }), cls: "num" },
      { label: "دخول", render: a => `<span class="${a.in > "09:15" ? "prio high" : ""}">${a.in}</span>`, cls: "num" },
      { label: "خروج", render: a => a.out || '<span class="badge info">داخل الآن</span>', cls: "num" },
      { label: "المدة", render: a => a.out ? (m => Math.floor(m / 60) + "س " + (m % 60) + "د")(mins(a.in, a.out)) : "—", cls: "num" },
      { label: "المكان", render: a => `<span class="badge ${a.mode === "remote" ? "info" : "good"}">${a.mode === "remote" ? "عن بُعد" : "المكتب"}</span>` }
    ]);
    $("#checkBtn").addEventListener("click", async () => {
      const me = CW.auth.user(); const now = new Date().toTimeString().slice(0, 5);
      await CW.api.attendance.create({ emp: me.id, date: CW.config.today, in: now, out: null, mode: "office" });
      CW.ui.toast("سُجّل دخولك الساعة " + now); setTimeout(() => location.reload(), 700);
    });
  };

  /* ---------- 25 · Contracts ---------- */
  CW.pages["contracts"] = async function () {
    const r = await refs();
    const live = r.contracts.filter(k => k.status !== "draft");
    $("#kTotal").textContent = money(CW.calc.sum(live, "value"));
    $("#kRenew").textContent = r.contracts.filter(k => k.status === "renewal" || k.status === "ending").length;
    $("#kCount").textContent = live.length;
    CW.ui.filterable({
      input: $("#q"), chips: $$(".chip-filter"), rows: r.contracts, chipKey: k => k.status, match: k => k.title + (r.Cl[k.client] || {}).name,
      render: list => CW.ui.table($("#list"), list, [
        { label: "العقد", render: k => `<div class="cell-main">${esc(k.title)}</div><div class="cell-sub">${esc((r.S[k.service] || {}).name || "")}</div>` },
        { label: "العميل", render: k => esc((r.Cl[k.client] || {}).name) },
        { label: "القيمة", render: k => money(k.value), cls: "num" },
        { label: "المدة", render: k => date(k.start, { month: "short", year: "2-digit" }) + " ← " + date(k.end, { month: "short", year: "2-digit" }), cls: "num" },
        { label: "الحالة", render: k => badge("contract", k.status) }
      ], { href: k => "contract-form.html?id=" + k.id })
    });
  };

  /* ---------- 26 · Contract add / edit ---------- */
  CW.pages["contract-form"] = async function () {
    const form = $("#contractForm");
    const id = qs("id");
    const k = id ? await CW.api.contracts.get(id) : null;
    if (k) {
      $("#formTitle").textContent = "تعديل عقد"; $("#crumbLast") && ($("#crumbLast").textContent = "تعديل");
      ["title", "value", "start", "end", "status"].forEach(f => form[f].value = k[f]);
      form.client.dataset.value = k.client; form.service.dataset.value = k.service;
    }
    await CW.ui.fillSelects(form);
    const calc = () => {
      const v = Number(form.value.value) || 0, s = new Date(form.start.value), e = new Date(form.end.value);
      const months = s && e && e > s ? Math.max(1, Math.round((e - s) / (30.44 * 864e5))) : 0;
      $("#monthly").textContent = months ? money(Math.round(v / months)) + " / شهر · " + months + " أشهر" : "—";
    };
    ["value", "start", "end"].forEach(f => form[f].addEventListener("input", calc)); calc();
    CW.ui.bindForm(form, { id: k && k.id, transform: d => d.value = Number(d.value) || 0 });
  };

  /* ---------- 27 · Settings ---------- */
  CW.pages["settings"] = async function () {
    const me = CW.auth.user();
    const form = $("#profileForm");
    form.name.value = me.name; form.email.value = me.email; form.title.value = me.title;
    $("#meHead").innerHTML = `${CW.ui.avatar(me, "lg")}<div><b>${esc(me.name)}</b><div class="muted">${esc(me.title)}</div></div>`;
    form.addEventListener("submit", e => { e.preventDefault(); CW.ui.toast("تم حفظ بياناتك"); });
    $$("[name=theme]").forEach(r => {
      r.checked = (document.documentElement.dataset.theme || "system") === r.value;
      r.addEventListener("change", () => {
        if (r.value === "system") { delete document.documentElement.dataset.theme; try { localStorage.removeItem("cw-theme"); } catch (e) {} }
        else { document.documentElement.dataset.theme = r.value; try { localStorage.setItem("cw-theme", r.value); } catch (e) {} }
        document.dispatchEvent(new Event("cw:theme"));
      });
    });
    $("#resetDemo").addEventListener("click", () => { CW.api.resetDemo(); CW.ui.toast("أُعيدت البيانات التجريبية"); });
    $("#pwForm").addEventListener("submit", e => {
      e.preventDefault(); const f = e.target;
      if (f.newpw.value.length < 8) { $("#pwErr").hidden = false; f.newpw.classList.add("invalid"); return; }
      $("#pwErr").hidden = true; f.reset(); CW.ui.toast("تم تغيير كلمة المرور");
    });
  };

  /* ---------- 30 · Employees ---------- */
  CW.pages["employees"] = async function () {
    const r = await refs();
    const tasks = await CW.api.tasks.list();
    $("#chips").innerHTML = '<button class="chip-filter" data-filter="all" aria-pressed="true">الكل</button>' + r.departments.map(d => `<button class="chip-filter" data-filter="${d.id}" aria-pressed="false">${esc(d.name)}</button>`).join("");
    CW.ui.filterable({
      input: $("#q"), chips: $$("#chips .chip-filter"), rows: r.employees, chipKey: e => e.dept || "none", match: e => e.name + e.title,
      render: list => CW.ui.table($("#list"), list, [
        { label: "الموظف", render: e => who(e, e.title) },
        { label: "القسم", render: e => esc((r.D[e.dept] || {}).name || "الإدارة") },
        { label: "مهام مفتوحة", render: e => tasks.filter(t => t.assignee === e.id && t.status !== "done").length, cls: "num" },
        { label: "الهاتف", render: e => `<span dir="ltr" class="num">${esc(e.phone)}</span>` },
        { label: "تاريخ الانضمام", render: e => date(e.joined), cls: "num" },
        { label: "الحالة", render: e => badge("employee", e.status) }
      ], { href: e => "user.html?id=" + e.id })
    });
  };
})();
