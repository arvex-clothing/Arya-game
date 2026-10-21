# ARYA — mobile multiplayer party game

A mobile-first PWA starter for Truth or Dare, The Secret Deck, Would You Rather, and This or That.

## Important status
- The interface and local game flow work without Firebase.
- Online rooms, room-code joining, and synchronized turns require your own Firebase Realtime Database project and web configuration.
- This is a starter project, not yet a production-hardened app. Review database rules and test with two devices before sharing it broadly.
- Firebase web config is not an admin secret, but database security must be enforced with rules. Never publish service-account keys.

## Files
- `index.html` — app screens
- `style.css` — responsive dark/purple UI
- `app.js` — game prompts and Firebase room logic
- `manifest.json`, `icon.svg`, `sw.js` — installable PWA shell

## Setup on Android
1. Create a GitHub repository named `arya-game`.
2. Upload all files in this folder to the repository root.
3. In repository Settings → Pages, choose deploy from branch `main`, folder `/ (root)`.
4. Create a Firebase project at https://console.firebase.google.com/
5. Add a Web App in Firebase project settings and copy its web config into `firebaseConfig` at the top of `app.js`.
6. Create a Realtime Database. Copy the database URL exactly into `databaseURL`.
7. Configure secure database rules before testing multiplayer. See `FIREBASE_SETUP.md`.
8. Wait for GitHub Pages to deploy, open the HTTPS URL in Chrome, then use Chrome's menu → Install app or Add to Home screen.

## Current prototype limitations
- No accounts or strong identity verification; nicknames are user-entered.
- The room code is a join token, not end-to-end encryption.
- Do not use it for sensitive conversations or store personal secrets.
- This starter is intended for two players per room; database rules should enforce room/player limits where feasible.
- The Firebase rules and app code must be reviewed and tested before production use.
