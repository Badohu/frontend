import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Environment variables (set in your .env file)
const baseUrl = import.meta.env.VITE_BASE_URL;
const csrfUrl = import.meta.env.VITE_CSRF_URL;

// ✅ Create axios instance
export const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // important for Laravel Sanctum
  headers: {
    Accept: "application/json",
  },
});

// ✅ Helper: Get token (if Laravel uses tokens)
export const getToken = () => localStorage.getItem("token");

// ✅ Login flow
export async function loginUser(credentials) {
  try {
    // 1️⃣ Get CSRF cookie from Laravel Sanctum
    await axios.get(csrfUrl, { withCredentials: true });

    // 2️⃣ Send login credentials
    const response = await axiosInstance.post("/login", credentials);

    // 3️⃣ If token is returned (depends on backend setup), store it
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    // 4️⃣ Optionally, update your AuthStore with user info
    const authStore = useAuthStore();
    authStore.setUser(response.data.user);

    return response.data;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }
}

// ✅ Logout flow
export async function logoutUser() {
  try {
    await axiosInstance.post("/logout");
    localStorage.removeItem("token");

    const authStore = useAuthStore();
    authStore.clearUser();
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
}
import axios from "axios";
import { useAuthStore } from "../stores/auth";

// Environment variables (set in your .env file)
const baseUrl = import.meta.env.VITE_BASE_URL;
const csrfUrl = import.meta.env.VITE_CSRF_URL;

// ✅ Create axios instance
export const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // important for Laravel Sanctum
  headers: {
    Accept: "application/json",
  },
});

// ✅ Helper: Get token (if Laravel uses tokens)
export const getToken = () => localStorage.getItem("token");

// ✅ Login flow
export async function loginUser(credentials) {
  try {
    // 1️⃣ Get CSRF cookie from Laravel Sanctum
    await axios.get(csrfUrl, { withCredentials: true });

    // 2️⃣ Send login credentials
    const response = await axiosInstance.post("/login", credentials);

    // 3️⃣ If token is returned (depends on backend setup), store it
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }

    // 4️⃣ Optionally, update your AuthStore with user info
    const authStore = useAuthStore();
    authStore.setUser(response.data.user);

    return response.data;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || "Login failed. Please try again."
    );
  }
}

// ✅ Logout flow
export async function logoutUser() {
  try {
    await axiosInstance.post("/logout");
    localStorage.removeItem("token");

    const authStore = useAuthStore();
    authStore.clearUser();
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
}
