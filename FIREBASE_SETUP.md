# Firebase setup guide for ARYA

Do these steps after the files are uploaded to GitHub.

## 1. Create a project
Open https://console.firebase.google.com/ → Create a project → name it `arya-game` (or another available name). Analytics can be disabled for this small prototype.

## 2. Register a Web App
In Project Overview, tap the web icon `</>` → register app. Firebase shows a JavaScript configuration object. Copy the values into the `firebaseConfig` object at the top of `app.js`.

Do not copy any service-account private key into this website. The web config is intended for client-side apps; access control comes from Firebase Security Rules.

## 3. Create Realtime Database
Build → Realtime Database → Create Database. Choose a nearby location and start in locked/production mode if offered. Copy the database URL shown by Firebase into `databaseURL`.

## 4. Security warning and rules
Do not set database rules to public read/write (`.read: true`, `.write: true`) for a public website. That would let strangers read, change, or delete data.

This starter does not include a complete production-safe authorization system yet. Before enabling multiplayer publicly, add Firebase Authentication (anonymous sign-in is a common prototype option) and write/test rules that:
- require an authenticated user;
- limit each room to two distinct players;
- allow players to read only rooms they joined;
- restrict each user to changing their own player record;
- validate permitted room fields and game-state updates;
- limit room data size and clean up expired rooms.

For a first private test, keep database access restricted while setting up. Then add authentication and tested rules before connecting the second phone. If you need help, ask for the next step and share a screenshot of the Firebase screen with private account details hidden.

## 5. Paste config
Replace the `PASTE_...` placeholder values in `app.js`. The `databaseURL` should match Firebase's displayed URL exactly.

## 6. Test
Open the GitHub Pages URL on your phone, create a room, and open the same URL on a second phone or browser profile. Join with the code. If the second phone cannot join, check browser console/logs, the database URL, app config, and security rules.

## 7. Install
Open the deployed HTTPS URL in Chrome → menu (⋮) → Install app or Add to Home screen. The menu wording varies by Android/Chrome version.
