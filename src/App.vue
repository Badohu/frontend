<template>
  <div class="app-wrap">
    <aside class="leftbar">
      <div class="brand">OPEX APP</div>
      <router-link to="/dashboard"><button>Dashboard</button></router-link>
      <router-link to="/projects"><button>Projects</button></router-link>
      <router-link to="/payment_requests"><button>Payment Requests</button></router-link>
      <router-link to="/reports"><button>Reports</button></router-link>
      <router-link to="/admin"><button>Admin</button></router-link>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup></script>

<style scoped></style>
