<template>
  <div class="app-wrap">
    <div class="login-page">
      <!-- <div class="logo-container">
        <img
          src="@/views/attachment_14717695.webp"
          alt="Company Logo"
          class="login-logo"
        />
      </div> -->

      <h1 id="hs">Sign In With Your Email</h1>

      <form
        class="login-form"
        @submit.prevent="handleSubmit"
        @reset.prevent="handleReset"
      >
        <div class="form-group">
          <label for="username / email">Username / email:</label>
          <input
            v-model="username"
            type="text"
            id="username"
            name="username"
            required
            placeholder="banku@gmail.com"
          />
        </div>
        <br />
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            v-model="password"
            type="password"
            id="password"
            name="password"
            required
            placeholder="*******"
            maxlength="255"
            minlength="3"
          />
        </div>

        <div class="buttons">
          <button type="submit" class="SignIn">Sign In</button>
          <button type="reset" class="Reset">Reset</button>
        </div>

        <!-- <input
          type="checkbox"
          name="Remember Me"
          class="Check"
          id="rememberMe"
        /> -->
        <!-- <label for="rememberMe">Remember Me</label> -->

        <div v-if="error" style="color: #b91c1c; margin-top: 12px">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* NEW: Styles for the logo */
.logo-container {
  text-align: center; /* Center the logo horizontally */
  margin-bottom: 30px; /* Space between logo and heading */
}

.login-logo {
  max-width: 150px; /* Adjust as needed */
  height: auto; /* Maintain aspect ratio */
  display: block; /* Ensures margin-bottom works correctly */
  margin: 0 auto; /* Centers the image if it's smaller than max-width */
}

/* Existing styles below */
.app-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  /* background-image: url(src/views/premium_photo-1701757710054-ea0bb5f4ce2b.webp);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat; */
  /* background:linear-gradient  40deg #ddd; */
  background: linear-gradient(90deg, #f7921c, #ddd);
}

#hs {
  color: #000000;
  padding-bottom: 50px;
  text-align: center;
}

.login-page {
  border: #fcfcfc;
  padding: 0;
  border-radius: 49px;
  height: 500px;
  width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(300px);
  /* box-shadow: 5px 5px 27px; */
}
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #000000;
}
.form-group {
  margin-bottom: 16px;
  padding: 2px;
}

.login-form {
  padding-inline: 100px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #000000;
}
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  box-sizing: border-box;
}

/* added button styles */
.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  margin-bottom: auto;
}
.SignIn {
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  margin-bottom: 5px;
  background-color: #f7921c;
  color: #fff;
  box-shadow: 0 8px 20px rgba(9, 10, 31, 0.1);
  border: 1px solid rgba(247, 146, 28, 0.12);
}

.SignIn:hover {
  background-color: #f5820a;
}

.Reset {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 5px;
}

.Reset:hover {
  background-color: #d1d5db;
}

/* .btn.ghost {
  background: rgba(255, 255, 255 0.02);
  color: #fff;
} */

/* small responsive tweak */
@media (max-width: 420px) {
  .app-wrap {
    width: 100%;
    height: 100vh;
    padding: 24px;
  }
  .login-page {
    width: 100%;
    padding: 24px;
  }
}

.Check {
  margin-top: 15px;
  margin-right: 10px;
  cursor: pointer;
}
</style>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login as authLogin } from "@/services/auth.js";

const router = useRouter();

const username = ref("");
const password = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    const user = await authLogin(username.value, password.value);

    // store user info for other pages to check allowedSections
    // In production use secure storage and server-issued token
    localStorage.setItem("user", JSON.stringify(user));

    // navigate to the main dashboard; other pages/components should read localStorage.user.allowedSections
    router.push({ name: "Overview" });
  } catch (err) {
    error.value = err.message || "Login failed";
    console.warn("login failed", err);
  }
}

function handleReset() {
  username.value = "";
  password.value = "";
  error.value = "";
  console.log("form reset");
}

function socialSign(provider) {
  alert(`Demo: sign in with ${provider}`);
}
</script>
