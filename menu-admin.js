ShopStore.initializeStore();

const menuForm = document.getElementById("menuForm");
const itemIdInput = document.getElementById("itemId");
const itemNameInput = document.getElementById("itemName");
const itemCategorySelect = document.getElementById("itemCategory");
const itemPriceInput = document.getElementById("itemPrice");
const itemImageUrlInput = document.getElementById("itemImageUrl");
const menuTableBody = document.getElementById("menuTableBody");
const menuStatus = document.getElementById("menuStatus");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");

function setStatus(message, isError = false) {
  menuStatus.textContent = message;
  menuStatus.classList.toggle("danger", isError);
}

function renderCategoryOptions() {
  itemCategorySelect.innerHTML = ShopStore.categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function resetForm() {
  itemIdInput.value = "";
  menuForm.reset();
  renderCategoryOptions();
  saveBtn.textContent = "Add Item";
}

function renderTable() {
  const items = ShopStore.getMenuItems();
  if (!items.length) {
    menuTableBody.innerHTML = '<tr><td colspan="4" class="muted">No menu items.</td></tr>';
    return;
  }
  menuTableBody.innerHTML = "";
  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>
        <button class="btn btn-secondary" data-action="edit">Edit</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </td>
    `;

    tr.querySelector('[data-action="edit"]').addEventListener("click", () => {
      itemIdInput.value = item.id;
      itemNameInput.value = item.name;
      itemCategorySelect.value = item.category;
      itemPriceInput.value = item.price;
      itemImageUrlInput.value = item.imageUrl;
      saveBtn.textContent = "Update Item";
      setStatus(`Editing "${item.name}".`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    tr.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!window.confirm(`Delete "${item.name}" from menu?`)) {
        return;
      }
      const updated = ShopStore.getMenuItems().filter((entry) => entry.id !== item.id);
      ShopStore.setMenuItems(updated);
      renderTable();
      setStatus(`Deleted "${item.name}".`);
    });

    menuTableBody.appendChild(tr);
  });
}

menuForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = itemNameInput.value.trim();
  const category = itemCategorySelect.value;
  const price = Number(itemPriceInput.value);
  const imageUrl = itemImageUrlInput.value.trim();
  const editingId = itemIdInput.value;

  if (!name || !category || Number.isNaN(price) || price <= 0 || !imageUrl) {
    setStatus("Please fill all fields with valid values.", true);
    return;
  }

  const items = ShopStore.getMenuItems();
  if (editingId) {
    const updatedItems = items.map((item) =>
      item.id === editingId ? { ...item, name, category, price, imageUrl } : item
    );
    ShopStore.setMenuItems(updatedItems);
    setStatus(`Updated "${name}".`);
  } else {
    items.push({
      id: makeId("menu"),
      name,
      category,
      price,
      imageUrl,
    });
    ShopStore.setMenuItems(items);
    setStatus(`Added "${name}" to menu.`);
  }

  resetForm();
  renderTable();
});

resetBtn.addEventListener("click", () => {
  resetForm();
  setStatus("Form reset.");
});

renderCategoryOptions();
renderTable();
