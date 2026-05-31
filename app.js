const storageKey = "platelog-foods";
const goalKey = "platelog-goal";

const form = document.querySelector("#foodForm");
const foodNameInput = document.querySelector("#foodName");
const caloriesInput = document.querySelector("#calories");
const mealTypeInput = document.querySelector("#mealType");
const foodDateInput = document.querySelector("#foodDate");
const dailyGoalInput = document.querySelector("#dailyGoal");
const todayCaloriesEl = document.querySelector("#todayCalories");
const remainingCaloriesEl = document.querySelector("#remainingCalories");
const progressLabelEl = document.querySelector("#progressLabel");
const progressBarEl = document.querySelector("#progressBar");
const mealCountEl = document.querySelector("#mealCount");
const foodListEl = document.querySelector("#foodList");
const emptyStateEl = document.querySelector("#emptyState");
const filterButtons = document.querySelectorAll(".filter-button");

let foods = JSON.parse(localStorage.getItem(storageKey) || "[]");
let activeFilter = "today";

const today = () => new Date().toISOString().slice(0, 10);

const saveFoods = () => {
  localStorage.setItem(storageKey, JSON.stringify(foods));
};

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
};

const visibleFoods = () => {
  if (activeFilter === "all") {
    return [...foods].sort((a, b) => b.createdAt - a.createdAt);
  }

  return foods
    .filter((food) => food.date === today())
    .sort((a, b) => b.createdAt - a.createdAt);
};

const updateStats = () => {
  const goal = Number(dailyGoalInput.value) || 0;
  const todaysFoods = foods.filter((food) => food.date === today());
  const todaysCalories = todaysFoods.reduce((sum, food) => sum + food.calories, 0);
  const remaining = goal - todaysCalories;
  const progress = goal > 0 ? Math.min((todaysCalories / goal) * 100, 100) : 0;

  todayCaloriesEl.textContent = todaysCalories.toLocaleString();
  remainingCaloriesEl.textContent = remaining.toLocaleString();
  remainingCaloriesEl.style.color = remaining < 0 ? "var(--tomato)" : "inherit";
  progressLabelEl.textContent = `${Math.round(progress)}% of goal`;
  progressBarEl.style.width = `${progress}%`;
  mealCountEl.textContent = `${todaysFoods.length} ${todaysFoods.length === 1 ? "food" : "foods"}`;
};

const renderFoods = () => {
  const items = visibleFoods();
  foodListEl.innerHTML = "";
  emptyStateEl.classList.toggle("visible", items.length === 0);

  items.forEach((food) => {
    const item = document.createElement("li");
    item.className = "food-item";
    item.innerHTML = `
      <div>
        <span class="food-name"></span>
        <span class="food-meta"></span>
      </div>
      <span class="meal-pill"></span>
      <span class="calorie-value"></span>
      <button class="delete-button" type="button" aria-label="Delete ${food.name}">x</button>
    `;

    item.querySelector(".food-name").textContent = food.name;
    item.querySelector(".food-meta").textContent = `${formatDate(food.date)} • ${food.meal}`;
    item.querySelector(".meal-pill").textContent = food.meal;
    item.querySelector(".calorie-value").textContent = `${food.calories.toLocaleString()} cal`;
    item.querySelector(".delete-button").addEventListener("click", () => {
      foods = foods.filter((savedFood) => savedFood.id !== food.id);
      saveFoods();
      render();
    });

    foodListEl.appendChild(item);
  });
};

const render = () => {
  updateStats();
  renderFoods();
};

foodDateInput.value = today();
dailyGoalInput.value = localStorage.getItem(goalKey) || "2000";

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const food = {
    id: crypto.randomUUID(),
    name: foodNameInput.value.trim(),
    calories: Number(caloriesInput.value),
    meal: mealTypeInput.value,
    date: foodDateInput.value,
    createdAt: Date.now(),
  };

  if (!food.name || food.calories <= 0 || !food.date) {
    return;
  }

  foods = [food, ...foods];
  saveFoods();
  form.reset();
  foodDateInput.value = today();
  foodNameInput.focus();
  render();
});

dailyGoalInput.addEventListener("input", () => {
  localStorage.setItem(goalKey, dailyGoalInput.value);
  updateStats();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderFoods();
  });
});

render();
