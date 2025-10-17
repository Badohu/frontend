<template>
  <div class="budgets-view">
    <header>
      <h2>Budgets</h2>
      <p class="subtitle">Overview and allocations</p>
    </header>

    <section class="budget-list">
      <ul>
        <li v-for="b in budgets" :key="b.id">
          <strong>{{ b.name }}</strong> — {{ b.allocated }} (Used: {{ b.used }})
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const budgets = ref([
  { id: 1, name: "Engineering", allocated: "0", used: "0" },
  { id: 2, name: "Marketing", allocated: "0", used: "0" },
]);
</script>
<style scoped>
.budgets-view {
  padding: 20px;
}
.subtitle {
  color: var(--muted);
  margin-bottom: 12px;
}
ul {
  padding-left: 0;
  list-style: none;
}
li {
  background: var(--card);
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}
</style>
