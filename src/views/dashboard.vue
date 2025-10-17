<template>
  <div class="dashboard">
    <header class="dash-header">
      <h2>Approver Dashboard</h2>
      <p class="subtitle">Overview of budgets and requests</p>
    </header>

    <section class="cards">
      <div class="card" v-for="card in cards" :key="card.title">
        <div class="card-title">{{ card.title }}</div>
        <div class="card-value">{{ card.value }}</div>
      </div>
    </section>

    <section class="charts">
      <div class="chart-card">
        <h3>Budget Usage</h3>
        <!-- lightweight SVG bar chart placeholder -->
        <!-- <svg class="bar-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
          <rect
            v-for="(v, i) in chartData"
            :key="i"
            :x="i * 15"
            :y="30 - v"
            :width="10"
            :height="v"
            fill="#0b74de"
          />
        </svg> -->
      </div>

      <div class="list-card">
        <h3>Recent Requests</h3>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in recent" :key="req.id">
              <td>{{ req.project }}</td>
              <td>{{ req.amount }}</td>
              <td>{{ req.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const cards = ref([
  { title: "Total Budget", value: "0" },
  { title: "Spent", value: "0" },
  { title: "Remaining", value: "0" },
  { title: "Pending Requests", value: "0" },
]);

// Simple dataset scaled to the SVG viewBox height (30)
const chartData = ref([8, 20, 15, 25, 10]);

const recent = ref([
  { id: 1, project: "Website Revamp", amount: "0", status: "0" },
  { id: 2, project: "Office Supplies Q4", amount: "0", status: "0" },
  { id: 3, project: "Mobile App", amount: "0", status: "0" },
]);
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.dash-header h2 {
  margin: 0;
  color: var(--text);
}
.subtitle {
  color: var(--muted);
  margin-bottom: 16px;
}
.cards {
  display: flex;
  gap: var(--gap);
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.card {
  background: var(--card);
  padding: 16px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  width: 200px;
}
.card-title {
  color: var(--muted);
  font-size: 14px;
}
.card-value {
  font-size: 20px;
  font-weight: 600;
  margin-top: 8px;
  color: var(--text);
}
.charts {
  display: flex;
  gap: 16px;
}
.chart-card,
.list-card {
  background: var(--card);
  padding: 16px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  flex: 1;
}
.bar-chart {
  width: 100%;
  height: 120px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #eef2f7;
  font-size: 14px;
}
</style>
