(function () {
  function closeNav() {
    var sb = document.getElementById("sidebar");
    var bd = document.getElementById("sb-backdrop");
    var bt = document.querySelector(".nav-mtoggle");
    if (sb) sb.classList.remove("is-open");
    if (bd) bd.classList.remove("is-open");
    if (bt) {
      bt.setAttribute("aria-expanded", "false");
    }
  }

  window.glToggleNav = function () {
    var sb = document.getElementById("sidebar");
    var bd = document.getElementById("sb-backdrop");
    var bt = document.querySelector(".nav-mtoggle");
    if (!sb) return;
    var open = !sb.classList.contains("is-open");
    sb.classList.toggle("is-open", open);
    if (bd) bd.classList.toggle("is-open", open);
    if (bt) bt.setAttribute("aria-expanded", open ? "true" : "false");
  };

  window.glCloseNav = closeNav;

  document.querySelectorAll(".sidebar a").forEach(function (a) {
    a.addEventListener("click", function () {
      if (window.matchMedia("(max-width:900px)").matches) closeNav();
    });
  });
})();
