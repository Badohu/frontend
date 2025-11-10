import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000/api";

// ✅ Create axios instance
export const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// =========================
// 🔐 TOKEN HELPERS
// =========================
export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const clearToken = () => {
  localStorage.removeItem("token");
  delete axiosInstance.defaults.headers.common["Authorization"];
};

// ✅ Automatically attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// 🔒 LOGIN
// =========================
export async function login(credentials) {
  try {
    const response = await axiosInstance.post("/login", credentials);

    // Laravel response should include a token
    if (response.data?.token) {
      setToken(response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Login failed");
  }
}

// =========================
// 🔓 LOGOUT
// =========================
export async function logoutUser() {
  try {
    await axiosInstance.post("/logout");
  } catch (error) {
    console.warn("Logout error (ignored):", error.response?.data || error.message);
  } finally {
    clearToken();
  }
}

// =========================
// 👤 FETCH AUTH USER
// =========================
export async function fetchUser() {
  try {
    const response = await axiosInstance.get("v1/user");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error.response?.data || error.message);
    throw error;
  }
}
