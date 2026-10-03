import { createFileRoute } from "@tanstack/react-router";

import { ReportsPage } from "@/features/admin/reports/reports-page";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Bilan de la semaine — Ndelli's Traiteur" },
      { name: "description", content: "Ventes, plats les plus vendus et quantités à ajuster." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportsPage,
});
