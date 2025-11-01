<template>
  <div class="dashboard">
    <!-- HEADER -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>Dashboard Overview</h1>
        <p class="subtitle">Quick insight into your budgets and requests</p>
      </div>

      <div class="notification-wrapper">
        <button
          class="notif-btn"
          @click="toggleNotifications"
          :aria-expanded="String(showNotifications)"
        >
          🔔
          <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
        </button>

        <div
          v-if="showNotifications"
          class="notif-dropdown"
          role="dialog"
          aria-label="Notifications"
        >
          <div class="notif-header">
            <strong>Notifications</strong>
            <div class="notif-actions">
              <button
                class="btn small"
                @click="markAllRead"
                :disabled="unreadCount === 0"
              >
                Mark all read
              </button>
              <button class="btn small" @click="toggleNotifications">
                Close
              </button>
            </div>
          </div>

          <ul class="notif-list">
            <li
              v-for="n in notifications"
              :key="n.id"
              :class="{ unread: !n.read }"
            >
              <div class="n-main">
                <div class="n-title">{{ n.title }}</div>
                <div class="n-body">{{ n.body }}</div>
              </div>
              <div class="n-meta">
                <small class="n-time">{{ n.time }}</small>
                <div class="n-action-buttons">
                  <button class="btn tiny" @click="toggleRead(n)">
                    {{ n.read ? "Unread" : "Read" }}
                  </button>
                  <button class="btn tiny danger" @click="dismiss(n.id)">
                    Dismiss
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <div v-if="notifications.length === 0" class="notif-empty">
            No notifications
          </div>
        </div>
      </div>
    </header>

    <!-- SUMMARY CARDS -->
    <section class="summary-grid">
      <div class="card stat-card">
        <div class="card-icon users-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Users</div>
          <div class="card-value">{{ users.length }}</div>
          <div class="card-trend">
            <span class="trend-up">+{{ newUsersThisMonth }}</span> this month
          </div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="card-icon departments-icon">
          <i class="fas fa-building"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Departments</div>
          <div class="card-value">{{ departments.length }}</div>
          <div class="card-subtitle">Active departments</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="card-icon projects-icon">
          <i class="fas fa-folder"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Projects</div>
          <div class="card-value">{{ projects.length }}</div>
          <div class="card-subtitle">Total expense lines</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="card-icon budget-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Budget</div>
          <div class="card-value">{{ formatCurrency(totalBudget) }}</div>
          <div class="card-subtitle">Across all projects</div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="card-icon spent-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Spent</div>
          <div class="card-value">{{ formatCurrency(totalSpent) }}</div>
          <div class="card-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: spentPercentage + '%' }"></div>
            </div>
            <span class="progress-text">{{ spentPercentage }}% of budget</span>
          </div>
        </div>
      </div>

      <div class="card stat-card">
        <div class="card-icon remaining-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Remaining</div>
          <div class="card-value">{{ formatCurrency(totalRemaining) }}</div>
          <div class="card-subtitle">Available funds</div>
        </div>
      </div>
    </section>

    <!-- TWO COLUMN LAYOUT -->
    <div class="dashboard-grid">
      <!-- LEFT COLUMN -->
      <div class="left-column">
        <!-- RECENT USERS -->
        <section class="dashboard-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-user-plus"></i>
              Recent Users
            </h2>
            <router-link to="/users" class="view-all-link">View All →</router-link>
          </div>
          <div class="users-list">
            <div v-if="recentUsers.length === 0" class="empty-state">
              No users added yet
            </div>
            <div 
              v-for="user in recentUsers" 
              :key="user.id" 
              class="user-item"
            >
              <div class="user-avatar">{{ getInitials(user.name) }}</div>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-meta">
                  <span class="user-dept">{{ user.department }}</span>
                  <span class="user-role">{{ user.role }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- DEPARTMENTS OVERVIEW -->
        <section class="dashboard-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-building"></i>
              Departments
            </h2>
            <router-link to="/departments" class="view-all-link">Manage →</router-link>
          </div>
          <div class="departments-list">
            <div v-if="departments.length === 0" class="empty-state">
              No departments created yet
            </div>
            <div 
              v-for="dept in departments" 
              :key="dept.id" 
              class="dept-item"
            >
              <div class="dept-icon">
                <i class="fas fa-briefcase"></i>
              </div>
              <div class="dept-info">
                <div class="dept-name">{{ dept.name }}</div>
                <div class="dept-count">{{ getUserCountByDept(dept.name) }} users</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="right-column">
        <!-- PROJECTS OVERVIEW -->
        <section class="dashboard-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-project-diagram"></i>
              Recent Projects
            </h2>
            <router-link to="/projects" class="view-all-link">View All →</router-link>
          </div>
          <div class="projects-list">
            <div v-if="recentProjects.length === 0" class="empty-state">
              No projects created yet
            </div>
            <div 
              v-for="project in recentProjects" 
              :key="project.id" 
              class="project-item"
            >
              <div class="project-header">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-category">{{ project.category }}</div>
              </div>
              <div class="project-description">{{ project.description || 'No description' }}</div>
              <div class="project-budget">
                Budget: {{ formatCurrency(project.budget || 0) }}
              </div>
            </div>
          </div>
        </section>

        <!-- BUDGET BREAKDOWN BY CATEGORY -->
        <section class="dashboard-section">
          <div class="section-header">
            <h2>
              <i class="fas fa-chart-pie"></i>
              Budget by Category
            </h2>
          </div>
          <div class="category-breakdown">
            <div v-if="categoryBreakdown.length === 0" class="empty-state">
              No budget data available
            </div>
            <div 
              v-for="cat in categoryBreakdown" 
              :key="cat.category"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-name">{{ cat.category }}</div>
                <div class="category-amount">{{ formatCurrency(cat.total) }}</div>
              </div>
              <div class="category-bar">
                <div 
                  class="category-bar-fill" 
                  :style="{ width: cat.percentage + '%' }"
                ></div>
              </div>
              <div class="category-meta">
                {{ cat.count }} project(s) • {{ cat.percentage }}%
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- QUICK STATS BAR -->
    <section class="quick-stats">
      <div class="stat-item">
        <i class="fas fa-clock"></i>
        <div class="stat-content">
          <div class="stat-label">Last Activity</div>
          <div class="stat-value">{{ lastActivityTime }}</div>
        </div>
      </div>
      <div class="stat-item">
        <i class="fas fa-calendar-check"></i>
        <div class="stat-content">
          <div class="stat-label">Active Today</div>
          <div class="stat-value">{{ activeToday }} users</div>
        </div>
      </div>
      <div class="stat-item">
        <i class="fas fa-tasks"></i>
        <div class="stat-content">
          <div class="stat-label">Completion Rate</div>
          <div class="stat-value">{{ completionRate }}%</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUsers } from "@/services/useUsers";
