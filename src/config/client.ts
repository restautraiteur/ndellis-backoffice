/**
 * Configuration propre au client. Les fonctionnalités génériques (abonnements…) lisent ces valeurs
 * au lieu d'écrire le nom du restaurant en dur : c'est ce fichier qui change d'un client à l'autre.
 */
export const CLIENT = {
  /** Nom affiché dans les messages envoyés aux clients. */
  name: "Ndelli's Traiteur",
  /** Module « Entreprises partenaires » (désactivé pour l'instant ; possible plus tard, ex. Free). */
  partners: false,
} as const;
