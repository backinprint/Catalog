# JN21 Product Gallery

A small product catalog and admin app for JN21 item photos.

## Run locally

```powershell
.\start.ps1
```

Then open:

- Catalog: http://localhost:3000
- Admin: http://localhost:3000/admin.html

## Update photos

Add item photos to `01_ITEM_PHOTOS`, then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\refresh-photos.ps1
```

The refresh script updates `products.csv`, `public/js/photo-manifest.js`, and `public/js/products-data.js`.
