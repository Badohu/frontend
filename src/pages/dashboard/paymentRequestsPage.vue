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
            <th>Invoice</th>
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
              <span
                v-if="r.status === 'Rejected'"
                class="rejection-info"
                @click="showRejectionDetails(r)"
              >
                ℹ️
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

            <td>
              <button
                v-if="r.invoiceFiles?.length"
                class="btn-invoice"
                @click="viewInvoices(r)"
              >
                View ({{ r.invoiceFiles.length }})
              </button>
              <span v-else>-</span>
            </td>

            <td class="actions-cell">
              <button
                class="btn actions-toggle"
                @click.stop="toggleActionMenu(r.id)"
                :disabled="isActionDisabled(r)"
              >
                &#8942;
              </button>

              <div 
                class="actions-menu" 
                v-if="openActionMenuId === r.id"
                v-click-outside="closeActionMenu"
              >
                <button @click="handleEdit(r)" :disabled="!canEdit(r)">
                  Edit
                </button>
                <div class="menu-divider"></div>

                <button
                  @click="updateStatus(r, 'Approved')"
                  :disabled="!canApprove(r)"
                >
                  Approve
                </button>
                <button
                  @click="updateStatus(r, 'Rejected')"
                  :disabled="!canApprove(r)"
                >
                  Reject
                </button>
                <button
                  @click="updateStatus(r, 'Under Review')"
                  :disabled="!canEdit(r)"
                >
                  Under Review
                </button>
                <button
                  @click="updateStatus(r, 'Pending')"
                  :disabled="!canEdit(r)"
                >
                  Pending
                </button>
                <button
                  @click="updateStatus(r, 'Paid')"
                  :disabled="!canMarkPaid(r)"
                >
                  Mark Paid
                </button>

                <div class="menu-divider"></div>
                <button
                  class="btn-danger-text"
                  @click="deleteRequest(r.id)"
                  :disabled="!canDelete(r)"
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

    <!-- Invoice Viewer Modal -->
    <InvoiceViewerModal
      v-if="selectedRequest && selectedRequest.invoiceFiles?.length"
      :invoices="selectedRequest.invoiceFiles"
      :canEdit="canEdit(selectedRequest)"
      @close="selectedRequest = null"
      @update:invoices="updateRequestInvoices"
    />

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
import InvoiceViewerModal from "@/components/common/InvoiceViewerModal.vue";
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
const selectedRequest = ref(null);

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};

function viewInvoices(request) {
  selectedRequest.value = request;
}

function updateRequestInvoices(newInvoices) {
  if (!selectedRequest.value) return;

  // Update invoices in the selected request
  selectedRequest.value.invoiceFiles = newInvoices;

  // If we're in edit mode, also update the editing request
  if (
    showEditRequestModal.value &&
    editingRequest.value?.id === selectedRequest.value.id
  ) {
    editingRequest.value.invoiceFiles = newInvoices;
  }

  // Update the request in the main list
  const idx = requests.value.findIndex(
    (r) => r.id === selectedRequest.value.id
  );
  if (idx !== -1) {
    requests.value[idx] = { ...requests.value[idx], invoiceFiles: newInvoices };
  }

  // If no invoices left, close the modal
  if (!newInvoices.length) {
    selectedRequest.value = null;
  }
}

// Improved permission functions
const canEdit = (request) => {
  if (!user.value?.role) return false;
  if (user.value.role === "REQUESTER") return false;
  
  // Cannot edit approved or paid requests
  const status = request.status?.toUpperCase();
  return !["APPROVED", "PAID"].includes(status);
};

const canApprove = (request) => {
  if (!user.value?.role) return false;
  if (user.value.role !== "CEO") return false;
  
  // Can only approve pending or under review requests
  const status = request.status?.toUpperCase();
  return ["PENDING", "UNDER REVIEW"].includes(status);
};

const canMarkPaid = (request) => {
  if (!user.value?.role) return false;
  if (user.value.role !== "CEO") return false;
  
  // Can only mark approved requests as paid
  return request.status?.toUpperCase() === "APPROVED";
};

const canDelete = (request) => {
  if (!user.value?.role) return false;
  if (user.value.role === "REQUESTER") return false;
  
  // Cannot delete approved or paid requests
  const status = request.status?.toUpperCase();
  return !["APPROVED", "PAID"].includes(status);
};

const isActionDisabled = (request) => {
  // Disable action button if no actions are available
  return !canEdit(request) && !canApprove(request) && !canMarkPaid(request) && !canDelete(request);
};

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
    project: formData.project || formData.expenditureType,
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

function handleEdit(request) {
  if (!canEdit(request)) return;
  editingRequest.value = { ...request };
  showEditRequestModal.value = true;
  openActionMenuId.value = null;
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
  const request = requests.value.find(r => r.id === id);
  if (!request || !canDelete(request)) return;
  
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
  currentDescription.value = "";
}

function showRejectionDetails(request) {
  const details = `Rejection Reason: ${request.rejectionReason}\nRejected By: ${
    request.rejectedBy?.name || "Unknown"
  }\nRejection Date: ${request.rejectedBy?.date || "Unknown"}`;
  currentDescription.value = details;
  showDescriptionModal.value = true;
}

function toggleActionMenu(id) {
  openActionMenuId.value = openActionMenuId.value === id ? null : id;
}

function closeActionMenu() {
  openActionMenuId.value = null;
}

function updateStatus(request, newStatus) {
  if (newStatus === "Rejected") {
    const rejectionReason = prompt("Please provide a reason for rejection:");
    if (!rejectionReason) return; // Cancel if no reason provided
    request.status = newStatus;
    request.rejectionReason = rejectionReason;
    request.rejectedBy = {
      name: user.value?.name || "Unknown",
      date: new Date().toISOString().split("T")[0],
    };
  } else {
    request.status = newStatus;
    if (newStatus === "Paid") {
      updateBudgetsForPaidRequest(request);
    }
  }
  openActionMenuId.value = null;
  saveRequests();
}

function getStatusClass(status) {
  if (!status) return "";
  const slug = status.toLowerCase().replace(" ", "-");
  return `status-${slug}`;
}

function handleStorageChange(event) {
  if (event.key === STORAGE_KEY) loadRequests();
}

onMounted(() => {
  loadRequests();
  window.addEventListener("storage", handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
});
</script>

<style scoped>
.requests-view {
  padding: 20px;
  font-family: Inter, sans-serif;
  background-color: white;
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

.rejection-info {
  margin-left: 8px;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.rejection-info:hover {
  opacity: 1;
}

/* Actions menu */
.actions-cell {
  position: relative;
  width: 40px;
}
.actions-toggle {
  position: relative;
  z-index: 1;
}
.actions-menu {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  font-size: 0.875rem;
}
.actions-menu button:hover:not(:disabled) {
  background-color: #f3f4f6;
}
.actions-menu button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 6px 0;
}
.btn-danger-text {
  color: #dc2626;
}

.btn-invoice {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-invoice:hover {
  background-color: #2563eb;
}

/* Description Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 8px;
  max-width: 720px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.modal-body {
  padding: 16px;
  color: #333;
  max-height: 60vh;
  overflow: auto;
}
.modal-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}
</style>