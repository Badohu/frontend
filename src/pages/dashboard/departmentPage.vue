<template>
  <div class="department-page">
    <header class="page-header">
      <div class="header-content">
        <h1>Departments</h1>
        <p class="subtitle">Manage your company's organizational structure</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportDepartments">
          <DownloadIcon />
          Export
        </button>
      </div>
    </header>

    <div class="content-grid">
      <!-- Add Department Card -->
      <div class="card add-department-card">
        <div class="card-header">
          <h3>Add New Department</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="addDepartment" class="department-form">
            <div class="form-group">
              <label for="dept-name">Department Name *</label>
              <input
                id="dept-name"
                v-model="newDepartment.name"
                placeholder="e.g., Finance, Human Resources"
                aria-label="New department name"
                class="form-input"
                :class="{ error: formErrors.name }"
                @input="clearError('name')"
              />
              <span v-if="formErrors.name" class="error-message">{{
                formErrors.name
              }}</span>
            </div>

            <div class="form-group">
              <label for="dept-code">Department Code</label>
              <input
                id="dept-code"
                v-model="newDepartment.code"
                placeholder="e.g., FIN, HR"
                aria-label="Department code"
                class="form-input"
                maxlength="10"
              />
              <span class="helper-text"
                >Unique identifier for the department (optional)</span
              >
            </div>

            <div class="form-group">
              <label for="dept-description">Description</label>
              <textarea
                id="dept-description"
                v-model="newDepartment.description"
                placeholder="Brief description of the department's function..."
                aria-label="Department description"
                class="form-input textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-outline"
                @click="resetForm"
                :disabled="!isFormDirty"
              >
                Reset
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!isFormValid"
                :class="{ loading: isAdding }"
              >
                <PlusIcon v-if="!isAdding" />
                <span v-if="isAdding">Adding...</span>
                <span v-else>Add Department</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Departments List Card -->
      <div class="card department-list-card">
        <div class="card-header">
          <div class="card-header-content">
            <h3>Departments ({{ filteredDepartments.length }})</h3>
            <div class="card-actions">
              <div class="search-box">
                <SearchIcon />
                <input
                  v-model="searchQuery"
                  placeholder="Search departments..."
                  class="search-input"
                />
              </div>
              <select v-model="sortBy" class="sort-select">
                <option value="name">Sort by Name</option>
                <option value="code">Sort by Code</option>
                <option value="created">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-body">
          <div
            v-if="filteredDepartments.length > 0"
            class="department-list-container"
          >
            <ul class="department-list">
              <li
                v-for="dept in sortedDepartments"
                :key="dept.id"
                class="department-item"
                :class="{ expanded: expandedDept === dept.id }"
              >
                <div class="dept-main-info" @click="toggleExpand(dept.id)">
                  <div class="dept-identifier">
                    <span class="dept-name">{{ dept.name }}</span>
                    <span v-if="dept.code" class="dept-code">{{
                      dept.code
                    }}</span>
                  </div>
                  <div class="dept-meta">
                    <span class="dept-date">{{
                      formatDate(dept.createdAt)
                    }}</span>
                    <ChevronDownIcon class="expand-icon" />
                  </div>
                </div>

                <div v-if="expandedDept === dept.id" class="dept-details">
                  <p v-if="dept.description" class="dept-description">
                    {{ dept.description }}
                  </p>
                  <p v-else class="no-description">No description provided</p>

                  <div class="dept-actions">
                    <button
                      class="btn btn-outline btn-sm"
                      @click="editDepartment(dept)"
                    >
                      <EditIcon />
                      Edit
                    </button>
                    <button
                      class="btn btn-danger btn-sm"
                      @click="deleteDepartment(dept.id)"
                    >
                      <TrashIcon />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <FolderIcon />
            </div>
            <h4>No departments found</h4>
            <p v-if="searchQuery">No departments match your search criteria</p>
            <p v-else>Get started by creating your first department</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Department Modal -->
    <div v-if="editingDepartment" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Department</h3>
          <button class="btn-close" @click="closeModal" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateDepartment">
            <div class="form-group">
              <label>Department Name *</label>
              <input
                v-model="editingDepartment.name"
                class="form-input"
                :class="{ error: formErrors.name }"
              />
              <span v-if="formErrors.name" class="error-message">{{
                formErrors.name
              }}</span>
            </div>

            <div class="form-group">
              <label>Department Code</label>
              <input
                v-model="editingDepartment.code"
                class="form-input"
                maxlength="10"
              />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="editingDepartment.description"
                class="form-input textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" @click="closeModal">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!editingDepartment.name.trim()"
              >
                Update Department
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.department-page {
  padding: 2rem;
  font-family: "Inter", system-ui, sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 400px 1fr;
  }
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  color: #64748b;
  width: 18px;
  height: 18px;
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 200px;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.card-body {
  padding: 1.5rem;
}

.department-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.helper-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.error-message {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #f7921c;
  color: white;
  border: 1px solid #f7921c;
}

.btn-primary:hover:not(:disabled) {
  background: #e6830a;
  border-color: #e6830a;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #64748b;
  color: white;
  border: 1px solid #64748b;
}

.btn-secondary:hover:not(:disabled) {
  background: #475569;
}

