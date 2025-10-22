<template>
  <div class="requests-view">
    <header>
      <h2>Payment Requests</h2>
      <p class="subtitle">Approve or review incoming requests</p>
      <div class="header-actions">
        <button class="btn primary" @click="openNewRequest">New Request</button>
      </div>
    </header>

    <section>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.project }}</td>
            <td>{{ r.amount }}</td>
            <td>{{ r.status }}</td>
            <td>
              <button class="btn danger" @click="deleteRequest(r.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Teleported modal -->
    <teleport to="body" v-if="modalOpen">
      <div
        class="modal-overlay"
        ref="modalRef"
        tabindex="-1"
        @keydown="onKeydown"
        role="presentation"
      >
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Create payment request"
        >
          <header class="modal-header">
            <h3>New Payment Request</h3>
            <button class="modal-close" @click="closeModal" aria-label="Close">
              ✕
            </button>
          </header>

          <form class="request-form" @submit.prevent="createRequest">
            <label>
              Project
              <input
                v-model="form.project"
                required
                placeholder="Project name"
              />
            </label>
            <label>
              Amount
              <input v-model="form.amount" required placeholder="e.g. $12000" />
            </label>
            <label>
              Status
              <select v-model="form.status">
                <option>Pending</option>
                <option>Under Review</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Paid</option>
              </select>
            </label>
            <div class="form-actions">
              <button type="submit" class="btn primary">Create</button>
              <button type="button" class="btn" @click="closeModal">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from "vue";

const requests = ref([
  // { id: 101, project: "Website Revamp", amount: "$12,000", status: "Pending" },
  // { id: 102, project: "Mobile App", amount: "$30,000", status: "Approved" },
]);

// modal & form state
const modalOpen = ref(false);
const modalRef = ref(null);

const form = reactive({
  project: "",
  amount: "",
  status: "Pending",
});

function nextId() {
  const ids = requests.value.map((r) => r.id);
  return ids.length ? Math.max(...ids) + 1 : 100;
}

function openNewRequest() {
  form.project = "";
  form.amount = "";
  form.status = "Pending";
  modalOpen.value = true;
  // focus overlay so keydown is captured
  nextTick(() => {
    modalRef.value?.focus?.();
  });
}

function closeModal() {
  modalOpen.value = false;
}

function onKeydown(e) {
  if (e.key === "Escape" || e.key === "Esc") closeModal();
}

function createRequest() {
  const payload = {
    id: nextId(),
    project: form.project,
    amount: form.amount,
    status: form.status,
  };
  requests.value.unshift(payload);
  closeModal();
}

function deleteRequest(id) {
  const idx = requests.value.findIndex((r) => r.id === id);
  if (idx === -1) return;
  if (!confirm("Delete this request?")) return;
  requests.value.splice(idx, 1);
}
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

/* header actions */
.header-actions {
  margin-top: 8px;
}
.btn.primary {
  background: linear-gradient(1deg, #f8a23e, #ebedee);
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}
.btn.danger {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
}
.modal {
  width: min(640px, 96%);
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.modal-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}
.request-form label {
  display: block;
  margin-bottom: 10px;
}
.request-form input,
.request-form select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
