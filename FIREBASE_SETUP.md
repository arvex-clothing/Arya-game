# ARYA Firebase setup (mobile-friendly)

This project uses Firebase Realtime Database and **anonymous authentication**. The web config is designed to be included in browser code; never add service-account keys or Admin SDK credentials.

## 1. Enable Anonymous Authentication
1. Open https://console.firebase.google.com/ and select `arya-game`.
2. Open **Build → Authentication → Get started**.
3. Open **Sign-in method** (or **Sign-in providers**), select **Anonymous**, enable it, and save.

## 2. Confirm Realtime Database URL
The configured URL is `https://arya-game-default-rtdb.firebaseio.com`. Confirm that this matches the URL shown on your Realtime Database page.

## 3. Set Realtime Database rules
Open **Realtime Database → Rules** and replace the rules with the following. Review and publish them. These rules require a signed-in (anonymous) Firebase user, restrict room creation to a room's host, and allow room members to update the game fields. Do not use public `read: true` / `write: true` rules.

```json
{
  "rules": {
    "rooms": {
      ".read": "auth != null",
      "$room": {
        ".write": "auth != null && !data.exists() && newData.child('hostId').val() === auth.uid && newData.child('players').child(auth.uid).exists()",
        "players": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid && (!data.exists() || root.child('rooms').child($room).child('players').child(auth.uid).exists())"
          }
        },
        "lastPrompt": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "lastType": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "category": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "cardIndex": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "lastActionBy": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "updatedAt": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "currentTurn": { ".write": "auth != null && root.child('rooms').child($room).child('players').child(auth.uid).exists()" },
        "hostId": { ".write": false },
        "createdAt": { ".write": false }
      }
    }
  }
}
```

**Important limitations:** this is a small prototype, not a hardened public service. The rules above are a starting point and should be tested in Firebase Rules Playground. They do not enforce a strict two-player maximum against all concurrent joins. Do not store sensitive personal information in rooms. Consider App Check, room expiration/cleanup, rate limits, and stronger validation before sharing widely.

## 4. Publish on GitHub Pages
Upload the files from the ZIP to the repository root, replacing the same-named files. Ensure `index.html`, `app.js`, `style.css`, `manifest.json`, and `sw.js` are directly in the root—not inside an extra nested folder. Wait for GitHub Pages to deploy, then reload the site. If an older version is cached, close the tab and reopen the site or clear the site's cached data.

## 5. Test
1. Open the site on phone 1 and create a room.
2. Open the same site on phone 2, enter a nickname and the room code, and join.
3. Confirm both screens show two players and that a new card on one phone appears on the other.

If it fails, check the browser console and Firebase Authentication/Realtime Database logs. Do not loosen rules to public access as a workaround.
