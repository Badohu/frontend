import { useUsers } from "./useUsers";

export async function login(email, password) {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 300));

  const { users } = useUsers();
  console.log("Users from useUsers:", users.value);
  const user = users.value.find((u) => u.email === email);

  // Basic validations for demo purposes
  if (!user) {
    throw new Error("Unknown user or invalid password");
  }

  const roleBasedAccess = {
    CEO: [
      "Overview",
      "budgets",
      "PaymentRequests",
      "Projects",
      "Department",
      "Users",
    ],

    HR: [
      "Overview",
      "Department",
      "budgets",
      "PaymentRequests",
      "Projects",
      "Department",
      "Users",
    ],

    "FINANCE MANAGER": [
      "Overview",
      "Department",
      "budgets",
      "PaymentRequests",
      "Projects",
      "Users",
    ],

    "FINANCE OFFICER": ["Overview", "budgets", "PaymentRequests", "Projects"],

    INTERN: ["Overview", "Projects"],

    EMPLOYEE: ["Overview", "Projects", "PaymentRequests"],
  };

  const allowedSections = roleBasedAccess[user.role] || [];

  // Return minimal user object; in real app you'd get a token and roles from backend
  return {
    username: user.name,
    role: user.role,
    allowedSections,
  };
}