import { useDepartments } from "@/services/useDepartments";
import { useProjectStore } from "@/stores/projectStore";
import { formatCurrency } from "@/services/useCurrency";

// Get data from stores
const { users } = useUsers();
const { departments } = useDepartments();
const projectStore = useProjectStore();
const projects = computed(() => projectStore.projects);

// Notifications
const notifications = ref([
  {
    id: 1,
    title: "New user added",
    body: "A new user has been added to the system",
    time: "2h ago",
    read: false,
  },
  {
    id: 2,
    title: "Budget updated",
    body: "Project budget has been updated",
    time: "1d ago",
    read: true,
  },
  {
    id: 3,
    title: "Department created",
    body: "New department added successfully",
    time: "3d ago",
    read: false,
  },
]);

const showNotifications = ref(false);
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length
);

// Budget calculations
const totalBudget = computed(() => {
  return projects.value.reduce((sum, p) => sum + (p.budget || 0), 0);
});

const totalSpent = computed(() => {
  // You can implement actual spending tracking
  // For now, simulating with 70% of budget
  return totalBudget.value * 0.7;
});

const totalRemaining = computed(() => {
  return totalBudget.value - totalSpent.value;
});

const spentPercentage = computed(() => {
  if (totalBudget.value === 0) return 0;
  return Math.round((totalSpent.value / totalBudget.value) * 100);
});

// Recent users (last 5)
const recentUsers = computed(() => {
  return [...users.value]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5);
});

// Recent projects (last 5)
const recentProjects = computed(() => {
  return [...projects.value]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5);
});

// Budget breakdown by category
const categoryBreakdown = computed(() => {
  const breakdown = {};
  
  projects.value.forEach(project => {
    const cat = project.category || 'Uncategorized';
    if (!breakdown[cat]) {
      breakdown[cat] = { total: 0, count: 0 };
    }
    breakdown[cat].total += project.budget || 0;
    breakdown[cat].count += 1;
  });

  const total = Object.values(breakdown).reduce((sum, item) => sum + item.total, 0);

  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
    percentage: total > 0 ? Math.round((data.total / total) * 100) : 0
  })).sort((a, b) => b.total - a.total);
});

