
window.SP = window.SP || {};

SP.cart = {
  key: "sharkpilot_cart",
  codeKey: "sharkpilot_discount_code",
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  },
  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    SP.updateCartCount();
  },
  add(productId, qty = 1) {
    const items = this.get();
    const existing = items.find((item) => item.id === productId);
    if (existing) {
      existing.qty += Number(qty) || 1;
    } else {
      items.push({ id: productId, qty: Number(qty) || 1 });
    }
    this.save(items);
  },
  setQty(productId, qty) {
    const items = this.get()
      .map((item) => item.id === productId ? { ...item, qty: Number(qty) || 0 } : item)
      .filter((item) => item.qty > 0);
    this.save(items);
  },
  remove(productId) {
    const items = this.get().filter((item) => item.id !== productId);
    this.save(items);
  },
  clear() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.codeKey);
    SP.updateCartCount();
  },
  getCode() {
    return localStorage.getItem(this.codeKey) || "";
  },
  setCode(code) {
    if (!code) {
      localStorage.removeItem(this.codeKey);
      return;
    }
    localStorage.setItem(this.codeKey, code.trim().toUpperCase());
  },
  count() {
    return this.get().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  }
};

SP.notify = function notify(message, type = "info") {
  const host = document.getElementById("site-toast");
  if (!host) return;
  host.textContent = message;
  host.dataset.type = type;
  host.classList.add("is-visible");
  clearTimeout(SP.notifyTimer);
  SP.notifyTimer = setTimeout(() => {
    host.classList.remove("is-visible");
  }, 2600);
};

SP.updateCartCount = function updateCartCount() {
  const count = SP.cart.count();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
  });
};

SP.buildHeader = function buildHeader() {
  const lang = SP.getLang();
  const current = window.location.pathname.split("/").pop() || "index.html";
  const isHome = current === "index.html";
  const isStore = current === "store.html";
  const isCart = current === "cart.html";
  const isContact = current === "contact.html";
  const altLang = lang === "bg" ? "en" : "bg";
  const altPath = window.location.pathname.replace(`/${lang}/`, `/${altLang}/`) + window.location.search;

  return `
    <div class="container nav-shell">
      <a class="brand" href="./index.html" aria-label="${SP.escapeHtml(SP.t("siteName"))}">
        <span class="brand-mark">SP</span>
        <span class="brand-text">${SP.escapeHtml(SP.t("siteName"))}</span>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        <a class="${isHome ? "active" : ""}" href="./index.html">${SP.escapeHtml(SP.t("navHome"))}</a>
        <a class="${isStore ? "active" : ""}" href="./store.html">${SP.escapeHtml(SP.t("navStore"))}</a>
        <a class="${isCart ? "active" : ""}" href="./cart.html">${SP.escapeHtml(SP.t("navCart"))} <span class="cart-pill" data-cart-count>0</span></a>
        <a class="${isContact ? "active" : ""}" href="./contact.html">${SP.escapeHtml(SP.t("navContact"))}</a>
      </nav>
      <div class="nav-actions">
        <a class="lang-switch" href="${altPath}">${altLang.toUpperCase()}</a>
      </div>
    </div>
  `;
};

SP.buildFooter = function buildFooter() {
  const year = new Date().getFullYear();
  return `
    <div class="container footer-shell">
      <div>${SP.escapeHtml(SP.t("footerText"))}</div>
      <div>© ${year} SharkPilot</div>
    </div>
  `;
};

SP.initShell = function initShell() {
  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = SP.buildHeader();
  }
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = SP.buildFooter();
  }
  SP.updateCartCount();
};

document.addEventListener("DOMContentLoaded", () => {
  SP.initShell();
});
