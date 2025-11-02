<template>
  <div class="requests-view">
    <header>
      <h2>Payment Requests</h2>
      <p class="subtitle">Approve or review incoming requests</p>
      <div class="header-actions">
        <button class="btn primary" @click="showNewRequestModal = true">
          + New Request
        </button>
      </div>
    </header>

    <!-- Table Section -->
    <section>
      <table v-if="requests.length">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Description</th>
            <th>Prepared By</th>
            <th>Reviewed By</th>
            <th>Authorised By</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in requests" :key="r.id">
            <td>{{ r.id }}</td>
            <td>{{ r.project }}</td>
            <td>{{ r.amount }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(r.status)">
                {{ r.status }}
              </span>
            </td>
            <td>
              <button class="btn" @click="showDescription(r.description)">
                View
              </button>
            </td>
            <td>
              {{ r.preparedBy?.name || "-" }}<br />{{
                r.preparedBy?.date || ""
              }}
            </td>
            <td>
              {{ r.reviewedBy?.name || "-" }}<br />{{
                r.reviewedBy?.date || ""
              }}
            </td>
            <td>
              {{ r.authorisedBy?.name || "-" }}<br />{{
                r.authorisedBy?.date || ""
              }}
            </td>

            <td class="actions-cell">
              <button
                class="btn actions-toggle"
                @click="toggleActionMenu(r.id)"
              >
                &#8942;
              </button>

              <div class="actions-menu" v-if="openActionMenuId === r.id">
                <button @click="openModal(r.id)" :disabled="isRestricted">
                  Edit
                </button>
                <div class="menu-divider"></div>

                <button
                  @click="updateStatus(r, 'Approved')"
                  :disabled="isApprovalRestricted"
                >
                  Approve
                </button>
                <button
                  @click="updateStatus(r, 'Rejected')"
                  :disabled="isApprovalRestricted"
                >
                  Reject
                </button>
                <button
                  @click="updateStatus(r, 'Under Review')"
                  :disabled="isRestricted"
                >
                  Under Review
                </button>
                <button
                  @click="updateStatus(r, 'Pending')"
                  :disabled="isRestricted"
                >
                  Pending
                </button>
                <button
                  @click="updateStatus(r, 'Paid')"
                  :disabled="isApprovalRestricted"
                >
                  Mark Paid
                </button>

                <div class="menu-divider"></div>
                <button
                  class="btn-danger-text"
                  @click="deleteRequest(r.id)"
                  :disabled="isApprovalRestricted"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="no-data">No payment requests yet.</p>
    </section>

    <!-- New Request Modal -->
    <NewRequestModal
      v-if="showNewRequestModal"
      :users="users"
      :user="user"
      @close="showNewRequestModal = false"
      @submit="handleNewRequest"
    />

    <!-- Edit Request Modal -->
    <NewRequestModal
      v-if="showEditRequestModal"
      :users="users"
      :user="user"
      :request="editingRequest"
      @close="showEditRequestModal = false"
      @update="handleUpdateRequest"
    />

    <!-- Description Modal -->
    <teleport to="body" v-if="showDescriptionModal">
      <div class="modal-overlay" @click="closeDescriptionModal">
        <div class="modal" @click.stop>
          <header class="modal-header">
            <h3>Request Description</h3>
            <button class="modal-close" @click="closeDescriptionModal">
              ✕
            </button>
          </header>
          <div class="modal-body">
            <p>{{ currentDescription }}</p>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import NewRequestModal from "@/components/request/NewRequestModal.vue";
import { useUsers } from "@/services/useUsers.js";
import { useCurrency } from "@/services/useCurrency";

const { users } = useUsers();
const { selectedCurrency } = useCurrency();

const STORAGE_KEY = "payment_requests_v1";
const STORAGE_KEY_BUDGETS = "budgets_v2";

const requests = ref([]);
const user = ref(null);
const showNewRequestModal = ref(false);
const showEditRequestModal = ref(false);
const editingRequest = ref(null);
const showDescriptionModal = ref(false);
const currentDescription = ref("");
const openActionMenuId = ref(null);

const isRestricted = computed(() => user.value?.role === "REQUESTER");
const isApprovalRestricted = computed(() =>
  ["REQUESTER", "FINANCE MANAGER", "FINANCE OFFICER"].includes(user.value?.role)
);

function saveRequests() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.value));
  } catch (e) {
    console.warn("failed to save requests", e);
  }
}

