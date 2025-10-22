<template>
  <div class="projects-view">
    <header>
      <h2>Projects</h2>
      <p class="subtitle">Active projects and budgets</p>
    </header>

    <div class="currency-selector">
      <label for="currency-select">Display Currency:</label>
      <select
        v-model="selectedCurrency"
        id="currency-select"
        class="category-select"
      >
        <option value="USD">USD ($)</option>
        <option value="GHS">GHS (₵)</option>
      </select>
    </div>

    <section>
      <form class="project-form" @submit.prevent="addProject">
        <input v-model="projectForm.name" placeholder="Project name" required />
        <input v-model="projectForm.owner" placeholder="Owner" />
        <select v-model="projectForm.category" class="category-select">
          <option value="Project-based">Project-based</option>
          <option value="Opex">Opex</option>
          <option value="Capex">Capex</option>
        </select>
        <input
          v-model.number="projectForm.budget"
          placeholder="Budget"
          type="number"
          min="0"
        />
        <button type="submit" class="btn add">Add project</button>
      </form>

      <div v-for="cat in categoriesOrder" :key="cat" class="category-section">
        <h3 class="category-title">{{ cat }}</h3>
        <ul v-if="projectsByCategory[cat] && projectsByCategory[cat].length">
          <li
            v-for="p in projectsByCategory[cat]"
            :key="p.id"
            class="project-row"
          >
            <div class="project-meta">
              <strong class="project-name">{{ p.name }}</strong>
              <div class="project-sub">{{ p.owner || "—" }}</div>
            </div>
            <div class="project-actions">
              <div class="project-budget">{{ formatCurrency(p.budget) }}</div>
              <button
                class="btn danger"
                @click="deleteProject(p.id)"
                aria-label="Delete project"
              >
                Delete
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="empty">No projects in this category</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";

const STORAGE_KEY = "projects_v1";

// --- New State for Currency Selection ---
const selectedCurrency = ref("USD"); // Default currency

// projects stored with numeric budgets
const projects = ref([]);

const projectForm = reactive({
  name: "",
  owner: "",
  budget: null,
  category: "Project-based",
});

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value));
  } catch (e) {
    console.warn("failed to save projects", e);
  }
}

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      projects.value = JSON.parse(raw);
    } else {
      // default seed (converted to numbers)
      projects.value = [
        {
          id: 1,
          name: "Website Revamp",
          owner: "Alice",
          budget: 50000,
          category: "Project-based",
        },
        {
          id: 2,
          name: "Mobile App",
          owner: "Dev Team",
          budget: 200000,
          category: "Project-based",
        },
        {
          id: 3,
          name: "Office Upgrade",
          owner: "Operations",
          budget: 150000,
          category: "Capex",
        },
        {
          id: 4,
          name: "Cloud Hosting",
          owner: "IT",
          budget: 30000,
          category: "Opex",
        },
      ];
      saveProjects();
    }
  } catch (e) {
    projects.value = [];
  }
}

function nextId() {
  const ids = projects.value.map((p) => p.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function addProject() {
  if (!projectForm.name) return;
  const payload = {
    id: nextId(),
    name: projectForm.name.trim(),
    owner: projectForm.owner.trim(),
    budget: Number(projectForm.budget) || 0,
    category: projectForm.category || "Project-based",
  };
  projects.value.unshift(payload);
  saveProjects();
  projectForm.name = "";
  projectForm.owner = "";
  projectForm.budget = null;
  projectForm.category = "Project-based";
}

function deleteProject(id) {
  projects.value = projects.value.filter((p) => p.id !== id);
  saveProjects();
}

onMounted(loadProjects);

// --- Modified Currency Formatting ---
// Use a computed property to dynamically create the formatter based on selectedCurrency
const currencyFormatter = computed(() => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedCurrency.value, // Now reactive!
  });
});

function formatCurrency(n) {
  return currencyFormatter.value.format(Number(n || 0));
}

// category ordering and grouping
const categoriesOrder = ["Project-based", "Opex", "Capex"];
const projectsByCategory = computed(() => {
  const map = {};
  for (const c of categoriesOrder) map[c] = [];
  for (const p of projects.value) {
    const cat = p.category || "Project-based";
    if (!map[cat]) map[cat] = [];
    map[cat].push(p);
  }
  return map;
});
</script>

<style scoped>
/* Keep all existing styles */
.projects-view {
  padding: 20px;
  font-family: Inter, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 12px;
}
ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
li {
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
}

/* new: project form and row styles */
.project-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}
.project-form input,
.project-form select {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.btn.add {
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.project-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.project-meta {
  display: flex;
  flex-direction: column;
}
.project-name {
  font-size: 1rem;
}
.project-sub {
  color: #6b7280;
  font-size: 0.85rem;
}
.project-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.project-budget {
  font-weight: 600;
  color: #111827;
}

.btn.danger {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.category-section {
  margin-bottom: 16px;
}
.category-title {
  margin: 8px 0;
  font-size: 1.03rem;
  color: #111827;
}
.category-select {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

/* new: currency selector style */
.currency-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f7f7f7;
  border-radius: 6px;
}
</style>
