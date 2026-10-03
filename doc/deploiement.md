# Déploiement

Ce dépôt est déployé par **un projet Vercel** (`ndellis-backoffice`), relié au dépôt GitHub
`restautraiteur/ndellis-backoffice`. Le build (`vite build`) produit automatiquement la sortie Vercel.

- **Dossier racine** : `./` (la racine du dépôt).
- **Variables d'environnement** : *Settings › Environment Variables* (import d'un fichier `.env` hors dépôt,
  une ligne `NOM=valeur`). Liste dans le `README.md`.
- **Branche de production** : `main`.

Le dépôt jumeau `ndellis-site` est déployé par son propre projet Vercel. Les deux utilisent la même base Supabase
(`edwisnrfjxhkgsrlidqo`).
