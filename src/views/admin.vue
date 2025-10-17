<template>
  <div class="admin-view">
    <header>
      <h2>Admin Console</h2>
      <p class="subtitle">Manage users, roles and permissions</p>
    </header>

    <section class="admin-card">
      <h3>Users</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.role }}</td>
            <td>{{ u.active ? "Active" : "Disabled" }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const users = ref([
  { id: 1, name: "Alice", role: "Admin", active: true },
  { id: 2, name: "Bob", role: "Approver", active: true },
  { id: 3, name: "Carmen", role: "Viewer", active: false },
]);
</script>

<style scoped>
.admin-view {
  padding: 20px;
}
.subtitle {
  color: var(--muted);
  margin-bottom: 12px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
}
</style>
