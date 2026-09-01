/* Side by Side Support Services — the page's only script.
   One job: the mobile menu. Everything else on this page is static markup,
   native anchors and CSS. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (!header || !toggle || !nav) return;

  function setOpen(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("nav-open"));
  });

  // Close after picking a destination, and on Escape.
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  // The panel only exists below the breakpoint; leaving it "open" as the
  // viewport grows would strand the aria state.
  var wide = window.matchMedia("(min-width: 901px)");
  wide.addEventListener("change", function (event) {
    if (event.matches) setOpen(false);
  });
})();
