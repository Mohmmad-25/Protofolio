/* تسجيل الدخول: 01 (عربي) · 02 (English) · 03 (حالة الخطأ) */
(function () {
  const HOME = { ceo: "dashboard-ceo.html", ops: "dashboard-ops.html", employee: "my-tasks.html" };
  function bind() {
    const form = document.getElementById("loginForm");
    const alertBox = document.getElementById("loginError");
    if (document.body.dataset.error === "1") showError();
    function showError() {
      alertBox.hidden = false;
      form.email.classList.add("invalid"); form.password.classList.add("invalid");
    }
    // تعبئة سريعة حسب الدور (للعرض التجريبي)
    document.querySelectorAll("[data-demo]").forEach(b => b.addEventListener("click", () => {
      form.email.value = b.dataset.demo; form.password.value = "demo1234";
    }));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]"); btn.disabled = true;
      try {
        const s = await CW.auth.login(form.email.value, form.password.value);
        location.href = HOME[s.user.role] || "dashboard-ceo.html";
      } catch (err) { showError(); btn.disabled = false; }
    });
    const toggle = document.getElementById("pwToggle");
    if (toggle) toggle.addEventListener("click", () => {
      const show = form.password.type === "password"; form.password.type = show ? "text" : "password";
      toggle.textContent = show ? toggle.dataset.hide : toggle.dataset.show;
    });
  }
  document.addEventListener("DOMContentLoaded", bind);
})();
