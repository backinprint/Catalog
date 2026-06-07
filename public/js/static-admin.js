const adminList = document.querySelector("#adminList");
const adminEmpty = document.querySelector("#adminEmpty");
const adminContent = document.querySelector("#adminContent");
const adminLogin = document.querySelector("#adminLogin");
const adminPassword = document.querySelector("#adminPassword");
const loginStatus = document.querySelector("#loginStatus");
const adminStatus = document.querySelector("#adminStatus");
const exportCsv = document.querySelector("#exportCsv");
const importCsv = document.querySelector("#importCsv");
const ADMIN_PASSWORD = "Bear";
const ADMIN_AUTH_KEY = "jn21AdminAuthed";

function unlockAdmin() {
  adminLogin.hidden = true;
  adminContent.hidden = false;
  renderAdmin();
}

adminLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  if (adminPassword.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    unlockAdmin();
    return;
  }

  loginStatus.textContent = "Incorrect password";
  adminPassword.value = "";
  adminPassword.focus();
});

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

if (sessionStorage.getItem(ADMIN_AUTH_KEY) === "true") {
  unlockAdmin();
} else {
  adminPassword.focus();
}
