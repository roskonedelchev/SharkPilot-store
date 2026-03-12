
window.SP = window.SP || {};

document.addEventListener("DOMContentLoaded", async () => {
  const wrap = document.getElementById("cart-page");
  if (!wrap) return;

  const [products, settings, codes] = await Promise.all([
    SP.getProducts(),
    SP.getSettings(),
    SP.getDiscountCodes()
  ]);

  const byId = Object.fromEntries(products.map((product) => [product.id, product]));
  const codeInput = document.getElementById("discount-code");
  const applyBtn = document.getElementById("apply-code");
  const clearBtn = document.getElementById("clear-cart");
  const copyBtn = document.getElementById("copy-order");
  const mailBtn = document.getElementById("email-order");
  const preview = document.getElementById("order-preview-text");
  const form = document.getElementById("order-form");

  codeInput.value = SP.cart.getCode();

  function getCartRows() {
    return SP.cart.get()
      .map((item) => {
        const product = byId[item.id];
        if (!product) return null;
        return { product, qty: Number(item.qty) || 0 };
      })
      .filter(Boolean);
  }

  function getSummary() {
    const rows = getCartRows();
    const subtotal = rows.reduce((sum, row) => sum + (row.product.price * row.qty), 0);
    const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);
    return SP.discounts.calculate({
      subtotal,
      totalQty,
      code: codeInput.value,
      settings,
      codes
    });
  }

  function renderCart() {
    const rows = getCartRows();
    const summary = getSummary();
    const list = document.getElementById("cart-items");
    const empty = document.getElementById("cart-empty");
    const full = document.getElementById("cart-full");

    if (!rows.length) {
      empty.hidden = false;
      full.hidden = true;
      preview.value = "";
      return;
    }

    empty.hidden = true;
    full.hidden = false;

    list.innerHTML = rows.map(({ product, qty }) => {
      const text = SP.getProductText(product);
      return `
        <div class="cart-row">
          <div class="cart-row__main">
            <img src="..${SP.escapeHtml(product.image)}" alt="${SP.escapeHtml(text.name)}">
            <div>
              <strong>${SP.escapeHtml(text.name)}</strong>
              <div class="muted">${SP.formatCurrency(product.price, product.currency)} / ${SP.escapeHtml(SP.getUnitLabel(product.unit))}</div>
            </div>
          </div>
          <div class="cart-row__controls">
            <input type="number" min="1" step="1" value="${qty}" data-qty-id="${SP.escapeHtml(product.id)}">
            <div class="cart-row__sum">${SP.formatCurrency(product.price * qty, product.currency)}</div>
            <button class="btn btn--ghost btn--small" type="button" data-remove-id="${SP.escapeHtml(product.id)}">×</button>
          </div>
        </div>
      `;
    }).join("");

    document.getElementById("subtotal-value").textContent = SP.formatCurrency(summary.subtotal, settings.store.currency);
    document.getElementById("discount-value").textContent = summary.discountValue > 0
      ? `- ${SP.formatCurrency(summary.discountValue, settings.store.currency)}${summary.discountLabel ? ` (${summary.discountLabel})` : ""}`
      : "—";
    document.getElementById("total-value").textContent = SP.formatCurrency(summary.total, settings.store.currency);
    document.getElementById("temporary-notice-text").textContent = settings.variantC.notice[SP.getLang()];
    buildPreview();

    list.querySelectorAll("[data-qty-id]").forEach((input) => {
      input.addEventListener("input", () => {
        const qty = Math.max(1, Number(input.value) || 1);
        SP.cart.setQty(input.getAttribute("data-qty-id"), qty);
        renderCart();
      });
    });

    list.querySelectorAll("[data-remove-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        SP.cart.remove(btn.getAttribute("data-remove-id"));
        renderCart();
      });
    });
  }

  function validateForm() {
    const required = form.querySelectorAll("[data-required]");
    let valid = true;
    required.forEach((field) => {
      const hasValue = field.value.trim().length > 0;
      field.classList.toggle("field-error", !hasValue);
      if (!hasValue) valid = false;
    });
    return valid;
  }

  function buildPreview() {
    const rows = getCartRows();
    const summary = getSummary();
    const data = Object.fromEntries(new FormData(form).entries());
    const lines = [
      SP.t("orderSummaryTitle"),
      "",
      `${SP.t("name")}: ${data.name || ""}`,
      `${SP.t("phone")}: ${data.phone || ""}`,
      `${SP.t("email")}: ${data.email || ""}`,
      `${SP.t("delivery")}: ${data.delivery || ""}`,
      `${SP.t("note")}: ${data.note || ""}`,
      "",
      `${SP.t("item")}:`
    ];

    rows.forEach(({ product, qty }, index) => {
      const text = SP.getProductText(product);
      lines.push(`${index + 1}. ${text.name} x ${qty} ${SP.getUnitLabel(product.unit)} = ${product.price * qty} ${product.currency}`);
    });

    lines.push("");
    lines.push(`${SP.t("subtotal")}: ${summary.subtotal.toFixed(2)} ${settings.store.currency}`);
    if (summary.discountValue > 0) {
      lines.push(`${SP.t("discount")}: ${summary.discountPercent}%${summary.discountLabel ? ` (${summary.discountLabel})` : ""}`);
    } else {
      lines.push(`${SP.t("discount")}: 0%`);
    }
    lines.push(`${SP.t("finalTotal")}: ${summary.total.toFixed(2)} ${settings.store.currency}`);
    if (summary.matchingCode) {
      lines.push(`${SP.t("discountCode")}: ${summary.matchingCode.code}`);
    }
    lines.push(`Lang: ${SP.getLang().toUpperCase()}`);
    preview.value = lines.join("\n");
  }

  applyBtn.addEventListener("click", () => {
    const normalized = codeInput.value.trim().toUpperCase();
    const found = SP.discounts.findCode(normalized, codes);
    if (normalized && found) {
      SP.cart.setCode(normalized);
      SP.notify(`${SP.t("appliedCode")}: ${normalized}`, "success");
    } else if (normalized) {
      SP.cart.setCode("");
      SP.notify(SP.t("invalidCode"), "error");
    } else {
      SP.cart.setCode("");
    }
    renderCart();
  });

  clearBtn.addEventListener("click", () => {
    SP.cart.clear();
    codeInput.value = "";
    renderCart();
  });

  form.addEventListener("input", buildPreview);

  copyBtn.addEventListener("click", async () => {
    if (!validateForm()) {
      SP.notify(SP.t("required"), "error");
      return;
    }
    buildPreview();
    try {
      await navigator.clipboard.writeText(preview.value);
      SP.notify(SP.t("copied"), "success");
    } catch {
      SP.notify(SP.t("copyFailed"), "error");
    }
  });

  mailBtn.addEventListener("click", () => {
    if (!validateForm()) {
      SP.notify(SP.t("required"), "error");
      return;
    }
    buildPreview();
    const email = settings.store.orderEmail;
    const subject = encodeURIComponent(SP.t("mailtoSubject"));
    const body = encodeURIComponent(preview.value);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });

  renderCart();
});
