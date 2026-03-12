
window.SP = window.SP || {};

SP.dataCache = SP.dataCache || {};

SP.loadJson = async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
};

SP.getProducts = async function getProducts() {
  if (!SP.dataCache.products) {
    SP.dataCache.products = SP.loadJson("../data/products.json");
  }
  return SP.dataCache.products;
};

SP.getCategories = async function getCategories() {
  if (!SP.dataCache.categories) {
    SP.dataCache.categories = SP.loadJson("../data/categories.json");
  }
  return SP.dataCache.categories;
};

SP.getSettings = async function getSettings() {
  if (!SP.dataCache.settings) {
    SP.dataCache.settings = SP.loadJson("../data/settings.json");
  }
  return SP.dataCache.settings;
};

SP.getDiscountCodes = async function getDiscountCodes() {
  if (!SP.dataCache.codes) {
    SP.dataCache.codes = SP.loadJson("../data/discount-codes.json");
  }
  return SP.dataCache.codes;
};

SP.findProductById = async function findProductById(id) {
  const products = await SP.getProducts();
  return products.find((item) => item.id === id) || null;
};
