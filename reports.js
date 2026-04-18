ShopStore.initializeStore();

const reportsContainer = document.getElementById("reportsContainer");

function monthKey(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function humanMonth(key) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function createMonthlyAggregate(records) {
  const grouped = {};
  records.forEach((record) => {
    const key = monthKey(record.dateISO);
    if (!grouped[key]) {
      grouped[key] = {
        billCount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        itemsCount: {},
        categoryCount: {},
      };
    }

    grouped[key].billCount += 1;
    grouped[key].subtotal += record.subtotal;
    grouped[key].tax += record.tax;
    grouped[key].total += record.total;

    const menuLookup = ShopStore.getMenuItems().reduce((map, item) => {
      map[item.id] = item.category;
      return map;
    }, {});

    record.items.forEach((item) => {
      grouped[key].itemsCount[item.name] = (grouped[key].itemsCount[item.name] || 0) + item.qty;
      const cat = menuLookup[item.id] || "unknown";
      grouped[key].categoryCount[cat] = (grouped[key].categoryCount[cat] || 0) + item.qty;
    });
  });
  return grouped;
}

function topLabel(countMap) {
  const pairs = Object.entries(countMap);
  if (!pairs.length) {
    return "N/A";
  }
  pairs.sort((a, b) => b[1] - a[1]);
  return `${pairs[0][0]} (${pairs[0][1]})`;
}

function renderReports() {
  const records = ShopStore.getSalesRecords();
  if (!records.length) {
    reportsContainer.innerHTML = '<p class="muted">No completed bills yet. Pay a bill from POS to generate reports.</p>';
    return;
  }

  const monthly = createMonthlyAggregate(records);
  const sortedMonths = Object.keys(monthly).sort((a, b) => (a > b ? -1 : 1));
  reportsContainer.innerHTML = sortedMonths
    .map((month) => {
      const entry = monthly[month];
      return `
        <article class="card">
          <h3>${humanMonth(month)}</h3>
          <p><strong>Bills:</strong> ${entry.billCount}</p>
          <p><strong>Subtotal:</strong> ${formatCurrency(entry.subtotal)}</p>
          <p><strong>Tax:</strong> ${formatCurrency(entry.tax)}</p>
          <p><strong>Total Sales:</strong> ${formatCurrency(entry.total)}</p>
          <p><strong>Top Item:</strong> ${topLabel(entry.itemsCount)}</p>
          <p><strong>Top Category:</strong> ${topLabel(entry.categoryCount)}</p>
        </article>
      `;
    })
    .join("");
}

renderReports();
