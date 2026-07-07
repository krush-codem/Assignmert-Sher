let currSessUser = localStorage.getItem("ft_sess_email") || null;
let transactions = [];
let config = { name: "User", currency: "USD", darkMode: false };
let currFFil = "all";
let chatIns = null;

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

document.addEventListener("DOMContentLoaded", () => {
  if (currSessUser) {
    startUserArea();
  } else {
    document.querySelector("#auth-overlay").style.display = "flex";
  }
  document.querySelector("#tx-date").valueAsDate = new Date();
});

function togAuth(showRegister) {
  document.querySelector("#register-box").style.display = showRegister
    ? "block"
    : "none";
  document.querySelector("#login-box").style.display = showRegister
    ? "none"
    : "block";
}

function handleRegis(e) {
  e.preventDefault();
  const name = document.querySelector("#reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const password = document.querySelector("#reg-password").value;

  let users = JSON.parse(localStorage.getItem("ft_resgister_user")) || {};

  if (users[email]) {
    alert("An account with this email already exists.");
    return;
  }

  // Save account meta details
  users[email] = {
    name,
    password,
    config: { name, currency: "USD", darkMode: false },
  };
  localStorage.setItem("ft_resgister_user", JSON.stringify(users));

  alert("Registration successful! Logging into your dashboard.");
  startUserSession(email);
  e.target.reset();
}

// --- LOGIN HANDLER ---
function handleLogin(e) {
  e.preventDefault();
  const email = document
    .getElementById("login-email")
    .value.trim()
    .toLowerCase();
  const password = document.querySelector("#login-password").value;

  let users = JSON.parse(localStorage.getItem("ft_resgister_user")) || {};

  if (!users[email] || users[email].password !== password) {
    alert("Invalid email validation or incorrect password parameters.");
    return;
  }

  startUserSession(email);
  e.target.reset();
}

function startUserSession(email) {
  localStorage.setItem("ft_sess_email", email);
  currSessUser = email;
  startUserArea();
}

function handleLogout() {
  localStorage.removeItem("ft_sess_email");
  currSessUser = null;
  if (chatIns) chatIns.destroy();
  document.querySelector("#auth-overlay").style.display = "flex";
  showPage("dashboard");
}

function startUserArea() {
  document.querySelector("#auth-overlay").style.display = "none";

  let users = JSON.parse(localStorage.getItem("ft_resgister_user")) || {};
  let userMeta = users[currSessUser];

  config = userMeta.config || {
    name: userMeta.name,
    currency: "USD",
    darkMode: false,
  };
  transactions =
    JSON.parse(
      localStorage.getItem(`fintrack_user_${currSessUser}_transactions`),
    ) || [];

  applyTheme();
  allRefresh();
}

function applyTheme() {
  if (config.darkMode) {
    document.body.classList.add("dark");
    document.querySelector("#settings-darkmode").checked = true;
  } else {
    document.body.classList.remove("dark");
    document.querySelector("#settings-darkmode").checked = false;
  }
  document.querySelector("#settings-name").value = config.name;
  document.querySelector("#settings-currency").value = config.currency;
  document.querySelector("#welcome-msg").innerText = `Hello, ${config.name}!`;
}

function showPage(pageId) {
  document
    .querySelectorAll(".page-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-links a")
    .forEach((l) => l.classList.remove("active"));
  document.getElementById(`${pageId}-section`).classList.add("active");
  document.getElementById(`nav-${pageId}`).classList.add("active");
}

function allRefresh() {
  calAndRender();
  renderTable();
  renderChart();
}

function calAndRender() {
  let incomeTotal = 0,
    expenseTotal = 0;
  transactions.forEach((t) => {
    if (t.type === "income") incomeTotal += t.amount;
    else expenseTotal += t.amount;
  });
  const netBalance = incomeTotal - expenseTotal;
  const sym = currencySymbols[config.currency] || "$";

  document.querySelector("#total-balance").innerText =
    `${netBalance < 0 ? "-" : ""}${sym}${Math.abs(netBalance).toFixed(2)}`;
  document.querySelector("#total-income").innerText =
    `${sym}${incomeTotal.toFixed(2)}`;
  document.querySelector("#total-expense").innerText =
    `${sym}${expenseTotal.toFixed(2)}`;
  document.querySelector("#total-count").innerText = transactions.length;
}

function renderTable() {
  const tbody = document.querySelector("#transaction-rows");
  tbody.innerHTML = "";
  let filtered = transactions;
  if (currFFil === "income")
    filtered = transactions.filter((t) => t.type === "income");
  if (currFFil === "expense")
    filtered = transactions.filter((t) => t.type === "expense");

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No entries recorded.</td></tr>`;
    return;
  }

  const sym = currencySymbols[config.currency] || "$";
  filtered.forEach((t) => {
    const r = document.createElement("tr");
    r.innerHTML = `
            <td>${formatDate(t.date)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td><span style="background:rgba(0,0,0,0.05); padding:2px 8px; border-radius:4px; font-size:0.8rem;">${t.category}</span></td>
            <td class="${t.type === "income" ? "td-income" : "td-expense"}">${t.type === "income" ? "+" : "-"}${sym}${t.amount.toFixed(2)}</td>
            <td><button class="delete-action" onclick="deleteTrans(${t.id})">Delete</button></td>
        `;
    tbody.appendChild(r);
  });
}

function renderChart() {
  const ctx = document.querySelector("#cashFlowChart").getContext("2d");
  const trackingMap = {};
  transactions.forEach((t) => {
    if (!trackingMap[t.date]) trackingMap[t.date] = { income: 0, expense: 0 };
    trackingMap[t.date][t.type] += t.amount;
  });

  const sortedDates = Object.keys(trackingMap).sort(
    (a, b) => new Date(a) - new Date(b),
  );
  const incomeData = [],
    expenseData = [],
    labels = sortedDates.map((d) => formatDate(d));

  sortedDates.forEach((d) => {
    incomeData.push(trackingMap[d].income);
    expenseData.push(trackingMap[d].expense);
  });

  if (chatIns) chatIns.destroy();

  const style = getComputedStyle(document.body);
  chatIns = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: style.getPropertyValue("--income").trim(),
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: style.getPropertyValue("--expense").trim(),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: style.getPropertyValue("--text-main").trim() },
        },
        y: {
          ticks: { color: style.getPropertyValue("--text-main").trim() },
        },
      },
      plugins: {
        legend: {
          labels: { color: style.getPropertyValue("--text-main").trim() },
        },
      },
    },
  });
}

function setFilter(type, el) {
  currFFil = type;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  el.add("active"); // Added to fix the active class application bug in previous version
  el.classList.add("active");
  renderTable();
}

function formHandle(e) {
  e.preventDefault();
  const type = document.querySelector('input[name="tx-type"]:checked').value;
  const description = document.querySelector("#tx-desc").value.trim();
  const amount = parseFloat(document.querySelector("#tx-amount").value);
  const date = document.querySelector("#tx-date").value;
  const category = document.querySelector("#tx-category").value;

  transactions.push({
    id: Date.now(),
    type,
    description,
    amount,
    date,
    category,
  });
  localStorage.setItem(
    `fintrack_user_${currSessUser}_transactions`,
    JSON.stringify(transactions),
  );

  document.querySelector("#transaction-form").reset();
  document.querySelector("#tx-date").valueAsDate = new Date();
  closeModal();
  allRefresh();
}

function deleteTrans(id) {
  transactions = transactions.filter((t) => t.id !== id);
  localStorage.setItem(
    `fintrack_user_${currSessUser}_transactions`,
    JSON.stringify(transactions),
  );
  allRefresh();
}

function saveSettings() {
  config.name = document.querySelector("#settings-name").value.trim() || "User";
  config.currency = document.querySelector("#settings-currency").value;
  config.darkMode = document.querySelector("#settings-darkmode").checked;

  let users = JSON.parse(localStorage.getItem("ft_resgister_user")) || {};
  users[currSessUser].config = config;
  users[currSessUser].name = config.name;

  localStorage.setItem("ft_resgister_user", JSON.stringify(users));
  applyTheme();
  allRefresh();
  alert("Settings configured successfully!");
}

function resetAllData() {
  if (confirm("Wipe historical financial workspace files for this account?")) {
    transactions = [];
    localStorage.removeItem(`fintrack_user_${currSessUser}_transactions`);
    allRefresh();
  }
}

function openModal() {
  document.querySelector("#transaction-modal").classList.add("open");
}
function closeModal() {
  document.querySelector("#transaction-modal").classList.remove("open");
}
function handleOverlayClick(e) {
  if (e.target.id === "transaction-modal") closeModal();
}

function formatDate(dateString) {
  const dateParts = dateString.split("-");
  if (dateParts.length === 3) {
    return new Date(
      dateParts[0],
      dateParts[1] - 1,
      dateParts[2],
    ).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return dateString;
}
