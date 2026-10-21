# ARYA — Play Closer. Know More.

A mobile-friendly installable web game prototype with Truth or Dare, Secret Deck, Would You Rather, and This or That.

## Included
- `index.html`, `style.css`, `app.js`: game interface and logic
- `manifest.json`, `sw.js`, `icon.svg`: installable PWA support
- `FIREBASE_SETUP.md`: Firebase Authentication and Realtime Database setup

## Online multiplayer
The app is configured for the ARYA Firebase web project and uses Firebase anonymous authentication plus Realtime Database. Online play requires enabling the **Anonymous** sign-in provider and publishing appropriate database rules. See `FIREBASE_SETUP.md`.

This is a prototype, not a hardened production service. Test with two devices and review Firebase rules before sharing broadly. Never add private service-account credentials to the frontend.
