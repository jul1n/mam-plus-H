# MAM+ (mam-plus-H)

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/jul1n/mam-plus-H?label=version)

---

## 🇫🇷 Version Française

Une version personnalisée (fork) de MAM+ contenant :
- Diverses optimisations et améliorations pour MyAnonamouse (MAM).
- **Intégration Goodreads & Amazon → MAM** : Ajoute automatiquement des boutons de recherche 🔎 directement sur les pages de livres de Goodreads (dans la barre latérale sous "Want to Read") et sur les pages produit d'Amazon. Cela vous permet de rechercher instantanément les torrents correspondants sur MAM (recherche par titre seul ou titre + auteur).

Vous ne savez pas ce qu'est MAM ? Ce script ne vous sera d'aucune utilité.

### Installation

[![Bouton Installer](https://img.shields.io/badge/Installer-Cliquez%20Ici-green?style=for-the-badge&logo=DocuSign)](https://github.com/jul1n/mam-plus-H/raw/master/release/mam-plus-H.user.js)

Vous devez avoir installé une extension de navigateur pour scripts utilisateur (comme [Violentmonkey](https://violentmonkey.github.io/get-it/) ou Tampermonkey) afin d'utiliser MAM+. Greasemonkey n'est PAS recommandé.

---

## 🇬🇧 English Version

A custom fork of MAM+ containing:
- Tweaks and enhancements for MyAnonamouse (MAM).
- **Goodreads & Amazon → MAM integration**: Automatically adds 🔎 search buttons directly on Goodreads book pages (within the sidebar under "Want to Read") and Amazon product pages, allowing you to instantly search for the corresponding torrents on MAM (supporting title-only and title+author searches).

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
