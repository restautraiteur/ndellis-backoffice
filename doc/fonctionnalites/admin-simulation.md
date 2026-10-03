# Simulation de production et des dépenses

**Code :** `src/features/admin/simulation/`

Le gérant connaît **trois chiffres** pour un jour ou une semaine : la **somme à recevoir**, les
**dépenses** et le **bénéfice**. Il obtient aussi la **liste de courses**. Tout est calculé à
partir de ce qui s'est réellement passé lors des cuissons précédentes.

**Route :** `/admin/simulation` (menu « Simulation » de l'espace gérant)

## Le flow

```
① Ingrédients (une fois)      ② Journal de production (après chaque cuisson)     ③ Prévisions
Tomate concentrée (g)          Lundi · Riz méditerranéen                          Lundi prochain
  boîte 300 g · 450 F           2 × boîte 500 g + 1 × boîte 300 g de tomate        47 précommandes
  boîte 500 g · 700 F ★         1 × sac 5 kg de riz …                              60 à cuisiner
  boîte 1 kg · 1 300 F          → 52 plats obtenus                         ──►     → liste de courses
                                                                                    → dépense, recette,
                                                                                      bénéfice
```

### 1. Ingrédients
- Chaque ingrédient est mesuré dans une **unité de base** : grammes, millilitres ou pièces.
- Il a un ou plusieurs **formats d'achat**, chacun avec sa contenance et son prix : boîte 300 g,
  boîte 500 g, boîte 1 kg, sac 5 kg, au kilo (1 000 g), plateau de 30 œufs…
- L'étoile ★ marque le **format habituel**, utilisé pour la liste de courses. Sans étoile, le format
  le moins cher au gramme est utilisé.
- Les **emballages et le gaz** se gèrent comme des ingrédients (ex. « Barquette », en pièces) pour
  être comptés dans les dépenses.

### 2. Journal de production
- Après chaque cuisson, une fiche : le plat, la date, les **plats obtenus** et chaque ingrédient
  utilisé, sous la forme **nombre × format**. On peut mélanger les formats sur deux lignes
  (2 boîtes de 500 g + 1 boîte de 300 g).
- La fiche calcule la dépense de la cuisson et le coût par plat, au prix des formats au moment
  de l'enregistrement.
- Une cuisson ratée peut être **écartée** : elle reste visible mais n'entre plus dans les calculs.
- La fiche est liée automatiquement au plat du menu de ce jour-là s'il existe.

### 3. Prévisions (jour ou semaine)
- Pour chaque plat de la période : précommandes, portions prévues, et **plats à cuisiner**
  (modifiable). Par défaut, ce sont les portions prévues, et au moins les précommandes. Une alerte
  s'affiche s'il y a moins de plats que de précommandes.
- **Somme à recevoir** :
  - *assurée* : total des commandes de la période (plats et jus), hors commandes annulées ;
  - *dont déjà payée* : commandes au statut « Payé » ;
  - *si tout est vendu* : assurée + les plats à cuisiner non encore commandés × prix du jour.
- **Dépenses prévues** : coût des formats à acheter d'après la liste de courses.
- **Bénéfice prévu** : si tout est vendu, et avec les seules commandes.
- **Réel à ce jour** (jours passés ou en cours) : encaissé, dépensé (fiches de production) et
  bénéfice réel.

## Règles de calcul
- **Quantité par plat** d'un ingrédient = total utilisé sur les **3 dernières cuissons non
  écartées** du plat ÷ total des plats obtenus sur ces cuissons.
- **Quantité nécessaire** = quantité par plat × plats à cuisiner.
- **À acheter** = quantité nécessaire ÷ contenance du format habituel, **arrondi au-dessus**
  (1,38 kg de tomate → 3 boîtes de 500 g).
- Un plat **sans fiche de production** est signalé « pas encore d'historique » et n'est pas compté
  dans les dépenses.

## Données
| Table | Contenu |
| --- | --- |
| `ingredients` | Nom et unité de base (`g`, `ml`, `piece`) |
| `ingredient_formats` | Formats d'achat : libellé, contenance, prix, format habituel |
| `production_logs` | Une cuisson : plat, date, plats obtenus, écartée ou non, notes |
| `production_log_items` | Ingrédients utilisés : format (libellé copié), nombre, quantité totale, coût |

Migration : `supabase/migrations/20261003100000_journal_production.sql`.

## Fichiers
| Fichier | Rôle |
| --- | --- |
| `api.ts` | Types, requêtes et calculs (`dishRatio`, `shoppingList`, `defaultFormat`…) |
| `simulation-page.tsx` | Page et onglets |
| `components/forecast-panel.tsx` | Prévisions : trois chiffres, plats à cuisiner, liste de courses |
| `components/production-panel.tsx` | Journal et fiche de production |
| `components/ingredients-panel.tsx` | Ingrédients et formats d'achat |

## Pour plus tard
- Estimation saisie à la main pour un plat jamais cuisiné.
- Bases communes à plusieurs plats (une sauce pour deux plats) et répartition des quantités.
- Restes après cuisson (boîte entamée), pour ne compter que le consommé.
- Charges fixes (loyer, salaires), réparties sur le mois, pour le vrai bénéfice net.
- Choix automatique de la meilleure combinaison de formats (1 boîte de 1 kg + 1 de 500 g…).
- Lien avec le module Caisse & dépenses : prix des formats mis à jour par les achats saisis.
