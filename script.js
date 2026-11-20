// Altezza reale della barra promo: aggiorna --promo-h (usata dallo scorrimento
// verso le sezioni) quando la frase va a capo su più righe
(function () {
  const promo = document.querySelector(".promo-bar");
  if (!promo) return;

  function updatePromoHeight() {
    document.documentElement.style.setProperty("--promo-h", promo.offsetHeight + "px");
  }

  updatePromoHeight();
  window.addEventListener("resize", updatePromoHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updatePromoHeight);
  if ("ResizeObserver" in window) new ResizeObserver(updatePromoHeight).observe(promo);
})();

// Menu compatto su telefono: apertura/chiusura accessibile
(function () {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  // Chiude il menu quando si sceglie un link
  nav.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  // Chiude il menu con il tasto Esc e riporta il focus sul pulsante
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // Se lo schermo torna largo, il menu si resetta
  window.matchMedia("(min-width: 600px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
})();
