# ShopLedger contributor notes

## Stack

- Node.js application using Express and `body-parser`.
- Server-rendered/static frontend: `public/index.html`, `public/js/app.js`, and `public/css/style.css`.
- File-backed persistence in `data/db.json`.
- No test framework or automated test suite is currently configured.

## Module map

- `server.js` configures Express, serves `public/`, mounts API routers, and renders the invoice page.
- `routes/` contains HTTP handlers for products, orders, customers, and reports.
- `lib/` contains business logic for storage, inventory, orders, pricing, tax, coupons, customer ledger, reports, invoices, and dates.
- `config.js` contains shop configuration, GST slabs, inventory settings, and coupon definitions.
- `data/db.json` is the application datastore.

## Commands

- `npm start` starts the application with `node server.js`.
- `npm test` is defined but currently exits with `Error: no test specified`.

## Change rules

- Write characterization tests before changing behaviour.
- Change only the module the ticket is about.
- Tests must never read from or write to `data/db.json`.
- Add no dependencies.
