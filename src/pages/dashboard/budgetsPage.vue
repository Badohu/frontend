<template>
  <div id="budgets-page" class="budgets-page">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1>Budgets</h1>
        <p class="subtitle">Overview and Allocations</p>
      </div>

      <div class="currency-selector">
        <label for="currency-select">Currency:</label>
        <select
          v-model="selectedCurrency"
          id="currency-select"
          class="currency-select"
        >
          <option value="USD">USD ($)</option>
          <option value="GHS">GHS (₵)</option>
        </select>
      </div>
    </header>

    <!-- Budgets List -->
    <section class="budgets-section">
      <ul v-if="budgets.length > 0" class="budgets-grid">
        <li
          v-for="b in budgets"
          :key="b.id"
          class="budget-card"
          :class="{ 'over-budget-card': b.used > b.allocated }"
        >
          <div class="card-header">
            <i class="fas fa-coins"></i>
            <h3 class="budget-name">{{ b.name }}</h3>
          </div>

          <div class="description">
            Manage allocations and usage for {{ b.name }}.
          </div>

          <div class="budget-inputs">
            <div class="input-group">
              <label>Allocated:</label>
              <input
                v-model.number="b.allocated"
                type="number"
                min="0"
                class="allocated-input"
                @input="debouncedSave"
              />
            </div>

            <div class="input-group">
              <label>Paid:</label>
              <input
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
        </li>
      </ul>

      <div v-else class="empty-state">
        <i class="fas fa-wallet"></i>
        <h2>No Budgets Found</h2>
        <p>Add or load projects to start managing your budgets.</p>
      </div>
    </section>

    <!-- Totals Summary -->
    <section v-if="budgets.length > 0" class="summary-section">
      <h3>Summary</h3>
      <div class="summary-stats">
        <p>
          Total Allocated: <strong>{{ formatCurrency(totalAllocated) }}</strong>
        </p>
        <p>
          Total Used: <strong>{{ formatCurrency(totalUsed) }}</strong>
        </p>
        <p>
          Remaining Balance:
          <strong :class="{ 'over-budget': totalUsed > totalAllocated }">
            {{ formatCurrency(totalAllocated - totalUsed) }}
          </strong>
        </p>
      </div>
    </section>

    <!-- Toast Notification -->
    <transition name="fade">
      <div v-if="showSaved" class="toast">Changes saved</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useProjectStore } from "@/stores/projectStore";

const projectStore = useProjectStore();
const STORAGE_KEY = "budgets_v2";

const selectedCurrency = ref("USD");
const budgets = ref([]);
const showSaved = ref(false);

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
  background-color: var(--background, #f8f9fa);
}

/* --- Header --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary, #333);
}

.subtitle {
  color: var(--text-secondary, #666);
  margin-top: 0.25rem;
}

/* --- Currency Selector --- */
.currency-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-select {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* --- Budgets Grid --- */
.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.budget-card {
  background: var(--card, white);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  border-left: 5px solid #4a90e2;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.budget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* --- Over Budget Highlight --- */
.over-budget-card {
  border-left-color: #e74c3c;
}

/* --- Card Header --- */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-header .fas {
  font-size: 1.5rem;
  color: var(--text-secondary, #666);
}

.budget-name {
  font-size: 1.25rem;
  margin: 0;
}

/* --- Inputs --- */
.budget-inputs {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-secondary, #555);
}

.input-group input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

/* --- Meta Info --- */
.meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9em;
  color: #555;
}

.remaining-display.over-budget {
  color: #e74c3c;
  font-weight: bold;
}

/* --- Empty State --- */
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

/* --- Summary Section --- */
.summary-section {
  margin-top: 3rem;
  background: var(--card, white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

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

/* --- Toast Notification --- */
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
</style>
