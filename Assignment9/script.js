const dbord = document.querySelector("#dashboard");
const fpage = document.querySelector("#featurePage");
const back = document.querySelector("#backBtn");

const cards = document.querySelectorAll(".dashboard-card");
const feature = document.querySelectorAll(".feature");

function hideFeature() {
  feature.forEach((feature) => {
    feature.classList.remove("active");
  });
}

function openFea(id) {
  dbord.style.display = "none";
  fpage.style.display = "block";

  hideFeature();
  document.getElementById(id).classList.add("active");
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const page = card.dataset.page;
    openFea(page);
  });
});

back.addEventListener("click", () => {
  fpage.style.display = "none";
  dbord.style.display = "block";
});

//Date

const dateEle = document.querySelector("#currentDate");
const timeEle = document.querySelector("#currentTime");

function upDateTi() {
  const now = new Date();

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  dateEle.textContent = now.toLocaleDateString("en-US", dateOptions);
  timeEle.textContent = now.toLocaleTimeString("en-US", timeOptions);
}

upDateTi();
setInterval(upDateTi, 1000);

// Theme

const themeTog = document.querySelector("#themeToggle");

function loadTh() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeTog.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
}

loadTh();

themeTog.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeTog.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    localStorage.setItem("theme", "light");
    themeTog.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});

function upBack() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    document.body.style.background = "linear-gradient(135deg,#60A5FA,#38BDF8)";
  } else if (hour >= 12 && hour < 17) {
    document.body.style.background = "linear-gradient(135deg,#34D399,#10B981)";
  } else if (hour >= 17 && hour < 21) {
    document.body.style.background = "linear-gradient(135deg,#F97316,#FB7185)";
  } else {
    document.body.style.background = "linear-gradient(135deg,#4F46E5,#1E293B)";
  }
}

upBack();
setInterval(upBack, 60000);

// TODO LIST

const todoIn = document.querySelector("#todoInput");
const todoBtn = document.querySelector("#addTodo");
const todoLi = document.querySelector("#todoList");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function renderList() {
  todoLi.innerHTML = "";

  if (todos.length === 0) {
    todoLi.innerHTML = `<p class="empty-message">No tasks added yet.</p>`;
    uplist();
    return;
  }

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    if (todo.completed) li.classList.add("completed");
    if (todo.important) li.classList.add("important");

    li.innerHTML = `
      <div class="todo-text">${todo.text}</div>
      <div class="todo-actions">
        <button class="important-btn" title="Mark important">⭐</button>
        <button class="complete-btn" title="Mark complete">✔</button>
        <button class="delete-btn" title="Delete">🗑</button>
      </div>
    `;

    li.querySelector(".important-btn").addEventListener("click", () => {
      todos[index].important = !todos[index].important;
      saveTodos();
      renderList();
    });

    li.querySelector(".complete-btn").addEventListener("click", () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderList();
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos();
      renderList();
    });

    todoLi.appendChild(li);
  });

  uplist();
}

function addTodo() {
  const text = todoIn.value.trim();

  if (text === "") {
    alert("Please enter a task.");
    return;
  }

  todos.push({
    text: text,
    completed: false,
    important: false,
  });

  todoIn.value = "";
  saveTodos();
  renderList();
}

todoBtn.addEventListener("click", addTodo);

todoIn.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTodo();
  }
});

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function uplist() {
  let completed = todos.filter((todo) => todo.completed).length;
  let pending = todos.length - completed;
  console.log(`Completed: ${completed} | Pending: ${pending}`);
}

renderList();

//Plan

const plannerInputs = document.querySelectorAll(".planner-input");

function loadPlanner() {
  plannerInputs.forEach((input) => {
    const key = input.dataset.time;
    const savedText = localStorage.getItem("planner-" + key);

    if (savedText) {
      input.value = savedText;
    }
  });
}

function savePlanner(input) {
  const key = input.dataset.time;
  localStorage.setItem("planner-" + key, input.value);
}

plannerInputs.forEach((input) => {
  input.addEventListener("input", () => {
    savePlanner(input);
  });
});

function convert24(timeString) {
  const [time, modifier] = timeString.split(" ");
  let [hours] = time.split(":");
  hours = parseInt(hours);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return hours;
}

function highlightHoour() {
  const currentHour = new Date().getHours();

  plannerInputs.forEach((input) => {
    const plannerHour = convert24(input.dataset.time);
    const row = input.parentElement;

    if (plannerHour === currentHour) {
      row.classList.add("current-hour");
    } else {
      row.classList.remove("current-hour");
    }
  });
}

highlightHoour();
setInterval(highlightHoour, 60000);

function clear() {
  if (!confirm("Clear today's planner?")) {
    return;
  }

  plannerInputs.forEach((input) => {
    input.value = "";
    localStorage.removeItem("planner-" + input.dataset.time);
  });
}

const plan = document.querySelector("#planner");
const clPlnBtn = document.createElement("button");

clPlnBtn.textContent = "Clear Planner";
clPlnBtn.className = "clear-planner-btn";
plan.appendChild(clPlnBtn);

clPlnBtn.addEventListener("click", clear);

loadPlanner();

// Timer

const timerDisplay = document.querySelector("#timerDisplay");
const startBtn = document.querySelector("#startTimer");
const pauseBtn = document.querySelector("#pauseTimer");
const resetBtn = document.querySelector("#resetTimer");

const timerBox = document.querySelector(".timer-box");

const sessionLabel = document.createElement("h3");
sessionLabel.textContent = "🍅 Work Session";
timerBox.insertBefore(sessionLabel, timerDisplay);

