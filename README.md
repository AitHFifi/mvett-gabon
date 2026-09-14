# 🇬🇦 MVETT — Les 9 Provinces du Gabon

[![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://greensock.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **MVETT** est une expérience web immersive en 3D WebGL dédiée à la valorisation culturelle, géographique et touristique des 9 provinces du Gabon, propulsée par **Astro**, **Three.js**, **GSAP** et **Supabase**.

---

## 🌟 Points Forts

- **🎨 Diaporama WebGL Cinématique 3D :**
  - Moteur de rendu Three.js avec transition par shaders personnalisés.
  - Détection dynamique des ratios d'aspect : gestion intelligente des photos en format portrait 9:16 avec shader de flou cinématique d'arrière-plan (*dual-pass ambient blur*).
  - Navigation fluide avec animations d'ambiance synchronisées via GSAP.

- **🏛️ Espace Administration & Modération :**
  - Gestion du catalogue officiel des 9 provinces (*Estuaire, Haut-Ogooué, Moyen-Ogooué, Ngounié, Nyanga, Ogooué-Ivindo, Ogooué-Lolo, Ogooué-Maritime, Woleu-Ntem*).
  - Modération des contributions communautaires (`pending`, `approved`, `rejected`, `archived`).
  - Studio de prévisualisation interactif avec simulation **Laptop (16:9)** et **Smartphone (9:16)**.
  - Réorganisation visuelle de l'ordre d'affichage (`display_order`) par province.

- **⚡ Performance & Résilience :**
  - Compression automatique côté client en **WebP** (`browser-image-compression`) avant l'envoi vers Supabase Storage.
  - Architecture bi-mode résiliente : synchronisation temps réel avec **Supabase** et fallback transparent en `localStorage` (mode hors-ligne / démo).

---

## 📂 Structure du Projet

```text
├── public/                     # Actifs statiques publics
├── src/
│   ├── components/
│   │   └── Slideshow.astro     # Moteur du diaporama WebGL & Canvas Three.js
│   ├── data/
│   │   └── provinces.ts        # Données de base & patrimoine des 9 provinces
│   ├── layouts/
│   │   └── Layout.astro        # Layout racine avec typographie & styles globaux
│   ├── lib/
│   │   ├── photo-store.ts      # Store unifié (Supabase Storage/DB + LocalStorage)
│   │   └── supabase.ts         # Client d'initialisation Supabase
│   ├── pages/
│   │   ├── index.astro         # Page d'accueil & expérience 3D immersive
│   │   └── admin.astro         # Dashboard d'administration & studio de modération
│   └── styles/
│       └── global.css          # Variables CSS, thème sombre & design system
├── docs/
│   └── SUPABASE_SETUP.md       # Guide de configuration pas-à-pas de Supabase
├── supabase_schema.sql         # Script SQL complet (tables, index, RLS & triggers)
├── astro.config.mjs            # Configuration du framework Astro
└── package.json                # Dépendances & scripts du projet
```

---

## 🚀 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- [pnpm](https://pnpm.io/) (version 9+)

### Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/AitHFifi/mvett-gabon.git
   cd mvett-gabon
   ```

2. **Installer les dépendances avec pnpm :**
   ```bash
   pnpm install
   ```

3. **Configurer l'environnement :**
   Dupliquez `.env.example` en `.env` et renseignez vos identifiants Supabase (optionnel en mode démo) :
   ```bash
   cp .env.example .env
   ```

4. **Lancer le serveur de développement :**
   ```bash
   pnpm dev
   ```
   L'application sera accessible sur `http://localhost:4321`.

---

## 🛠️ Scripts Disponibles

| Commande | Description |
| :--- | :--- |
| `pnpm dev` | Démarre le serveur Astro en mode développement local |
| `pnpm build` | Compile le site statique dans le dossier `dist/` |
| `pnpm preview` | Prévisualise localement le build de production |
| `pnpm astro` | Accède à la CLI Astro |

---

## 🗄️ Configuration Supabase

Pour activer l'authentification des modérateurs, la synchronisation multi-utilisateurs et le stockage des photographies en ligne, consultez le guide dédié :

👉 **[Consulter le guide de configuration Supabase](docs/SUPABASE_SETUP.md)**

---

## 🤝 Contribution & Bonnes Pratiques

1. Créez une branche dédiée à votre fonctionnalité (`git checkout -b feat/nom-de-fonctionnalite`).
2. Effectuez vos modifications en respectant les conventions de commit [Conventional Commits](https://www.conventionalcommits.org/).
3. Validez la compilation avec `pnpm build`.
4. Poussez votre branche et ouvrez une Pull Request.

---

## 📄 Licence

Projet sous licence MIT — Développé avec passion pour la mise en valeur du patrimoine culturel gabonais.
