/* =========================================================
   الرسوم البيانية — CW.charts (يعتمد على Chart.js 4)
   الألوان تُقرأ من tokens.css فتتبدّل تلقائياً مع الوضع الداكن.
   كل رسم له "عرض كجدول" للوصولية: data-table-toggle
   ========================================================= */
(function () {
  const registry = [];
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const tok = () => ({
    s1: css("--series-1"), s2: css("--series-2"), s3: css("--series-3"),
    good: css("--good"), bad: css("--bad"), warn: css("--warn"),
    grid: css("--chart-grid"), ink: css("--ink"), ink2: css("--ink-2"), ink3: css("--ink-3"),
    surface: css("--surface"), track: css("--surface-sunken"), font: css("--font-num")
  });
  const colorOf = (t, key) => t[key] || key;

  const RTL = () => document.documentElement.dir !== "ltr";
  function base(t) {
    return {
      responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, layout: { padding: { left: 18, right: 18, top: 4 } },
      locale: CW.config.locale,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: RTL(), textDirection: RTL() ? "rtl" : "ltr", backgroundColor: t.ink, titleColor: t.surface, bodyColor: t.surface,
          padding: 10, cornerRadius: 8, boxPadding: 4, usePointStyle: true,
          titleFont: { family: t.font, weight: "600" }, bodyFont: { family: t.font }
        }
      },
      scales: {
        x: { reverse: RTL(), grid: { display: false }, border: { color: t.grid }, ticks: { color: t.ink3, font: { family: t.font, size: 11 } } },
        y: { position: RTL() ? "right" : "left", beginAtZero: true, grid: { color: t.grid }, border: { display: false }, ticks: { color: t.ink3, font: { family: t.font, size: 11 }, precision: 0 } }
      }
    };
  }

  function make(el, build) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el || !window.Chart) return null;
    const canvas = document.createElement("canvas");
    el.innerHTML = ""; el.appendChild(canvas);
    const entry = { el, canvas, build, chart: null };
    entry.chart = new Chart(canvas, build(tok()));
    registry.push(entry);
    return entry.chart;
  }

  document.addEventListener("cw:theme", () => {
    requestAnimationFrame(() => registry.forEach(e => { e.chart.destroy(); e.chart = new Chart(e.canvas, e.build(tok())); }));
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => document.dispatchEvent(new Event("cw:theme")));

  /* legend HTML (identity never by color alone: the label sits beside the swatch) */
  function legend(el, items) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el) return;
    el.innerHTML = items.map(i => `<span><i style="background:var(--${i.color})"></i>${CW.ui.esc(i.label)}</span>`).join("");
  }

  /* chart ⇄ table toggle */
  function tableToggle(card, labels, series) {
    const toggle = card.querySelector("[data-table-toggle]");
    if (!toggle) return;
    const box = card.querySelector(".chart-box"), tbl = document.createElement("div");
    tbl.className = "table-wrap"; tbl.hidden = true;
    tbl.innerHTML = `<table class="table"><thead><tr><th></th>${series.map(s => `<th>${CW.ui.esc(s.label)}</th>`).join("")}</tr></thead><tbody>${labels.map((l, i) => `<tr><td class="cell-main">${CW.ui.esc(l)}</td>${series.map(s => `<td class="num">${s.data[i]}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    box.after(tbl);
    toggle.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      toggle.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
      const asTable = b.dataset.view === "table"; box.hidden = asTable; tbl.hidden = !asTable;
    }));
  }

  CW.charts = {
    legend, tableToggle,

    /* خط زمني: series = [{label, data, color:'series-1', fill:true, dashed:false}] */
    line(el, labels, series) {
      return make(el, t => ({
        type: "line",
        data: { labels, datasets: series.map(s => ({
          label: s.label, data: s.data, borderColor: colorOf(t, s.color), borderWidth: 2, tension: .35,
          borderDash: s.dashed ? [5, 4] : [], pointRadius: (c) => c.dataIndex === labels.length - 1 ? 4 : 0,
          pointHoverRadius: 5, pointBackgroundColor: colorOf(t, s.color), pointBorderColor: t.surface, pointBorderWidth: 2,
          fill: s.fill ? "origin" : false,
          backgroundColor: (ctx) => {
            if (!s.fill) return "transparent";
            const { chart } = ctx; const a = chart.chartArea; if (!a) return "transparent";
            const g = chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
            g.addColorStop(0, colorOf(t, s.color) + "40"); g.addColorStop(1, colorOf(t, s.color) + "00"); return g;
          }
        })) },
        options: base(t)
      }));
    },

    /* أعمدة: horizontal / stacked اختيارية */
    bar(el, labels, series, opts) {
      opts = opts || {};
      return make(el, t => {
        const o = base(t);
        if (opts.horizontal) {
          o.indexAxis = "y";
          o.scales = {
            x: { beginAtZero: true, reverse: RTL(), stacked: !!opts.stacked, grid: { color: t.grid }, border: { display: false }, ticks: { color: t.ink3, font: { family: t.font, size: 11 }, precision: 0, callback: opts.tick } },
            y: { position: RTL() ? "right" : "left", stacked: !!opts.stacked, grid: { display: false }, border: { display: false }, ticks: { color: t.ink2, font: { family: t.font, size: 12 } } }
          };
        } else {
          o.scales.x.stacked = o.scales.y.stacked = !!opts.stacked;
          if (opts.tick) o.scales.y.ticks.callback = opts.tick;
        }
        if (opts.tooltip) o.plugins.tooltip.callbacks = { label: opts.tooltip };
        return {
          type: "bar",
          data: { labels, datasets: series.map(s => ({
            label: s.label, data: s.data, backgroundColor: colorOf(t, s.color),
            borderRadius: opts.stacked ? 0 : 4, borderSkipped: "start", borderColor: t.surface, borderWidth: opts.stacked ? { left: 2, right: 2, top: 2, bottom: 2 } : 0,
            maxBarThickness: opts.horizontal ? 18 : 28, categoryPercentage: .7, barPercentage: .85
          })) },
          options: o
        };
      });
    },

    /* دونات بنسبة واحدة أو أجزاء قليلة (≤ 3) */
    donut(el, labels, data, colors) {
      return make(el, t => ({
        type: "doughnut",
        data: { labels, datasets: [{ data, backgroundColor: colors.map(c => colorOf(t, c)), borderColor: t.surface, borderWidth: 3, hoverOffset: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "74%", plugins: { legend: { display: false }, tooltip: base(t).plugins.tooltip } }
      }));
    },

    /* مقياس نسبة (نسبة واحدة من 100) */
    gauge(el, pct, color) {
      return make(el, t => ({
        type: "doughnut",
        data: { labels: ["منجز", "متبقٍ"], datasets: [{ data: [pct, 100 - pct], backgroundColor: [colorOf(t, color || "s1"), t.track], borderWidth: 0, borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "78%", rotation: -90, circumference: 180, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
      }));
    },

    /* Sparkline صغير داخل بطاقة رقمية */
    spark(el, data, color) {
      return make(el, t => ({
        type: "line",
        data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: colorOf(t, color || "s1"), borderWidth: 2, tension: .4, fill: "origin",
          backgroundColor: colorOf(t, color || "s1") + "22", pointRadius: (c) => c.dataIndex === data.length - 1 ? 3 : 0, pointBackgroundColor: colorOf(t, color || "s1") }] },
        options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false, reverse: RTL() }, y: { display: false, beginAtZero: true } } }
      }));
    }
  };
})();
