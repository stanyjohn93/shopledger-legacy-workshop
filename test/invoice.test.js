var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function line(name, sku, hsn, price, qty) {
  return {
    name: name,
    sku: sku,
    hsn: hsn,
    price: price,
    qty: qty,
    gstRate: undefined
  };
}

function figures(items, coupon) {
  return {
    invoice: invoice.computeInvoiceFigures({ items: items, coupon: coupon }),
    checkout: pricing.computeTotals(items, coupon)
  };
}

test('#1001-style 5% and 12% items print using their HSN GST rates', function () {
  var result = figures([
    line('Rice', 'GRN-001', '1006', 500, 1),
    line('Ghee', 'DRY-001', '0405', 500, 1)
  ], '');

  assert.deepEqual(result.invoice, {
    subtotal: 1000, discount: 0, tax: 85, cgst: 42.5, sgst: 42.5, total: 1085,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 500, gstPercent: 5, line: 500, lineTax: 25 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 500, gstPercent: 12, line: 500, lineTax: 60 }
    ]
  });
  assert.deepEqual(result.checkout, {
    subtotal: 1000, discount: 0, taxable: 1000, tax: 85, cgst: 42.5, sgst: 42.5, total: 1085,
    lines: [
      { id: undefined, name: 'Rice', hsn: '1006', gstPercent: 5, gross: 500, discount: 0, taxable: 500, tax: 25, net: 525 },
      { id: undefined, name: 'Ghee', hsn: '0405', gstPercent: 12, gross: 500, discount: 0, taxable: 500, tax: 60, net: 560 }
    ]
  });
});

test('#1002-style SAVE10 invoice matches checkout discount and GST', function () {
  var result = figures([
    line('Rice', 'GRN-001', '1006', 640, 1),
    line('Sunflower Oil', 'OIL-001', '1512', 190, 2)
  ], 'SAVE10');

  assert.deepEqual(result.invoice, {
    subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: 'OIL-001', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.equal(result.checkout.total, 963.9);
  assert.equal(result.checkout.tax, 45.9);
  assert.equal(result.checkout.discount, 102);
});

test('#1004-style SAVE10 invoice honours the ₹150 discount cap', function () {
  var result = figures([
    line('Groundnut Oil', 'OIL-002', '1508', 1120, 2)
  ], 'SAVE10');

  assert.deepEqual(result.invoice, {
    subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.equal(result.checkout.total, 2194.5);
  assert.equal(result.checkout.tax, 104.5);
  assert.equal(result.checkout.discount, 150);
});

test('CURRENT BEHAVIOUR: #1008-style all-18% order produces matching invoice and checkout totals', function () {
  var result = figures([
    line('Masala Chai', 'BEV-001', '0902', 140, 1),
    line('Kokum Sherbet', 'BEV-003', '2106', 180, 2)
  ], '');

  assert.deepEqual(result.invoice, {
    subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
    rows: [
      { name: 'Masala Chai', sku: 'BEV-001', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet', sku: 'BEV-003', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.equal(result.checkout.total, 590);
  assert.equal(result.checkout.tax, 90);
  assert.equal(result.checkout.discount, 0);
});

test('invoice matches checkout HSN GST and totals for 5% and 12% lines', function () {
  var items = [
    line('Rice', 'GRN-001', '1006', 500, 1),
    line('Ghee', 'DRY-001', '0405', 500, 1)
  ];
  var printed = invoice.computeInvoiceFigures({ items: items, coupon: '' });
  var billed = pricing.computeTotals(items, '');

  assert.deepEqual(printed, {
    subtotal: 1000, discount: 0, tax: 85, cgst: 42.5, sgst: 42.5, total: 1085,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 500, gstPercent: 5, line: 500, lineTax: 25 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 500, gstPercent: 12, line: 500, lineTax: 60 }
    ]
  });
  assert.equal(printed.subtotal, billed.subtotal);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.total, billed.total);
});
