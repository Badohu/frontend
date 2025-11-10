<template>
  <div class="projects-page">
    <header class="page-header">
      <h1>Expense Line Overview</h1>
      <button class="btn primary" @click="showModal = true">
        <i class="fas fa-plus-circle"></i> New Expense Line
      </button>
    </header>

    <div class="controls-bar">
      <div class="control-group">
        <label for="categoryFilter">Filter by Category:</label>
        <select id="categoryFilter" v-model="selectedCategory">
          <option value="All">All Categories</option>
          <option value="Opex">Opex</option>
          <option value="Capex">Capex</option>
          <option value="Project Based">Project Based</option>
        </select>
      </div>
      <div class="control-group">
        <label for="sortOrder">Sort by:</label>
        <select id="sortOrder" v-model="selectedSort">
          <option value="default">Default</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="category-asc">Category (A-Z)</option>
        </select>
      </div>
    </div>

    <div v-if="projects.length === 0" class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h2>No Projects Yet</h2>
      <p>Get started by creating your first project.</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <i class="fas fa-filter"></i>
      <h2>No Projects Found</h2>
      <p>
        No projects match the category "{{ selectedCategory }}". Try a different
        filter.
      </p>
    </div>

    <template v-else>
      <div class="projects-list">
        <div
          v-for="project in pagedProjects"
          :key="project.id"
          class="project-item"
          :class="`category-${project.category
            .toLowerCase()
            .replace(' ', '-')}`"
        >
          <i :class="categoryIcon(project.category)" class="item-icon"></i>

          <div class="item-details">
            <h3 class="item-name">{{ project.name }}</h3>
            <p v-if="project.description" class="description">
              {{ project.description }}
            </p>
          </div>

          <span class="category-label">{{ project.category }}</span>

          <button
            class="delete-btn"
            @click="deleteProject(project.id)"
            :disabled="isDeleteRestricted"
            title="Delete project"
          >
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <i class="fas fa-chevron-left"></i>
          Previous
        </button>

        <button
          v-for="page in pagesToShow"
          :key="page"
          class="page-number"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="page-btn"
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Next
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Results Summary -->
      <div class="pagination-info" v-if="sortedProjects.length > 0">
        <span>
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, sortedProjects.length) }}
          of {{ sortedProjects.length }} projects
        </span>
      </div>
    </template>

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
import { ref, reactive, computed, watch } from "vue";
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
  "Project Based": "fas fa-cogs",
};

const categoryIcon = (category) =>
  categoryIcons[category] || "fas fa-question-circle";

// Filter State
const selectedCategory = ref("All");

// Sort State
const selectedSort = ref("default");

// Computed property for filtered projects
const filteredProjects = computed(() => {
  if (selectedCategory.value === "All") {
    return projects.value;
  }
  return projects.value.filter(
    (project) => project.category === selectedCategory.value
  );
});

// Computed property for sorted projects
const sortedProjects = computed(() => {
  const projectsToSort = [...filteredProjects.value];

  switch (selectedSort.value) {
    case "name-asc":
      return projectsToSort.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return projectsToSort.sort((a, b) => b.name.localeCompare(a.name));
    case "category-asc":
      return projectsToSort.sort((a, b) =>
        a.category.localeCompare(b.category)
      );
    case "default":
    default:
      return projectsToSort;
  }
});

// Pagination for projects
const pageSize = ref(6);
const currentPage = ref(1);

// Total pages based on sorted projects
const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedProjects.value.length / pageSize.value))
);

// Paginated projects
const pagedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedProjects.value.slice(start, start + pageSize.value);
});

// Pages to show in pagination
const pagesToShow = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const range = [];
  const window = 2;
  const start = Math.max(1, current - window);
  const end = Math.min(total, current + window);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

function goToPage(p) {
  if (p < 1) p = 1;
  if (p > totalPages.value) p = totalPages.value;
  currentPage.value = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Reset to page 1 when filters change
watch([selectedCategory, selectedSort], () => {
  currentPage.value = 1;
});

// Adjust current page if it exceeds total pages
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = Math.max(1, newTotal);
  }
});

const isDeleteRestricted = computed(() => {
  try {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    const role = (u?.role || "").toString().toUpperCase();
    return !["CEO", "FINANCE MANAGER"].includes(role);
  } catch (e) {
    return true;
  }
});

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
/* --- PAGE & HEADER STYLES --- */
.projects-page {
  padding: 2rem;
  background-color:  white;
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

/* --- BUTTONS --- */
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

/* --- CONTROLS BAR --- */
.controls-bar {
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  background: var(--card, white);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.controls-bar label {
  font-weight: 600;
  color: var(--text-primary, #333);
}
.controls-bar select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background: var(--background, #fdfdfd);
  cursor: pointer;
}
.controls-bar select:focus {
  outline: none;
  border-color: var(--primary-color, #007bff);
}

/* --- EMPTY STATE --- */
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

/* --- LIST STYLES --- */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.project-item {
  background: var(--card, white);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1rem 1.5rem;
  border-left: 5px solid;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.project-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Category-specific border colors */
.category-opex {
  border-color: #4a90e2;
}
.category-capex {
  border-color: #f5a623;
}
.category-project-based {
  border-color: #7ed321;
}

/* Item Icon */
.item-icon {
  font-size: 1.5rem;
  color: var(--text-secondary, #666);
}

/* Main content block */
.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.description {
  color: var(--text-secondary, #555);
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Category Label */
.category-label {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
}

/* Delete Button */
.delete-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s, transform 0.2s;
  margin-left: auto;
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  transform: scale(1.1);
}
.delete-btn:active {
  transform: scale(0.95);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- PAGINATION STYLES --- */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0 1rem 0;
}

.page-btn,
.page-number {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.page-number.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.pagination-info {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* --- MODAL STYLES --- */
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

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .project-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .delete-btn {
    margin-left: 0;
    align-self: flex-end;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .page-btn,
  .page-number {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
