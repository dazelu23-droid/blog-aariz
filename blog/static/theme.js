(function () {
  var STORAGE_KEY = "blog-theme";
  var toggle = document.getElementById("theme-toggle");
  var icon = document.getElementById("theme-icon");

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  function initTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    var theme = saved || getSystemTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "light";
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  initTheme();

  if (toggle) {
    toggle.addEventListener("click", toggleTheme);
  }
})();
