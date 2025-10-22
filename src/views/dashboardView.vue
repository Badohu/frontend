<template>
  <div class="dashboard-view">
    <dashboardSidebar />
    <RouterView />
  </div>
</template>

<style scoped>
.dashboard-view {
  display: grid;
  grid-template-columns: 15vw 1fr;
  height: 100%;
  background-color: #ddd;
}
</style>

<script setup>
import dashboardSidebar from "@/components/dashboard/dashboardSidebar.vue";
</script>
