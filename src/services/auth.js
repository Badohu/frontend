// Simple demo auth service (mock)
const users = {
  "ceo@company.com": {
    role: "ceo",
    sections: ["ceo", "manager", "employee"],
  },
  "admin@company.com": { role: "ceo", sections: ["ceo"] },
  "manager@company.com": { role: "manager", sections: ["manager", "employee"] },
  "employee@company.com": {
    role: "employee",
    sections: ["overview", "projects"],
  },
};

export async function login(username, password) {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 300));

  const normalized = (username || "").trim().toLowerCase();
  const user = users[normalized];

  // Basic validations for demo purposes
  if (!user) {
    throw new Error("Unknown user");
  }
  if (!password || password.length < 8) {
    throw new Error("Invalid credentials");
  }

  // Return minimal user object; in real app you'd get a token and roles from backend
  return {
    username: normalized,
    role: user.role,
    allowedSections: user.sections,
    // expiry/time/token fields could go here
  };
}
