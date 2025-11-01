<template>
  <teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="cancel">
      <div class="modal">
        <header class="modal-header">
          <h2>Confirm Deletion</h2>
          <button class="close-btn" @click="cancel">&times;</button>
        </header>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="cancel">
            Cancel
          </button>
          <button type="button" class="btn danger" @click="confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Are you sure you want to delete this item?",
  },
});

const emit = defineEmits(["confirm", "cancel"]);

function confirm() {
  emit("confirm");
}

function cancel() {
  emit("cancel");
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-primary, #333);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #888;
}

.modal-body {
  margin-bottom: 1.5rem;
  color: var(--text-secondary, #555);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn.danger {
  background-color: #dc3545;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn.danger:hover {
  background-color: #c82333;
}
</style>