.btn-outline {
  background: transparent;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.btn-outline:hover:not(:disabled) {
  background: #f8fafc;
  color: #374151;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: 1px solid #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-icon {
  padding: 0.5rem;
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}

.department-list-container {
  max-height: 600px;
  overflow-y: auto;
}

.department-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.department-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.department-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.department-item.expanded {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.dept-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
}

.dept-identifier {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dept-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.dept-code {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.dept-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.expand-icon {
  transition: transform 0.2s ease;
  width: 18px;
  height: 18px;
}

.department-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.dept-details {
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
  padding-top: 1rem;
}

.dept-description {
  color: #475569;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.no-description {
  color: #94a3b8;
  font-style: italic;
  margin: 0 0 1rem 0;
}

.dept-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: #cbd5e1;
}

.empty-state h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #475569;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #64748b;
  border-radius: 6px;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .department-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .card-header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .card-actions {
    justify-content: space-between;
  }

  .search-input {
    width: 150px;
  }

  .dept-main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .dept-meta {
    align-self: flex-end;
  }

  .form-actions,
  .modal-actions {
    flex-direction: column;
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useDepartments } from "@/services/useDepartments.js";

// Icons
const PlusIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
};

const DownloadIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

const SearchIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
};

const ChevronDownIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
};

const EditIcon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};

const TrashIcon = {
  template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
};

const FolderIcon = {
  template: `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
};

const CloseIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

// Composables
const {
  departments,
  addDepartment: addDepartmentComposable,
  deleteDepartment: deleteDepartmentComposable,
  updateDepartment: updateDepartmentComposable,
} = useDepartments();

// Reactive state
const newDepartment = ref({
  name: "",
  code: "",
  description: "",
});

const searchQuery = ref("");
const sortBy = ref("name");
const expandedDept = ref(null);
const editingDepartment = ref(null);
const isAdding = ref(false);
const formErrors = ref({});

// Computed properties
const isFormDirty = computed(() => {
  return (
    newDepartment.value.name.trim() ||
    newDepartment.value.code.trim() ||
    newDepartment.value.description.trim()
  );
});

const isFormValid = computed(() => {
  return (
    newDepartment.value.name.trim().length > 0 &&
    newDepartment.value.name.trim().length <= 100
  );
});

const filteredDepartments = computed(() => {
  if (!searchQuery.value.trim()) return departments.value;

  const query = searchQuery.value.toLowerCase().trim();
  return departments.value.filter(
    (dept) =>
      dept.name.toLowerCase().includes(query) ||
      (dept.code && dept.code.toLowerCase().includes(query)) ||
      (dept.description && dept.description.toLowerCase().includes(query))
  );
});

const sortedDepartments = computed(() => {
  const depts = [...filteredDepartments.value];

  switch (sortBy.value) {
    case "name":
      return depts.sort((a, b) => a.name.localeCompare(b.name));
    case "code":
      return depts.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    case "created":
      return depts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    default:
      return depts;
  }
});

// Methods
const validateForm = () => {
  formErrors.value = {};

  if (!newDepartment.value.name.trim()) {
    formErrors.value.name = "Department name is required";
    return false;
  }

  if (newDepartment.value.name.trim().length > 100) {
    formErrors.value.name = "Department name must be less than 100 characters";
    return false;
  }

  return true;
};

const clearError = (field) => {
  if (formErrors.value[field]) {
    delete formErrors.value[field];
  }
};

const addDepartment = async () => {
  if (!validateForm()) return;

  isAdding.value = true;

  try {
    const departmentData = {
      id: generateId(),
      name: newDepartment.value.name.trim(),
      code: newDepartment.value.code.trim().toUpperCase(),
      description: newDepartment.value.description.trim(),
      createdAt: new Date().toISOString(),
    };

    addDepartmentComposable(departmentData);
    resetForm();
  } catch (error) {
    console.error("Error adding department:", error);
    alert("Failed to add department. Please try again.");
  } finally {
    isAdding.value = false;
  }
};

const resetForm = () => {
  newDepartment.value = {
    name: "",
    code: "",
    description: "",
  };
  formErrors.value = {};
};

const toggleExpand = (deptId) => {
  expandedDept.value = expandedDept.value === deptId ? null : deptId;
};

const editDepartment = (department) => {
  editingDepartment.value = { ...department };
};

const updateDepartment = () => {
  if (!editingDepartment.value.name.trim()) {
    formErrors.value.name = "Department name is required";
    return;
  }

  updateDepartmentComposable(editingDepartment.value);
  closeModal();
};

const deleteDepartment = (departmentId) => {
  const department = departments.value.find((d) => d.id === departmentId);
  if (
    department &&
    confirm(
      `Are you sure you want to delete the "${department.name}" department? This action cannot be undone.`
    )
  ) {
    deleteDepartmentComposable(departmentId);
    if (expandedDept.value === departmentId) {
      expandedDept.value = null;
    }
  }
};

const closeModal = () => {
  editingDepartment.value = null;
  formErrors.value = {};
};

const generateId = () => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const exportDepartments = () => {
  const data = JSON.stringify(departments.value, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `departments-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Initialize with sample data if empty
onMounted(() => {
  if (departments.value.length === 0) {
    const sampleDepartments = [
      {
        id: generateId(),
        name: "Finance",
        code: "FIN",
        description:
          "Manages company finances, budgeting, and financial reporting",
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: "Human Resources",
        code: "HR",
        description:
          "Responsible for recruitment, employee relations, and benefits administration",
        createdAt: new Date().toISOString(),
      },
    ];

    sampleDepartments.forEach((dept) => {
      addDepartmentComposable(dept);
    });
  }
});
</script>
