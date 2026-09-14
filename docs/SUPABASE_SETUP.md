# 🛠️ Guide de Déploiement & Configuration Supabase

Ce guide détaille la mise en service pas-à-pas de Supabase pour le projet **MVETT - Les 9 Provinces du Gabon**.

---

## 1. Création du Projet Supabase

1. Rendez-vous sur [Supabase.com](https://supabase.com) et créez un compte si nécessaire.
2. Cliquez sur **New Project**, sélectionnez votre organisation et donnez un nom à votre projet (ex: `mvett-gabon`).
3. Choisissez une région proche de vos utilisateurs (ex: `eu-west-1` / `eu-central-1`) et définissez un mot de passe de base de données robuste.

---

## 2. Récupération des Clés d'API

1. Dans le tableau de bord de votre projet, allez dans **Project Settings** (icône d'engrenage) > **API**.
2. Récupérez les deux informations suivantes :
   - **Project URL** : `https://xyzcompany.supabase.co`
   - **Project API Keys** > `anon` / `public` : `eyJhbGciOi...`
3. Renseignez ces variables dans votre fichier `.env` local :
   ```env
   PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique
   ```

---

## 3. Déploiement du Schéma de Base de Données

1. Dans votre tableau de bord Supabase, ouvrez le **SQL Editor** dans la barre latérale gauche.
2. Ouvrez ou copiez le contenu du fichier [`supabase_schema.sql`](../supabase_schema.sql).
3. Collez l'intégralité du script dans l'éditeur et cliquez sur **Run** (Exécuter).

### Ce que configure le script :
- **Table `public.community_photos`** :
  - Colonnes d'identification, de province, de titre, de légende et d'URL d'image.
  - Drapeau `is_official` pour différencier les photos officielles du patrimoine des soumissions communautaires.
  - Champ `display_order` pour ordonner les photos par province.
  - Statuts gérés : `pending`, `approved`, `rejected`, `archived`.
- **Politiques de sécurité Row Level Security (RLS)** :
  - Lecture publique des photos approuvées (`status = 'approved'`).
  - Insertion par les utilisateurs authentifiés.
  - Modification / Suppression réservée aux auteurs ou modérateurs autorisés.
- **Index de performance** sur `province_id`, `status`, `is_official`, `display_order` et `created_at`.

---

## 4. Configuration du Storage Supabase

Le stockage des photographies utilise Supabase Storage pour distribuer les images avec une mise en cache optimisée.

1. Rendez-vous dans la section **Storage** de la console Supabase.
2. Cliquez sur **New bucket** :
   - **Name** : `province-photos`
   - **Public bucket** : ✅ **Cochez cette case** (les photos doivent être lisibles publiquement par le diaporama WebGL).
3. Sous **Configuration** > **Policies** pour le bucket `province-photos` :
   - Ajoutez une politique **SELECT** : `true` pour tous les utilisateurs (public).
   - Ajoutez une politique **INSERT** : `auth.role() = 'authenticated'` pour les envois d'images modérées.

---

## 5. Création d'un Compte Modérateur / Administrateur

1. Allez dans **Authentication** > **Users**.
2. Cliquez sur **Add user** > **Create user**.
3. Renseignez l'adresse email et le mot de passe de l'administrateur.
4. Dans les métadonnées de l'utilisateur (`raw_app_meta_data` ou `raw_user_meta_data`), vous pouvez ajouter :
   ```json
   {
     "role": "admin"
   }
   ```
5. Connectez-vous ensuite sur la page `/admin` du projet pour piloter le catalogue et la modération.

---

## 6. Mode Hors-Ligne / Fallback LocalStorage

Si aucune clé d'API Supabase n'est configurée dans le `.env`, l'application s'exécute automatiquement en **Mode Démo** :
- Les photographies officielles issues de `src/data/provinces.ts` sont chargées immédiatement.
- Toutes les modifications du catalogue, ajouts de photos, réorganisations et modérations sont enregistrées dans le `localStorage` du navigateur.
- Aucun composant ou affichage n'est bloqué en l'absence de réseau ou d'identifiants Supabase.
