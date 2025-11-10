<template>
  <div id="budgets-page" class="budgets-page">
    <header class="page-header">
      <div>
        <h1>Budgets</h1>
        <p class="subtitle">Overview and Allocations</p>
      </div>

      <div class="header-controls">
        <label for="currency-select">Currency:</label>
        <select
          v-model="selectedCurrency"
          id="currency-select"
          class="control-select"
        >
          <option value="USD">USD ($)</option>
          <option value="GHS">GHS (₵)</option>
        </select>

        <label for="page-size-select">Per page:</label>
        <select
          id="page-size-select"
          v-model.number="pageSize"
          class="control-select"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="0">All</option>
        </select>
      </div>
    </header>

    <div class="controls-bar">
      <div class="control-group">
        <label for="sortOrder">Sort by:</label>
        <select id="sortOrder" v-model="selectedSort" class="control-select">
          <option value="default">Default</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="allocated-desc">Allocated (High-Low)</option>
          <option value="allocated-asc">Allocated (Low-High)</option>
          <option value="used-desc">Used (High-Low)</option>
          <option value="remaining-desc">Remaining (High-Low)</option>
        </select>
      </div>
    </div>

    <section class="budgets-section">
      <div v-if="budgets.length > 0" class="budgets-list">
        <div
          v-for="b in pagedBudgets"
          :key="b.id"
          class="budget-item"
          :class="{ 'over-budget-card': b.used > b.allocated }"
        >
          <div class="item-header">
            <i class="fas fa-coins"></i>
            <h3 class="budget-name">{{ b.name }}</h3>
          </div>

          <div class="budget-inputs">
            <div class="input-group">
              <label :for="`alloc-${b.id}`">Allocated:</label>
              <input
                :id="`alloc-${b.id}`"
                v-model.number="b.allocated"
                type="number"
                min="0"
                class="allocated-input"
                @input="debouncedSave"
              />
            </div>
            <div class="input-group">
              <label :for="`paid-${b.id}`">Paid:</label>
              <input
                :id="`paid-${b.id}`"
                v-model.number="b.Paid"
                type="number"
                min="0"
                class="paid-input"
                @input="debouncedSave"
              />
            </div>
          </div>

          <div class="meta">
            <span class="allocated-display">
              {{ formatCurrency(b.allocated) }} allocated
            </span>
            <span class="used-display">{{ formatCurrency(b.used) }} used</span>
            <span
              class="remaining-display"
              :class="{ 'over-budget': b.used > b.allocated }"
            >
              Remaining: {{ formatCurrency(b.allocated - b.used) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          ◀ Prev
        </button>

        <button
          v-for="p in pagesToShow"
          :key="p"
          class="page-number"
          :class="{ active: p === currentPage }"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="page-btn"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next ▶
        </button>
      </div>

      <!-- <div v-else class="empty-state">
        <i class="fas fa-wallet"></i>
        <h2>No Budgets Found</h2>
        <p>Add or load projects to start managing your budgets.</p>
      </div> -->
    </section>

    <section v-if="budgets.length > 0" class="summary-section">
      </section>

    <transition name="fade">
      </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { useProjects } from "@/services/useProjects";

const projectStore = useProjectStore();
const STORAGE_KEY = "budgets_v2";

const selectedCurrency = ref("GHS");
const budgets = ref([]);
const showSaved = ref(false);

// --- NEW: Sort State ---
const selectedSort = ref("default");

// Pagination
const pageSize = ref(5);
const currentPage = ref(1);

// --- NEW: Computed for sorted budgets ---
const sortedBudgets = computed(() => {
  const budgetsToSort = [...budgets.value]; // Work on a copy
  switch (selectedSort.value) {
    case "name-asc":
      return budgetsToSort.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return budgetsToSort.sort((a, b) => b.name.localeCompare(a.name));
    case "allocated-desc":
      return budgetsToSort.sort((a, b) => b.allocated - a.allocated);
    case "allocated-asc":
      return budgetsToSort.sort((a, b) => a.allocated - b.allocated);
    case "used-desc":
      return budgetsToSort.sort((a, b) => b.used - a.used);
    case "remaining-desc":
      return budgetsToSort.sort(
        (a, b) => b.allocated - b.used - (a.allocated - a.used)
      );
    case "default":
    default:
      return budgetsToSort;
  }
});

// --- MODIFIED: Pagination now based on sortedBudgets ---
const totalPages = computed(() => {
  if (!pageSize.value || pageSize.value <= 0) return 1;
  return Math.max(1, Math.ceil(sortedBudgets.value.length / pageSize.value));
});

const pagedBudgets = computed(() => {
  if (!pageSize.value || pageSize.value <= 0) return sortedBudgets.value;
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedBudgets.value.slice(start, start + pageSize.value);
});

// Pages to show (simple range around current)
const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const range = [];
  const window = 3;
  const start = Math.max(1, current - window);
  const end = Math.min(total, current + window);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

function goToPage(p) {
  if (p < 1) p = 1;
  if (p > totalPages.value) p = totalPages.value;
  currentPage.value = p;
  const el = document.getElementById("budgets-page");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// --- MODIFIED: Watcher is now on sortedBudgets length ---
watch(sortedBudgets, () => {
  if (currentPage.value > totalPages.value)
    currentPage.value = totalPages.value;
});

watch(pageSize, () => {
  currentPage.value = 1;
});

// --- NEW: Watcher for sorting ---
watch(selectedSort, () => {
  currentPage.value = 1;
});

// --- (No changes to the functions below) ---

function loadBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);

    if (parsed?.length && projectStore.projects.length === parsed.length) {
      budgets.value = parsed.map((b) => ({
        ...b,
        allocated: Number(b.allocated) || 0,
        used: Number(b.used) || 0,
      }));
    } else {
      budgets.value = projectStore.projects;
      saveBudgets();
    }
  } catch (e) {
    console.error("Error loading budgets:", e);
  }
}

