<template>
  <div class="projects-page">
    <header class="page-header">
      <h1>Expense Line Overview</h1>
      <button class="btn primary" @click="showModal = true">
        <i class="fas fa-plus-circle"></i> New Expense Line
      </button>
    </header>

    <!-- Empty State -->
    <div v-if="projects.length === 0" class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h2>No Projects Yet</h2>
      <p>Get started by creating your first project.</p>
    </div>

    <!-- Projects Grid -->
    <div v-else class="projects-grid">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        :class="`category-${project.category.toLowerCase()}`"
      >
        <div class="card-header">
          <i :class="categoryIcon(project.category)"></i>
          <h3>{{ project.name }}</h3>
        </div>
        <p class="description">{{ project.description }}</p>
        <div class="meta">
          <span class="category-label">{{ project.category }}</span>
        </div>
        <button
          class="delete-btn"
          @click="deleteProject(project.id)"
          title="Delete project"
        >
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Project Creation Modal -->
    <teleport to="body">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal">
          <header class="modal-header">
            <h2>Create New Project</h2>
            <button class="close-btn" @click="showModal = false">
              &times;
            </button>
          </header>
          <form @submit.prevent="createProject">
            <div class="form-group">
              <label for="projectName">Expense Line</label>
              <input
                id="projectName"
                v-model="form.name"
                required
                placeholder="e.g., Q4 Marketing Campaign"
              />
            </div>

            <div class="form-group">
              <label for="projectCategory">Category</label>
              <select id="projectCategory" v-model="form.category" required>
                <option disabled value="">Select a category</option>
                <option value="Opex">Opex</option>
                <option value="Capex">Capex</option>
                <option value="Project Based">Project Based</option>
              </select>
            </div>

            <div class="form-group">
              <label for="projectDescription">Description</label>
              <textarea
                id="projectDescription"
                v-model="form.description"
                rows="4"
                placeholder="Briefly describe the project's goals"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button
                type="button"
                class="btn-cancel"
                @click="showModal = false"
              >
                Cancel
              </button>
              <button type="submit" class="btn primary">Create Project</button>
            </div>
          </form>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { formatCurrency } from "@/services/useCurrency";
import { storeToRefs } from "pinia";

const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const showModal = ref(false);
const form = reactive({
  name: "",
  category: "",
  description: "",
});

const categoryIcons = {
  Opex: "fas fa-laptop-code",
  Capex: "fas fa-bullhorn",
  "Project based": "fas fa-cogs",
};

const categoryIcon = (category) =>
  categoryIcons[category] || "fas fa-question-circle";

function createProject() {
  if (!form.name || !form.category) {
    alert("Project name and category are required.");
    return;
  }
  projectStore.addProject({ ...form, budget: 0 });
  showModal.value = false;
  Object.assign(form, { name: "", category: "", description: "" });
}

function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    projectStore.deleteProject(projectId);
  }
}
</script>

<style scoped>
.projects-page {
  padding: 2rem;
  background-color: var(--background, #f8f9fa);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--text-primary, #333);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn.primary {
  background-color: #007bff;
  color: white;
}

.btn.primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn.primary:active {
  transform: translateY(0);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: var(--card, white);
  border-radius: 12px;
  border: 2px dashed var(--border-color, #e0e0e0);
}

.empty-state .fas {
  font-size: 4rem;
  color: var(--primary-color, #007bff);
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary, #666);
  margin-bottom: 1.5rem;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: var(--card, white);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  border-left: 5px solid;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Category-specific border colors */
.category-opex {
  border-color: #4a90e2;
}
.category-capex {
  border-color: #f5a623;
}
.category-project.based {
  border-color: #7ed321;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-header .fas {
  font-size: 1.5rem;
  color: var(--text-secondary, #666);
}

.card-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.description {
  color: var(--text-secondary, #555);
  margin-bottom: 1rem;
  min-height: 40px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #777;
}

.category-label {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: 500;
}

.budget {
  font-weight: bold;
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.95);
}

/* Modal Styles */
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
  max-width: 550px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
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
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #888;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
