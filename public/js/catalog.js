const grid = document.querySelector("#productGrid");
const emptyState = document.querySelector("#emptyState");
const sortSelect = document.querySelector("#sortSelect");
let productList = [];

function moneyText(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "Price pending";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

async function loadProducts() {
  if (window.location.protocol === "file:") {
    throw new Error("Open this page from http://localhost:3000 after running .\\start.ps1.");
  }

  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Product API failed.");
  const data = await response.json();
  productList = data.products || [];
  renderProducts();
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
  return [...productList].sort((a, b) => {
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

sortSelect?.addEventListener("change", renderProducts);

loadProducts().catch(() => {
  emptyState.hidden = false;
  emptyState.textContent = "Could not load products. Run .\\start.ps1, then open http://localhost:3000.";
});
