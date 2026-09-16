# WANDA AGENCY
## DOSSIER CLIENT PRIVILÉGIÉ — LE JOURNAL D'ÉMERAUDE
### LIVRE 02 — FEUILLE DE ROUTE TECHNIQUE, SPÉCIFICATIONS DU PROTOTYPE & PLANNING DE PRODUCTION

**Référence :** WA-EMERAUDE-02  
**Client :** Martine Myphe Lomba (« Émeraude ») — Le Journal d'Émeraude  
**Version :** 1.0 — 2026  
**Nature :** Cahier des Charges Technique Interne & Planning de Développement  
**Diffusion :** Direction Technique & Développeurs WANDA AGENCY — Strictement Confidentiel  

---

## 1. SPÉCIFICATIONS TECHNIQUES DE L'INFRASTRUCTURE PROPRIÉTAIRE

La plateforme officielle de Martine Myphe Lomba est conçue sur la base de notre prototype d'ingénierie cinématique haute couture développé dans le fichier `journal-emeraude-prototype.html`.

### A. Stack Technologique & Moteur de Rendu :
- **Architecture de Base :** Astro 5.x (Génération statique optimisée, hydratation sélective, temps de chargement ultra-rapide).
- **Rendu WebGL Immersif :** Three.js r128 avec shaders d'ambiance et canvas de particules superposé.
- **Micro-Interactions :** GSAP 3.x pour les transitions cinématographiques et curseur aimanté dynamique (`.custom-cursor`).
- **Base de Données & Formulaires :** Supabase (stockage sécurisé des leads de marques et alertes instantanées).
- **Compression d'Images :** Pipeline WebP avec redimensionnement automatique côté client pour garantir un affichage instantané sur réseau mobile gabonais (Airtel / Moov).

