<template>
  <div class="requests-view">
    <header>
      <h2>Payment Requests</h2>
      <p class="subtitle">Approve or review incoming requests</p>
    </header>

    <section>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.project }}</td>
            <td>{{ r.amount }}</td>
            <td>{{ r.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const requests = ref([
  { id: 101, project: "Website Revamp", amount: "$12,000", status: "Pending" },
  { id: 102, project: "Mobile App", amount: "$30,000", status: "Approved" },
]);
</script>

<style scoped>
.requests-view {
  padding: 20px;
  font-family: Inter, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 12px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
</style>
