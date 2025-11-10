<template>
  <div class="app-wrap">
    <transition name="fade-slide">
      <div class="login-page" key="login">
        <div class="logo-container">
          <img
            src="@/views/attachment_14717695.webp"
            alt="Company Logo"
            class="login-logo"
          />
        </div>

        <h1 id="hs">Welcome Back 👋</h1>
        <p class="subtitle">Sign in to continue your journey</p>

        <form
          class="login-form"
          @submit.prevent="handleSubmit"
          @reset.prevent="handleReset"
        >
          <!-- ✅ Changed to match script variable -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="banku@gmail.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div class="buttons">
            <button type="submit" class="SignIn" :disabled="loading">
              <span v-if="!loading">Sign In</span>
              <span v-else class="loader"></span>
            </button>
            <button type="reset" class="Reset">Reset</button>
          </div>

          <transition name="fade">
            <div v-if="error" class="error">{{ error }}</div>
          </transition>
        </form>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/services/auth"; // ✅ Laravel Axios service

const router = useRouter();

// ✅ use "email" consistently
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  error.value = "";
  loading.value = true;

  try {
    const response = await login({
      email: email.value,
      password: password.value,
    });

    // ✅ Store token (if Laravel returns one)
    if (response.token) {
      localStorage.setItem("token", response.token);
    }

    console.log("✅ Login successful:", response);
    router.push({ name: "Overview" }); // redirect to dashboard
  } catch (err) {
    console.warn("❌ Login failed:", err);
    error.value =
      err.response?.data?.message || "Invalid credentials. Try again.";
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  email.value = "";
  password.value = "";
  error.value = "";
}
</script>

<style scoped>
/* ==========================
   Layout & Background
========================== */
.app-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fff;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

/* ==========================
   Login Card
========================== */
.login-page {
  width: 100%;
  height: 100%;
  max-width: 400px;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #000;
  animation: floatIn 0.8s ease;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================
   Text & Logo
========================== */
.logo-container {
  text-align: center;
  margin-bottom: 24px;
}
.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
#hs {
  font-size: 28px;
  margin-bottom: 8px;
  color: #000;
  font-weight: 700;
}
.subtitle {
  color: #333;
  font-size: 14px;
  margin-bottom: 32px;
}

/* ==========================
   Form
========================== */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}
label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
input {
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.85);
  outline: none;
  transition: all 0.3s ease;
}
input:focus {
  border-color: #f7921c;
  box-shadow: 0 0 8px rgba(247, 146, 28, 0.5);
  background-color: #fff;
}

/* ==========================
   Buttons
========================== */
.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.SignIn,
.Reset {
  position: relative;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.SignIn {
  background: #f7921c;
  color: #fff;
  border: none;
}
.SignIn:hover {
  background-color: #f5820a;
  box-shadow: 0 6px 16px rgba(247, 146, 28, 0.3);
}
.SignIn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.Reset {
  background-color: #f9fafb;
  color: #111827;
  border: 1px solid #d1d5db;
}
.Reset:hover {
  background-color: #e5e7eb;
}

/* ==========================
   Loader Spinner
========================== */
.loader {
  border: 3px solid #fff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==========================
   Error & Animations
========================== */
.error {
  margin-top: 16px;
  color: #b91c1c;
  text-align: center;
  font-weight: 500;
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-slide-enter-active {
  transition: all 0.6s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* ==========================
   Responsive
========================== */
@media (max-width: 640px) {
  .login-page {
    padding: 32px 24px;
    border-radius: 20px;
  }
  #hs {
    font-size: 24px;
  }
  input {
    font-size: 15px;
  }
  .SignIn,
  .Reset {
    font-size: 15px;
  }
}
</style>
