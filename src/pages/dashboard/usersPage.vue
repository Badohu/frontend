<template>
  <div>
    <h2>User Management Table </h2>

    <div class="user-form">
      <h3>Add New User</h3>
      <input
        v-model="newUser.name"
        placeholder="Name"
        aria-label="New user name"
      />
      <input id="add new user"
        v-model="newUser.email"
        placeholder="Email"
        aria-label="New user email"
      />
      <button @click="addUser" id="adduser"> Add User</button>
    </div>

    <hr />

    <h3>Current Users ({{ users.length }})</h3>
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
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button class="delete-btn" @click="deleteUser(user.id)">
               Remove
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="users.length === 0">
        <tr>
          <td colspan="4" style="text-align: center">
            No users found. Start adding some!
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
/* Basic styling for presentation */
.user-form {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* #add new user {
  padding: 8px 12px;
  background-color:#f8a23e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
} */

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
}

.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.users-table th {
  background-color: #f2f2f2;
}

#adduser {
  padding: 8px 12px;
  background-color:#f8a23e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 2px 2px;
  cursor: pointer;
  border-radius: 4px;
}
</style>

<script setup>
import { ref, computed } from "vue";

// --- State Management ---
const users = ref([
  // { id: 1, name: "Alice Smith", email: "alice@example.com" },
  // { id: 2, name: "Bob Johnson", email: "bob@example.com" },
]);

const newUser = ref({ name: "", email: "" });
let nextId = computed(() =>
  users.value.length > 0 ? Math.max(...users.value.map((u) => u.id)) + 1 : 1
);

// --- Insertion (Adding a User) ---
const addUser = () => {
  if (newUser.value.name.trim() && newUser.value.email.trim()) {
    users.value.push({
      id: nextId.value,
      name: newUser.value.name.trim(),
      email: newUser.value.email.trim(),
    });

    // Reset the form
    newUser.value.name = "";
    newUser.value.email = "";
  } else {
    alert("Please enter both name and email.");
  }
};

// --- Deletion (Removing a User) ---
const deleteUser = (userId) => {
  if (confirm(`Are you sure you want to delete user ID ${userId}?`)) {
    users.value = users.value.filter((user) => user.id !== userId);
  }
};
</script>
