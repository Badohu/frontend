<template>
  <div class="department-page">
    <header class="page-header">
      <h1>Departments</h1>
      <p class="subtitle">Manage your company's departments</p>
    </header>

    <div class="content-grid">
      <div class="card add-department-card">
        <div class="card-header">
          <h3>Add New Department</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="addDepartment">
            <div class="form-group">
              <label for="dept-name">Department Name</label>
              <input
                id="dept-name"
                v-model="newDepartment.name"
                placeholder="e.g., Finance, Sales"
                aria-label="New department name"
                class="form-input"
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!newDepartment.name.trim()"
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
                class="feather feather-plus"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Department
            </button>
          </form>
        </div>
      </div>

      <div class="card department-list-card">
        <div class="card-header">
          <h3>Current Departments ({{ departments.length }})</h3>
        </div>
        <div class="card-body">
          <ul class="department-list">
            <li
              v-for="dept in departments"
              :key="dept.id"
              class="department-item"
            >
              <span class="dept-name">{{ dept.name }}</span>
              <div class="actions">
                <button
                  class="btn btn-icon btn-danger"
                  @click="deleteDepartment(dept.id)"
                  aria-label="Delete department"
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
              </div>
            </li>
          </ul>
          <div v-if="departments.length === 0" class="empty-message">
            <p>No departments found.</p>
            <span>Use the form to add your first department.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.department-page {
  padding: 2rem;
  font-family: "Inter", sans-serif;
  background-color: #dddddd;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 2fr;
  }
}

.card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.card-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background-color: #f7921c;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #f5820a;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-icon {
  padding: 0.5rem;
}

.department-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.department-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.department-item:last-child {
  border-bottom: none;
}

.dept-name {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
}

.empty-message p {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-message span {
  font-size: 0.875rem;
}
</style>

<script setup>
import { ref, computed } from "vue";
import { useDepartments } from "@/services/useDepartments.js";

const {
  departments,
  addDepartment: addDepartmentComposable,
  deleteDepartment: deleteDepartmentComposable,
} = useDepartments();

// Reactive object for the new department input
const newDepartment = ref({ name: "" });

// Computes the next available ID by finding the max existing ID and adding 1
const nextId = computed(() => {
  if (departments.value.length === 0) return 100;
  return Math.max(...departments.value.map((d) => d.id)) + 1;
});

// --- Insertion (Adding a Department) ---
const addDepartment = () => {
  const name = newDepartment.value.name.trim();

  if (name) {
    addDepartmentComposable({
      id: nextId.value,
      name: name,
    });

    // Reset the input field
    newDepartment.value.name = "";
  } else {
    alert("Please enter a department name.");
  }
};

// --- Deletion (Removing a Department) ---
const deleteDepartment = (departmentId) => {
  if (
    confirm(
      `Are you sure you want to delete the department with ID ${departmentId}?`
    )
  ) {
    deleteDepartmentComposable(departmentId);
  }
};
</script>
