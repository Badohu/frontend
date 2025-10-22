<template>
  <div class="budgets-view">
    <header>
      <h2>Budgets</h2>
      <p class="subtitle">Overview and allocations</p>
    </header>

    <div class="currency-selector">
      <label for="currency-select">Display Currency:</label>
      <select v-model="selectedCurrency" id="currency-select" class="currency-select">
        <option value="USD">USD ($)</option>
        <option value="GHS">GHS (₵)</option>
      </select>
    </div>

    <section class="budget-list">
      <ul>
        <li v-for="b in budgets" :key="b.id" class="budget-item">
          <div class="budget-meta">
            <strong>{{ b.name }}</strong>
            
            <div class="budget-inputs">
                <div class="input-group">
                    <label for="allocated-{{ b.id }}">Allocated:</label>
                    <input
                        v-model.number="b.allocated"
                        @change="saveBudgets"
                        type="number"
                        min="0"
                        class="allocated-input"
                        :id="'allocated-' + b.id"
                    />
                </div>
                
                <div class="input-group">
                    <label for="used-{{ b.id }}">Used:</label>
                    <input
                        v-model.number="b.used"
                        @change="saveBudgets"
                        type="number"
                        min="0"
                        class="used-input"
                        :id="'used-' + b.id"
                    />
                </div>
            </div>
          </div>
          
          <div class="budget-details">
            <span class="allocated-display">
              Total: {{ formatCurrency(b.allocated) }}
            </span>
            <span class="used-display">
              Used: {{ formatCurrency(b.used) }}
            </span>
            <span class="remaining-display" :class="{ 'over-budget': b.used > b.allocated }">
                Remaining: {{ formatCurrency(b.allocated - b.used) }}
            </span>
          </div>
        </li>
      </ul>
      <p v-if="budgets.length === 0" class="empty-message">No budget categories defined.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const STORAGE_KEY = "budgets_v1";

const selectedCurrency = ref("USD");

const budgets = ref([
  // { id: 1, name: "Capex", allocated: 150000, used: 5000 },
  // { id: 2, name: "Opex", allocated: 80000, used: 12000 },
  // { id: 3, name: "Project-based Expenditure", allocated: 200000, used: 0 },
]);

// --- Data Persistence Functions ---

function saveBudgets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets.value));
  } catch (e) {
    console.error("Failed to save budgets to local storage:", e);
  }
}

function loadBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      budgets.value = loaded.map(b => ({
        ...b,
        allocated: Number(b.allocated) || 0,
        used: Number(b.used) || 0
      }));
    } else {
      // Save initial state if no data is found
      saveBudgets();
    }
  } catch (e) {
    console.error("Failed to load budgets from local storage:", e);
  }
}

onMounted(loadBudgets);

// --- Currency Formatting ---

const currencyFormatter = computed(() => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedCurrency.value,
    minimumFractionDigits: 0, // Set to 2 if you prefer cents/pence
    maximumFractionDigits: 2,
  });
});

function formatCurrency(n) {
  return currencyFormatter.value.format(Number(n || 0));
}
</script>

<style scoped>
/* Keep existing styles and add new ones for the Used input */
.budgets-view {
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  font-family: sans-serif;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 12px;
}

ul {
  padding-left: 0;
  list-style: none;
}

.budget-item {
  background: #f9fafb;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 280px;
}

.budget-inputs {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    font-weight: 500;
}

.allocated-input, .used-input {
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  width: 120px;
  text-align: right;
}

.budget-details {
  display: flex;
  flex-direction: column; /* Changed to column for better stacking */
  gap: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: right;
}

.currency-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f0f4f8;
  border-radius: 6px;
}
.currency-select {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.allocated-display {
    color: #059669; /* Green */
}

.used-display {
    color: #ef4444; /* Red */
}

.remaining-display {
    font-weight: 700;
    color: #3b82f6; /* Blue for remaining */
}

.remaining-display.over-budget {
    color: #f59e0b; /* Orange/Warning when used > allocated */
}

.empty-message {
    text-align: center;
    color: #6b7280;
    font-style: italic;
    padding: 20px;
}
</style>