<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>Allocate Budget</h3>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label for="project-select">Project</label>
          <select v-model="selectedProject" id="project-select" required>
            <option disabled value="">Please select a project</option>
            <optgroup v-for="(projects, category) in projectsByCategory" :label="category" :key="category">
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </optgroup>
          </select>
        </div>
        <div class="form-group">
          <label for="budget-amount">Amount</label>
          <input v-model.number="amount" id="budget-amount" type="number" min="0" required />
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')">Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProjects } from '@/services/useProjects';

const { projects } = useProjects();

const selectedProject = ref('');
const amount = ref(0);

const emit = defineEmits(['close', 'save']);

const projectsByCategory = computed(() => {
  const grouped = {};
  projects.value.forEach(p => {
    if (!grouped[p.category]) {
      grouped[p.category] = [];
    }
    grouped[p.category].push(p);
  });
  return grouped;
});

function handleSave() {
  if (!selectedProject.value || amount.value <= 0) return;
  const project = projects.value.find(p => p.id === selectedProject.value);
  if (project) {
    emit('save', { ...project, budget: amount.value });
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
