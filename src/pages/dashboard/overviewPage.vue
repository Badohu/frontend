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
      <div class="card" v-for="card in cards" :key="card.title">
        <div class="card-title">{{ card.title }}</div>
        <div class="card-value">{{ card.value }}</div>
      </div>
    </section>

    <!-- RECENT REQUESTS -->
    <section class="requests-section">
      <h2>Recent Requests</h2>
      <div class="table-wrapper">
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
import { ref, computed } from "vue";

const cards = ref([
  { title: "Total Budget", value: "₵120,000" },
  { title: "Spent", value: "₵85,000" },
  { title: "Remaining", value: "₵35,000" },
  { title: "Pending Requests", value: "5" },
]);

const recent = ref([
  { id: 1, project: "Website Revamp", amount: "₵5,000", status: "Pending" },
  {
    id: 2,
    project: "Office Supplies Q4",
    amount: "₵2,500",
    status: "Approved",
  },
  { id: 3, project: "Mobile App", amount: "₵7,000", status: "Processing" },
]);

const notifications = ref([
  {
    id: 1,
    title: "Request #342 pending",
    body: "Budget approval required for Website Revamp",
    time: "2h ago",
    read: false,
  },
  {
    id: 2,
    title: "Payment processed",
    body: "Invoice 201 has been paid",
    time: "1d ago",
    read: true,
  },
  {
    id: 3,
    title: "New comment",
    body: "Manager requested clarification on Mobile App",
    time: "3d ago",
    read: false,
  },
]);

const showNotifications = ref(false);
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length
);

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
  --bg: #f9fafb;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
  --radius: 10px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dashboard {
  min-height: 100vh;
  background: var(--bg);
  padding: 30px 40px;
  box-sizing: border-box;
}

/* HEADER */
.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 30px;
}

.header-left h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.subtitle {
  color: var(--muted);
  margin-top: 4px;
}

/* SUMMARY CARDS */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
}

.card-title {
  font-size: 14px;
  color: var(--muted);
}
.card-value {
  font-size: 22px;
  font-weight: 700;
  margin-top: 6px;
  color: var(--text);
}

/* REQUEST TABLE */
.requests-section {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.requests-section h2 {
  margin-bottom: 16px;
  font-size: 20px;
  color: var(--text);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 12px 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: var(--text);
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
}

.badge {
  background: #ef4444;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 5px;
}

.notif-dropdown {
  position: absolute;
  right: 0;
  top: 40px;
  width: 320px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: var(--radius);
  z-index: 2000;
  max-height: 360px;
  overflow-y: auto;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notif-list li {
  padding: 10px;
  border-bottom: 1px solid #f3f4f6;
}
.notif-list li.unread {
  background: rgba(59, 130, 246, 0.05);
}

.n-title {
  font-weight: 600;
}
.n-body {
  font-size: 13px;
  color: #555;
}

.n-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #777;
  margin-top: 4px;
}

.btn.small,
.btn.tiny {
  border: none;
  background: #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 6px;
}

.btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.notif-empty {
  text-align: center;
  padding: 12px;
  color: #777;
}
</style>
