<template>
  <div class="container">
    <header class="header">
      <h1>User Management</h1>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          placeholder="Search users..."
          class="search-input"
        />
        <button @click="showAddUserModal = true" class="add-user-btn">
          Add New User
        </button>
      </div>
    </header>

    <div class="user-list">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="confirmDelete(user)" class="btn btn-danger">
                Remove
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="filteredUsers.length === 0">
          <tr>
            <td colspan="4" class="text-center">No users found.</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New User</h5>
            <button
              type="button"
              class="close"
              @click="showAddUserModal = false"
            >
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addUser">
              <div class="form-group">
                <label for="name">Name</label>
                <input
                  id="name"
                  v-model="newUser.name"
                  placeholder="Enter full name"
                  required
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model="newUser.email"
                  type="email"
                  placeholder="Enter email address"
                  required
                  class="form-control"
                />
              </div>
              <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Add User</button>
                <button
                  @click="showAddUserModal = false"
                  type="button"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="userToDelete" class="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Deletion</h5>
            <button type="button" class="close" @click="userToDelete = null">
              <span>&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete
              <strong>{{ userToDelete.name }}</strong
              >?
            </p>
          </div>
          <div class="modal-footer">
            <button @click="deleteUser" class="btn btn-danger">
              Yes, Delete
            </button>
            <button @click="userToDelete = null" class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  font-family: "Inter", sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 300px;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  /* overflow: hidden; */
}

.table th,
.table td {
  padding: 0;
  /* text-align: left; */
  border-bottom: 1px solid #ddd;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.btn-danger {
  background-color: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-danger:hover {
  background-color: #dc3545;
  color: white;
}

.text-center {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: #6c757d;
}

.add-user-btn {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.add-user-btn:hover {
  background-color: #0056b3;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  width: 300px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Modal Styles */
.modal {
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

.modal-dialog {
  background: white;
  border-radius: 0.5rem;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content {
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.close {
  background: transparent;
  border: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
}

.close:hover {
  opacity: 0.75;
}

.modal-body {
  padding-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group .form-control {
  width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}
</style>

<script setup>
import { ref, computed } from "vue";

// --- State Management ---
const users = ref([
  { id: 1, name: "Alice Smith", email: "alice@example.com" },
  { id: 2, name: "Bob Johnson", email: "bob@example.com" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
  { id: 4, name: "David Lee", email: "david@example.com" },
]);

const newUser = ref({ name: "", email: "" });
const searchQuery = ref("");
const showAddUserModal = ref(false);
const userToDelete = ref(null);

let nextId = computed(() =>
  users.value.length > 0 ? Math.max(...users.value.map((u) => u.id)) + 1 : 1
);

// --- Computed Properties ---
const filteredUsers = computed(() =>
  users.value.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// --- User Actions ---
const addUser = () => {
  if (newUser.value.name.trim() && newUser.value.email.trim()) {
    users.value.push({
      id: nextId.value,
      ...newUser.value,
    });
    newUser.value = { name: "", email: "" };
    showAddUserModal.value = false;
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
};

const deleteUser = () => {
  if (userToDelete.value) {
    users.value = users.value.filter(
      (user) => user.id !== userToDelete.value.id
    );
    userToDelete.value = null;
  }
};
</script>
