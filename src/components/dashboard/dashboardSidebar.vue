<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <!--       <span class="logo"></span>       -->
      <span class="title">Dashboard</span>
    </div>
    <nav class="sidebar-nav">
      <RouterLink
        v-for="child in dashboardChildren"
        :key="child.name"
        :to="{ name: child.name }"
        :class="['nav-link', { 'is-active': route.name === child.name }]"
        :aria-current="route.name === child.name ? 'page' : undefined"
      >
        <span class="label">{{ child.name }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <RouterLink to="/login" class="nav-link">Logout</RouterLink>
    </div>

     
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import { computed } from "vue";

const route = useRoute();

const dashboardChildren = computed(() => {
  const dashboardMatch = route.matched.find((r) => r.name === "Dashboard");
  const user = JSON.parse(localStorage.getItem("user"));
  const allowedSections = user?.allowedSections || [];
  console.log("Allowed sections:", allowedSections);
  if (dashboardMatch) {
    return dashboardMatch.children.filter((child) => {
      const normalizedAllowed = allowedSections.map((section) =>
        section.toLowerCase()
      );
      return normalizedAllowed.includes(child.name.toString().toLowerCase());
    });
  }

  return [];
});
</script>

<style scoped>
/* Professional sidebar styling */
:root {
  --sidebar-bg-top: #0b1220;
  --sidebar-bg-bottom: #0f1724;
  --panel-bg: rgba(255, 255, 255, 0.02);
  --muted: #9aa3b2;
  --text: #e6eef8;
  --accent: #1260c6;
  --glass: rgba(255, 255, 255, 0.025);
}

.sidebar {
  background: linear-gradient(
    180deg,
    var(--sidebar-bg-top),
    var(--sidebar-bg-bottom)
  );
  color: var(--text);
  width: 240px;
  /* min-height: 100vh; */
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 2rem 1.25rem;
  gap: 1.25rem;
  box-shadow: 0 6px 30px rgba(2, 6, 23, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.02) inset;
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
    Arial;
  transition: width 0.18s ease;
}

/* header */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.logo {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: (135deg, #f8a23e);
  box-shadow: 0 4px 14px rgba(2, 6, 23, 0.4);
  font-size: 1.25rem;
}
.title {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 0.25rem;
}

/* nav links */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: var(--muted);
  text-decoration: none;
  transition: background 180ms ease, color 180ms ease, transform 120ms ease;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  position: relative;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* label inside link */
.nav-link .label {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* hover & focus */
.nav-link:hover,
.nav-link:focus {
  background: var(--glass);
  color: var(--text);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.25);
}

/* active state */
.nav-link.is-active {
  color: #f8a23e;
  background: color(#f8a23e 10%);
  box-shadow: inset 4px 0 0 var(--accent);
}

/* small subtle divider between sections */
.sidebar-footer {
  font-size: 0.82rem;
  text-align: center;
  padding: 0.85rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  color: var(--muted);
}

/* logout link styling reuse */
.sidebar-footer .nav-link {
  justify-content: center;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  color: var(--muted);
}

/* responsive (collapse labels) */
@media (max-width: 900px) {
  .sidebar {
    width: 72px;
    padding: 1rem;
    gap: 0.75rem;
  }
  .title {
    display: none;
  }
  .sidebar-header .logo {
    width: 40px;
    height: 40px;
  }
  .nav-link {
    justify-content: center;
    padding: 0.6rem;
  }
  .nav-link .label {
    display: none;
  }
  .sidebar-footer {
    font-size: 0.75rem;
    padding: 0.6rem 0;
  }
}

/* accessibility focus ring */
.nav-link:focus-visible {
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.14);
  outline: none;
}
</style>
