import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/features/admin/dashboard/dashboard-page";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Ndelli's Traiteur" },
      { name: "description", content: "Production, commandes et stocks du service traiteur." },
      { property: "og:title", content: "Tableau de bord — Ndelli's Traiteur" },
      {
        property: "og:description",
        content: "Production, commandes et stocks du service traiteur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});
