<template>
  <div class="users-page">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1>User Management</h1>
          <p class="subtitle">Manage system users, roles, and permissions</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-value">{{ users.length }}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ departments.length }}</span>
            <span class="stat-label">Departments</span>
          </div>
        </div>
      </div>
      <button class="btn primary" @click="openUserModal()">
        <i class="fas fa-user-plus"></i>
        Add New User
      </button>
    </header>

    <div class="controls-section">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input
          type="search"
          v-model="search"
          placeholder="Search by name, email, or department..."
          class="search-input"
        />
      </div>
      <div class="filters">
        <select v-model="departmentFilter" class="filter-select">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept">{{ dept }}</option>
        </select>
        <select v-model="roleFilter" class="filter-select">
          <option value="">All Roles</option>
          <option value="CEO">CEO</option>
          <option value="HR">HR</option>
          <option value="FINANCE MANAGER">Finance Manager</option>
          <option value="FINANCE OFFICER">Finance Officer</option>
          <option value="INTERN">Intern</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
      </div>
    </div>

    <div class="results-info">
      <span
        >Showing {{ filteredUsers.length }} of {{ users.length }} users</span
      >
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
              />
            </th>
            <th>User</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="7" class="empty-state">
              <i class="fas fa-users"></i>
              <p>No users found matching your criteria</p>
            </td>
          </tr>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td>
              <input type="checkbox" v-model="selectedUsers" :value="user.id" />
            </td>
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ getInitials(user.name) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                </div>
              </div>
            </td>
            <td class="email-cell">{{ user.email }}</td>
            <td>
              <span class="department-badge">
                <i class="fas fa-building"></i>
                {{ user.department }}
              </span>
            </td>
            <td>
              <span class="role-badge" :class="getRoleClass(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="status-badge active">Active</span>
            </td>
            <td>
              <div class="actions">
                <button
                  class="btn-icon"
                  @click="openUserModal(user)"
                  title="Edit user"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn-icon danger"
                  @click="deleteUser(user.id)"
                  title="Delete user"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk Actions Bar -->
    <div class="bulk-actions" v-if="selectedUsers.length > 0">
      <span>{{ selectedUsers.length }} user(s) selected</span>
      <div class="bulk-buttons">
        <button class="btn secondary" @click="clearSelection">Clear</button>
        <button class="btn danger" @click="bulkDelete">Delete Selected</button>
      </div>
    </div>

    <!-- User Modal -->
    <teleport to="body" v-if="showModal">
      <div class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <header class="modal-header">
            <div>
              <h2>{{ editingUser ? "Edit User" : "Add New User" }}</h2>
              <p class="modal-subtitle">
                {{
                  editingUser
                    ? "Update user information"
                    : "Create a new user account"
                }}
              </p>
            </div>
            <button class="close-btn" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </header>

          <form @submit.prevent="saveUser" class="user-form">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name <span class="required">*</span></label>
                <input
                  v-model="userForm.name"
                  required
                  placeholder="Enter full name"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Email Address <span class="required">*</span></label>
                <input
                  type="email"
                  v-model="userForm.email"
                  required
                  placeholder="user@example.com"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Department <span class="required">*</span></label>
                <select
                  v-model="userForm.department"
                  required
                  class="form-select"
                >
                  <option value="" disabled>Select department</option>
                  <option v-for="dept in departments" :key="dept">
                    {{ dept }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Role <span class="required">*</span></label>
                <select v-model="userForm.role" required class="form-select">
                  <option value="" disabled>Select role</option>
                  <option value="CEO">CEO</option>
                  <option value="HR">HR</option>
                  <option value="FINANCE MANAGER">Finance Manager</option>
                  <option value="FINANCE OFFICER">Finance Officer</option>
                  <option value="INTERN">Intern</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>
            </div>

            <div class="form-group" v-if="!editingUser">
              <label>Password <span class="required">*</span></label>
              <input
                type="password"
                v-model="userForm.password"
                required
                placeholder="Enter password"
                class="form-input"
              />
              <span class="form-hint">Minimum 6 characters</span>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn secondary" @click="closeModal">
                Cancel
              </button>
              <button type="submit" class="btn primary">
                <i
                  class="fas"
                  :class="editingUser ? 'fa-save' : 'fa-plus-circle'"
                ></i>
                {{ editingUser ? "Update User" : "Create User" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useUsers } from "@/services/useUsers";

const { users, addUser, updateUser, deleteUser: removeUser } = useUsers();

const search = ref("");
const departmentFilter = ref("");
const roleFilter = ref("");
const showModal = ref(false);
const editingUser = ref(null);
const selectedUsers = ref([]);
const selectAll = ref(false);

const userForm = reactive({
  name: "",
  email: "",
  department: "",
  role: "",
  password: "",
});

const departments = computed(() => [
  ...new Set(users.value.map((u) => u.department)),
]);

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const searchLower = search.value.toLowerCase();
    const matchesSearch =
      search.value === "" ||
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower);

    const matchesDepartment =
      departmentFilter.value === "" ||
      user.department === departmentFilter.value;

    const matchesRole =
      roleFilter.value === "" || user.role === roleFilter.value;

    return matchesSearch && matchesDepartment && matchesRole;
  });
});

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleClass(role) {
  const roleClasses = {
    CEO: "role-ceo",
    HR: "role-hr",
    "FINANCE MANAGER": "role-manager",
    "FINANCE OFFICER": "role-officer",
    INTERN: "role-intern",
    EMPLOYEE: "role-employee",
  };
  return roleClasses[role] || "";
}

