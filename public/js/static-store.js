(function () {
  const STORAGE_KEY = "jn21ProductRecords";

  function filenameToProduct(filename) {
    const name = filename.replace(/\.[^.]+$/, "");
    const parts = name.split("_");
    const itemNumber = parts.shift() || "";
    return {
      filename,
      itemName: parts.join(" ").trim(),
      itemNumber,
      itemPrice: ""
    };
  }

  function readRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function writeRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function products() {
    const records = readRecords();
    const productData = window.PRODUCT_DATA || {};
    return (window.PRODUCT_PHOTOS || []).map((filename) => ({
      ...filenameToProduct(filename),
      ...(productData[filename] || {}),
      ...(records[filename] || {}),
      filename,
      imageUrl: `01_ITEM_PHOTOS/${encodeURIComponent(filename)}`
    }));
  }

  function saveProduct(product) {
    const records = readRecords();
    records[product.filename] = {
      itemName: String(product.itemName || "").trim(),
      itemNumber: String(product.itemNumber || "").trim(),
      itemPrice: String(product.itemPrice || "").trim()
    };
    writeRecords(records);
  }

  function csvEscape(value) {
    const text = String(value || "");
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function toCsv() {
    const rows = [["filename", "item_name", "item_number", "item_price"]];
    for (const product of products()) {
      rows.push([product.filename, product.itemName, product.itemNumber, product.itemPrice]);
    }
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (quoted) {
        if (char === '"' && next === '"') {
          field += '"';
          index += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          field += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char !== "\r") {
        field += char;
      }
    }

    row.push(field);
    rows.push(row);
    return rows.filter((item) => item.some((value) => value.trim()));
  }

  function importCsv(text) {
    const rows = parseCsv(text);
    const [header, ...body] = rows;
    if (!header) return 0;

    const indexes = Object.fromEntries(header.map((name, index) => [name.trim().toLowerCase(), index]));
    let count = 0;
    for (const row of body) {
      const filename = row[indexes.filename] || "";
      if (!filename || !(window.PRODUCT_PHOTOS || []).includes(filename)) continue;
      saveProduct({
        filename,
        itemName: row[indexes.item_name] || "",
        itemNumber: row[indexes.item_number] || "",
        itemPrice: row[indexes.item_price] || ""
      });
      count += 1;
    }
    return count;
  }

  window.ProductStore = {
    products,
    saveProduct,
    toCsv,
    importCsv
  };
})();
