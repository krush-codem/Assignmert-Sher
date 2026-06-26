const toIn = document.querySelector("#todo-input");
const category = document.querySelector("#category-input");
const adBtn = document.querySelector("#add-btn");

const todoLi = document.querySelector("#todo-list");

let todo = JSON.parse(localStorage.getItem("my-todo")) || [];
let edId = null;

const theme = document.querySelector("#theme-toggle");
const savTheme = localStorage.getItem("todo-theme") || "light";
document.documentElement.setAttribute("todo-theme", savTheme);

theme.innerText = savTheme === "dark" ? "Light" : "Dark";

const cardUi = () => {
  todoLi.innerHTML = ``;
  todo.forEach((elem) => {
    const li = document.createElement("li");

    if (elem.done) {
      li.classList.add("completedd");
    }

    li.innerHTML = `
            <div class="todo-content" onclick="togDone(${elem.id})">
                <span class="todo-text">${elem.task}</span>
                <span class="category-badge">${elem.tCat}</span>
            </div>
            <div class="actions">
            <button class="edit-btn" onclick="edit(${elem.id})">Edit</button>
                <button class="delete-btn" onclick="del(${elem.id})">Delete</button>
            </div>
        `;

    todoLi.appendChild(li);
  });
};

adBtn.addEventListener("click", () => {
  const task = toIn.value;
  const tCat = category.value;

  if (task.trim() === "") {
    alert("give a task.");
    return;
  }

  if (edId !== null) {
    todo = todo.map((elem) => {
      if (elem.id === edId) {
        return { ...elem, task, tCat };
      }
      return elem;
    });
    adBtn.innerText = "Add";
    edId = null;
  } else {
    const newTodo = {
      id: Date.now(),
      task,
      tCat,
      done: false,
    };

    todo.push(newTodo);
  }

  toIn.value = "";
  localStorage.setItem("my-todo", JSON.stringify(todo));
  cardUi();
});

const togDone = (id) => {
  todo = todo.map((elem) => {
    if (elem.id === id) {
      return { ...elem, done: !elem.done };
    }
    return elem;
  });
  localStorage.setItem("my-todo", JSON.stringify(todo));
  cardUi();
};

const del = (id) => {
  todo = todo.filter((elem) => elem.id !== id);

  localStorage.setItem("my-todo", JSON.stringify(todo));
  cardUi();
};

const edit = (id) => {
  const toEdit = todo.find((elem) => elem.id === id);

  if (toEdit) {
    toIn.value = toEdit.task;
    category.value = toEdit.tCat;

    adBtn.innerText = "Update";
    edId = id;
  }
};

theme.addEventListener("click", () => {
  const curr = document.documentElement.getAttribute("data-theme");

  const newTh = curr === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTh);

  localStorage.setItem("todo-theme", newTh);

  theme.innerHTML = newTh === "dark" ? "light" : "dark";
});

cardUi();