function updateBudgetsForPaidRequest(request) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (!raw) return;
    const budgets = JSON.parse(raw);
    const project = budgets.find(
      (b) => b.name?.toLowerCase() === request.project?.toLowerCase()
    );
    if (!project) return;

    const amountValue = parseFloat(
      String(request.amount).replace(/[^\d.-]/g, "")
    );
    if (!isNaN(amountValue)) {
      project.used = Number(project.used || 0) + amountValue;
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    }
  } catch (err) {
    console.error("Failed to update budgets:", err);
  }
}

function loadRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) requests.value = JSON.parse(raw);
    const userData = localStorage.getItem("user");
    if (userData) user.value = JSON.parse(userData);
  } catch (e) {
    requests.value = [];
  }
}

watch(requests, saveRequests, { deep: true });

function nextId() {
  const ids = requests.value.map((r) => r.id);
  return ids.length ? Math.max(...ids) + 1 : 100;
}

function handleNewRequest(formData) {
  const payload = {
    id: nextId(),
    project: formData.expenditureType,
    amount: `${selectedCurrency.value} ${formData.totalAmount.toFixed(2)}`,
    description: formData.items
      .map((item) => `${item.description} (${item.vendor})`)
      .join(", "),
    status: "Pending",
    ...formData,
  };
  requests.value.unshift(payload);
  showNewRequestModal.value = false;
}

function openModal(requestId) {
  const request = requests.value.find((r) => r.id === requestId);
  if (request) {
    editingRequest.value = { ...request };
    showEditRequestModal.value = true;
  }
}

function handleUpdateRequest(formData) {
  const index = requests.value.findIndex((r) => r.id === formData.id);
  if (index !== -1) {
    requests.value[index] = { ...formData };
  }
  showEditRequestModal.value = false;
  editingRequest.value = null;
}

function deleteRequest(id) {
  const idx = requests.value.findIndex((r) => r.id === id);
  if (idx === -1) return;
  if (!confirm("Delete this request?")) return;
  requests.value.splice(idx, 1);
  openActionMenuId.value = null;
}

function showDescription(description) {
  currentDescription.value = description;
  showDescriptionModal.value = true;
}

function closeDescriptionModal() {
  showDescriptionModal.value = false;
}

function toggleActionMenu(id) {
  openActionMenuId.value = openActionMenuId.value === id ? null : id;
}

function updateStatus(request, newStatus) {
  request.status = newStatus;
  if (newStatus === "Paid") updateBudgetsForPaidRequest(request);
  openActionMenuId.value = null;
  saveRequests();
}

function getStatusClass(status) {
  if (!status) return "";
  const slug = status.toLowerCase().replace(" ", "-");
  return `status-${slug}`;
}

function closeMenuOnClickOutside(event) {
  if (!event.target.closest(".actions-cell")) {
    openActionMenuId.value = null;
  }
}

function handleStorageChange(event) {
  if (event.key === STORAGE_KEY) loadRequests();
}

onMounted(() => {
  loadRequests();
  window.addEventListener("storage", handleStorageChange);
  document.addEventListener("click", closeMenuOnClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  document.removeEventListener("click", closeMenuOnClickOutside);
});
</script>

<style scoped>
.requests-view {
  padding: 20px;
  font-family: Inter, sans-serif;
  background-color: #dddddd;
}
.subtitle {
  color: #666;
  margin-bottom: 12px;
}
.no-data {
  color: #999;
  text-align: center;
  margin-top: 24px;
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
  vertical-align: middle;
}
.header-actions {
  margin-top: 8px;
}
.btn {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  background-color: #f3f4f6;
}
.btn.primary {
  background-color: #f7921c;
  color: #fff;
}
.btn.primary:hover {
  background-color: #f5820a;
}

/* Status Badges */
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}
.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}
.status-under-review {
  background-color: #dbeafe;
  color: #1e40af;
}
.status-approved {
  background-color: #d1fae5;
  color: #065f46;
}
.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-paid {
  background-color: #e5e7eb;
  color: #374151;
}

/* Actions menu */
.actions-cell {
  position: relative;
  width: 40px;
}
.actions-menu {
  position: absolute;
  right: 20px;
  top: 100%;
  z-index: 10;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-width: 160px;
  padding: 6px;
}
.actions-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  text-align: left;
}
.actions-menu button:hover {
  background-color: #f3f4f6;
}
.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 0;
}
.btn-danger-text {
  color: #dc2626;
}
</style>
