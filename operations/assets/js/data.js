/* =========================================================
   بيانات تجريبية (Sample data) — استبدلها بالـ API الحقيقي.
   كل الشاشات تقرأ من CW.api وليس من هذا الملف مباشرة،
   لذلك عند ربط الباك-إند لا تحتاج لتعديل الصفحات.
   ========================================================= */
window.CW = window.CW || {};

CW.config = Object.assign({
  apiBase: null,            // مثال: "https://api.connectwebia.com/v1" — عند تعبئته يتحول النظام للـ API
  today: "2026-11-23",      // تاريخ ثابت للعرض التجريبي (احذفه لاستخدام تاريخ اليوم الفعلي)
  currentWeek: "W48",
  currency: "JOD",
  locale: "ar-JO-u-nu-latn"
}, CW.config || {});

CW.seed = (function () {
  const departments = [
    { id: "d1", name: "التسويق الرقمي", lead: "e3", color: "series-1" },
    { id: "d2", name: "تطوير المواقع", lead: "e4", color: "series-2" },
    { id: "d3", name: "الهوية البصرية", lead: "e5", color: "series-3" },
    { id: "d4", name: "تمكين المبيعات", lead: "e2", color: "series-2" }
  ];

  const employees = [
    { id: "e1", name: "محمد الخطيب", role: "ceo", title: "الرئيس التنفيذي", dept: null, email: "ceo@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2024-01-10" },
    { id: "e2", name: "ليث حدّاد", role: "ops", title: "مدير التشغيل", dept: "d4", email: "ops@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2024-03-02" },
    { id: "e3", name: "سارة النجار", role: "employee", title: "مديرة حملات", dept: "d1", email: "sara@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2024-05-14" },
    { id: "e4", name: "يزن مصطفى", role: "employee", title: "مطوّر واجهات", dept: "d2", email: "yazan@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2024-06-01" },
    { id: "e5", name: "رهف العلي", role: "employee", title: "مصممة هوية", dept: "d3", email: "rahaf@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2024-08-20" },
    { id: "e6", name: "دانا خليل", role: "employee", title: "كاتبة محتوى", dept: "d1", email: "dana@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2025-01-12" },
    { id: "e7", name: "عمر الشريف", role: "employee", title: "مطوّر باك-إند", dept: "d2", email: "omar@connectwebia.com", phone: "+962 7X XXX XXXX", status: "leave", joined: "2025-02-03" },
    { id: "e8", name: "هبة عيسى", role: "employee", title: "مصممة سوشال ميديا", dept: "d3", email: "heba@connectwebia.com", phone: "+962 7X XXX XXXX", status: "active", joined: "2025-04-18" }
  ];

  const clients = [
    { id: "c1", name: "مطاعم سنابل", sector: "مطاعم", contact: "خالد منصور", city: "عمّان", since: "2024-04-01", status: "active" },
    { id: "c2", name: "عيادات بلسم", sector: "رعاية صحية", contact: "د. لينا سمارة", city: "عمّان", since: "2024-07-15", status: "active" },
    { id: "c3", name: "أكاديمية روّاد", sector: "تعليم", contact: "ماهر عوض", city: "إربد", since: "2025-01-20", status: "active" },
    { id: "c4", name: "Nova Fitness", sector: "رياضة", contact: "Rami Saleh", city: "عمّان", since: "2025-03-05", status: "active" },
    { id: "c5", name: "عقارات الريّان", sector: "عقارات", contact: "نور الدين", city: "الزرقاء", since: "2025-06-11", status: "paused" },
    { id: "c6", name: "متجر لمسة", sector: "تجارة إلكترونية", contact: "رنا حمدان", city: "عمّان", since: "2025-09-02", status: "active" }
  ];

  // [id, name, clientId, deptId, ownerId, start, due, status, progress, budget]
  const P = [
    ["p1", "إطلاق متجر لمسة الإلكتروني", "c6", "d2", "e4", "2026-10-01", "2026-12-15", "active", 68, 6500],
    ["p2", "حملة الشتاء — مطاعم سنابل", "c1", "d1", "e3", "2026-11-01", "2026-12-20", "active", 40, 3200],
    ["p3", "هوية بصرية — أكاديمية روّاد", "c3", "d3", "e5", "2026-10-10", "2026-11-28", "active", 82, 2800],
    ["p4", "موقع عيادات بلسم v2", "c2", "d2", "e7", "2026-09-15", "2026-11-20", "late", 71, 5400],
    ["p5", "إدارة سوشال — Nova Fitness", "c4", "d1", "e6", "2026-11-01", "2027-01-31", "active", 25, 1500],
    ["p6", "صفحات هبوط — عقارات الريّان", "c5", "d2", "e4", "2026-08-01", "2026-11-18", "late", 55, 2100],
    ["p7", "دليل الهوية — عيادات بلسم", "c2", "d3", "e8", "2026-11-05", "2026-12-05", "active", 35, 1900],
    ["p8", "تحسين محركات البحث — سنابل", "c1", "d1", "e3", "2026-10-20", "2027-01-20", "active", 30, 2400],
    ["p9", "عروض المبيعات — Nova Fitness", "c4", "d4", "e2", "2026-11-10", "2026-12-10", "active", 20, 1200],
    ["p10", "تصوير منتجات — متجر لمسة", "c6", "d3", "e8", "2026-09-01", "2026-10-15", "done", 100, 1600],
    ["p11", "موقع أكاديمية روّاد", "c3", "d2", "e7", "2026-06-01", "2026-09-30", "done", 100, 4800],
    ["p12", "حملة الافتتاح — Nova Fitness", "c4", "d1", "e6", "2026-04-01", "2026-05-30", "done", 100, 2000]
  ];
  const projects = P.map(r => ({ id: r[0], name: r[1], client: r[2], dept: r[3], owner: r[4], start: r[5], due: r[6], status: r[7], progress: r[8], budget: r[9] }));

  // [id, title, projectId, assigneeId, status, due, priority, week]
  // status: todo | progress | review | done   (المتأخرة تُحسب: غير منجزة وموعدها قبل اليوم)
  const T = [
    ["t1", "تصميم صفحة المنتج", "p1", "e4", "done", "2026-11-19", "high", "W48"],
    ["t2", "ربط بوابة الدفع", "p1", "e7", "progress", "2026-11-21", "high", "W48"],
    ["t3", "اختبار سلة الشراء", "p1", "e4", "done", "2026-11-22", "mid", "W48"],
    ["t4", "كتابة نصوص الحملة", "p2", "e6", "done", "2026-11-20", "mid", "W48"],
    ["t5", "تصميم 6 منشورات", "p2", "e8", "done", "2026-11-22", "mid", "W48"],
    ["t6", "إعداد الجمهور المستهدف", "p2", "e3", "done", "2026-11-18", "high", "W48"],
    ["t7", "اعتماد الشعار النهائي", "p3", "e5", "review", "2026-11-24", "high", "W48"],
    ["t8", "لوحة الألوان والخطوط", "p3", "e5", "done", "2026-11-19", "mid", "W48"],
    ["t9", "تسليم ملفات المصدر", "p3", "e5", "done", "2026-11-23", "low", "W48"],
    ["t10", "إصلاح نموذج الحجز", "p4", "e7", "progress", "2026-11-20", "high", "W48"],
    ["t11", "صفحة الأطباء", "p4", "e4", "done", "2026-11-17", "mid", "W48"],
    ["t12", "تقرير الأداء الشهري", "p5", "e6", "done", "2026-11-21", "mid", "W48"],
    ["t13", "جدولة محتوى الأسبوع", "p5", "e6", "done", "2026-11-19", "low", "W48"],
    ["t14", "تصميم ستوري العروض", "p5", "e8", "review", "2026-11-25", "mid", "W48"],
    ["t15", "صفحة هبوط المشروع الجديد", "p6", "e4", "progress", "2026-11-22", "high", "W48"],
    ["t16", "دليل استخدام الشعار", "p7", "e8", "done", "2026-11-20", "mid", "W48"],
    ["t17", "نماذج القرطاسية", "p7", "e5", "done", "2026-11-22", "low", "W48"],
    ["t18", "تحليل الكلمات المفتاحية", "p8", "e3", "done", "2026-11-18", "high", "W48"],
    ["t19", "تحسين سرعة الموقع", "p8", "e4", "done", "2026-11-21", "mid", "W48"],
    ["t20", "عرض تقديمي للمبيعات", "p9", "e2", "review", "2026-11-26", "mid", "W48"],
    ["t21", "قائمة العملاء المحتملين", "p9", "e2", "done", "2026-11-19", "low", "W48"],
    ["t22", "إعلانات ميتا — سنابل", "p2", "e3", "done", "2026-11-23", "high", "W48"],
    ["t23", "مراجعة نصوص الموقع", "p1", "e6", "done", "2026-11-20", "low", "W48"],
    ["t24", "صور الغلاف للحسابات", "p5", "e8", "done", "2026-11-18", "low", "W48"],
    ["t25", "اختبار الموقع على الجوال", "p4", "e4", "done", "2026-11-22", "mid", "W48"],
    ["t26", "عقد الصيانة السنوي", "p4", "e2", "review", "2026-11-27", "mid", "W48"],
    ["t27", "باقة الأيقونات", "p3", "e8", "done", "2026-11-21", "low", "W48"],
    ["t28", "خطة محتوى ديسمبر", "p5", "e6", "todo", "2026-12-01", "mid", "W49"],
    ["t29", "إطلاق المتجر تجريبياً", "p1", "e4", "todo", "2026-12-03", "high", "W49"],
    ["t30", "حملة إعادة الاستهداف", "p2", "e3", "progress", "2026-12-02", "mid", "W49"],
    ["t31", "تصميم بطاقات العمل", "p7", "e5", "todo", "2026-12-04", "low", "W49"],
    ["t32", "مقالات المدونة (3)", "p8", "e6", "progress", "2026-12-05", "mid", "W49"],
    ["t33", "تجهيز عرض العميل", "p9", "e2", "todo", "2026-12-06", "high", "W49"]
  ];
  const tasks = T.map(r => ({ id: r[0], title: r[1], project: r[2], assignee: r[3], status: r[4], due: r[5], priority: r[6], week: r[7] }));

  const events = [
    { id: "v1", title: "اجتماع انطلاق — سنابل", date: "2026-11-02", time: "10:00", type: "meeting", client: "c1" },
    { id: "v2", title: "تسليم تصاميم روّاد", date: "2026-11-05", time: "14:00", type: "delivery", client: "c3" },
    { id: "v3", title: "اجتماع الفريق الأسبوعي", date: "2026-11-08", time: "09:30", type: "internal" },
    { id: "v4", title: "مراجعة موقع بلسم", date: "2026-11-11", time: "12:00", type: "meeting", client: "c2" },
    { id: "v5", title: "اجتماع الفريق الأسبوعي", date: "2026-11-15", time: "09:30", type: "internal" },
    { id: "v6", title: "تسليم صفحات الريّان", date: "2026-11-18", time: "16:00", type: "delivery", client: "c5" },
    { id: "v7", title: "اجتماع الفريق الأسبوعي", date: "2026-11-22", time: "09:30", type: "internal" },
    { id: "v8", title: "عرض Nova Fitness", date: "2026-11-23", time: "11:00", type: "meeting", client: "c4" },
    { id: "v9", title: "اعتماد شعار روّاد", date: "2026-11-24", time: "13:00", type: "delivery", client: "c3" },
    { id: "v10", title: "مكالمة متابعة — لمسة", date: "2026-11-26", time: "15:00", type: "meeting", client: "c6" },
    { id: "v11", title: "اجتماع الفريق الأسبوعي", date: "2026-11-29", time: "09:30", type: "internal" },
    { id: "v12", title: "تسليم متجر لمسة (تجريبي)", date: "2026-12-03", time: "12:00", type: "delivery", client: "c6" }
  ];

  const services = [
    { id: "s1", name: "إدارة حسابات التواصل", dept: "d1", price: 450, unit: "شهري", steps: 5, active: true },
    { id: "s2", name: "حملات إعلانية مدفوعة", dept: "d1", price: 600, unit: "حملة", steps: 6, active: true },
    { id: "s3", name: "تحسين محركات البحث SEO", dept: "d1", price: 400, unit: "شهري", steps: 4, active: true },
    { id: "s4", name: "تصميم وتطوير موقع", dept: "d2", price: 2500, unit: "مشروع", steps: 7, active: true },
    { id: "s5", name: "متجر إلكتروني", dept: "d2", price: 4500, unit: "مشروع", steps: 8, active: true },
    { id: "s6", name: "هوية بصرية كاملة", dept: "d3", price: 1800, unit: "مشروع", steps: 6, active: true },
    { id: "s7", name: "تصميم محتوى سوشال", dept: "d3", price: 350, unit: "شهري", steps: 3, active: false },
    { id: "s8", name: "عروض وأدوات مبيعات", dept: "d4", price: 900, unit: "مشروع", steps: 4, active: true }
  ];

  const flow = [
    { name: "استلام الطلب وتوثيق المتطلبات", owner: "e2", days: 1 },
    { name: "عرض سعر وتوقيع العقد", owner: "e2", days: 2 },
    { name: "اجتماع انطلاق مع العميل", owner: "e3", days: 1 },
    { name: "التنفيذ والمراجعة الداخلية", owner: "e4", days: 14 },
    { name: "مراجعة العميل (جولتان)", owner: "e3", days: 5 },
    { name: "التسليم النهائي والأرشفة", owner: "e2", days: 1 }
  ];

  const documents = [
    { id: "f1", name: "عقد خدمات تسويق — قالب", type: "template", owner: "e2", updated: "2026-11-12", size: "48 KB" },
    { id: "f2", name: "عرض سعر موقع إلكتروني", type: "template", owner: "e2", updated: "2026-11-02", size: "36 KB" },
    { id: "f3", name: "موجز إبداعي — سنابل", type: "brief", owner: "e3", updated: "2026-11-18", size: "22 KB" },
    { id: "f4", name: "دليل الهوية — روّاد", type: "deliverable", owner: "e5", updated: "2026-11-21", size: "8.4 MB" },
    { id: "f5", name: "محضر اجتماع بلسم", type: "minutes", owner: "e2", updated: "2026-11-11", size: "14 KB" },
    { id: "f6", name: "تقرير أداء Nova — أكتوبر", type: "report", owner: "e6", updated: "2026-11-03", size: "1.2 MB" }
  ];

  const contracts = [
    { id: "k1", client: "c6", title: "متجر إلكتروني + صيانة سنة", service: "s5", value: 6500, start: "2026-10-01", end: "2027-09-30", status: "active" },
    { id: "k2", client: "c1", title: "إدارة سوشال + إعلانات", service: "s2", value: 7200, start: "2026-01-01", end: "2026-12-31", status: "renewal" },
    { id: "k3", client: "c3", title: "هوية بصرية كاملة", service: "s6", value: 2800, start: "2026-10-10", end: "2026-12-10", status: "active" },
    { id: "k4", client: "c2", title: "موقع + دليل هوية", service: "s4", value: 7300, start: "2026-09-15", end: "2027-03-15", status: "active" },
    { id: "k5", client: "c4", title: "إدارة سوشال شهرية", service: "s1", value: 5400, start: "2026-11-01", end: "2027-10-31", status: "active" },
    { id: "k6", client: "c5", title: "صفحات هبوط", service: "s4", value: 2100, start: "2026-08-01", end: "2026-11-30", status: "ending" },
    { id: "k7", client: "c1", title: "تحسين محركات البحث", service: "s3", value: 4800, start: "2026-10-20", end: "2027-10-19", status: "active" },
    { id: "k8", client: "c4", title: "عروض مبيعات", service: "s8", value: 1200, start: "2026-11-10", end: "2026-12-10", status: "draft" }
  ];

  const attendance = [
    { emp: "e2", date: "2026-11-23", in: "08:52", out: null, mode: "office" },
    { emp: "e3", date: "2026-11-23", in: "09:05", out: null, mode: "office" },
    { emp: "e4", date: "2026-11-23", in: "09:31", out: null, mode: "remote" },
    { emp: "e5", date: "2026-11-23", in: "08:58", out: null, mode: "office" },
    { emp: "e6", date: "2026-11-23", in: "10:12", out: null, mode: "remote" },
    { emp: "e8", date: "2026-11-23", in: "09:00", out: null, mode: "office" },
    { emp: "e2", date: "2026-11-22", in: "08:47", out: "17:10", mode: "office" },
    { emp: "e3", date: "2026-11-22", in: "09:02", out: "17:30", mode: "office" },
    { emp: "e4", date: "2026-11-22", in: "09:20", out: "18:05", mode: "remote" },
    { emp: "e5", date: "2026-11-22", in: "09:10", out: "16:55", mode: "office" }
  ];

  // تاريخ الأداء الأسبوعي (للرسوم البيانية)
  const weekly = {
    labels: ["W41", "W42", "W43", "W44", "W45", "W46", "W47", "W48"],
    planned:   [22, 24, 21, 26, 25, 28, 24, 27],
    completed: [17, 19, 18, 18, 21, 22, 19, 20]
  };

  const loginLog = [
    { user: "e1", at: "2026-11-23 08:40", ip: "94.249.x.x", device: "iPad · Safari", ok: true },
    { user: "e2", at: "2026-11-23 08:50", ip: "94.249.x.x", device: "macOS · Chrome", ok: true },
    { user: "e6", at: "2026-11-23 10:08", ip: "176.29.x.x", device: "Windows · Edge", ok: false },
    { user: "e6", at: "2026-11-23 10:10", ip: "176.29.x.x", device: "Windows · Edge", ok: true },
    { user: "e4", at: "2026-11-23 09:29", ip: "92.253.x.x", device: "Linux · Firefox", ok: true }
  ];

  return { departments, employees, clients, projects, tasks, events, services, flow, documents, contracts, attendance, weekly, loginLog };
})();
