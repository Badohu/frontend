<template>
  <div class="dashboard">
    <header class="dash-header">
      <div class="dash-title">
        <h2>Dashboard</h2>
        <p class="subtitle">Overview of budgets and requests</p>
      </div>

      <div class="notification-wrapper">
        <button
          class="notif-btn"
          @click="toggleNotifications"
          aria-haspopup="true"
          :aria-expanded="String(showNotifications)"
          title="Notifications"
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

    <section class="cards">
      <div class="card" v-for="card in cards" :key="card.title">
        <div class="card-title">{{ card.title }}</div>
        <div class="card-value">{{ card.value }}</div>
      </div>
    </section>

    <section class="charts">
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
import { ref, computed } from "vue";

const cards = ref([
  { title: "Total Budget", value: "0" },
  { title: "Spent", value: "0" },
  { title: "Remaining", value: "0" },
  { title: "Pending Requests", value: "0" },
]);

const recent = ref([
  { id: 1, project: "Website Revamp", amount: "0", status: "0" },
  { id: 2, project: "Office Supplies Q4", amount: "0", status: "0" },
  { id: 3, project: "Mobile App", amount: "0", status: "0" },
]);

// notification state (demo data)
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
.dashboard {
  padding: 20px;
  /* background-color: #c7bfbf; */
}
.dash-header {
  display: flex;
  align-items: center;
  padding: 0 0 24px;
  border-bottom: 1px solid #e6eef6;
}
.dash-title {
  flex: 1;
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
.list-card {
  background: var(--card);
  padding: 16px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  flex: 1;
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

/* notification UI */
.notification-wrapper {
  margin-left: auto;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 6px;
  border-radius: 6px;
}
.notif-btn:hover {
  background: rgba(0, 0, 0, 0.03);
}

.badge {
  display: inline-block;
  min-width: 18px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  line-height: 1;
  margin-left: 6px;
  vertical-align: top;
}

/* dropdown */
.notif-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  max-height: 360px;
  overflow: auto;
  background: var(--card, #fff);
  border: 1px solid #e6eef6;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.08);
  border-radius: 8px;
  padding: 8px;
  z-index: 2000;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 8px;
}
.notif-header .notif-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.notif-list li {
  padding: 8px;
  border-bottom: 1px solid #f6f9fc;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.notif-list li.unread {
  background: rgba(79, 70, 229, 0.03);
}

.n-title {
  font-weight: 600;
  font-size: 13px;
}
.n-body {
  font-size: 13px;
  color: #444;
}
.n-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.n-action-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn.small {
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 6px;
  background: #eef3ff;
  border: none;
  cursor: pointer;
}
.btn.tiny {
  padding: 4px 6px;
  font-size: 12px;
  border-radius: 6px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
}
.btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

/* when empty */
.notif-empty {
  padding: 12px;
  text-align: center;
  color: #777;
}
</style>
