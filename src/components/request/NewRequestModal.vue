<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <h3>
          {{
            isEditMode
              ? "Edit Expenditure Approval"
              : "New Expenditure Approval"
          }}
        </h3>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </header>

      <form @submit.prevent="submitForm">
        <div class="form-section">
          <div class="section-header">
            <h4><span class="section-number">1</span> Request Details</h4>
            <div class="section-hint">
              Basic information about the expenditure request
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="expenditure-type">
                Expenditure Type
                <span class="required">*</span>
                <span
                  class="tooltip"
                  title="Select the type of expenditure for this request"
                  >?</span
                >
              </label>
              <select
                id="expenditure-type"
                v-model="form.expenditureType"
                required
                class="form-select"
              >
                <option value="OPEX">OPEX (Operating Expenditure)</option>
                <option value="CAPEX">CAPEX (Capital Expenditure)</option>
                <option value="Project Based">Project Based</option>
              </select>
            </div>
            <!-- Project Based -->
            <div
              class="form-group"
              v-if="
                form.expenditureType === 'Project Based' ||
                form.expenditureType === 'CAPEX' ||
                form.expenditureType === 'OPEX'
              "
            >
              <label for="expenditure-type">Projects</label>
              <select id="expenditure-type" v-model="form.project">
                <option disabled value="">Please select a project</option>
                <option
                  v-for="(project, index) in filteredProjects"
                  :key="project.id || index"
                  :value="project.name"
                >
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="items-table">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Vendor</th>
                <th>Amount (GHC)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="index">
                <td>
                  <input type="text" v-model="item.description" required />
                </td>
                <td>
                  <select v-model="item.vendor">
                    <option disabled value="">Select vendor</option>
                    <option v-for="(v, i) in vendors" :key="i" :value="v">
                      {{ v }}
                    </option>
                  </select>
                </td>
                <td>
                  <input type="number" v-model.number="item.amount" required />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn-remove"
                    @click="removeItem(index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="feather feather-trash-2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      ></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="btn-add-item" @click="addItem">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-plus"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Item
          </button>
        </div>

        <div class="summary-section">
          <div class="total-amount">
            <strong>Total:</strong> {{ formatCurrency(totalAmount) }}
          </div>
          <div class="amount-in-words">
            <label for="amount-in-words">Amount in Words</label>
            <input
              id="amount-in-words"
              type="text"
              v-model="form.amountInWords"
            />
          </div>
        </div>

        <div class="approval-section">
          <h4>Approvals</h4>
          <div class="approval-grid">
            <!-- Prepared By - always visible -->
            <div class="approval-group">
              <label>Prepared By</label>
              <div class="prepared-by-info">{{ currentUserName }}</div>
              <input
                type="datetime-local"
                v-model="form.preparedBy.date"
                disabled
              />
            </div>

            <!-- Reviewed By - only visible to HR and Finance Manager who didn't create the request -->
            <div class="approval-group" v-if="canReview && !isCreator">
              <label>Reviewed By</label>
              <select v-model="form.reviewedBy.name">
                <option disabled value="">Please select one</option>
                <option
                  v-for="user in filteredReviewedUsers"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
              <input type="datetime-local" v-model="form.reviewedBy.date" />
            </div>

            <!-- Authorised By - only visible to CEO -->
            <div class="approval-group" v-if="props.user?.role === 'CEO'">
              <label>Authorised By</label>
              <select v-model="form.authorisedBy.name">
                <option disabled value="">Please select one</option>
                <option
                  v-for="user in props.users"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
              <input type="datetime-local" v-model="form.authorisedBy.date" />
            </div>
          </div>
        </div>

        <div class="payment-section">
          <h4>Payment Mode</h4>
          <div class="payment-grid">
            <div class="form-group">
              <select v-model="form.paymentMethod">
                <option disabled value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="momo">Momo</option>
              </select>
            </div>

            <!-- Momo fields -->
            <div class="form-group" v-if="form.paymentMethod === 'momo'">
              <label for="momo-phone">Momo Phone</label>
              <input
                id="momo-phone"
                type="tel"
                v-model="form.momoPhone"
                placeholder="e.g. 0244xxxxxx"
              />
            </div>

            <!-- Bank fields -->
            <div class="form-group" v-if="form.paymentMethod === 'bank'">
              <label for="bank-select">Bank</label>
              <select id="bank-select" v-model="form.bank">
                <option disabled value="">Select Bank</option>
                <option value="UBA">UBA</option>
                <option value="Ecobank Bulk">Ecobank Bulk</option>
                <option value="Ecobank Voice">Ecobank Voice</option>
                <option value="Ecobank USD">Ecobank USD</option>
                <option value="Ecobank EUR">Ecobank EUR</option>
                <option value="GT Bank USD">GT Bank USD</option>
                <option value="GT Bank GHS">GT Bank GHS</option>
                <option value="UBA GHS">UBA GHS</option>
                <option value="CALBANK GHS">CalBank GHS</option>
              </select>
            </div>

            <div class="form-group" v-if="form.paymentMethod === 'bank'">
              <!-- <label for="account-number">Account Number</label>
              <input
                id="account-number"
                type="text"
                v-model="form.accountNumber"
              /> -->
            </div>

            <div class="form-group">
              <label for="cheque-no">Cheque/MC No</label>
              <input id="cheque-no" type="text" v-model="form.chequeNo" />
            </div>
            <div class="form-group">
              <label for="payment-date">Date</label>
              <input
                id="payment-date"
                type="datetime-local"
                v-model="form.paymentDate"
              />
            </div>
          </div>
        </div>

        <!-- Invoice upload/view -->
        <div class="form-group" style="margin-bottom: 1.5rem">
          <label for="invoice">{{
            isEditMode ? "Attached Invoices" : "Upload Invoice"
          }}</label>

          <!-- Upload in new mode -->
          <input
            v-if="!isEditMode"
            id="invoice"
            type="file"
            @change="onInvoiceChange"
            multiple
          />

          <!-- View in edit mode -->
          <div
            v-if="form.invoiceFiles && form.invoiceFiles.length"
            class="invoice-files"
          >
            <ul>
              <li
                v-for="(f, i) in form.invoiceFiles"
                :key="i"
                class="invoice-file-item"
              >
                {{ f.name }} ({{ f.size }} bytes)
                <button
                  v-if="isEditMode"
                  type="button"
                  class="btn-view-invoice"
                  @click="viewInvoice(f)"
                >
                  View Invoice
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Cancel
          </button>
          <button type="submit" class="btn-submit">
            {{ isEditMode ? "Update Request" : "Submit Request" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";

const { projects } = storeToRefs(useProjectStore());

const filteredProjects = computed(() => {
  const type = (form.expenditureType || "").toString().toLowerCase();
  if (!type) return projects.value || [];
  // normalize mapping: form values are 'OPEX','CAPEX','Project Based'
  const map = {
    opex: "opex",
    capex: "capex",
    "project based": "project based",
  };
  const target = map[type] || type;
  return (projects.value || []).filter(
    (p) => (p.category || "").toString().toLowerCase() === target
  );
});

const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  user: {
    type: Object,
    default: () => ({}),
  },
  request: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "submit", "update", "viewInvoice"]);