// Get user count by department
function getUserCountByDept(deptName) {
  return users.value.filter(u => u.department === deptName).length;
}

// Get initials for avatar
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// New users this month (simulated)
const newUsersThisMonth = computed(() => {
  // You can implement actual date tracking
  return Math.min(users.value.length, 3);
});

// Quick stats (simulated data)
const lastActivityTime = ref("2 hours ago");
const activeToday = computed(() => Math.min(users.value.length, 8));
const completionRate = ref(85);

// Notification functions
function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
}
function markAllRead() {
  notifications.value.forEach((n) => (n.read = true));
}
function toggleRead(n) {
  n.read = !n.read;
}
function dismiss(id) {
  const idx = notifications.value.findIndex((x) => x.id === id);
  if (idx !== -1) notifications.value.splice(idx, 1);
}
</script>

<style scoped>
:root {
  --bg: #f8f9fa;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --primary: #f7921c;
  --radius: 12px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dashboard {
  min-height: 100vh;
  background: var(--bg);
  padding: 2rem;
  box-sizing: border-box;
}

/* HEADER */
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
}

.subtitle {
  color: var(--muted);
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

/* SUMMARY CARDS */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.users-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.departments-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.projects-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.budget-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.spent-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.remaining-icon {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.card-content {
  flex: 1;
}

.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 0.875rem;
  color: var(--muted);
  font-weight: 500;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 0.25rem;
  color: var(--text);
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 0.25rem;
}

.card-trend {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.trend-up {
  color: #10b981;
  font-weight: 600;
}

.card-progress {
  margin-top: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7921c, #ffa940);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--muted);
}

/* DASHBOARD GRID */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 968px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* DASHBOARD SECTIONS */
.dashboard-section {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header i {
  color: var(--primary);
  font-size: 1rem;
}

.view-all-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #e8830f;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
  font-size: 0.9rem;
}

/* USERS LIST */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f9fafb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #ffa940);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: var(--text);
  font-size: 0.95rem;
}

.user-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 0.25rem;
}

.user-dept {
  display: flex;
  align-items: center;
}

.user-role {
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
}

/* DEPARTMENTS LIST */
.departments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dept-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.dept-item:hover {
  background: #f9fafb;
}

.dept-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dept-info {
  flex: 1;
}

.dept-name {
  font-weight: 500;
  color: var(--text);
}

.dept-count {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 0.125rem;
}

/* PROJECTS LIST */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.project-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(247, 146, 28, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.project-name {
  font-weight: 600;
  color: var(--text);
}

.project-category {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--muted);
}

.project-description {
  font-size: 0.875rem;
  color: var(--muted);
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-budget {
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 600;
}

/* CATEGORY BREAKDOWN */
.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category-name {
  font-weight: 500;
  color: var(--text);
}

.category-amount {
  font-weight: 600;
  color: var(--primary);
}

.category-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.category-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #ffa940);
  transition: width 0.3s;
}

.category-meta {
  font-size: 0.75rem;
  color: var(--muted);
}

/* QUICK STATS */
.quick-stats {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item i {
  font-size: 1.5rem;
  color: var(--primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--muted);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin-top: 0.125rem;
}

/* NOTIFICATION DROPDOWN */
.notification-wrapper {
  position: relative;
}

.notif-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  padding: 0.5rem;
  transition: transform 0.2s;
}

.notif-btn:hover {
  transform: scale(1.1);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.notif-dropdown {
  position: absolute;
  right: 0;
  top: 50px;
  width: 360px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-radius: var(--radius);
  z-index: 2000;
  max-height: 400px;
  overflow-y: auto;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  background: white;
}

.notif-actions {
  display: flex;
  gap: 0.5rem;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notif-list li {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.notif-list li:hover {
  background: #f9fafb;
}

.notif-list li.unread {
  background: rgba(247, 146, 28, 0.05);
}

.n-title {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.n-body {
  font-size: 0.875rem;
  color: var(--muted);
}

.n-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.5rem;
}

.n-action-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn.small,
.btn.tiny {
  border: none;
  background: #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  transition: background 0.2s;
}

.btn.small:hover,
.btn.tiny:hover {
  background: #d1d5db;
}

.btn.small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.btn.danger:hover {
  background: #fecaca;
}

.notif-empty {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
  font-size: 0.9rem;
}
</style>