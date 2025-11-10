import { defineStore } from "pinia";
import { ref } from "vue";
import { login, logoutUser, fetchUser, setToken, clearToken, getToken } from "@/services/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(getToken());
  const loading = ref(false);
  const error = ref(null);

  // 🔐 Login function
  const loginUser = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await login(credentials);
      if (data.token) {
        setToken(data.token);
        token.value = data.token;
        await loadUser();
      }
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 👤 Load current user
  const loadUser = async () => {
    try {
      const data = await fetchUser();
      user.value = data;
    } catch (err) {
      console.error("Failed to load user:", err);
      logout();
    }
  };

  // 🔓 Logout
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      clearToken();
      token.value = null;
      user.value = null;
    }
  };

  // 🔁 Auto-load user if token exists
  if (token.value) loadUser();

  return { user, token, loading, error, loginUser, logout, loadUser };
});
