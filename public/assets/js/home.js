
window.SP = window.SP || {};

document.addEventListener("DOMContentLoaded", async () => {
  const featuredWrap = document.getElementById("featured-products");
  const newWrap = document.getElementById("new-products");
  if (!featuredWrap && !newWrap) return;

  const products = await SP.getProducts();
  if (featuredWrap) {
    featuredWrap.innerHTML = products
      .filter((item) => item.featured)
      .slice(0, 6)
      .map(SP.renderProductCard)
      .join("");
    SP.bindAddToCartButtons(featuredWrap);
  }
  if (newWrap) {
    newWrap.innerHTML = products
      .filter((item) => item.newProduct)
      .slice(0, 6)
      .map(SP.renderProductCard)
      .join("");
    SP.bindAddToCartButtons(newWrap);
  }
});