### B. Direction Artistique Haute Couture :
- **Palette Chromatique Exécutive :**
  - Noir Obsidienne Profond : `#030806`, `#04100c` (Atmosphère feutrée cinéma).
  - Émeraude Minérale : `#10b981`, `#047857` (Signature identitaire de l'actrice).
  - Or Noble Satiné : `#d4af37`, `#f3e5ab` (Codes du luxe et de l'autorité institutionnelle).
  - Blanc Luminescent : `#f8faf9` (Contraste et lisibilité maximale).
- **Typographie Institutionnelle :**
  - Titrages Solennels : `Cinzel` (Capitales impériales, références festivals de cinéma).
  - Citations & Manifestes : `Cormorant Garamond` (Élégance éditoriale).
  - Interface & Données : `Plus Jakarta Sans` (Clarté ergonomique moderne).

---

## 2. DÉCOUPAGE MODULAIRE DES COMPOSANTS À INDUSTRIALISER

| Module | Éléments Fonctionnels Développés | Statut Prototype | Action d'Industrialisation |
| :--- | :--- | :---: | :--- |
| **01. Hero Cinéma** | Video background en boucle, bouton son ON/OFF, canvas Three.js, badge officiel CEMAC/Diaspora. | Validé | Optimiser le poids de la vidéo en streaming adaptatif HLS/MP4 léger. |
| **02. Manifeste** | Grille asymétrique, portrait officiel sticky avec métadonnées Koulamoutou/Libreville, citation en exergue. | Validé | Remplacer l'image par le shooting officiel haute résolution de Martine. |
| **03. Showcase Bi-Mode** | Bascule Vue Cinéma / Vue Grille, Ticker interactif (Stérile, Eki, EWUSU, Journal, Osaka 2025, Siège Studio). | Validé | Relier chaque œuvre aux bandes-annonces vidéo officielles et synopsis. |
| **04. Tiroir Études de Cas** | Modal coulissant latéral (Drawer) présentant les résultats des campagnes de marque (Vues, viralité, ROI). | Validé | Renseigner les données chiffrées réelles des partenariats télécoms et bancaires. |
| **05. L'Agence & Studio** | Présentation des 4 pôles : Brand content, Égérie, Studio 4K & Post-Prod, Galas & Modération. | Validé | Intégrer les photos réelles du plateau de tournage inauguré en 2025. |
| **06. Données d'Impact** | Bento Grid de chiffres clés : 2.5M+ abonnés, 84% affinité féminine, 15+ marques, Top 1% notoriété. | Validé | Graphismes animés au défilement (compteurs dynamiques GSAP). |
| **07. Booking VIP (Wizard)** | Formulaire de qualification avec filtrage budgétaire (<2M, 2M-5M, 5M-15M, 15M+ FCFA). | Validé | Connecter l'envoi direct vers le WhatsApp de l'agence et la boîte email officielle. |

---

## 3. CALENDRIER DE PRODUCTION DÉTAILLÉ (DURÉE : 6 SEMAINES)

### Semaine 1 : Cadrage & Récupération des Médias
- Validation conjointe du contrat signé et encaissement de l'acompte initial de 50%.
- Conduite du Kickoff Strategy Call de 45 minutes avec Martine Myphe Lomba et son assistante.
- Récupération sur le Drive partagé des photographies officielles en format RAW/TIFF et des vidéos sources.
- Réservation et configuration des DNS du nom de domaine officiel (`lejournaldemeraude.com` ou équivalent).

### Semaine 2 : Industrialisation du Moteur Frontend
- Migration du code du prototype dans l'architecture Astro de production.
- Paramétrage des shaders Three.js et du curseur aimanté.
- Optimisation fine du responsive design pour l'ensemble des smartphones du marché gabonais.

### Semaine 3 : Curation Éditoriale & Intégration Audiovisuelle
- Traitement colorimétrique des visuels pour respecter l'univers émeraude et or noble.
- Encodage des extraits vidéos pour lecture fluide sans latence.
- Intégration des textes définitifs validés par la cliente pour chaque section.

### Semaine 4 : Connexion du Tunnel de Monétisation
- Configuration de la base de données Supabase pour la centralisation des demandes d'annonceurs.
- Mise en place des notifications instantanées par email et webhook WhatsApp pour chaque nouvelle demande de marque supérieure à 2 000 000 FCFA.
- Tests d'intégrité du formulaire de filtrage.

### Semaine 5 : Recette Interne & Tests de Performance
- Audit de vitesse de chargement sur réseau mobile 3G/4G restreint (score de performance cible > 90/100).
- Déploiement sur le serveur privé de prévisualisation (Staging sécurisé sous mot de passe).
- Validation interne par la Direction de WANDA AGENCY.

### Semaine 6 : Restitution, Recette Client & Mise en Ligne
- Présentation de la plateforme en visioconférence à Martine Myphe Lomba.
- Recueil et intégration des ajustements consolidés (Round 1 de retours).
- Signature du Procès-Verbal de Recette Définitive.
- Encaissement du solde final de 50%.
- Basculement DNS définitif et mise en production officielle.
- Session de formation de 45 minutes pour l'équipe du studio.

---

## 4. CHECKLIST TECHNIQUE NON-NÉGOCIABLE AVANT LIVRAISON

- [ ] Vitesse d'affichage : Première peinture avec contenu (FCP) inférieure à 1,8 seconde sur mobile.
- [ ] Poids global : Page d'accueil compressée pesant moins de 2,5 Mo (vidéo d'arrière-plan optimisée).
- [ ] Shaders WebGL : Dégradation gracieuse sans saccade sur smartphones d'entrée de gamme (fallback CSS élégant si WebGL non supporté).
- [ ] Formulaire de booking : Réception confirmée des leads de marques dans la boîte de réception de l'agence.
- [ ] Référencement naturel : Balises OpenGraph et meta tags configurés avec le portrait officiel pour un partage prestigieux sur WhatsApp et Facebook.
- [ ] Mentions légales & RGPD : Conformité juridique avec identification de l'entreprise Le Journal d'Émeraude à Libreville.