function saveBudgets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets.value));
    showToast();

    try {
      const { saveProject } = useProjects();
      budgets.value.forEach((b) => {
        const proj = projectStore.projects.find((p) => p.id === b.id);
        if (proj) {
          const allocated = Number(b.allocated) || 0;
          const used = Number(b.used) || 0;
          saveProject({ ...proj, budget: allocated, used });
          projectStore.updateProjectBudget(proj.id, allocated);
        }
      });
    } catch (syncErr) {
      console.warn("Failed to sync budgets to projects store:", syncErr);
    }
  } catch (e) {
    console.error("Error saving budgets:", e);
  }
}

function showToast() {
  showSaved.value = true;
  setTimeout(() => (showSaved.value = false), 1500);
}

let saveTimeout;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveBudgets, 500);
}

const currencyFormatter = computed(
  () =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedCurrency.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
);

function formatCurrency(value) {
  return currencyFormatter.value.format(Number(value || 0));
}

const totalAllocated = computed(() =>
  budgets.value.reduce((sum, b) => sum + b.allocated, 0)
);
const totalUsed = computed(() =>
  budgets.value.reduce((sum, b) => sum + b.used, 0)
);

onMounted(loadBudgets);
</script>

<style scoped>
/* --- Page Layout --- */
.budgets-page {
  padding: 2rem;
  background-color: white;
}

/* --- Header --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem; /* Reduced margin */
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary, #333);
}

.subtitle {
  color: var(--text-secondary, #666);
  margin-top: 0.25rem;
}

/* --- Header & Sort Controls --- */
.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.header-controls label,
.controls-bar label {
  margin-right: 0.25rem;
  font-weight: 600;
  color: var(--text-secondary, #555);
}

.control-select {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-right: 0.5rem;
  background: white;
}

.controls-bar {
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  background: var(--card, white);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ---
--- NEW LIST STYLES ---
--- */

.budgets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.budget-item {
  background: var(--card, white);
  border-radius: 8px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); */
  padding: 1.5rem;
  border-left: 5px solid #4a90e2;
  transition: transform 0.2s, box-shadow 0.2s;
  /* Flexbox for the row layout */
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Allows wrapping on small screens */
  gap: 1.5rem;
}

.budget-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.over-budget-card {
  border-left-color: #e74c3c;
}

/* Column 1: Header */
.item-header {
  flex: 2; /* Takes up 2 parts of the space */
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-header .fas {
  font-size: 1.5rem;
  color: var(--text-secondary, #666);
}

.budget-name {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
}

/* Column 2: Inputs */
.budget-inputs {
  flex: 3; /* Takes up 3 parts */
  min-width: 280px;
  display: flex;
  gap: 1rem;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-secondary, #555);
  font-size: 0.9em;
}

.input-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

/* Column 3: Meta */
.meta {
  flex: 2; /* Takes up 2 parts */
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9em;
  color: #555;
  text-align: right; /* Aligns to the right in the flex row */
}

.remaining-display.over-budget {
  color: #e74c3c;
  font-weight: bold;
}

/* ---
--- END OF LIST STYLES ---
--- */

/* --- Empty State (Unchanged) --- */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: var(--card, white);
  border-radius: 12px;
  border: 2px dashed var(--border-color, #e0e0e0);
}
.empty-state .fas {
  font-size: 4rem;
  color: var(--primary-color, #007bff);
  margin-bottom: 1rem;
}
.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

/* --- Summary (Unchanged) --- */
/* .summary-section {
  margin-top: 3rem;
  background: var(--card, white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
} */
.summary-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}
.summary-stats p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

/* --- Toast (Unchanged) --- */
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #4caf50;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- Pagination (Unchanged) --- */
.pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1.25rem;
}
.page-btn,
.page-number {
  border: 1px solid #e5e7eb;
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.page-number.active {
  background: var(--primary, #f7921c);
  color: white;
  border-color: var(--primary, #f7921c);
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>