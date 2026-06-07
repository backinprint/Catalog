const adminList = document.querySelector("#adminList");
const adminEmpty = document.querySelector("#adminEmpty");
const adminStatus = document.querySelector("#adminStatus");
const exportCsv = document.querySelector("#exportCsv");
const importCsv = document.querySelector("#importCsv");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function productForm(product) {
  return `
    <form class="admin-row" data-filename="${escapeHtml(product.filename)}">
      <img src="${product.imageUrl}" alt="${escapeHtml(product.itemName || product.filename)}" loading="lazy">
      <div class="field-stack">
        <label>
          <span>Item Name</span>
          <input name="itemName" value="${escapeHtml(product.itemName)}" autocomplete="off">
        </label>
        <label>
          <span>Item Number</span>
          <input name="itemNumber" value="${escapeHtml(product.itemNumber)}" autocomplete="off">
        </label>
        <label>
          <span>Item Price</span>
          <input name="itemPrice" value="${escapeHtml(product.itemPrice)}" inputmode="decimal" autocomplete="off">
        </label>
      </div>
      <div class="admin-actions">
        <span class="filename">${escapeHtml(product.filename)}</span>
        <button type="submit">Save</button>
        <span class="save-state" role="status"></span>
      </div>
    </form>
  `;
}

function renderAdmin() {
  const products = window.ProductStore.products();
  adminEmpty.hidden = products.length > 0;
  adminList.innerHTML = products.map(productForm).join("");
  adminList.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", saveProduct);
  });
}

function saveProduct(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const state = form.querySelector(".save-state");
  const formData = new FormData(form);

  window.ProductStore.saveProduct({
    filename: form.dataset.filename,
    itemName: formData.get("itemName"),
    itemNumber: formData.get("itemNumber"),
    itemPrice: formData.get("itemPrice")
  });

  state.textContent = "Saved";
  adminStatus.textContent = "Record updated in this browser";
}

exportCsv.addEventListener("click", () => {
  const blob = new Blob([window.ProductStore.toCsv()], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.csv";
  link.click();
  URL.revokeObjectURL(url);
});

importCsv.addEventListener("change", async () => {
  const [file] = importCsv.files;
  if (!file) return;
  const count = window.ProductStore.importCsv(await file.text());
  adminStatus.textContent = `Imported ${count} records`;
  renderAdmin();
  importCsv.value = "";
});

renderAdmin();
