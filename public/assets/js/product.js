
window.SP = window.SP || {};

document.addEventListener("DOMContentLoaded", async () => {
  const wrap = document.getElementById("product-view");
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = await SP.findProductById(id);

  if (!product) {
    wrap.innerHTML = `
      <div class="empty-state">
        <p>${SP.escapeHtml(SP.t("productNotFound"))}</p>
        <a class="btn btn--accent" href="./store.html">${SP.escapeHtml(SP.t("backToStore"))}</a>
      </div>
    `;
    return;
  }

  const text = SP.getProductText(product);
  const included = product.included[SP.getLang()] || product.included.bg || [];
  wrap.innerHTML = `
    <section class="product-detail">
      <div class="product-detail__media">
        <img src="..${SP.escapeHtml(product.image)}" alt="${SP.escapeHtml(text.name)}">
      </div>
      <div class="product-detail__content">
        <div class="product-card__topline">
          ${SP.renderBadge(product)}
          ${SP.renderStock(product)}
        </div>
        <h1>${SP.escapeHtml(text.name)}</h1>
        <p class="lead">${SP.escapeHtml(text.shortDescription)}</p>
        <div class="price-xl">${SP.formatCurrency(product.price, product.currency)} / ${SP.escapeHtml(SP.getUnitLabel(product.unit))}</div>
        <div class="detail-block">
          <h2>${SP.escapeHtml(SP.t("details"))}</h2>
          <p>${SP.escapeHtml(text.description)}</p>
        </div>
        ${included.length ? `
          <div class="detail-block">
            <h2>${SP.escapeHtml(SP.t("included"))}</h2>
            <ul class="detail-list">
              ${included.map((item) => `<li>${SP.escapeHtml(item)}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
        <div class="product-detail__actions">
          <label class="qty-inline">
            <span>${SP.escapeHtml(SP.t("quantity"))}</span>
            <input id="product-qty" type="number" min="1" step="1" value="1">
          </label>
          <button id="product-add" class="btn btn--accent" type="button">${SP.escapeHtml(SP.t("addToCart"))}</button>
          <a class="btn btn--ghost" href="./store.html">${SP.escapeHtml(SP.t("backToStore"))}</a>
        </div>
      </div>
    </section>
  `;

  const addBtn = document.getElementById("product-add");
  const qtyInput = document.getElementById("product-qty");
  addBtn.addEventListener("click", () => {
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    SP.cart.add(product.id, qty);
    SP.notify(`${SP.t("addToCart")}: ${text.name}`, "success");
  });
});
