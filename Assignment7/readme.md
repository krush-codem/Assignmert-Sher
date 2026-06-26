const todoInput = document.getElementById("todo-input");
const categoryInput = document.getElementById("category-input");
const filterCategory = document.getElementById("filter-category");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const themeToggle = document.getElementById("theme-toggle");

let todos = JSON.parse(localStorage.getItem("todos-cat")) || [];
let editId = null;

// CREATE / UPDATE
function handleTodoSubmit() {
const taskText = todoInput.value.trim();
const taskCategory = categoryInput.value;
if (taskText === "") return;

if (editId !== null) {
// UPDATE
todos = todos.map((todo) =>
todo.id === editId
? { ...todo, text: taskText, category: taskCategory }
: todo,
);
addBtn.innerText = "Add";
editId = null;
} else {
// CREATE
const newTodo = {
id: Date.now(),
text: taskText,
category: taskCategory,
completed: false,
};
todos.push(newTodo);
}

todoInput.value = "";
categoryInput.value = "General"; // Reset to default option
saveToLocalStorage();
renderTodos();
}

// READ (Load data for editing)
function startEdit(id) {
const todoToEdit = todos.find((todo) => todo.id === id);
if (todoToEdit) {
todoInput.value = todoToEdit.text;
categoryInput.value = todoToEdit.category;
todoInput.focus();
addBtn.innerText = "Update";
editId = id;
}
}

// TOGGLE COMPLETE
function toggleComplete(id) {
todos = todos.map((todo) =>
todo.id === id ? { ...todo, completed: !todo.completed } : todo,
);
saveToLocalStorage();
renderTodos();
}

// DELETE
function deleteTodo(id) {
todos = todos.filter((todo) => todo.id !== id);
if (editId === id) {
todoInput.value = "";
addBtn.innerText = "Add";
editId = null;
}
saveToLocalStorage();
renderTodos();
}

// --- EVENT LISTENERS ---
addBtn.addEventListener("click", handleTodoSubmit);
todoInput.addEventListener("keypress", (e) => {
if (e.key === "Enter") handleTodoSubmit();
});
filterCategory.addEventListener("change", renderTodos);

// Initial Paint
renderTodos();

// --- CRUD & FILTER RENDER ---
function saveToLocalStorage() {
localStorage.setItem("todos-cat", JSON.stringify(todos));
}

function renderTodos() {
todoList.innerHTML = "";
const activeFilter = filterCategory.value;

todos.forEach((todo) => {
// Skip rendering if it doesn't match the selected filter category
if (activeFilter !== "All" && todo.category !== activeFilter) return;

    const li = document.createElement("li");
    if (todo.completed) li.classList.add("completed");

    li.innerHTML = `
                    <div class="todo-content" onclick="toggleComplete(${todo.id})">
                        <span class="todo-text">${todo.text}</span>
                        <span class="category-badge">${todo.category}</span>
                    </div>
                    <div class="actions">
                        <button class="edit-btn" onclick="startEdit(${todo.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                    </div>
                `;
    todoList.appendChild(li);

});
}

// theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.innerText = savedTheme === "dark" ? "☀️ Light" : "🌙 Dark";

themeToggle.addEventListener("click", () => {
const currentTheme = document.documentElement.getAttribute("data-theme");
const newTheme = currentTheme === "dark" ? "light" : "dark";
document.documentElement.setAttribute("data-theme", newTheme);
localStorage.setItem("theme", newTheme);
themeToggle.innerText = newTheme === "dark" ? "☀️ Light" : "🌙 Dark";
});
