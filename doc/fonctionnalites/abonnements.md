# Abonnements repas

**Code :** site `src/features/subscriptions/` · back-office `src/features/admin/subscriptions/`
**Pages :** site `/abonnement` (lien dans l'en-tête, le pied de page et un bandeau sur l'accueil) ·
back-office `/admin/abonnements`

Fonctionnalité **générique** : à intégrer au modèle (`template-site`, `template-backoffice`).

## Côté client
Page en cinq parties : présentation (photos, atouts), « Comment ça marche » en 3 étapes, composition de
l'abonnement, suivi, questions fréquentes.
1. **Combien de repas ?** : cartes des formules avec le prix par repas ; badge « Meilleur prix par repas »
   sur la formule la plus avantageuse.
2. **À partir de quand ?** : calendrier du lundi au vendredi. On touche un jour de départ (à partir de
   demain) ; les jours de repas s'allument et les **jours fermés** (déclarés dans le calendrier des menus)
   apparaissent barrés : ils **décalent la fin**.
3. **Vos coordonnées** : nom, téléphone, adresse de livraison (facultative).
4. **Récapitulatif** (colonne fixe) : premier et dernier repas, prix par repas, total, bouton
   « Réserver mes repas ». Pas de paiement en ligne : le restaurant rappelle pour confirmer et encaisser.
   Après la réservation : « Suivre mes repas » ou « Abonner un proche ».
5. **Suivez vos repas** : avec le **téléphone** seul, le client voit une barre de progression, le prochain
   repas, et ses jours à venir, servis, passés ou annulés.

## Côté gérant
- **Repas du jour** : les abonnés à servir un jour donné (nom, téléphone, adresse), bouton « Marquer pris ».
  À ajouter à la production du jour.
- **Abonnés** : confirmer, marquer payé, appeler, annuler (les repas à venir sont annulés).
- **Formules** : nom, nombre de repas (1 à 60), prix, livraison incluse, visible ou non sur le site.

## Règles
- Dates calculées **côté serveur** (`subscription_dates`) : lundi → vendredi, hors jours fermés.
- Souscription par la fonction `create_subscription` (contrôles : formule active, nom, téléphone de 7 à
  15 chiffres, début entre demain et J+60).
- « Mon abonnement » : fonction `lookup_subscriptions(téléphone)`, qui ne renvoie pas l'adresse.
- Un repas réservé par jour ; le choix du plat jour par jour est prévu pour plus tard.

## Configuration par client
- `src/config/client.ts` (site) : `name` (affiché dans le parcours), `subscriptions` (activer le module).
- Les formules et leurs prix sont réglés par le gérant dans l'espace gérant.

## Données
Tables `subscription_plans`, `subscriptions`, `subscription_meals` ; migration
`supabase/migrations/20261003180000_abonnements.sql` et `20261003181000_abonnements_lecture_formules.sql` (dépôt back-office).

## Pour plus tard
- Choix du plat par l'abonné (quand il y a plusieurs plats par jour) et déplacement d'un repas.
- Paiement en ligne (PayDunya) en option, au choix du restaurant.
- Code de vérification par SMS ou WhatsApp pour « Mon abonnement ».
- Repas des abonnés inclus automatiquement dans le tableau de bord et la simulation.