const progressContainer = document.createElement("div");
progressContainer.className = "progress-container";

const progressBar = document.createElement("div");
progressBar.className = "progress-bar";

progressContainer.appendChild(progressBar);
timerBox.insertBefore(progressContainer, timerDisplay.nextSibling);

const sessionCounter = document.createElement("p");
sessionCounter.className = "session-counter";
sessionCounter.textContent = "Completed Sessions : 0";
timerBox.appendChild(sessionCounter);

let WORK_TIME = 25 * 60;
let BREAK_TIME = 5 * 60;
let timer = WORK_TIME;
let interval = null;
let workMode = true;
let sessions = 0;

function updateTimerDisplay() {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const total = workMode ? WORK_TIME : BREAK_TIME;
  const progress = ((total - timer) / total) * 100;

  progressBar.style.width = progress + "%";
}

function startPomodoro() {
  if (interval) return;

  interval = setInterval(() => {
    timer--;
    updateTimerDisplay();

    if (timer <= 0) {
      clearInterval(interval);
      interval = null;

      if (workMode) {
        sessions++;
        sessionCounter.textContent = `Completed Sessions : ${sessions}`;
        alert("🎉 Work Session Complete!\nTake a 5 minute break.");

        workMode = false;
        timer = BREAK_TIME;
        sessionLabel.textContent = "☕ Break Session";
      } else {
        alert("Break Finished!\nBack to work.");

        workMode = true;
        timer = WORK_TIME;
        sessionLabel.textContent = "🍅 Work Session";
      }

      updateTimerDisplay();
    }
  }, 1000);
}

function pausePomodoro() {
  clearInterval(interval);
  interval = null;
}

function resetPomodoro() {
  clearInterval(interval);
  interval = null;

  workMode = true;
  timer = WORK_TIME;
  sessionLabel.textContent = "🍅 Work Session";

  updateTimerDisplay();
}

startBtn.addEventListener("click", startPomodoro);
pauseBtn.addEventListener("click", pausePomodoro);
resetBtn.addEventListener("click", resetPomodoro);

updateTimerDisplay();

// Weather

const cityName = document.querySelector("#cityName");
const temperature = document.querySelector("#temperature");
const weatherCondition = document.querySelector("#weatherCondition");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#windSpeed");

const CITY = "Bhubaneswar"; // just change this to your city name

async function loadWeather() {
  cityName.textContent = CITY;
  weatherCondition.textContent = "Loading...";

  try {
    const response = await fetch(`https://wttr.in/${CITY}?format=j1`);
    const data = await response.json();
    const current = data.current_condition[0];

    temperature.textContent = current.temp_C + "°C";
    weatherCondition.textContent = current.weatherDesc[0].value;
    humidity.textContent = current.humidity + "%";
    windSpeed.textContent = current.windspeedKmph + " km/h";
  } catch (error) {
    weatherCondition.textContent = "Unable to load weather.";
    temperature.textContent = "--";
    humidity.textContent = "--";
    windSpeed.textContent = "--";
  }
}

loadWeather();

// Quotes

const quote = document.querySelector("#quote");
const author = document.querySelector("#author");
const newQuoteBtn = document.querySelector("#newQuote");

async function getQuote() {
  quote.textContent = "Loading...";
  author.textContent = "";

  try {
    const response = await fetch("https://dummyjson.com/quotes/random");
    const data = await response.json();

    quote.textContent = `"${data.quote}"`;
    author.textContent = "- " + data.author;
  } catch {
    quote.textContent = "Couldn't load quote.";
    author.textContent = "";
  }
}

newQuoteBtn.addEventListener("click", getQuote);
getQuote();

// Goals

const goalInput = document.querySelector("#goalInput");
const addGoalBtn = document.querySelector("#addGoal");
const goalList = document.querySelector("#goalList");
const goalProgress = document.querySelector("#goalProgress");

let goals = JSON.parse(localStorage.getItem("goals")) || [];

function renderGoals() {
  goalList.innerHTML = "";

  if (goals.length === 0) {
    goalList.innerHTML = `<p class="empty-message">No goals added yet.</p>`;
    updateGoalProgress();
    return;
  }

  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.className = "goal-item";

    if (goal.completed) li.classList.add("completed");

    li.innerHTML = `
      <span class="goal-text">${goal.text}</span>
      <div class="goal-actions">
        <button class="goal-complete-btn">${goal.completed ? "Undo" : "Done"}</button>
        <button class="goal-delete-btn">🗑</button>
      </div>
    `;

    li.querySelector(".goal-complete-btn").addEventListener("click", () => {
      goals[index].completed = !goals[index].completed;
      saveGoals();
      renderGoals();
    });

    li.querySelector(".goal-delete-btn").addEventListener("click", () => {
      goals.splice(index, 1);
      saveGoals();
      renderGoals();
    });

    goalList.appendChild(li);
  });

  updateGoalProgress();
}

function addGoal() {
  const text = goalInput.value.trim();

  if (text === "") {
    alert("Please enter a goal.");
    return;
  }

  goals.push({
    text: text,
    completed: false,
  });

  goalInput.value = "";
  saveGoals();
  renderGoals();
}

addGoalBtn.addEventListener("click", addGoal);

goalInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addGoal();
  }
});

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function updateGoalProgress() {
  const completed = goals.filter((g) => g.completed).length;
  goalProgress.textContent = `${completed} / ${goals.length} Completed`;
}

renderGoals();
