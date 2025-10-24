import { createRouter, createWebHistory } from "vue-router";

// Import views (match actual filenames in src/views)

import DashboardView from "@/views/dashboardView.vue";
import usersPage from "@/pages/dashboard/usersPage.vue";
// import budgetsPage from "@/pages/dashboard/budgetsPage.vue";
import paymentRequestsPage from "@/pages/dashboard/paymentRequestsPage.vue";
import projectsPage from "@/pages/dashboard/projectsPage.vue";
import LoginPage from "@/pages/auth/loginPage.vue";
import AuthView from "@/views/authvView.vue";
import departmentPage from "@/pages/dashboard/departmentPage.vue";
import OverviewPage from "@/pages/dashboard/overviewPage.vue";
import approvalwWorkflowPage from "@/pages/dashboard/approvalwWorkflowPage.vue";
// import notificationPage from "@/pages/dashboard/notificationPage.vue";

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
    children: [
      {
        path: "",
        name: "Overview",
        component: OverviewPage,
      },

      {
        path: "users",
        name: "Users",
        component: usersPage,
      },

      { path: "department", name: "Department", component: departmentPage },

      { path: "projects", name: "Projects", component: projectsPage },

      // { path: "budgets", name: "Budgets", component: budgetsPage },

      {
        path: "payments-requests",
        name: "PaymentRequests",
        component: paymentRequestsPage,
      },

      {
        path: "approval-workflow",
        name: "ApprovalWorkflow",
        component: approvalwWorkflowPage,
      },
      // {
      //   path: "notifications",
      //   name: "Notifications",
      //   component: notificationPage,
      // },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
