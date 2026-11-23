/* =========================================================
   طبقة البيانات — CW.api
   - وضع تجريبي (افتراضي): يقرأ من CW.seed ويحفظ التعديلات في المتصفح.
   - وضع الإنتاج: عيّن CW.config.apiBase فتتحول كل الدوال إلى fetch REST:
       GET    {apiBase}/{resource}          → list
       GET    {apiBase}/{resource}/{id}     → get
       POST   {apiBase}/{resource}          → create
       PATCH  {apiBase}/{resource}/{id}     → update
       DELETE {apiBase}/{resource}/{id}     → remove
   ========================================================= */
(function () {
  const STORE_KEY = "cw-ops-store-v2"; // غيّر الرقم عند تعديل البيانات التجريبية
  let store;

  function load() {
    if (store) return store;
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      store = saved || structuredClone(CW.seed);
    } catch (e) { store = structuredClone(CW.seed); }
    return store;
  }
  function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* storage unavailable */ } }

  async function http(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    const token = CW.auth && CW.auth.token();
    if (token) headers.Authorization = "Bearer " + token;
    const res = await fetch(CW.config.apiBase + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error("API " + res.status + " " + path);
    return res.status === 204 ? null : res.json();
  }

  function resource(name) {
    const remote = () => !!CW.config.apiBase;
    return {
      list: async (filter) => {
        if (remote()) return http("GET", "/" + name + (filter ? "?" + new URLSearchParams(filter) : ""));
        let rows = load()[name] || [];
        if (filter) rows = rows.filter(r => Object.entries(filter).every(([k, v]) => r[k] === v));
        return structuredClone(rows);
      },
      get: async (id) => {
        if (remote()) return http("GET", "/" + name + "/" + id);
        return structuredClone((load()[name] || []).find(r => r.id === id) || null);
      },
      create: async (data) => {
        if (remote()) return http("POST", "/" + name, data);
        const rows = load()[name];
        const row = Object.assign({ id: name[0] + Date.now().toString(36) }, data);
        rows.unshift(row); persist(); return structuredClone(row);
      },
      update: async (id, patch) => {
        if (remote()) return http("PATCH", "/" + name + "/" + id, patch);
        const row = load()[name].find(r => r.id === id);
        if (row) { Object.assign(row, patch); persist(); }
        return structuredClone(row);
      },
      remove: async (id) => {
        if (remote()) return http("DELETE", "/" + name + "/" + id);
        const rows = load()[name]; const i = rows.findIndex(r => r.id === id);
        if (i > -1) { rows.splice(i, 1); persist(); }
        return null;
      }
    };
  }

  CW.api = {
    employees: resource("employees"),
    departments: resource("departments"),
    clients: resource("clients"),
    projects: resource("projects"),
    tasks: resource("tasks"),
    events: resource("events"),
    services: resource("services"),
    documents: resource("documents"),
    contracts: resource("contracts"),
    attendance: resource("attendance"),
    loginLog: resource("loginLog"),
    /* بيانات مجمّعة للوحات — في الإنتاج اجعلها endpoint واحد: GET /stats/overview */
    async overview() {
      if (CW.config.apiBase) return http("GET", "/stats/overview");
      const s = load();
      return { weekly: s.weekly, flow: s.flow, flows: s.flows || {} };
    },
    resetDemo() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} store = null; }
  };

  /* ---------- Auth (تجريبي) ---------- */
  const AUTH_KEY = "cw-ops-session";
  CW.auth = {
    users: { "ceo@connectwebia.com": "e1", "ops@connectwebia.com": "e2", "sara@connectwebia.com": "e3" },
    async login(email, password) {
      if (CW.config.apiBase) {
        const r = await http("POST", "/auth/login", { email, password });
        CW.auth.save(r); return r;
      }
      const id = CW.auth.users[email.trim().toLowerCase()];
      if (!id || password.length < 6) throw new Error("invalid");
      const emp = load().employees.find(e => e.id === id);
      const session = { token: "demo-" + id, user: emp };
      CW.auth.save(session); return session;
    },
    save(s) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(s)); } catch (e) {} },
    session() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (e) { return null; } },
    token() { const s = CW.auth.session(); return s && s.token; },
    user() {
      const s = CW.auth.session();
      return (s && s.user) || load().employees[0]; // بدون تسجيل دخول في العرض التجريبي: الرئيس التنفيذي
    },
    logout() { try { localStorage.removeItem(AUTH_KEY); } catch (e) {} location.href = "login.html"; }
  };
})();
