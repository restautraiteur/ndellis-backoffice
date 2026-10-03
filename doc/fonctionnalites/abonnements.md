# Abonnements (« Mangez ici toute la semaine »)

**Code :** site `src/features/subscriptions/` · back-office `src/features/admin/subscriptions/`
**Pages :** site `/abonnement` (lien dans l'en-tête, le pied de page et un bandeau sur l'accueil) ·
back-office `/admin/abonnements`

Fonctionnalité **générique** : à intégrer au modèle (`template-site`, `template-backoffice`).

## Côté client
1. **La formule** : nombre de repas, prix, « livraison incluse », date de fin calculée.
2. **Je commence le** : les prochains jours ouverts (à partir de demain).
3. **Vos repas** : la liste des jours de repas, du lundi au vendredi, **en sautant les jours fermés**
   (déclarés dans le calendrier des menus) : un jour fermé **décale la fin**.
4. **Vos coordonnées** : nom, téléphone, adresse de livraison (facultative).
5. **M'abonner** : pas de paiement en ligne ; le restaurant rappelle pour confirmer et encaisser.
6. **Mon abonnement** : avec le **téléphone** seul, le client voit ses jours à venir, pris, passés, et ce
   qu'il lui reste.

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
