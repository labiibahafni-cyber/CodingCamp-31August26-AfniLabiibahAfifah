const form = document.getElementById("expenseForm");
const itemName = document.getElementById("itemName");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const transactionList = document.getElementById("transactionList");
const totalBalance = document.getElementById("totalBalance");
const transactionCount = document.getElementById("transactionCount");
const message = document.getElementById("message");
const sortSelect = document.getElementById("sortSelect");
const themeToggle = document.getElementById("themeToggle");

let transactions = JSON.parse(localStorage.getItem("expenseTransactions") || "[]");
let darkMode = localStorage.getItem("expenseDarkMode") === "true";
let chart;

const money = value => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(value);

function saveData() {
  localStorage.setItem("expenseTransactions", JSON.stringify(transactions));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function getSortedTransactions() {
  const data = [...transactions];

  if (sortSelect.value === "amount")
    return data.sort((a, b) => b.amount - a.amount);

  if (sortSelect.value === "category")
    return data.sort((a, b) => a.category.localeCompare(b.category));

  return data.sort((a, b) => b.createdAt - a.createdAt);
}

function renderTransactions() {
  transactionList.innerHTML = "";
  const data = getSortedTransactions();

  if (!data.length) {
    transactionList.innerHTML =
      '<div class="empty">🧾<br><br>Belum ada transaksi.<br>Tambahkan pengeluaran pertamamu.</div>';
  } else {
    data.forEach(item => {
      const el = document.createElement("div");
      el.className = "transaction";

      el.innerHTML = `
        <div class="transaction-info">
          <span class="category-dot"></span>
          <div>
            <div class="transaction-name">${escapeHTML(item.name)}</div>
            <div class="transaction-category">
              ${item.category} • ${new Date(item.createdAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>

        <div class="transaction-right">
          <span class="transaction-amount">${money(item.amount)}</span>
          <button class="delete-btn" data-id="${item.id}">✕</button>
        </div>
      `;

      const dot = el.querySelector(".category-dot");

      dot.style.background =
        item.category === "Food" ? "#f59e0b" :
        item.category === "Transport" ? "#3b82f6" :
        "#ec4899";

      transactionList.appendChild(el);
    });
  }

  transactionList.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () =>
      deleteTransaction(Number(btn.dataset.id))
    );
  });

  transactionCount.textContent =
    `${transactions.length} item${transactions.length === 1 ? "" : "s"}`;
}

function updateSummary() {
  const totals = {
    Food: 0,
    Transport: 0,
    Fun: 0
  };

  transactions.forEach(item => {
    totals[item.category] += item.amount;
  });

  totalBalance.textContent =
    money(Object.values(totals).reduce((a, b) => a + b, 0));

  document.getElementById("summaryItems").textContent = transactions.length;
  document.getElementById("summaryFood").textContent = money(totals.Food);
  document.getElementById("summaryTransport").textContent = money(totals.Transport);
  document.getElementById("summaryFun").textContent = money(totals.Fun);
}

function updateChart() {
  const totals = {
    Food: 0,
    Transport: 0,
    Fun: 0
  };

  transactions.forEach(item => {
    totals[item.category] += item.amount;
  });

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: ["Food", "Transport", "Fun"],
      datasets: [{
        data: [
          totals.Food,
          totals.Transport,
          totals.Fun
        ],
        backgroundColor: [
          "#f59e0b",
          "#3b82f6",
          "#ec4899"
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  saveData();
  render();
}

function render() {
  renderTransactions();
  updateSummary();
  updateChart();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = itemName.value.trim();
  const value = Number(amount.value);
  const selectedCategory = category.value;

  if (!name || !value || value < 1 || !selectedCategory) {
    message.textContent = "Semua field wajib diisi dengan benar.";
    return;
  }

  transactions.push({
    id: Date.now(),
    name,
    amount: value,
    category: selectedCategory,
    createdAt: Date.now()
  });

  saveData();
  form.reset();

  message.textContent = "Transaksi berhasil ditambahkan.";

  render();

  setTimeout(() => {
    message.textContent = "";
  }, 1800);
});

sortSelect.addEventListener("change", renderTransactions);

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;

  document.body.classList.toggle("dark", darkMode);

  localStorage.setItem(
    "expenseDarkMode",
    String(darkMode)
  );

  themeToggle.textContent = darkMode ? "☀" : "☾";
});

document.body.classList.toggle("dark", darkMode);

themeToggle.textContent = darkMode ? "☀" : "☾";

render();
