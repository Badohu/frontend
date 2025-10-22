<template>
  <div class="reports-view">
    <header>
      <h2>Reports</h2>
      <p class="subtitle">Generate or download financial reports</p>
    </header>

    <section>
      <ul>
        <li v-for="r in reports" :key="r.id">
          <button class="report-btn">Download {{ r.name }}</button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const reports = ref([
  { id: "m", name: "Monthly Summary" },
  { id: "q", name: "Quarterly Spend" },
]);
</script>

<style scoped>
.reports-view {
  padding: 20px;
  font-family: Inter, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 12px;
}
.report-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #0b74de;
  color: white;
  border: none;
}
</style>