const isEditMode = computed(() => !!props.request);

// Current user name - computed for reactivity
const currentUserName = computed(() => {
  return props.user?.name || "Current User";
});

// Only HR and Finance Manager can review
const canReview = computed(() => {
  const role = props.user?.role;
  return role === "HR" || role === "FINANCE MANAGER";
});

// Check if current user is the creator of the request
const isCreator = computed(() => {
  return form.preparedBy.name === props.user?.name;
});
 
// form state
const form = reactive({
  expenditureType: "OPEX",
  project: "",
  items: [{ description: "", vendor: "", amount: 0 }],
  amountInWords: "",
  preparedBy: { name: "", signature: "", date: "" },
  reviewedBy: { name: "", signature: "", date: "" },
  authorisedBy: { name: "", signature: "", date: "" },
  // payment fields
  paymentMethod: "",
  momoPhone: "",
  bank: "",
  accountNumber: "",
  chequeNo: "",
  paymentDate: "",
  // invoice metadata
  invoiceFiles: [],
});

// vendors list (from localStorage)
const vendors = ref([]);
function loadVendors() {
  try {
    const raw = localStorage.getItem("vendors_v1");
    if (raw) vendors.value = JSON.parse(raw);
    else {
      vendors.value = ["MTN GH", "VODAFONE GH", "Local Supplies", "Other"];
      localStorage.setItem("vendors_v1", JSON.stringify(vendors.value));
    }
  } catch (e) {
    vendors.value = ["MTN GH", "VODAFONE GH", "Local Supplies", "Other"];
  }
}

