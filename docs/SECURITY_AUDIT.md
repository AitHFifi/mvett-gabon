# Rapport d'Audit de Sécurité & Plan de Durcissement

**Projets ciblés :** MVETT Gabon & Mainframe Web Platform  
**Date d'évaluation :** 20 Septembre 2026  
**Statut :** Remédiations appliquées & Guide de durcissement opérationnel  
**Classification :** Document Interne Confidentiel  

---

## 1. Résumé Exécutif & Modèle de Menace

L'audit de sécurité a porté sur l'architecture globale des applications du dépôt :
1. **Backend & Base de données Supabase** (`supabase_schema.sql`, Row Level Security, Triggers Postgres, Buckets de Stockage).
2. **Couche d'Authentification & Autorisation** (Gestion des rôles, sessions OAuth/OTP, privilèges administrateur).
3. **Frontend & Intégrité Web** (Politiques de sécurité de contenu CSP, en-têtes HTTP, gestion des secrets `.env`, dépendances npm/pnpm).

### Synthèse des Vulnérabilités Identifiées

| Réf. | Vulnérabilité / Risque | Sévérité | Statut |
| :--- | :--- | :---: | :---: |
| **SEC-01** | Contournement de modération & auto-approbation de photos via l'API publique | **Élevée (8.1)** | **Corrigé** |
| **SEC-02** | Privilèges administrateurs basés sur une adresse email codée en dur dans les politiques RLS | **Élevée (7.2)** | **Corrigé** |
| **SEC-03** | Téléversement non restreint (types MIME et taille illimitée) dans le bucket de stockage | **Élevée (7.5)** | **Corrigé** |
| **SEC-04** | Absence de quota ou limite de fréquence de soumission citoyenne (Déni de service/Spam) | **Moyenne (6.5)** | **Corrigé** |
| **SEC-05** | Fuite de stockage et fichiers orphelins persistants lors de la suppression de photos | **Moyenne (5.3)** | **Corrigé** |
| **SEC-06** | Absence d'en-têtes HTTP de sécurité et de Content-Security-Policy (CSP) | **Moyenne (5.8)** | **Corrigé** |
| **SEC-07** | Exposition potentielle de secrets et hygiène du référentiel Git | **Faible (4.3)** | **Audité & Sécurisé** |

---

## 2. Détail des Vulnérabilités & Remédiations

### SEC-01 : Contournement de Modération via `INSERT` / `UPDATE`
- **Gravité :** Élevée (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N - Score 8.1)
- **Mécanisme :**
  La politique RLS initiale sur `community_photos` pour l'insertion était :
  ```sql
  CREATE POLICY "Les utilisateurs authentifiés peuvent publier une photo"
      ON public.community_photos FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  ```
  Un utilisateur malveillant pouvait envoyer une requête directe à l'API Supabase (`/rest/v1/community_photos`) avec :
  ```json
  {
    "title": "Hack",
    "image_url": "https://malicious.site/img.jpg",
    "status": "approved",
    "is_official": true,
    "user_id": "<son-uid>"
  }
  ```
  Le système enregistrait la photo comme `approved` et `is_official: true`, contournant intégralement la modération citoyenne et polluant le diaporama officiel 3D.
- **Remédiation appliquée :**
  Création d'un trigger Postgres `BEFORE INSERT OR UPDATE` (`handle_photo_moderation_guard`) qui :
  1. Force `status = 'pending'`, `is_official = false` et `approved_at = NULL` lors de tout ajout par un non-administrateur.
  2. Bloque formellement toute tentative de modification de ces colonnes ou de réassignation d'auteur (`user_id`) lors d'un `UPDATE`.

---

