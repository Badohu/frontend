<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <span class="title">Dashboard</span>
    </div>

    <!-- User Profile Section -->
    <div class="user-profile">
      <div class="user-avatar">
        {{ userInitials }}
      </div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role">{{ userRole }}</span>
      </div>
    </div>

    <!-- Navigation -->
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

    <!-- Footer -->
    <div class="sidebar-footer">
      <RouterLink to="/login" class="nav-link">Logout</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();

// Get user data from localStorage
const userData = computed(() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
});

// User profile computed properties
const userInitials = computed(() => {
  const name = userData.value?.name || "User";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const userName = computed(() => userData.value?.name || "User");
const userRole = computed(() => userData.value?.role || "User");

// Navigation logic
const dashboardChildren = computed(() => {
  const dashboardMatch = route.matched.find((r) => r.name === "Dashboard");
  const user = userData.value;
  const allowedSections = user?.allowedSections || [];
  const role = (user?.role || "").toString().toUpperCase();
  const budgetsAllowedRoles = ["CEO", "HR", "FINANCE MANAGER"];

  console.log("Allowed sections:", allowedSections);

  if (dashboardMatch) {
    return dashboardMatch.children.filter((child) => {
      const normalizedAllowed = allowedSections.map((section: string) =>
        section.toLowerCase()
      );

      // If this child is the Budgets page, additionally check the user's role
      const childName = child.name.toString().toLowerCase();
      if (childName === "budgets") {
        if (!budgetsAllowedRoles.includes(role)) return false;
      }

      return normalizedAllowed.includes(childName);
    });
  }

  return [];
});
</script>

<style scoped>
/* Professional sidebar styling */
/* :root {
  --sidebar-bg-top: #0b1220;
  --sidebar-bg-bottom: #0f1724;
  --panel-bg: rgba(255, 255, 255, 0.02);
  --muted: #9aa3b2;
  --text: #e6eef8;
  --accent: #1260c6;
  --glass: rgba(255, 255, 255, 0.025);
  --active-color: #ff4733;
  --active-bg: rgba(255, 71, 51, 0.1);
} */

.sidebar {
  background-color: white;
  color: var(--text);
  width: 240px;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  padding: 2rem 1.25rem;
  gap: 1.25rem;
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
    Arial;
  transition: width 0.18s ease;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.title {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
}

/* User Profile Section */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--glass);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.5rem;
  font-size: 30px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--active-color), #ff6b4a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f7921c;
  font-weight: 600;
  font-size: 25px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
  font-size: 20px;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  /* background-color: #40b5e4; */
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-right: 0.25rem;
  color: white;
}

/* Nav Links */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: var(--muted);
  text-decoration: none;
  background-color: whitesmoke;
  transition: background 180ms ease, color 180ms ease, transform 120ms ease;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  position: relative;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Label inside link */
.nav-link .label {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hover & Focus */
.nav-link:hover,
.nav-link:focus {
  background: var(--glass);
  color: var(--text);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.25);
}

/* Active State */
.nav-link.is-active {
  color: var(--active-color);
  background-color: #202018;
  backdrop-filter: blur(8px);
}

/* Footer */
.sidebar-footer {
  font-size: 0.82rem;
  text-align: center;
  padding: 0.85rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  color: var(--muted);
}

/* Logout link styling */
.sidebar-footer .nav-link {
  justify-content: center;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  color: var(--muted);
}

/* Responsive Design */
@media (max-width: 900px) {
  .sidebar {
    width: 72px;
    padding: 1rem;
    gap: 0.75rem;
  }

  .title {
    display: none;
  }

  .user-profile {
    flex-direction: column;
    text-align: center;
    padding: 0.5rem;
  }

  .user-info {
    display: none;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
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

/* Accessibility */
.nav-link:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 71, 51, 0.14);
  outline: none;
}
</style>