function formatDateTimeLocal(dt = new Date()) {
  const d = new Date(dt);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

onMounted(() => {
  loadVendors();

  // Set prepared by to current user automatically
  if (!isEditMode.value) {
    form.preparedBy.name = currentUserName.value;
    form.preparedBy.date = formatDateTimeLocal();
  } else if (props.request) {
    // In edit mode, use the existing prepared by data
    Object.assign(form.preparedBy, props.request.preparedBy);
  }

  // Set default payment date if not set
  if (!form.paymentDate) {
    form.paymentDate = formatDateTimeLocal();
  }
});

// Watch for user prop changes and update preparedBy
watch(
  () => props.user,
  (newUser) => {
    if (newUser && !isEditMode.value) {
      form.preparedBy.name = newUser.name || '';
    }
  },
  { immediate: true }
);

// exclude current user from reviewed-by list
const filteredReviewedUsers = computed(() => {
  return (props.users || []).filter((u) => u.name !== props.user?.name);
});

function onInvoiceChange(e) {
  const files = Array.from(e.target.files || []);
  form.invoiceFiles = files.map((f) => ({
    name: f.name,
    size: f.size,
    type: f.type,
  }));
}

watch(
  () => props.request,
  (newRequest) => {
    if (newRequest) {
      Object.assign(form, newRequest);
    }
  },
  { immediate: true }
);

const totalAmount = computed(() => {
  return form.items.reduce((total, item) => total + (item.amount || 0), 0);
});

function addItem() {
  form.items.push({ description: "", vendor: "", amount: 0 });
}

function removeItem(index) {
  form.items.splice(index, 1);
}

function formatCurrency(value) {
  return `GHC ${value.toFixed(2)}`;
}

function viewInvoice(file) {
  // Emit event to parent to handle invoice viewing
  emit("viewInvoice", file);
}

function submitForm() {
  // Ensure preparedBy is always set to current user for new requests
  if (!isEditMode.value) {
    form.preparedBy.name = currentUserName.value;
    form.preparedBy.date = formatDateTimeLocal();
  }

  // include invoice metadata and a placeholder rejectedBy (null until rejected)
  const payload = {
    ...form,
    totalAmount: totalAmount.value,
    invoiceFiles: form.invoiceFiles || [],
    rejectedBy: null,
  };

  if (isEditMode.value) {
    emit("update", payload);
  } else {
    emit("submit", payload);
  }
}
</script>

<style scoped>
/* Same professional styling as other modals */
.prepared-by-info {
  padding: 0.75rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
}

.form-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.section-header h4 {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.section-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f7921c;
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  margin-right: 0.75rem;
  font-weight: 600;
}

.section-hint {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.required {
  color: #dc2626;
  margin-left: 0.25rem;
}

.tooltip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 50%;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  cursor: help;
  border: 1px solid #e5e7eb;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

input:focus,
select:focus {
  outline: none;
  border-color: #f7921c;
  box-shadow: 0 0 0 2px rgba(247, 146, 28, 0.1);
}

.invoice-files ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.invoice-file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.btn-view-invoice {
  padding: 0.25rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-view-invoice:hover {
  background: #2563eb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
}

input,
select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.items-table {
  margin-bottom: 1.5rem;
}

.items-table table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.items-table th {
  background-color: #f9fafb;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}

.btn-add-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-weight: 600;
}

.summary-section {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.amount-in-words {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.approval-section,
.payment-section {
  margin-bottom: 1.5rem;
}

.approval-section h4,
.payment-section h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.approval-grid,
.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.approval-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  cursor: pointer;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  background-color: #f7921c;
  color: white;
  cursor: pointer;
}

.btn-submit:hover {
  background-color: #f5820a;
}
</style>