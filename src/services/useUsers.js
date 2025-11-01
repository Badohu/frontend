import { ref } from "vue";

const USERS_STORAGE_KEY = "users_v1";
const DEPARTMENTS_STORAGE_KEY = "departments_v1";

const defaultUsers = [
  {
    id: 1,
    name: "Ronald Bagani",
    email: "ronald@mnotify.com",
    department: "Ceo",
    password: "pass1",
    role: "CEO",
  },
  {
    id: 2,
    name: "Eunice prettier",
    email: "eunice@mnotify.com",
    department: "HR",
    password: "pass2",
    role: "HR",
  },
  {
    id: 3,
    name: "Godsway pampanini",
    email: "godsway@mnotify.com",
    department: "Finance",
    password: "pass2",
    role: "FINANCE MANAGER",
  },
  {
    id: 4,
    name: "Aseda Homelander",
    email: "aseda@mnotify.com",
    department: "Tech",
    password: "pass3",
    role: "FINANCE OFFICER",
  },
];

const defaultDepartments = [
  {
    id: 1,
    name: "Finance",
    description: "Financial planning and management",
    // budget: "$100,000",
  },
  {
    id: 2,
    name: "Tech",
    description: "Technology and development",
    // budget: "$150,000",
  },
];

const users = ref([]);
const departments = ref([]);

function safeJSONParse(item) {
  try {
    return JSON.parse(item);
  } catch (e) {
    return null;
  }
}

export function useUsers() {
  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        users.value = safeJSONParse(raw) || defaultUsers;
      } else {
        users.value = defaultUsers;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      }
    } catch (e) {
      console.error("Failed to load users from local storage:", e);
      users.value = defaultUsers;
    }
  }

  function addUser(user) {
    users.value.push(user);
    saveUsers();
  }

  function updateUser(updatedUser) {
    const index = users.value.findIndex((u) => u.id === updatedUser.id);
    if (index !== -1) {
      users.value[index] = updatedUser;
      saveUsers();
    }
  }

  function deleteUser(userId) {
    users.value = users.value.filter((u) => u.id !== userId);
    saveUsers();
  }

  function saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users.value));
    } catch (e) {
      console.error("Failed to save users to local storage:", e);
    }
  }

  loadUsers();

  return {
    users,
    loadUsers,
    addUser,
    updateUser,
    deleteUser,
  };
}

export function useDepartments() {
  function loadDepartments() {
    const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
    departments.value = stored ? safeJSONParse(stored) : defaultDepartments;
  }

  function saveDepartments() {
    localStorage.setItem(
      DEPARTMENTS_STORAGE_KEY,
      JSON.stringify(departments.value)
    );
  }

  loadDepartments();

  return {
    departments,
    saveDepartments,
  };
}
