import { createRouter, createWebHistory } from "vue-router";
import CobrancaDetalhes from "../pages/CobrancaDetalhes.vue";
import CobrancaValidacao from "../pages/CobrancaValidacao.vue";
import Dashboard from "../pages/Dashboard.vue";

const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/cobranca/:token",
    name: "CobrancaValidacao",
    component: CobrancaValidacao
  },
  {
    path: "/cobrancas/:token/detalhes",
    name: "CobrancaDetalhes",
    component: CobrancaDetalhes,
  },
];

const router = createRouter({
  history: createWebHistory(), // <- aqui é o certo
  routes,
});

export default router;
