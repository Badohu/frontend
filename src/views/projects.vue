<template>
  <div class="projects-view">
    <header>
      <h2>Projects</h2>
      <p class="subtitle">Active projects and budgets</p>
    </header>

    <section>
      <ul>
        <li v-for="p in projects" :key="p.id">
          <strong>{{ p.name }}</strong> — {{ p.owner }} (Budget: {{ p.budget }})
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const projects = ref([
  { id: 1, name: "Website Revamp", owner: "Alice", budget: "$50,000" },
  { id: 2, name: "Mobile App", owner: "Dev Team", budget: "$200,000" },
]);
</script>

<style scoped>
.projects-view {
  padding: 20px;
  font-family: Inter, sans-serif;
}
.subtitle {
  color: #666;
  margin-bottom: 12px;
}
ul {
  list-style: none;
  padding-left: 0;
}
li {
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
}
</style>
