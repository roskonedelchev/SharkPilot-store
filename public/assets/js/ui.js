
window.SP = window.SP || {};

SP.getProductText = function getProductText(product) {
  return product.labels[SP.getLang()] || product.labels.bg;
};

SP.getUnitLabel = function getUnitLabel(unit) {
  return unit === "m" ? SP.t("unitM") : SP.t("unitPcs");
};

SP.getBadgeLabel = function getBadgeLabel(badge) {
  if (badge === "new") return SP.t("badgeNewShort");
  if (badge === "best_seller") return SP.t("badgeBestShort");
  return "";
};

SP.getStockLabel = function getStockLabel(status) {
  return status === "on_request" ? SP.t("statusOnRequest") : SP.t("statusInStock");
};

SP.renderBadge = function renderBadge(product) {
  if (!product.badge || product.badge === "none") return "";
  return `<span class="badge badge--${SP.escapeHtml(product.badge)}">${SP.escapeHtml(SP.getBadgeLabel(product.badge))}</span>`;
};

SP.renderStock = function renderStock(product) {
  return `<span class="stock stock--${SP.escapeHtml(product.stockStatus)}">${SP.escapeHtml(SP.getStockLabel(product.stockStatus))}</span>`;
};

SP.renderProductCard = function renderProductCard(product) {
  const text = SP.getProductText(product);
  return `
    <article class="product-card">
      <a class="product-card__image" href="./product.html?id=${encodeURIComponent(product.id)}">
        <img src="..${SP.escapeHtml(product.image)}" alt="${SP.escapeHtml(text.name)}" loading="lazy">
      </a>
      <div class="product-card__meta">
        <div class="product-card__topline">
          ${SP.renderBadge(product)}
          ${SP.renderStock(product)}
        </div>
        <h3 class="product-card__title">
          <a href="./product.html?id=${encodeURIComponent(product.id)}">${SP.escapeHtml(text.name)}</a>
        </h3>
        <p class="product-card__desc">${SP.escapeHtml(text.shortDescription)}</p>
        <div class="product-card__bottom">
          <div class="product-card__price">${SP.formatCurrency(product.price, product.currency)} / ${SP.escapeHtml(SP.getUnitLabel(product.unit))}</div>
          <div class="product-card__actions">
            <a class="btn btn--ghost" href="./product.html?id=${encodeURIComponent(product.id)}">${SP.escapeHtml(SP.t("viewDetails"))}</a>
            <button class="btn btn--accent" type="button" data-add-to-cart="${SP.escapeHtml(product.id)}" data-add-name="${SP.escapeHtml(text.name)}">${SP.escapeHtml(SP.t("addToCart"))}</button>
          </div>
        </div>
      </div>
    </article>
  `;
};

SP.bindAddToCartButtons = function bindAddToCartButtons(scope = document) {
  scope.querySelectorAll("[data-add-to-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-add-to-cart");
      const name = button.getAttribute("data-add-name") || id;
      SP.cart.add(id, 1);
      SP.notify(`${SP.t("addToCart")}: ${name}`, "success");
    });
  });
};