function openUserModal(user = null) {
  editingUser.value = user;
  if (user) {
    Object.assign(userForm, user);
  } else {
    Object.assign(userForm, {
      name: "",
      email: "",
      department: "",
      role: "",
      password: "",
    });
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingUser.value = null;
}

function saveUser() {
  const payload = { ...userForm };
  if (editingUser.value) {
    payload.id = editingUser.value.id;
    updateUser(payload);
  } else {
    payload.id = Date.now();
    addUser(payload);
  }
  closeModal();
}

function deleteUser(id) {
  if (
    confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
  ) {
    removeUser(id);
    selectedUsers.value = selectedUsers.value.filter((uid) => uid !== id);
  }
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map((u) => u.id);
  } else {
    selectedUsers.value = [];
  }
}

function clearSelection() {
  selectedUsers.value = [];
  selectAll.value = false;
}

function bulkDelete() {
  if (
    confirm(
      `Are you sure you want to delete ${selectedUsers.value.length} user(s)? This action cannot be undone.`
    )
  ) {
    selectedUsers.value.forEach((id) => removeUser(id));
    clearSelection();
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.users-page {
  padding: 2rem;
  background-color: #dddddd;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  min-width: 100px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f7921c;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.controls-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #f7921c;
  box-shadow: 0 0 0 3px rgba(247, 146, 28, 0.1);
}

.filters {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.filter-select:focus {
  outline: none;
  border-color: #f7921c;
  box-shadow: 0 0 0 3px rgba(247, 146, 28, 0.1);
}

.results-info {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-row {
  transition: background-color 0.2s;
}

.user-row:hover {
  background-color: #f9fafb;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f7921c, #ffa940);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
}

.email-cell {
  color: #6b7280;
  font-size: 0.9rem;
}

.department-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #374151;
}

.department-badge i {
  font-size: 0.75rem;
  color: #9ca3af;
}

.role-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.role-ceo {
  background: #fef3c7;
  color: #92400e;
}

.role-hr {
  background: #dbeafe;
  color: #1e40af;
}

.role-manager {
  background: #f7921c1a;
  color: #c2410c;
}

.role-officer {
  background: #dcfce7;
  color: #166534;
}

.role-intern {
  background: #f3e8ff;
  color: #6b21a8;
}

.role-employee {
  background: #f3f4f6;
  color: #374151;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-icon.danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon.danger:hover {
  background: #fecaca;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.bulk-actions {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 100;
}

.bulk-actions span {
  font-weight: 500;
  color: #374151;
}

.bulk-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn.primary {
  background: #f7921c;
  color: white;
}

.btn.primary:hover {
  background: #e8830f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(247, 146, 28, 0.3);
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover {
  background: #e5e7eb;
}

.btn.danger {
  background: #dc2626;
  color: white;
}

.btn.danger:hover {
  background: #b91c1c;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.modal-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.user-form {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.required {
  color: #dc2626;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #f7921c;
  box-shadow: 0 0 0 3px rgba(247, 146, 28, 0.1);
}

.form-hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.825rem;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-stats {
    justify-content: flex-start;
  }
}
</style>
