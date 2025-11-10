<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <div class="modal-title">
          <h3>{{ invoices.length > 1 ? "Invoices" : "View Invoice" }}</h3>
          <span v-if="invoices.length > 1" class="invoice-count">
            {{ selectedIndex + 1 }} of {{ invoices.length }}
          </span>
        </div>
        <button class="modal-close" @click="$emit('close')" title="Close">
          &times;
        </button>
      </header>

      <div class="invoice-content" v-if="selectedInvoice">
        <img
          v-if="isImage"
          :src="invoiceUrl"
          :alt="selectedInvoice.name"
          class="invoice-image"
        />

        <iframe
          v-else-if="isPDF"
          :src="invoiceUrl"
          class="invoice-pdf"
          type="application/pdf"
        ></iframe>

        <div v-else class="invoice-download">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
              stroke="#6b7280"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13 2V9H20"
              stroke="#6b7280"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h4>{{ selectedInvoice.name }}</h4>
          <p>This file type can't be previewed.</p>
          <button @click="downloadInvoice" class="btn-download">
            Download File
          </button>
        </div>
      </div>
      <div v-else class="invoice-content">
        <p>No invoice selected.</p>
      </div>

      <div class="invoice-navigation">
        <div class="nav-group actions">
          <button
            v-if="canEdit && selectedInvoice"
            class="btn-action delete"
            @click="deleteInvoice(selectedIndex)"
            title="Delete this invoice"
          >
            Delete
          </button>

          <label
            v-if="canEdit"
            class="btn-action add"
            title="Add more invoices"
          >
            <input
              type="file"
              multiple
              @change="addInvoices"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            />
            Add Files
          </label>
        </div>

        <div v-if="invoices.length > 1" class="nav-group controls">
          <button
            class="nav-btn"
            @click="selectedIndex = Math.max(0, selectedIndex - 1)"
            :disabled="selectedIndex === 0"
          >
            ◀ Previous
          </button>

          <button
            class="nav-btn"
            @click="
              selectedIndex = Math.min(invoices.length - 1, selectedIndex + 1)
            "
            :disabled="selectedIndex === invoices.length - 1"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- SCRIPT REMAINS UNCHANGED ---
// All your original <script setup> logic is perfect.
// It was just a styling problem.
import { ref, computed } from "vue";

const props = defineProps({
  invoices: {
    type: Array,
    default: () => [],
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "update:invoices"]);

const selectedIndex = ref(0);

const selectedInvoice = computed(() => props.invoices[selectedIndex.value]);

// File type helpers
const isImage = computed(() => {
  return selectedInvoice.value?.type?.startsWith("image/");
});

const isPDF = computed(() => {
  return selectedInvoice.value?.type === "application/pdf";
});

// URL handling
const invoiceUrl = computed(() => getFileUrl(selectedInvoice.value));

function getFileUrl(file) {
  if (!file) return null;
  if (file.url) return file.url;
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  return null;
}

// File operations
function downloadInvoice() {
  const file = selectedInvoice.value;
  if (file.url) {
    window.open(file.url, "_blank");
  } else if (file instanceof File) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function addInvoices(event) {
  const files = Array.from(event.target.files || []);
  if (files.length) {
    const newInvoices = [...props.invoices, ...files];
    emit("update:invoices", newInvoices);
    // Auto-select the newly added file
    selectedIndex.value = newInvoices.length - 1;
  }
}

function deleteInvoice(index) {
  if (!confirm("Are you sure you want to delete this invoice?")) return;

  const newInvoices = [...props.invoices];
  newInvoices.splice(index, 1);
  emit("update:invoices", newInvoices);

  if (selectedIndex.value >= newInvoices.length) {
    selectedIndex.value = Math.max(0, newInvoices.length - 1);
  }
}
</script>

<style scoped>
/* --- SIMPLE & MINIMALIST STYLES --- 
*/
.modal-overlay {
  position: fixed;
  inset: 0;
  /* Simple dark overlay */
  background-color: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #ffffff;
  border-radius: 8px;
  width: 100%;
  max-width: 900px; /* Max width for the modal */
  max-height: 90vh; /* Max height */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* --- Header --- */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.modal-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111;
}

.invoice-count {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 0;
}
.modal-close:hover {
  color: #111;
}

/* --- Main Content --- */
.invoice-content {
  flex: 1; /* This makes it take all available space */
  overflow: auto; /* Adds scroll if content is too tall */
  padding: 1.5rem;
  display: grid;
  place-items: center;
  background: #f9f9f9;
  min-height: 400px;
}

.invoice-image {
  max-width: 100%;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #eee;
}

.invoice-pdf {
  width: 100%;
  height: 65vh; /* Takes full height of the content area */
  border: none;
  border-radius: 4px;
}

.invoice-download {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  color: #6b7280;
}
.invoice-download h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.invoice-download p {
  margin: 0;
  font-size: 0.9rem;
}

.btn-download {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.btn-download:hover {
  background: #1d4ed8;
}

/* --- Footer Navigation --- */
.invoice-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Allows wrapping on small screens */
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: #fff;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Base button style for all footer buttons */
.nav-btn,
.btn-action {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #f9f9f9;
  border-color: #bbb;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Specific Action Buttons */
.btn-action.delete {
  color: #ef4444;
  border-color: #fca5a5;
}
.btn-action.delete:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

.btn-action.add {
  color: #2563eb;
  border-color: #93c5fd;
}
.btn-action.add:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

/* Hide file input */
.btn-action.add input[type="file"] {
  display: none;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    max-height: 95vh;
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
  .invoice-navigation {
    flex-direction: column-reverse; /* Puts nav on bottom */
  }
  .nav-group.controls {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
