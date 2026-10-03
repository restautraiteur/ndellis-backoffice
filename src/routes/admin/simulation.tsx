import { createFileRoute } from "@tanstack/react-router";

import { SimulationPage } from "@/features/admin/simulation/simulation-page";

export const Route = createFileRoute("/admin/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation — Ndelli's Traiteur" },
      {
        name: "description",
        content: "Quantités d'ingrédients et dépenses à prévoir selon les recettes.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SimulationPage,
});
