
window.SP = window.SP || {};

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("store-grid");
  if (!grid) return;

  const [products, categories] = await Promise.all([SP.getProducts(), SP.getCategories()]);

  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category-filter");
  const stockSelect = document.getElementById("stock-filter");
  const badgeSelect = document.getElementById("badge-filter");
  const empty = document.getElementById("store-empty");

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.labels[SP.getLang()] || category.labels.bg;
    categorySelect.appendChild(option);
  });

  function matches(product, query, category, stock, badge) {
    const text = SP.getProductText(product);
    const haystack = `${text.name} ${text.shortDescription} ${text.description}`.toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (category === "all" || product.category === category) &&
      (stock === "all" || product.stockStatus === stock) &&
      (badge === "all" || product.badge === badge)
    );
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const stock = stockSelect.value;
    const badge = badgeSelect.value;
    const filtered = products.filter((product) => matches(product, query, category, stock, badge));

    grid.innerHTML = filtered.map(SP.renderProductCard).join("");
    SP.bindAddToCartButtons(grid);
    empty.hidden = filtered.length !== 0;
  }

  [searchInput, categorySelect, stockSelect, badgeSelect].forEach((el) => el.addEventListener("input", render));
  render();
});
