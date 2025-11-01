import { ref } from "vue";

const DEPARTMENTS_STORAGE_KEY = "departments_v1";

const defaultDepartments = [
  { id: 101, name: "Marketing" },
  { id: 102, name: "Engineering" },
  { id: 103, name: "Human Resources" },
];

const departments = ref([]);

function safeJSONParse(item) {
  try {
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
}

export function useDepartments() {
  function loadDepartments() {
    try {
      const raw = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (raw) {
        departments.value = safeJSONParse(raw) || defaultDepartments;
      } else {
        departments.value = defaultDepartments;
        localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(defaultDepartments));
      }
    } catch (e) {
      console.error("Failed to load departments from local storage:", e);
      departments.value = defaultDepartments;
    }
  }

  function addDepartment(department) {
    const isDuplicate = departments.value.some(
      (d) => d.name.toLowerCase() === department.name.toLowerCase()
    );

    if (isDuplicate) {
      alert("This department already exists!");
      return;
    }

    departments.value.push(department);
    saveDepartments();
  }

  function deleteDepartment(departmentId) {
    departments.value = departments.value.filter(d => d.id !== departmentId);
    saveDepartments();
  }

  function saveDepartments() {
    try {
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments.value));
    } catch (e) {
      console.error("Failed to save departments to local storage:", e);
    }
  }

  loadDepartments();

  return {
    departments,
    loadDepartments,
    addDepartment,
    deleteDepartment,
  };
}
