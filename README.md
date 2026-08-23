# MAM+ (mam-plus-H)

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/jul1n/mam-plus-H?label=version)

A custom fork of MAM+ containing:
- Tweaks and enhancements for MyAnonamouse (MAM).
- **Goodreads & Amazon → MAM integration**: Automatically adds 🔎 search buttons directly on Goodreads book pages (within the sidebar) and Amazon product pages, allowing you to instantly search for the corresponding torrents on MAM (supporting title-only and title+author searches).

Don't know what MAM is? This script won't be very useful to you then.

## Installation

[![Install Button](https://img.shields.io/badge/Install-Click%20Here-green?style=for-the-badge&logo=DocuSign)](https://github.com/jul1n/mam-plus-H/raw/master/release/mam-plus-H.user.js)

You need to have a userscript browser extension (like [Violentmonkey](https://violentmonkey.github.io/get-it/) or similar) installed in order to use MAM+. Greasemonkey is NOT recommended as it no longer follows the Userscript API standards it once set (and that MAM+ currently uses).

MAM+ only officially supports the most recent versions of Chrome & Firefox, but other modern browsers with userscript support should theoretically work. That said, you'll probably have lots of issues if you use Safari, Firefox offshoots (Waterfox, Basilisk, etc.), or older Edge versions.

## Modification & Contribution

In case you want to modify the script and/or contribute to it, follow the below instructions. These instructions are for Chrome using Violentmonkey, as it's the easiest way to test scripts. Additionally, there's some [documentation](https://github.com/gardenshade/mam-plus/wiki) in the Wiki to help you get started with adding new features, so be sure to check that out.

### Prerequisites

-   [Node.js](https://nodejs.org/en/download/)
-   Google Chrome with [Violentmonkey](https://violentmonkey.github.io/get-it/)
-   tslint (not currently included because vscode has baked-in linting)

### Instructions

#### First-time setup

-   Make sure the prerequisites are installed on your system
-   Clone this project to your computer
-   Open a terminal window in your project folder, and run `npm install`
-   On the Chrome extensions page (found at chrome://extensions), ensure that the Violentmonkey extension has access to file URLs

#### Workflow

This is a Typescript project, but vanilla JavaScript is valid Typescript, so don't let a lack of knowledge of TS keep you from contributing.

To start developing, simply run `npm run build`. Assuming everything works, this will transpile the Typescript files into a single JavaScript file (in the `build/` dir) with a userscript header and inline sourcemaps. Additionally, the userscript will have `_dev` appended to its name, to differentiate between the developmental version and the release version.

For continuous development, run `npm run watch`. This task will otherwise retranspile the script every time you save.

Drag the `_dev.user.js` file into Chrome and install with Violentmonkey. When you are using the Watch task, as long as you keep the userscript installation tab open any changes you save will be automatically loaded in your browser when you reload. Occasionally, Violentmonkey will throw an error when the script is being generated via `watch`; if this happens, close the script installation page and reinstall the script as previously described.

When you are ready to release your script, use [`npm version <patch|minor|major>`](https://docs.npmjs.com/cli/version) to increment your script. This will output a minified JavaScript file without the `_dev` suffix and will automatically generate a commit & push to the Github repo.

This project uses `git flow` so pull requests should not be on the `master` branch if possible.
