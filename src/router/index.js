import { createRouter, createWebHistory } from "vue-router";

// Import views (match actual filenames in src/views)
import DashboardView from "@/views/dashboard.vue";
import BudgetsView from "@/views/budgets.vue";
import AdminView from "@/views/admin.vue";
import ReportsView from "@/views/Reports.vue";
import PaymentRequests from "@/views/payment_requests.vue";
import ProjectsView from "@/views/projects.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", name: "Dashboard", component: DashboardView },
  { path: "/budgets", name: "Budgets", component: BudgetsView },
  { path: "/projects", name: "Projects", component: ProjectsView },
  {
    path: "/payment_requests",
    name: "PaymentRequests",
    component: PaymentRequests,
  },
  { path: "/reports", name: "Reports", component: ReportsView },
  { path: "/admin", name: "Admin", component: AdminView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
