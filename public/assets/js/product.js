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
  const included = product.included?.[SP.getLang()] || product.included?.bg || [];
  const gallery = Array.isArray(product.gallery) && product.gallery.length
    ? product.gallery
    : [product.image];

  const videoUrl = product.video?.url || "";
  const videoTitle = SP.getLang() === "bg" ? "Видео" : "Video";
  const youtubeButtonText = SP.getLang() === "bg" ? "Гледай в YouTube" : "Watch on YouTube";

  wrap.innerHTML = `
    <section class="product-detail">
      <div class="product-detail__media">
        <div class="product-gallery">
          <div class="product-gallery__main">
            <img
              id="product-main-image"
              src="..${SP.escapeHtml(gallery[0])}"
              alt="${SP.escapeHtml(text.name)}">
          </div>

          ${gallery.length > 1 ? `
            <div class="product-gallery__thumbs">
              ${gallery.map((img, index) => `
                <button
                  class="product-gallery__thumb ${index === 0 ? "is-active" : ""}"
                  type="button"
                  data-image="..${SP.escapeHtml(img)}"
                  aria-label="Image ${index + 1}">
                  <img src="..${SP.escapeHtml(img)}" alt="${SP.escapeHtml(text.name)} ${index + 1}">
                </button>
              `).join("")}
            </div>
          ` : ""}

          ${videoUrl ? `
            <div class="video-card">
              <div class="detail-block">
                <h2>${SP.escapeHtml(videoTitle)}</h2>
              </div>
              <div class="video-wrap">
                <iframe
                  src="${SP.escapeHtml(videoUrl)}"
                  title="${SP.escapeHtml(text.name)} video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen>
                </iframe>
              </div>
              <div class="video-actions">
                <a
                  class="btn btn--ghost btn--small"
                  href="${SP.escapeHtml(videoUrl)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  ${SP.escapeHtml(youtubeButtonText)}
                </a>
              </div>
            </div>
          ` : ""}
        </div>
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

  const mainImage = document.getElementById("product-main-image");
  const thumbs = wrap.querySelectorAll(".product-gallery__thumb");

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const nextImage = thumb.getAttribute("data-image");
      if (mainImage && nextImage) {
        mainImage.src = nextImage;
      }

      thumbs.forEach((btn) => btn.classList.remove("is-active"));
      thumb.classList.add("is-active");
    });
  });
});
