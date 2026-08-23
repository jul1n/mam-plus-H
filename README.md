# MAM+ (mam-plus-H)

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/jul1n/mam-plus-H?label=version)

---

## 🇫🇷 Version Française

Une version personnalisée (fork) de MAM+ contenant :
- Diverses optimisations et améliorations pour MyAnonamouse (MAM).
- **Évolutions par rapport au script MAM+ d'origine :**
  - **Intégration Goodreads & Amazon → MAM autonome** : Ajout de boutons de recherche 🔎 sur Goodreads (insérés élégamment entre le bouton de lecture et le bouton d'achat Amazon) et Amazon pour lancer des recherches directes sur MAM (Titre seul / Titre + Auteur). Cette logique est complètement isolée pour une meilleure stabilité et performance.
  - **Support d'installation en parallèle** : Le script a été renommé (`mam-plus-H`), et les métadonnées (auteur `jul1n`, namespace) modifiées pour vous permettre d'installer et d'utiliser cette version améliorée en parallèle du script officiel `mam-plus` sans aucun conflit de mise à jour sous Tampermonkey.
  - **Correction des liens de redirection** : Résout les problèmes de redirection vers la page de préférences depuis des sites externes (comme Goodreads) en convertissant les chemins relatifs de MAM en URLs absolues sécurisées.
  - **Gestion dynamique de React sur Goodreads** : Utilisation d'un observateur DOM persistant (`MutationObserver`) pour s'assurer que les boutons MAM restent visibles, même si React rafraîchit dynamiquement la page Goodreads après le chargement initial.

Vous ne savez pas ce qu'est MAM ? Ce script ne vous sera d'aucune utilité.

### Installation

[![Bouton Installer](https://img.shields.io/badge/Installer-Cliquez%20Ici-green?style=for-the-badge&logo=DocuSign)](https://github.com/jul1n/mam-plus-H/raw/master/release/mam-plus-H.user.js)

Vous devez avoir installé une extension de navigateur pour scripts utilisateur (comme [Violentmonkey](https://violentmonkey.github.io/get-it/) ou Tampermonkey) afin d'utiliser MAM+. Greasemonkey n'est PAS recommandé.

---

## 🇬🇧 English Version

A custom fork of MAM+ containing:
- Tweaks and enhancements for MyAnonamouse (MAM).
- **Key Enhancements compared to the original MAM+ script:**
  - **Decoupled Goodreads & Amazon → MAM Integration**: Adds native-looking search buttons 🔎 on Goodreads (positioned exactly between the read status and Amazon buttons) and Amazon to search MAM (Title Only / Title + Author). The integration logic is fully isolated to prevent performance regressions on other pages.
  - **Parallel Installation Support**: Renamed to `mam-plus-H` with updated author (`jul1n`) and namespace metadata, allowing you to run this custom version side-by-side with the official `mam-plus` script in Tampermonkey without update conflicts.
  - **Redirect Link Fixes**: Fixes issues where preferences notification redirects broke on external sites (like Goodreads) by translating MAM relative URLs to absolute secure paths.
  - **Goodreads React Lifecycle Handling**: Utilizes a persistent `MutationObserver` to ensure the search buttons are automatically re-injected if Goodreads' React runtime redraws the action column after initial load.

Don't know what MAM is? This script won't be very useful to you then.

### Installation

[![Install Button](https://img.shields.io/badge/Install-Click%20Here-green?style=for-the-badge&logo=DocuSign)](https://github.com/jul1n/mam-plus-H/raw/master/release/mam-plus-H.user.js)

You need to have a userscript browser extension (like [Violentmonkey](https://violentmonkey.github.io/get-it/) or Tampermonkey) installed in order to use MAM+. Greasemonkey is NOT recommended.

---

## 🛠️ Modification & Contribution / Développement

### Prerequisites / Prérequis

- [Node.js](https://nodejs.org/en/download/)
- Google Chrome / Edge with [Violentmonkey](https://violentmonkey.github.io/get-it/) or [Tampermonkey](https://www.tampermonkey.net/)

### Instructions

1. **First-time setup / Configuration initiale** :
   - Open a terminal window in the project folder and run:
     ```bash
     npm install
     ```
2. **Workflow / Développement** :
   - To start developing / Pour lancer le développement :
     ```bash
     npm run build
     ```
   - For continuous build (auto-compile on save) / Pour compiler automatiquement lors des sauvegardes :
     ```bash
     npm run watch
     ```
   - Drag the generated `build/_dev.user.js` into your browser to install it.
3. **Release / Publication** :
   - When ready to release, use / Pour publier la nouvelle version :
     ```bash
     npm run release
     ```
