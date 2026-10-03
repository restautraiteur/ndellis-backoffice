import { createFileRoute } from "@tanstack/react-router";

import { ProductsPage } from "@/features/admin/products/products-page";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Catalogue de produits — Ndelli's Traiteur" },
      { name: "description", content: "Catalogue des plats et jus du traiteur." },
      { property: "og:title", content: "Catalogue de produits — Ndelli's Traiteur" },
      { property: "og:description", content: "Catalogue des plats et jus du traiteur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});
