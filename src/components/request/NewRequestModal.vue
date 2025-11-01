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
        <div class="form-grid">
          <div class="form-group">
            <label for="expenditure-type">Expenditure Type</label>
            <select id="expenditure-type" v-model="form.expenditureType">
              <option value="OPEX">OPEX</option>
              <option value="CAPEX">CAPEX</option>
              <option value="Project Based">Project Based</option>
            </select>
          </div>
          <!-- Project Based -->
          <div
            class="form-group"
            v-if="form.expenditureType === 'Project Based' || form.expenditureType === 'CAPEX' || form.expenditureType === 'OPEX'"
          >
            <label for="expenditure-type">Projects</label>
            <select id="expenditure-type" v-model="form.project">
              <option
                v-for="(project, index) in projects"
                :key="index"
                :value="project.name"
              >
                {{ project.name }}
              </option>
            </select>
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
                <td><input type="text" v-model="item.vendor" /></td>
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
            <div class="approval-group">
              <label>Prepared By</label>
              <select v-model="form.preparedBy.name">
                <option disabled value="">Please select one</option>
                <option
                  v-for="user in props.users"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
              <input type="date" v-model="form.preparedBy.date" />
            </div>
            <div class="approval-group">
              <label>Reviewed By</label>
              <select
                v-model="form.reviewedBy.name"
                :disabled="isReviewerRestricted"
              >
                <option disabled value="">Please select one</option>
                <option
                  v-for="user in props.users"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
              <input
                type="date"
                v-model="form.reviewedBy.date"
                :disabled="isReviewerRestricted"
              />
            </div>
            <div class="approval-group">
              <label>Authorised By</label>
              <select
                v-model="form.authorisedBy.name"
                :disabled="isAuthorizerRestricted"
              >
                <option disabled value="">Please select one</option>
                <option
                  v-for="user in props.users"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
              <input
                type="date"
                v-model="form.authorisedBy.date"
                :disabled="isAuthorizerRestricted"
              />
            </div>
          </div>
        </div>

        <div class="payment-section">
          <h4>Payment Details</h4>
          <div class="payment-grid">
            <div class="form-group">
              <label for="bank">Bank</label>
              <input id="bank" type="text" v-model="form.bank" />
            </div>
            <div class="form-group">
              <label for="cheque-no">Cheque/MC No</label>
              <input id="cheque-no" type="text" v-model="form.chequeNo" />
            </div>
            <div class="form-group">
              <label for="payment-date">Date</label>
              <input id="payment-date" type="date" v-model="form.paymentDate" />
            </div>
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
import { ref, reactive, computed, watch } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { storeToRefs } from "pinia";

const { projects } = storeToRefs(useProjectStore());

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

const emit = defineEmits(["close", "submit", "update"]);

const isEditMode = computed(() => !!props.request);

const isReviewerRestricted = computed(
  () =>
    props.user &&
    props.user.role !== "CEO" &&
    props.user.role !== "FINANCE MANAGER"
);
const isAuthorizerRestricted = computed(
  () => props.user && props.user.role !== "CEO"
);

const form = reactive({
  expenditureType: "OPEX",
  items: [{ description: "", vendor: "", amount: 0 }],
  amountInWords: "",
  preparedBy: { name: "", signature: "", date: "" },
  reviewedBy: { name: "", signature: "", date: "" },
  authorisedBy: { name: "", signature: "", date: "" },
  bank: "",
  chequeNo: "",
  paymentDate: "",
});

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

function submitForm() {
  if (isEditMode.value) {
    emit("update", { ...form, totalAmount: totalAmount.value });
  } else {
    emit("submit", { ...form, totalAmount: totalAmount.value });
  }
}
</script>

<style scoped>
/* Same professional styling as other modals */
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
