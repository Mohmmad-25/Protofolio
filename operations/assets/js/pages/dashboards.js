/* لوحات التحكم: الرئيس التنفيذي (04) · مدير التشغيل (05) · مهامي (06) · الملخص الأسبوعي (21) · Operations EN (28) */
(function () {
  const { $, esc, badge, who, progress, date, money, index } = CW.ui;
  const C = CW.charts;
  const WEEK_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  async function loadAll() {
    const [tasks, projects, employees, contracts, services, departments, events, attendance, ov] = await Promise.all([
      CW.api.tasks.list(), CW.api.projects.list(), CW.api.employees.list(), CW.api.contracts.list(),
      CW.api.services.list(), CW.api.departments.list(), CW.api.events.list(), CW.api.attendance.list(), CW.api.overview()
    ]);
    return { tasks, projects, employees, contracts, services, departments, events, attendance, weekly: ov.weekly,
      E: index(employees), P: index(projects), S: index(services), D: index(departments) };
  }

  function kpi(el, { label, value, suffix, icon, foot, trend, spark, sparkColor, alert }) {
    el.className = "card kpi" + (alert ? " is-alert" : "");
    el.innerHTML = `<div class="kpi-top"><span>${label}</span><span class="kpi-ico">${CW.icon(icon)}</span></div>
      <div class="kpi-value">${value}${suffix ? `<small>${suffix}</small>` : ""}</div>
      <div class="kpi-foot"><span>${trend ? `<span class="trend ${trend.dir}" dir="ltr">${trend.text}</span> ` : ""}${foot || ""}</span>${spark ? '<div class="kpi-spark"></div>' : ""}</div>`;
    if (spark) C.spark(el.querySelector(".kpi-spark"), spark, sparkColor);
  }

  const weekRates = (w) => w.completed.map((c, i) => Math.round(c / w.planned[i] * 100));
  const delta = (arr) => arr[arr.length - 1] - arr[arr.length - 2];
  const trendOf = (d, unit, invert) => ({ dir: (invert ? d <= 0 : d >= 0) ? "up" : "down", text: (d > 0 ? "+" : "") + d + (unit || "") });

  /* ---------- 04 · CEO ---------- */
  CW.pages["dash-ceo"] = async function () {
    const d = await loadAll();
    const st = CW.calc.weekStats(d.tasks);
    const rates = weekRates(d.weekly);
    const activeP = d.projects.filter(p => p.status === "active" || p.status === "late");
    const lateP = d.projects.filter(p => p.status === "late");
    const liveContracts = d.contracts.filter(k => k.status !== "draft");

    $("#hello").textContent = "صباح الخير، " + CW.auth.user().name.split(" ")[0];
    $("#today").textContent = date(CW.config.today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · الأسبوع " + CW.config.currentWeek.slice(1);

    kpi($("#k1"), { label: "نسبة الإنجاز هذا الأسبوع", value: st.rate, suffix: "%", icon: "target", trend: trendOf(delta(rates), "%"), foot: "عن الأسبوع الماضي", spark: rates, sparkColor: "s1" });
    kpi($("#k2"), { label: "مهام منجزة", value: st.done, suffix: " / " + st.total, icon: "check", trend: trendOf(delta(d.weekly.completed)), foot: "مهمة", spark: d.weekly.completed, sparkColor: "s2" });
    kpi($("#k3"), { label: "مهام متأخرة", value: st.overdue, icon: "alert", foot: `<a href="tasks.html?filter=overdue" style="color:var(--bad);font-weight:600">عرض المتأخرة ←</a>`, alert: st.overdue > 0 });
    kpi($("#k4"), { label: "قيمة العقود السارية", value: CW.ui.num(CW.calc.sum(liveContracts, "value")), suffix: " د.أ", icon: "money", foot: `${liveContracts.length} عقود · ${activeP.length} مشاريع نشطة` });

    // Planned vs completed
    C.line("#chWeekly", d.weekly.labels, [
      { label: "المهام المخطط لها", data: d.weekly.planned, color: "s2", dashed: true },
      { label: "المهام المنجزة", data: d.weekly.completed, color: "s1", fill: true }
    ]);
    C.legend("#lgWeekly", [{ label: "المنجزة", color: "series-1" }, { label: "المخطط لها", color: "series-2" }]);
    C.tableToggle($("#cardWeekly"), d.weekly.labels, [{ label: "المخطط", data: d.weekly.planned }, { label: "المنجز", data: d.weekly.completed }]);

    // Gauge + status split
    C.gauge("#chGauge", st.rate, "s1");
    $("#gaugeVal").textContent = st.rate + "%";
    const split = [
      { label: "منجزة", v: st.done, c: "good" },
      { label: "بانتظار المراجعة", v: st.review, c: "warn" },
      { label: "متأخرة", v: st.overdue, c: "bad" }
    ];
    $("#statusList").innerHTML = split.map(s => `<div class="stat-row"><span class="swatch" style="background:var(--${s.c})"></span><span class="lbl">${s.label}</span><span class="val">${s.v}</span><span class="muted num" style="min-width:40px;text-align:end">${Math.round(s.v / st.total * 100)}%</span></div>`).join("");

    // Workload per employee (stacked)
    const load = CW.calc.byAssignee(d.tasks, d.employees, CW.config.currentWeek);
    const names = load.map(r => r.emp.name);
    const ser = [
      { label: "منجزة", data: load.map(r => r.done), color: "s2" },
      { label: "مفتوحة", data: load.map(r => r.open), color: "s3" },
      { label: "متأخرة", data: load.map(r => r.overdue), color: "s1" }
    ];
    C.bar("#chLoad", names, ser, { horizontal: true, stacked: true });
    C.legend("#lgLoad", [{ label: "منجزة", color: "series-2" }, { label: "مفتوحة", color: "series-3" }, { label: "متأخرة", color: "series-1" }]);
    C.tableToggle($("#cardLoad"), names, ser);

    // Contract value by department
    const byDept = d.departments.map(dep => CW.calc.sum(liveContracts.filter(k => d.S[k.service] && d.S[k.service].dept === dep.id), "value"));
    C.bar("#chRevenue", d.departments.map(x => x.name), [{ label: "قيمة العقود (د.أ)", data: byDept, color: "s1" }],
      { tick: (v) => (v / 1000) + "k", tooltip: (c) => " " + money(c.raw) });
    C.tableToggle($("#cardRevenue"), d.departments.map(x => x.name), [{ label: "د.أ", data: byDept }]);

    // Projects needing attention
    const watch = activeP.slice().sort((a, b) => (a.status === "late" ? -1 : 1) - (b.status === "late" ? -1 : 1) || a.due.localeCompare(b.due)).slice(0, 6);
    CW.ui.table($("#watchList"), watch, [
      { label: "المشروع", render: p => `<div class="cell-main">${esc(p.name)}</div>` },
      { label: "المسؤول", render: p => who(d.E[p.owner]) },
      { label: "التسليم", render: p => date(p.due), cls: "num" },
      { label: "التقدّم", render: p => progress(p.progress) },
      { label: "الحالة", render: p => badge("project", p.status) }
    ], { href: p => "project.html?id=" + p.id });
    $("#lateCount").textContent = lateP.length + " متأخر";
  };

  /* ---------- 05 · Ops manager ---------- */
  CW.pages["dash-ops"] = async function () {
    const d = await loadAll();
    const st = CW.calc.weekStats(d.tasks);
    const activeP = d.projects.filter(p => p.status === "active" || p.status === "late");
    const t0 = CW.calc.today(), t7 = new Date(t0); t7.setDate(t7.getDate() + 7);
    const upcoming = d.events.filter(e => { const x = new Date(e.date + "T12:00:00"); return x >= new Date(t0.toDateString()) && x <= t7; });
    const dueSoon = d.tasks.filter(t => t.status !== "done" && CW.calc.taskState(t) !== "overdue").sort((a, b) => a.due.localeCompare(b.due));

    kpi($("#k1"), { label: "مشاريع نشطة", value: activeP.length, icon: "folder", foot: `${activeP.filter(p => p.status === "late").length} منها متأخرة` });
    kpi($("#k2"), { label: "مهام متأخرة", value: st.overdue, icon: "alert", foot: "تحتاج إعادة جدولة", alert: st.overdue > 0 });
    kpi($("#k3"), { label: "بانتظار مراجعتك", value: st.review, icon: "check", foot: "مهمة في المراجعة" });
    kpi($("#k4"), { label: "مواعيد خلال 7 أيام", value: upcoming.length, icon: "cal", foot: "اجتماعات وتسليمات" });

    // Tasks by department & state (stacked)
    const deptOf = (t) => (d.P[t.project] || {}).dept;
    const states = [["done", "منجزة", "s2"], ["open", "مفتوحة", "s3"], ["overdue", "متأخرة", "s1"]];
    const ser = states.map(([k, label, color]) => ({ label, color, data: d.departments.map(dep => d.tasks.filter(t => deptOf(t) === dep.id && t.week === CW.config.currentWeek).filter(t => {
      const s = CW.calc.taskState(t); return k === "done" ? s === "done" : k === "overdue" ? s === "overdue" : s !== "done" && s !== "overdue";
    }).length) }));
    C.bar("#chDept", d.departments.map(x => x.name), ser, { stacked: true });
    C.legend("#lgDept", states.map(s => ({ label: s[1], color: "series-" + s[2].slice(1) })));
    C.tableToggle($("#cardDept"), d.departments.map(x => x.name), ser);

    // Review queue
    CW.ui.table($("#reviewList"), d.tasks.filter(t => CW.calc.taskState(t) === "review"), [
      { label: "المهمة", render: t => `<div class="cell-main">${esc(t.title)}</div><div class="cell-sub">${esc((d.P[t.project] || {}).name || "")}</div>` },
      { label: "المنفّذ", render: t => who(d.E[t.assignee]) },
      { label: "الموعد", render: t => date(t.due), cls: "num" }
    ], { href: t => "task.html?id=" + t.id, empty: "لا شيء بانتظار المراجعة." });

    // Overdue
    CW.ui.table($("#overdueList"), d.tasks.filter(t => CW.calc.taskState(t) === "overdue"), [
      { label: "المهمة", render: t => `<div class="cell-main">${esc(t.title)}</div>` },
      { label: "المنفّذ", render: t => who(d.E[t.assignee]) },
      { label: "كان مستحقاً", render: t => date(t.due), cls: "num" },
      { label: "", render: t => `<a class="btn btn-sm btn-secondary" href="task.html?id=${t.id}">إعادة جدولة</a>` }
    ]);

    // Upcoming
    $("#upcoming").innerHTML = upcoming.length ? `<ul class="timeline">${upcoming.map(e => `<li><div><div class="cell-main">${esc(e.title)}</div><div class="t-time">${date(e.date, { weekday: "long", day: "numeric", month: "short" })} · ${e.time}</div></div></li>`).join("")}</ul>` : '<div class="empty">لا مواعيد هذا الأسبوع.</div>';

    // Team today
    const todayStr = CW.config.today;
    const present = d.attendance.filter(a => a.date === todayStr);
    $("#teamToday").innerHTML = d.employees.filter(e => e.role !== "ceo").map(e => {
      const a = present.find(x => x.emp === e.id);
      const state = e.status === "leave" ? '<span class="badge warn">إجازة</span>' : a ? `<span class="badge ${a.mode === "remote" ? "info" : "good"}">${a.mode === "remote" ? "عن بُعد" : "في المكتب"} · ${a.in}</span>` : '<span class="badge muted">لم يسجّل</span>';
      return `<div class="row between">${who(e, e.title)}${state}</div>`;
    }).join("");
    $("#dueSoon").textContent = dueSoon.length;
  };

  /* ---------- 06 · My tasks ---------- */
  CW.pages["my-tasks"] = async function () {
    const d = await loadAll();
    let me = CW.auth.user();
    if (!d.tasks.some(t => t.assignee === me.id)) { me = d.E.e3; $("#demoNote").hidden = false; $("#demoName").textContent = me.name; }
    const mine = d.tasks.filter(t => t.assignee === me.id);
    const done = mine.filter(t => t.status === "done").length;
    const rate = mine.length ? Math.round(done / mine.length * 100) : 0;
    $("#hello").textContent = "مهام " + me.name;

    C.gauge("#chMine", rate, "s1"); $("#mineVal").textContent = rate + "%";
    $("#mineStats").innerHTML = [["منجزة", done, "good"], ["قيد العمل", mine.filter(t => ["progress", "review", "todo"].includes(CW.calc.taskState(t))).length, "info"], ["متأخرة", mine.filter(t => CW.calc.taskState(t) === "overdue").length, "bad"]]
      .map(([l, v, c]) => `<div class="stat-row"><span class="swatch" style="background:var(--${c})"></span><span class="lbl">${l}</span><span class="val">${v}</span></div>`).join("");

    const render = () => {
      const open = mine.filter(t => t.status !== "done").sort((a, b) => a.due.localeCompare(b.due));
      $("#openList").innerHTML = open.length ? open.map(t => `<li><input type="checkbox" id="c-${t.id}" aria-label="إنهاء ${esc(t.title)}"><span style="flex:1"><a href="task.html?id=${t.id}" class="cell-main">${esc(t.title)}</a><br><span class="cell-sub">${esc((d.P[t.project] || {}).name || "")} · ${date(t.due)}</span></span>${badge("task", CW.calc.taskState(t))}</li>`).join("") : '<li class="empty">لا توجد مهام مفتوحة.</li>';
      $("#doneList").innerHTML = mine.filter(t => t.status === "done").map(t => `<li class="done"><input type="checkbox" checked disabled><span>${esc(t.title)}</span></li>`).join("");
      CW.ui.$$("#openList input").forEach(cb => cb.addEventListener("change", async () => {
        const id = cb.id.slice(2); await CW.api.tasks.update(id, { status: "done" });
        mine.find(t => t.id === id).status = "done"; CW.ui.toast("تم إنهاء المهمة"); render();
      }));
    };
    render();
  };

  /* ---------- 21 · Weekly summary ---------- */
  CW.pages["weekly"] = async function () {
    const d = await loadAll();
    const week = CW.ui.qs("week") || CW.config.currentWeek;
    const st = CW.calc.weekStats(d.tasks, week);
    const wt = d.tasks.filter(t => t.week === week);
    $("#weekTitle").textContent = "الأسبوع " + week.slice(1);
    $("#sumDone").textContent = st.done; $("#sumTotal").textContent = st.total; $("#sumRate").textContent = st.rate + "%"; $("#sumLate").textContent = st.overdue;

    // Completed by day
    const byDay = WEEK_DAYS.map((_, i) => wt.filter(t => t.status === "done" && new Date(t.due + "T12:00:00").getDay() === i).length);
    C.bar("#chDays", WEEK_DAYS, [{ label: "مهام منجزة", data: byDay, color: "s1" }]);
    C.tableToggle($("#cardDays"), WEEK_DAYS, [{ label: "منجزة", data: byDay }]);

    // Completion rate by project
    const projIds = [...new Set(wt.map(t => t.project))];
    const pr = projIds.map(id => { const x = wt.filter(t => t.project === id); return { name: d.P[id].name, rate: Math.round(x.filter(t => t.status === "done").length / x.length * 100) }; }).sort((a, b) => b.rate - a.rate);
    C.bar("#chProj", pr.map(p => p.name), [{ label: "نسبة الإنجاز", data: pr.map(p => p.rate), color: "s2" }], { horizontal: true, tick: v => v + "%", tooltip: c => " " + c.raw + "%" });
    C.tableToggle($("#cardProj"), pr.map(p => p.name), [{ label: "%", data: pr.map(p => p.rate) }]);

    CW.ui.table($("#highlights"), wt.filter(t => t.status === "done").slice(0, 8), [
      { label: "ما أُنجز", render: t => `<div class="cell-main">${esc(t.title)}</div>` },
      { label: "المشروع", render: t => esc(d.P[t.project].name) },
      { label: "بواسطة", render: t => who(d.E[t.assignee]) }
    ]);
    CW.ui.table($("#risks"), wt.filter(t => CW.calc.taskState(t) === "overdue" || CW.calc.taskState(t) === "review"), [
      { label: "بند يحتاج متابعة", render: t => `<div class="cell-main">${esc(t.title)}</div>` },
      { label: "الحالة", render: t => badge("task", CW.calc.taskState(t)) },
      { label: "المسؤول", render: t => who(d.E[t.assignee]) }
    ]);
  };

  /* ---------- 28 · Operations dashboard (English) ---------- */
  CW.pages["dash-en"] = async function () {
    const d = await loadAll();
    const st = CW.calc.weekStats(d.tasks);
    const rates = weekRates(d.weekly);
    const set = (id, v) => { $(id).textContent = v; };
    set("#eTotal", st.total); set("#eDone", st.done); set("#eLate", st.overdue); set("#eRate", st.rate + "%");
    C.spark("#sp1", d.weekly.planned, "s2"); C.spark("#sp2", d.weekly.completed, "s1"); C.spark("#sp4", rates, "s1");
    C.line("#chWeeklyEn", d.weekly.labels, [
      { label: "Planned", data: d.weekly.planned, color: "s2", dashed: true },
      { label: "Completed", data: d.weekly.completed, color: "s1", fill: true }
    ]);
    C.tableToggle($("#cardWeeklyEn"), d.weekly.labels, [{ label: "Planned", data: d.weekly.planned }, { label: "Completed", data: d.weekly.completed }]);
    const load = CW.calc.byAssignee(d.tasks, d.employees, CW.config.currentWeek);
    const en = { e2: "Laith H.", e3: "Sara N.", e4: "Yazan M.", e5: "Rahaf A.", e6: "Dana K.", e7: "Omar S.", e8: "Heba I." };
    const ser = [
      { label: "Completed", data: load.map(r => r.done), color: "s2" },
      { label: "Open", data: load.map(r => r.open), color: "s3" },
      { label: "Overdue", data: load.map(r => r.overdue), color: "s1" }
    ];
    C.bar("#chLoadEn", load.map(r => en[r.emp.id] || r.emp.name), ser, { horizontal: true, stacked: true });
    C.tableToggle($("#cardLoadEn"), load.map(r => en[r.emp.id] || r.emp.name), ser);
  };
})();
