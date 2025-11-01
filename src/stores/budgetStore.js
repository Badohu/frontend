// src/stores/budgetStore.js
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

const STORAGE_KEY = "budgets_store_v1";

export const useBudgetStore = defineStore("budgetStore", () => {
  const budgets = ref([]);

  // Load from localStorage
  const loadBudgets = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    budgets.value = raw ? JSON.parse(raw) : [];
  };

  // Persist whenever budgets change
  watch(
    budgets,
    (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
    { deep: true }
  );

  // Add new budget
  const addBudget = (budget) => {
    budgets.value.push({
      id: Date.now(),
      name: budget.name,
      category: budget.category,
      allocated: Number(budget.allocated),
      used: 0,
    });
  };

  // Delete existing budget
  const deleteBudget = (id) => {
    budgets.value = budgets.value.filter((b) => b.id !== id);
  };

  // Summary calculations
  const totalAllocated = computed(() =>
    budgets.value.reduce((sum, b) => sum + b.allocated, 0)
  );

  const totalUsed = computed(() =>
    budgets.value.reduce((sum, b) => sum + b.used, 0)
  );

  return {
    budgets,
    loadBudgets,
    addBudget,
    deleteBudget,
    totalAllocated,
    totalUsed,
  };
});
