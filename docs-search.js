/**
 * In-page search: indexes headings and block sections inside the scope element,
 * shows a dropdown of matches, scrolls on select / Enter.
 */
(function () {
  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments,
        ctx = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, a);
      }, ms);
    };
  }

  function norm(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function titleFor(el) {
    var h = el.querySelector("h1, h2, h3, .sec-title, .flow-title, .section-title");
    if (h) return h.textContent.trim().slice(0, 120);
    return (el.textContent || "").trim().slice(0, 80);
  }

  function buildIndex(scope) {
    var sel =
      ".doc-section, .sec, .flow-section, section[id], article[id], [data-search-block]";
    var blocks = scope.querySelectorAll(sel);
    var list = [];
    blocks.forEach(function (el) {
      var id = el.id;
      if (!id) return;
      var text = norm(el.innerText || "");
      if (text.length < 8) return;
      list.push({ id: id, title: titleFor(el), text: text });
    });
    if (!list.length) {
      scope.querySelectorAll("[id]").forEach(function (el) {
        if (el.id.indexOf("gl-") === 0) return;
        var tag = el.tagName;
        if (tag !== "DIV" && tag !== "SECTION" && tag !== "ARTICLE") return;
        var text = norm(el.innerText || "");
        if (text.length < 20) return;
        list.push({ id: el.id, title: titleFor(el), text: text });
      });
    }
    return list;
  }

  function score(item, q) {
    if (!q) return 0;
    var t = item.text;
    var bonus = item.title.toLowerCase().indexOf(q) >= 0 ? 2 : 0;
    if (t.indexOf(q) >= 0) return 10 + bonus;
    var words = q.split(" ").filter(Boolean);
    var n = 0;
    words.forEach(function (w) {
      if (t.indexOf(w) >= 0) n++;
    });
    return n ? n + bonus : 0;
  }

  function initDocsSearch() {
    var input = document.getElementById("gl-doc-search");
    var panel = document.getElementById("gl-doc-search-results");
    if (!input || !panel) return;

    var scope =
      document.getElementById("gl-search-scope") ||
      document.querySelector(".main-content, .main, .diagram-main, .page") ||
      document.body;

    var index = buildIndex(scope);
    var lastQ = "";

    function closePanel() {
      panel.hidden = true;
      panel.innerHTML = "";
    }

    function openPanel(html) {
      panel.innerHTML = html;
      panel.hidden = false;
    }

    function runSearch() {
      var q = norm(input.value);
      if (q.length < 2) {
        closePanel();
        return;
      }
      if (q === lastQ && panel.innerHTML) return;
      lastQ = q;

      var scored = index
        .map(function (item) {
          return { item: item, s: score(item, q) };
        })
        .filter(function (x) {
          return x.s > 0;
        })
        .sort(function (a, b) {
          return b.s - a.s;
        })
        .slice(0, 12);

      if (!scored.length) {
        openPanel(
          '<div class="nav-search-empty">No matches in this page. Try different keywords.</div>'
        );
        return;
      }

      var html = scored
        .map(function (x, i) {
          var it = x.item;
          return (
            '<button type="button" class="nav-search-hit" data-target="' +
            it.id +
            '" id="gl-search-opt-' +
            i +
            '"><span class="nav-search-hit-title">' +
            escapeHtml(it.title) +
            '</span><span class="nav-search-hit-id">#' +
            escapeHtml(it.id) +
            "</span></button>"
          );
        })
        .join("");
      openPanel(html);
    }

    function escapeHtml(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function go(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("gl-search-flash");
      setTimeout(function () {
        el.classList.remove("gl-search-flash");
      }, 1400);
      closePanel();
      input.blur();
    }

    panel.addEventListener("click", function (e) {
      var btn = e.target.closest(".nav-search-hit");
      if (!btn) return;
      go(btn.getAttribute("data-target"));
    });

    input.addEventListener(
      "input",
      debounce(function () {
        lastQ = "";
        runSearch();
      }, 180)
    );

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closePanel();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        var first = panel.querySelector(".nav-search-hit");
        if (first) go(first.getAttribute("data-target"));
        else runSearch();
      }
    });

    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !panel.contains(e.target)) closePanel();
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initDocsSearch);
  else initDocsSearch();
})();
