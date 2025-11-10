import { ref, computed } from "vue";

const PROJECTS_STORAGE_KEY = "projects_v1";

const projects = ref([]);
const user = ref(null);

// Default data if nothing is in local storage
const defaultProjects = [
  {
    id: 2,
    name: "Mobile App",
    owner: "Dev Team",
    budget: 200000,
    category: "project based",
    used: 50000,
  },
  {
    id: 3,
    name: "Office Upgrade",
    owner: "Operations",
    budget: 150000,
    category: "capex",
    used: 75000,
  },
  {
    id: 4,
    name: "Cloud Hosting",
    owner: "IT",
    budget: 30000,
    category: "opex",
    used: 15000,
  },
];

function safeJSONParse(item) {
  try {
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
}

export function useProjects() {
  function loadProjects() {
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
      const userData = safeJSONParse(localStorage.getItem("user"));
      user.value = userData;

      let allProjects = [];
      if (raw) {
        allProjects = safeJSONParse(raw) || defaultProjects;
      } else {
        allProjects = defaultProjects;
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
      }

      if (user.value && user.value.role !== "ceo" && user.value.projects) {
        projects.value = allProjects.filter((p) =>
          user.value.projects.includes(p.name)
        );
      } else {
        projects.value = allProjects;
      }
    } catch (e) {
      console.error("Failed to load projects from local storage:", e);
      projects.value = [];
    }
  }

  function saveProject(projectToSave) {
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (raw) {
        let allProjects = safeJSONParse(raw) || [];
        const index = allProjects.findIndex((p) => p.id === projectToSave.id);
        if (index !== -1) {
          allProjects[index] = projectToSave;
          localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(allProjects)
          );
          // Also update the local ref
          const localIndex = projects.value.findIndex(
            (p) => p.id === projectToSave.id
          );
          if (localIndex !== -1) {
            projects.value[localIndex] = projectToSave;
          }
        }
      }
    } catch (e) {
      console.error("Failed to save project to local storage:", e);
    }
  }

  function createProject(projectData) {
    try {
      const allProjects =
        safeJSONParse(localStorage.getItem(PROJECTS_STORAGE_KEY)) || [];
      const newProject = {
        id: Date.now(), // Simple unique ID
        ...projectData,
        budget: 0, // Initialize budget
        used: 0,
      };
      allProjects.push(newProject);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
      loadProjects(); // aod projects to get the new project
    } catch (e) {
      console.error("Failed to create project:", e);
    }
  }

  function deleteProject(projectId) {
    try {
      // Role check: only CEO and FINANCE MANAGER can delete projects
      const userData = safeJSONParse(localStorage.getItem("user")) || {};
      const role = (userData.role || "").toString().toUpperCase();
      const allowedRoles = ["CEO", "FINANCE MANAGER"];
      if (!allowedRoles.includes(role)) {
        // prevent deletion and notify the user
        alert("Only CEO and Finance Manager can delete projects.");
        return;
      }

      let allProjects =
        safeJSONParse(localStorage.getItem(PROJECTS_STORAGE_KEY)) || [];
      allProjects = allProjects.filter((p) => p.id !== projectId);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
      loadProjects(); // Reload projects
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  }

  return {
    projects,
    user,
    loadProjects,
    saveProject,
    createProject,
    deleteProject,
  };
}