### SEC-02 : Autorisation Admin par Adresse Email Codée en Dur
- **Gravité :** Élevée (CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N - Score 7.2)
- **Mécanisme :**
  Les règles RLS reposaient sur :
  ```sql
  auth.jwt() ->> 'email' = 'alloghofrederic9@gmail.com'
  ```
  - **Risque d'usurpation / collision :** Si un fournisseur d'identité tiers (OAuth / magic link) n'exige pas la vérification stricte de l'email, une falsification d'identité ou une prise de contrôle était possible.
  - **Défaut d'évolutivité :** Impossible d'ajouter un modérateur ou de changer d'adresse sans modifier et réexécuter des scripts DDL en production.
- **Remédiation appliquée :**
  Mise en place d'un système RBAC complet :
  1. Table `public.user_roles` avec contrainte unique sur `user_id` et vérification `role IN ('admin', 'moderator')`.
  2. Fonctions utilitaires sécurisées `public.is_admin(uuid)` et `public.is_moderator(uuid)` avec `SECURITY DEFINER` et `search_path = public` (protection contre le search_path hijacking).
  3. Migration automatique du compte existant lors de l'exécution du script SQL.

---

### SEC-03 : Téléversement Non Restreint & Débordement de Stockage
- **Gravité :** Élevée (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:H - Score 7.5)
- **Mécanisme :**
  Le bucket Supabase `province-photos` était configuré avec `public: true`, sans restriction de taille maximale (`file_size_limit`) ni de types MIME autorisés (`allowed_mime_types`).
  - Un attaquant pouvait uploader des scripts SVG avec code JavaScript malveillant (XSS stocké), des fichiers exécutables ou des images de plusieurs centaines de mégaoctets pour saturer le quota de stockage du projet.
- **Remédiation appliquée :**
  Configuration stricte du bucket dans `supabase_schema.sql` :
  - `file_size_limit = 5242880` (5 Mo maximum par fichier).
  - `allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']` (exclusion des SVG exécutables et fichiers non images).

---

### SEC-04 : Absence de Quota de Soumission (Spam / Inondation)
- **Gravité :** Moyenne (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H - Score 6.5)
- **Mécanisme :**
  Aucune limite n'empêchait un script automatisé de soumettre des milliers de photos en attente en quelques secondes via un compte authentifié.
- **Remédiation appliquée :**
  Déclencheur Postgres `check_photo_submission_quota` qui vérifie le nombre de photos `pending` de l'utilisateur :
  - Limite stricte : **Maximum 5 photos en attente simultanément** par utilisateur non-admin.
  - Rejet avec exception explicite en cas de dépassement.

---

### SEC-05 : Fichiers Orphelins & Fuite de Données dans le Stockage
- **Gravité :** Moyenne (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:L - Score 5.3)
- **Mécanisme :**
  Lorsqu'une photo était supprimée de la table `community_photos` (par l'auteur ou l'administrateur), la ligne SQL était effacée mais le fichier physique restait présent dans `storage.objects`, entraînant :
  - Surcoût d'hébergement.
  - Non-respect du droit à l'effacement (RGPD).
- **Remédiation appliquée :**
  Déclencheur Postgres `AFTER DELETE` (`cleanup_orphaned_photo_storage`) qui extrait automatiquement le chemin du fichier dans `OLD.image_url` et le supprime de `storage.objects`.

---

### SEC-06 : En-têtes HTTP de Sécurité & Content-Security-Policy (CSP)
- **Gravité :** Moyenne (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N - Score 5.8)
- **Mécanisme :**
  Absence de directive CSP et d'en-têtes de protection contre le clickjacking et le MIME sniffing.
- **Remédiation appliquée :**
  1. **Dans `index.html` :**
     - Balise `Content-Security-Policy` avec restriction granulaire (`default-src 'self'`, whitelisting des CDN de polices, flux vidéo/média, et endpoints Supabase).
     - `X-Content-Type-Options: nosniff`.
     - `Referrer-Policy: strict-origin-when-cross-origin`.
  2. **Dans `vite.config.ts` :**
     - En-têtes configurés pour le serveur de développement et de prévisualisation :
       - `X-Frame-Options: DENY`
       - `X-Content-Type-Options: nosniff`
       - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

