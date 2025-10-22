<template>
  <div class="department-manager">
    <h2>Department Manager</h2>

    <div class="form-section">
      <h3>Add New Department</h3>
      <input
        v-model="newDepartment.name"
        @keyup.enter="addDepartment"
        placeholder="e.g., Finance, Sales"
        aria-label="New department name"
        class="name-input"
      />
      <button @click="addDepartment" :disabled="!newDepartment.name.trim()">
        Add Department
      </button>
    </div>

    <hr />

    <h3>Current Departments ({{ departments.length }})</h3>
    <table class="departments-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Department Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dept in departments" :key="dept.id">
          <td>{{ dept.id }}</td>
          <td>{{ dept.name }}</td>
          <td>
            <button class="delete-btn" @click="deleteDepartment(dept.id)">
              🗑️ Delete
            </button>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="departments.length === 0">
        <tr>
          <td colspan="3" class="empty-message">
            No departments available. Use the form above to add one!
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style scoped>
/* Basic styling for presentation */
.department-manager {
  max-width: 600px;
  margin: 0 auto;
  padding: 0px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.name-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f8a23e;
  color: white;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #e2a45d;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.departments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.departments-table th,
.departments-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.departments-table th {
  background-color: #eef;
}

.delete-btn {
  background-color: #f44336;
}

.delete-btn:hover {
  background-color: #da190b;
}

.empty-message {
  text-align: center;
  font-style: italic;
  color: #888;
  padding: 15px;
  background-color: #f0f0f0;
}
</style>

<script setup>
import { ref, computed } from "vue";

// --- State Management ---
// Reactive array to hold department data
const departments = ref([
  // { id: 101, name: "Marketing" },
  // { id: 102, name: "Engineering" },
  // { id: 103, name: "Human Resources" },
]);

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
    // Check for duplicates (case-insensitive)
    const isDuplicate = departments.value.some(
      (d) => d.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      alert("This department already exists!");
      return;
    }

    // Add the new department to the reactive array
    departments.value.push({
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
    // Filter out the department with the matching ID
    // This creates a new array and replaces the old one, triggering a view update.
    departments.value = departments.value.filter(
      (department) => department.id !== departmentId
    );
  }
};
</script>
