const STORAGE_KEYS = {
  menuItems: "liquorShop_menuItems",
  cartItems: "liquorShop_cartItems",
  salesRecords: "liquorShop_salesRecords",
};

const CATEGORIES = [
  "beer",
  "whiskey",
  "gin",
  "vodka",
  "wine",
  "brandy",
  "tequila",
  "mezcal",
  "lagers",
  "ales",
  "dark beers",
];

const DEFAULT_MENU_ITEMS = [
  { id: "m-beer-1", name: "Classic Beer Pint", category: "beer", price: 180, imageUrl: "https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?auto=format&fit=crop&w=800&q=60" },
  { id: "m-whiskey-1", name: "Oak Reserve Whiskey", category: "whiskey", price: 420, imageUrl: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=60" },
  { id: "m-gin-1", name: "Juniper Dry Gin", category: "gin", price: 390, imageUrl: "https://images.unsplash.com/photo-1582450871972-ab5caab2f5d3?auto=format&fit=crop&w=800&q=60" },
  { id: "m-vodka-1", name: "Crystal Vodka", category: "vodka", price: 360, imageUrl: "https://images.unsplash.com/photo-1613214204937-2f7f86f9f1ea?auto=format&fit=crop&w=800&q=60" },
  { id: "m-wine-1", name: "Red Blend Wine", category: "wine", price: 550, imageUrl: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=800&q=60" },
  { id: "m-brandy-1", name: "Vintage Brandy", category: "brandy", price: 480, imageUrl: "https://images.unsplash.com/photo-1575650772417-e6b418b0d4b9?auto=format&fit=crop&w=800&q=60" },
  { id: "m-tequila-1", name: "Silver Tequila", category: "tequila", price: 460, imageUrl: "https://images.unsplash.com/photo-1621804142661-563b5f1b82c1?auto=format&fit=crop&w=800&q=60" },
  { id: "m-mezcal-1", name: "Smoky Mezcal", category: "mezcal", price: 500, imageUrl: "https://images.unsplash.com/photo-1582819509237-d5f707eb7f3d?auto=format&fit=crop&w=800&q=60" },
  { id: "m-lager-1", name: "Crisp Lager", category: "lagers", price: 210, imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=60" },
  { id: "m-ale-1", name: "Amber Ale", category: "ales", price: 230, imageUrl: "https://images.unsplash.com/photo-1513189737554-b5ccbf1eb2d8?auto=format&fit=crop&w=800&q=60" },
  { id: "m-dark-1", name: "Midnight Stout", category: "dark beers", price: 260, imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=60" },
];

function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getStorageArray(key) {
  return parseJSON(localStorage.getItem(key), []);
}

function setStorageArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.menuItems)) {
    setStorageArray(STORAGE_KEYS.menuItems, DEFAULT_MENU_ITEMS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.cartItems)) {
    setStorageArray(STORAGE_KEYS.cartItems, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.salesRecords)) {
    setStorageArray(STORAGE_KEYS.salesRecords, []);
  }
}

const ShopStore = {
  categories: CATEGORIES,
  initializeStore,
  getMenuItems() {
    return getStorageArray(STORAGE_KEYS.menuItems);
  },
  setMenuItems(items) {
    setStorageArray(STORAGE_KEYS.menuItems, items);
  },
  getCartItems() {
    return getStorageArray(STORAGE_KEYS.cartItems);
  },
  setCartItems(items) {
    setStorageArray(STORAGE_KEYS.cartItems, items);
  },
  clearCart() {
    setStorageArray(STORAGE_KEYS.cartItems, []);
  },
  getSalesRecords() {
    return getStorageArray(STORAGE_KEYS.salesRecords);
  },
  addSalesRecord(record) {
    const current = this.getSalesRecords();
    current.push(record);
    setStorageArray(STORAGE_KEYS.salesRecords, current);
  },
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
