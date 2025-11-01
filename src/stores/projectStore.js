import { ref, computed, onMounted } from "vue";
import { defineStore } from "pinia";
import { useProjects } from "@/services/useProjects";

export const useProjectStore = defineStore("projects", () => {
  const { projects, loadProjects, createProject, deleteProject: deleteProjectService } = useProjects();

  const projectsByCategory = computed(() => {
    return projects.value.reduce((acc, proj) => {
      if (!acc[proj.category]) acc[proj.category] = [];
      acc[proj.category].push(proj);
      return acc;
    }, {});
  });

  function addProject(project) {
    createProject(project);
    loadProjects(); // Reload projects into the store after creation
  }

  async function deleteProject(projectId) {
    await deleteProjectService(projectId);
    loadProjects(); // Reload projects into the store after deletion
  }

  function updateProjectBudget(projectId, budget) {
    const project = projects.value.find((p) => p.id === projectId);
    if (project) project.budget = budget;
  }

  onMounted(() => {
    loadProjects();
  });

  return {
    projects,
    projectsByCategory,
    addProject,
    deleteProject,
    updateProjectBudget,
  };
});
