import { ref, computed, watch } from 'vue';

const CURRENCY_STORAGE_KEY = 'selected_currency_v1';

const selectedCurrency = ref(localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD');

watch(selectedCurrency, (newCurrency) => {
  localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
});

export const currencySymbol = computed(() => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: 'GH₵',
  };
  return symbols[selectedCurrency.value] || '$';
});

export function formatCurrency(value) {
  const number = Number(value) || 0;
  return `${currencySymbol.value}${number.toFixed(2)}`;
}

export function useCurrency() {
  return {
    selectedCurrency,
    currencySymbol,
    formatCurrency,
  };
}