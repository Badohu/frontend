import { createRouter, createWebHistory } from "vue-router";

// Import views (match actual filenames in src/views)

import DashboardView from "@/views/dashboardView.vue";
import usersPage from "@/pages/dashboard/usersPage.vue";
import budgetsPage from "@/pages/dashboard/budgetsPage.vue";
import OverviewPage from "@/pages/dashboard/overviewPage.vue";
import paymentRequestsPage from "@/pages/dashboard/paymentRequestsPage.vue";
import ProjectsPage from "@/pages/dashboard/projectsPage.vue";
import LoginPage from "@/pages/auth/loginPage.vue";
import AuthView from "@/views/authvView.vue";
import departmentPage from "@/pages/dashboard/departmentPage.vue";

const routes = [
  {
    path: "/",
    name: "Auth",
    component: AuthView,
    redirect: { name: "Login" },
    children: [
      {
        path: "login",
        name: "Login",
        component: LoginPage,
      },
    ],
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: "Overview",
        name: "Overview",
        component: OverviewPage,
      },

      {
        path: "users",
        name: "users",
        component: usersPage,
      },

      { path: "department", name: "department", component: departmentPage },

      { path: "projects", name: "Projects", component: ProjectsPage },
      // { path: "projects", name: "Projects", component: ProjectsPage },

      {
        path: "payments-requests",
        name: "PaymentRequests",
        component: paymentRequestsPage,
      },

      {
        path: "budgets",
        name: "Budgets",
        component: budgetsPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      next({ name: "Login" });
    } else {
      const allowedSections = user.allowedSections || [];
      const normalizedAllowed = allowedSections.map((section) =>
        section.toLowerCase()
      );
      if (
        to.name &&
        !normalizedAllowed.includes(to.name.toLowerCase()) &&
        to.name !== "Dashboard"
      ) {
        next({ name: "Overview" });
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
