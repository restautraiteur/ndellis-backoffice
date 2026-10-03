# Paiement (PayDunya)

**Code :** `src/features/payment/`

Encaisse le total, ou l'acompte d'une précommande, par PayDunya (Wave, Orange Money, carte…).

## Fonctionnement
1. `startPayment` (fonction serveur) crée une facture PayDunya du bon montant et enregistre son jeton sur la commande.
2. Le client paie sur la page de PayDunya.
3. PayDunya renvoie le client vers `/confirmation` et prévient le site par l'**IPN** (`/api/public/paydunya-ipn`).
4. `syncPayment` **revérifie toujours le paiement auprès de PayDunya**, sans se fier au message reçu. Il passe ensuite la commande à :
   - `paye` (commande immédiate) ou `acompte_paye` (précommande) si le paiement est confirmé ;
   - `echec_paiement` si le paiement est annulé ou échoué.

## Configuration
Variables d'environnement côté serveur : `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN`.
Sans ces clés, le client voit le message « Le paiement est momentanément indisponible ».

## Fichiers
| Fichier | Rôle |
| --- | --- |
| `paydunya.server.ts` | Appels à l'API PayDunya (créer, confirmer, synchroniser) |
| `paydunya.functions.ts` | Fonctions serveur `startPayment` et `checkPayment` appelées par le site |
| `src/routes/api/public/paydunya-ipn.ts` | Notification serveur à serveur de PayDunya |