---

### SEC-07 : Hygiène Git & Protection des Clés d'API
- **Gravité :** Faible (CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N - Score 4.3)
- **Vérifications menées :**
  - Historique Git audité : aucun fichier `.env` contenant de véritables clés secrètes n'a été commité.
  - Le fichier `.gitignore` protège rigoureusement `.env`, `.env.production`, et `.env.local`.
  - La clé publique Supabase (`anon key`) est conçue pour être exposée côté client, car la sécurité repose intégralement sur les règles RLS que nous venons de verrouiller.
  - Les dépendances npm/pnpm ont été auditées avec `pnpm audit` : **0 vulnérabilité détectée**.

---

## 3. Matrice des Rôles et Permissions (RBAC)

| Ressource / Action | Visiteur Anonyme | Utilisateur Authentifié | Administrateur |
| :--- | :---: | :---: | :---: |
| **Voir les photos approuvées** |  Autorisé |  Autorisé |  Autorisé |
| **Voir ses propres photos en attente** |  Refusé |  Autorisé |  Autorisé |
| **Voir toutes les photos en attente** |  Refusé |  Refusé |  Autorisé |
| **Publier une photo (statut forcé `pending`)** |  Refusé |  Autorisé (max 5) |  Autorisé |
| **Approuver / Rejeter une photo** |  Refusé |  Refusé |  Autorisé |
| **Marquer une photo comme "officielle"** |  Refusé |  Refusé |  Autorisé |
| **Modifier le titre / lieu de sa photo** |  Refusé |  Autorisé |  Autorisé |
| **Supprimer une photo** |  Refusé |  Ses photos |  Toutes |
| **Téléverser dans le bucket `province-photos`** |  Refusé |  Dans son sous-dossier (≤ 5Mo) |  Autorisé |

---

## 4. Checklist Opérationnelle Post-Déploiement

Exécutez les actions suivantes pour finaliser la mise en production sécurisée :

1. **Exécution du script SQL mis à jour :**
   - Ouvrez le tableau de bord Supabase du projet.
   - Rendez-vous dans **SQL Editor**.
   - Collez et exécutez le script complet `supabase_schema.sql`.

2. **Vérification de l'attribution des rôles :**
   - Dans le tableau de bord Supabase, vérifiez la table `public.user_roles` :
     ```sql
     SELECT u.email, r.role, r.created_at
     FROM public.user_roles r
     JOIN auth.users u ON r.user_id = u.id;
     ```
   - Pour nommer un nouvel administrateur :
     ```sql
     INSERT INTO public.user_roles (user_id, role)
     SELECT id, 'admin' FROM auth.users WHERE email = 'nouvel-admin@domaine.com'
     ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
     ```

3. **Paramètres de sécurité Supabase Auth :**
   - **Authentication > URL Configuration :**
     - Vérifiez que **Site URL** et **Redirect URLs** pointent uniquement vers vos domaines de production autorisés (ex: `https://mvett.ga`, `https://mainframe.agency`) et non vers des wildcards non contrôlés (`*`).
   - **Authentication > Providers > Email :**
     - Assurez-vous que **Confirm email** est activé si vous souhaitez garantir l'authenticité des adresses.

4. **Configuration CDN / Hébergeur (Vercel / Netlify / Cloudflare) :**
   - Assurez-vous que les en-têtes HTTP de sécurité configurés dans `vite.config.ts` sont également déclarés dans la configuration de votre hébergeur (par ex. `vercel.json` ou `_headers` pour Cloudflare/Netlify) :
     ```json
     {
       "headers": [
         {
           "source": "/(.*)",
           "headers": [
             { "key": "X-Frame-Options", "value": "DENY" },
             { "key": "X-Content-Type-Options", "value": "nosniff" },
             { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
             { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" }
           ]
         }
       ]
     }
     ```
