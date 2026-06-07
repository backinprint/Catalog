const grid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const sortSelect = document.querySelector("#sortSelect");

function moneyText(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "Price pending";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function productName(product) {
  return String(product.itemName || product.filename || "").trim();
}

function priceValue(product) {
  const value = String(product.itemPrice || "").replace(/[^0-9.-]/g, "");
  const price = Number.parseFloat(value);
  return Number.isFinite(price) ? price : null;
}

function sortedProducts() {
  const sortMode = sortSelect?.value || "name";
  return window.ProductStore.products().sort((a, b) => {
    if (sortMode.startsWith("price")) {
      const priceA = priceValue(a);
      const priceB = priceValue(b);
      if (priceA === null && priceB === null) return productName(a).localeCompare(productName(b));
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return sortMode === "price-desc" ? priceB - priceA : priceA - priceB;
    }

    return productName(a).localeCompare(productName(b), undefined, { numeric: true, sensitivity: "base" });
  });
}

function renderProducts() {
  const products = sortedProducts();
  emptyState.hidden = products.length > 0;
  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <h2>${escapeHtml(product.itemName || product.filename)}</h2>
      <img src="${product.imageUrl}" alt="${escapeHtml(product.itemName || product.filename)}" loading="lazy">
      <p class="price">${escapeHtml(moneyText(product.itemPrice))}</p>
    </article>
  `).join("");
}

sortSelect?.addEventListener("change", renderProducts);

renderProducts();
