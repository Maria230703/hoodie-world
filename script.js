// Codice sconto: un clic copia il codice negli appunti
(function () {
  const button = document.querySelector(".promo-code");
  const status = document.getElementById("promo-status");
  if (!button) return;

  function fallbackCopy(text) {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok ? Promise.resolve() : Promise.reject(new Error("copy failed"));
  }

  // Messaggio che segue il cursore: "Copy and use it" al passaggio,
  // "Have a chic shopping" dopo la copia
  const TEXT_HOVER = "Copy and use it";
  const TEXT_COPIED = "Have a chic shopping";
  const tip = document.createElement("div");
  tip.className = "promo-tip";
  tip.setAttribute("aria-hidden", "true"); // i lettori di schermo usano #promo-status
  tip.hidden = true;
  document.body.appendChild(tip);
  let hideTimer = null;

  function placeTip(x, y) {
    const offset = 16;
    const maxX = window.innerWidth - tip.offsetWidth - 8;
    const maxY = window.innerHeight - tip.offsetHeight - 8;
    tip.style.left = Math.max(8, Math.min(x + offset, maxX)) + "px";
    tip.style.top = Math.max(8, Math.min(y + offset, maxY)) + "px";
  }

  function showTip(text, x, y) {
    clearTimeout(hideTimer);
    tip.textContent = text;
    tip.hidden = false;
    placeTip(x, y);
  }

  function hideTip() {
    clearTimeout(hideTimer);
    tip.hidden = true;
  }

  // Posizione di riserva (tastiera): sotto il pulsante
  function buttonPoint() {
    const r = button.getBoundingClientRect();
    return { x: r.left, y: r.bottom - 8 };
  }

  button.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "mouse" || e.pointerType === "pen") showTip(TEXT_HOVER, e.clientX, e.clientY);
  });
  button.addEventListener("pointermove", function (e) {
    if (!tip.hidden && (e.pointerType === "mouse" || e.pointerType === "pen")) placeTip(e.clientX, e.clientY);
  });
  button.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "mouse" || e.pointerType === "pen") hideTip();
  });
  button.addEventListener("focus", function () {
    if (button.matches(":focus-visible")) {
      const p = buttonPoint();
      showTip(TEXT_HOVER, p.x, p.y);
    }
  });
  button.addEventListener("blur", hideTip);

  button.addEventListener("click", function (e) {
    const code = button.dataset.code;
    const copy = navigator.clipboard && window.isSecureContext
      ? navigator.clipboard.writeText(code).catch(function () { return fallbackCopy(code); })
      : fallbackCopy(code);

    // Coordinate del clic o del tocco; da tastiera (0,0) si usa il pulsante
    const p = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : buttonPoint();

    copy
      .then(function () {
        if (status) status.textContent = "Code " + code + " copied";
        showTip(TEXT_COPIED, p.x, p.y);
        // Su telefono non c'è il passaggio del cursore: il messaggio sparisce da solo
        hideTimer = setTimeout(hideTip, 2500);
      })
      .catch(function () { if (status) status.textContent = "Could not copy the code"; });
  });
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

// Scheda "Collaborate with us": modulo B2B dentro la pagina.
// "Send" apre il programma di posta dell'utente con l'email già compilata per ddschic@gmail.com
(function () {
  const openButton = document.querySelector(".btn-collab");
  const dialog = document.getElementById("collab-dialog");
  if (!openButton || !dialog || typeof dialog.showModal !== "function") return;

  const form = dialog.querySelector(".collab-form");
  const closeButton = dialog.querySelector(".dialog-close");
  const RECIPIENT = "ddschic@gmail.com";

  openButton.addEventListener("click", function () {
    dialog.showModal();
  });

  closeButton.addEventListener("click", function () {
    dialog.close();
  });

  // Clic fuori dalla scheda: si chiude (Esc la chiude già in automatico)
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dialog.close();
    }
  });

  // Alla chiusura il focus torna sul pulsante che ha aperto la scheda
  dialog.addEventListener("close", function () {
    openButton.focus();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    form.classList.add("was-submitted");

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const name = data.get("name").trim();
    const company = data.get("company").trim();
    const subject = data.get("type") + " – " + (company || name);
    const body = [
      "Full name: " + name,
      "Company: " + company,
      "Email: " + data.get("email").trim(),
      "Request type: " + data.get("type"),
      "",
      data.get("message").trim()
    ].join("\n");

    window.location.href = "mailto:" + RECIPIENT +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    form.reset();
    form.classList.remove("was-submitted");
    dialog.close();
  });
})();
