ShopStore.initializeStore();

const TAX_RATE = 0.05;
const SHOP_NAME = "DMR Sundeep Group";
const SHOP_SUBTITLE = "Sundeep Sarl";
let selectedCategory = "all";

const categoryRow = document.getElementById("categoryRow");
const itemsGrid = document.getElementById("itemsGrid");
const billList = document.getElementById("billList");
const subtotalValue = document.getElementById("subtotalValue");
const taxValue = document.getElementById("taxValue");
const totalValue = document.getElementById("totalValue");
const clearCartBtn = document.getElementById("clearCartBtn");
const printBillBtn = document.getElementById("printBillBtn");
const payNowBtn = document.getElementById("payNowBtn");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const qrWrap = document.getElementById("qrWrap");
const posStatus = document.getElementById("posStatus");
const invoiceShopName = document.getElementById("invoiceShopName");
const invoiceShopSubtitle = document.getElementById("invoiceShopSubtitle");
const invoiceNumber = document.getElementById("invoiceNumber");
const invoiceDate = document.getElementById("invoiceDate");
const invoiceRows = document.getElementById("invoiceRows");
const invoiceSubtotal = document.getElementById("invoiceSubtotal");
const invoiceTax = document.getElementById("invoiceTax");
const invoiceTotal = document.getElementById("invoiceTotal");

function setStatus(message, isError = false) {
  posStatus.textContent = message;
  posStatus.classList.toggle("danger", isError);
}

function getFilteredItems() {
  const items = ShopStore.getMenuItems();
  if (selectedCategory === "all") {
    return items;
  }
  return items.filter((item) => item.category === selectedCategory);
}

function renderCategories() {
  const categoryList = ["all", ...ShopStore.categories];
  categoryRow.innerHTML = "";
  categoryList.forEach((category) => {
    const button = document.createElement("button");
    button.className = `chip ${selectedCategory === category ? "active" : ""}`;
    button.textContent = category === "all" ? "all" : category;
    button.addEventListener("click", () => {
      selectedCategory = category;
      renderCategories();
      renderItems();
    });
    categoryRow.appendChild(button);
  });
}

function addToCart(menuItem) {
  const cart = ShopStore.getCartItems();
  const existing = cart.find((entry) => entry.id === menuItem.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      qty: 1,
    });
  }
  ShopStore.setCartItems(cart);
  renderBill();
  setStatus(`${menuItem.name} added to cart.`);
}

function renderItems() {
  const items = getFilteredItems();
  if (!items.length) {
    itemsGrid.innerHTML = '<p class="muted">No items found in this category.</p>';
    return;
  }
  itemsGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" />
      <div class="item-body">
        <p class="item-name">${item.name}</p>
        <p class="item-meta">${item.category} • ${formatCurrency(item.price)}</p>
      </div>
    `;
    card.addEventListener("click", () => addToCart(item));
    itemsGrid.appendChild(card);
  });
}

function updateQty(itemId, diff) {
  const cart = ShopStore.getCartItems();
  const item = cart.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }
  item.qty += diff;
  const nextCart = cart.filter((entry) => entry.qty > 0);
  ShopStore.setCartItems(nextCart);
  renderBill();
}

function getBillTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * TAX_RATE;
  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

function renderBill() {
  const cart = ShopStore.getCartItems();
  if (!cart.length) {
    billList.innerHTML = '<p class="muted">No items in cart yet.</p>';
  } else {
    billList.innerHTML = "";
    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "bill-item";
      row.innerHTML = `
        <span>${item.name}</span>
        <button class="qty-btn" data-action="dec">-</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-action="inc">+</button>
      `;
      row.querySelector('[data-action="dec"]').addEventListener("click", () => updateQty(item.id, -1));
      row.querySelector('[data-action="inc"]').addEventListener("click", () => updateQty(item.id, 1));
      billList.appendChild(row);
    });
  }

  const totals = getBillTotals(cart);
  subtotalValue.textContent = formatCurrency(totals.subtotal);
  taxValue.textContent = formatCurrency(totals.tax);
  totalValue.textContent = formatCurrency(totals.total);
}

function clearCart() {
  if (!ShopStore.getCartItems().length) {
    setStatus("Cart is already empty.");
    return;
  }
  if (!window.confirm("Clear all items from cart?")) {
    return;
  }
  ShopStore.clearCart();
  qrWrap.classList.remove("open");
  renderBill();
  setStatus("Cart cleared.");
}

function confirmPayment() {
  const cart = ShopStore.getCartItems();
  if (!cart.length) {
    setStatus("Add at least one item before payment.", true);
    return;
  }
  const totals = getBillTotals(cart);
  ShopStore.addSalesRecord({
    billId: makeId("bill"),
    dateISO: new Date().toISOString(),
    items: cart,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    paymentType: "qr",
  });
  ShopStore.clearCart();
  qrWrap.classList.remove("open");
  renderBill();
  setStatus("Payment confirmed and bill saved.");
}

function buildPrintInvoice() {
  const cart = ShopStore.getCartItems();
  if (!cart.length) {
    setStatus("Add items before printing invoice.", true);
    return false;
  }

  const totals = getBillTotals(cart);
  invoiceShopName.textContent = SHOP_NAME;
  invoiceShopSubtitle.textContent = SHOP_SUBTITLE;
  invoiceNumber.textContent = makeId("INV").toUpperCase();
  invoiceDate.textContent = new Date().toLocaleString("en-IN");
  invoiceRows.innerHTML = "";

  cart.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(item.price * item.qty)}</td>
    `;
    invoiceRows.appendChild(row);
  });

  invoiceSubtotal.textContent = formatCurrency(totals.subtotal);
  invoiceTax.textContent = formatCurrency(totals.tax);
  invoiceTotal.textContent = formatCurrency(totals.total);
  return true;
}

clearCartBtn.addEventListener("click", clearCart);
printBillBtn.addEventListener("click", () => {
  const canPrint = buildPrintInvoice();
  if (!canPrint) {
    return;
  }
  window.print();
});
payNowBtn.addEventListener("click", () => {
  const hasCart = ShopStore.getCartItems().length > 0;
  if (!hasCart) {
    setStatus("Add items to cart before payment.", true);
    return;
  }
  qrWrap.classList.toggle("open");
  setStatus("QR panel opened. Scan and confirm payment.");
});
confirmPaymentBtn.addEventListener("click", confirmPayment);

renderCategories();
renderItems();
renderBill();
