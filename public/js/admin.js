const adminList = document.querySelector("#adminList");
const adminEmpty = document.querySelector("#adminEmpty");
const adminContent = document.querySelector("#adminContent");
const adminLogin = document.querySelector("#adminLogin");
const adminPassword = document.querySelector("#adminPassword");
const loginStatus = document.querySelector("#loginStatus");
const ADMIN_PASSWORD = "Bear";
const ADMIN_AUTH_KEY = "jn21AdminAuthed";

function unlockAdmin() {
  adminLogin.hidden = true;
  adminContent.hidden = false;
  loadAdmin().catch(() => {
    adminEmpty.hidden = false;
    adminEmpty.textContent = "Could not load admin data.";
  });
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

async function loadAdmin() {
  if (window.location.protocol === "file:") {
    throw new Error("Open this page from http://localhost:3000/admin.html after running .\\start.ps1.");
  }

  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Product API failed.");
  const data = await response.json();
  const products = data.products || [];

  adminEmpty.hidden = products.length > 0;
  adminList.innerHTML = products.map(productForm).join("");
  adminList.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", saveProduct);
  });
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

async function saveProduct(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const state = form.querySelector(".save-state");
  const button = form.querySelector("button");
  const formData = new FormData(form);
  const filename = form.dataset.filename;

  state.textContent = "Saving...";
  button.disabled = true;

  const response = await fetch(`/api/products/${encodeURIComponent(filename)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      itemName: formData.get("itemName"),
      itemNumber: formData.get("itemNumber"),
      itemPrice: formData.get("itemPrice")
    })
  });

  button.disabled = false;
  state.textContent = response.ok ? "Saved" : "Save failed";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (sessionStorage.getItem(ADMIN_AUTH_KEY) === "true") {
  unlockAdmin();
} else {
  adminPassword.focus();
}
