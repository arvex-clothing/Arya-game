// ARYA — starter game. Configure Firebase below to enable online multiplayer.
// Never put Firebase Admin SDK credentials or service-account keys in frontend code.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// 1) Replace these placeholder values with your Firebase Web App config.
// 2) Enable Realtime Database and set secure rules using the setup guide.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "PASTE_YOUR_DATABASE_URL",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
const firebaseReady = Object.values(firebaseConfig).every(v => v && !v.startsWith("PASTE_"));
let db = null;
if (firebaseReady) {
  try { db = getDatabase(initializeApp(firebaseConfig)); }
  catch (e) { console.error(e); }
}

const prompts = {
  funny: {
    truth: ["What is the most ridiculous thing you have ever searched online?","What is your most embarrassing autocorrect fail?","What is a tiny thing that makes you unreasonably angry?","What is the weirdest food combination you secretly enjoy?","What is the funniest excuse you have ever used?","If your life had a blooper reel, what would be in it?","What is something you pretended to understand but absolutely did not?","What is your most chaotic late-night decision?"],
    dare: ["Speak in a dramatic movie-trailer voice for the next two turns.","Invent a new award and give it to the other player.","Describe your day using only five emojis.","Make up a ridiculous slogan for yourself.","Send your best imaginary villain laugh — in text, obviously.","Write a two-line poem about the last thing you ate."]
  },
  cute: {
    truth: ["What small thing can instantly improve your mood?","What is a memory that always makes you smile?","What is the nicest compliment you still remember?","What little gesture makes you feel appreciated?","What song feels like a warm hug to you?","What is one thing you wish people noticed about you?"],
    dare: ["Give the other player a sincere, specific compliment.","Describe your ideal cozy day in three sentences.","Share three things you are grateful for this week.","Invent a cute nickname for your current mood."]
  },
  flirty: {
    truth: ["What kind of compliment makes you blush a little?","What is your most charming quality, in your opinion?","What is a green flag that instantly gets your attention?","What is the smoothest line someone could say to make you laugh?","Have you ever rehearsed a message before sending it?","What is more attractive: confidence, kindness, or a great sense of humor?"],
    dare: ["Give the other player a playful compliment without using the word 'cute'.","Write a harmless, ridiculously dramatic pickup line.","Describe your charm in exactly three words.","Create a flirty movie title starring you."]
  },
  deep: {
    truth: ["What is something you have learned about yourself recently?","What is a fear you have become better at handling?","What makes you feel truly understood?","What is a boundary you are proud of setting?","What is one thing you hope your future self remembers?","When do you feel most like yourself?"],
    dare: ["Share one goal you want to make progress on this month.","Name one quality you are trying to grow in yourself.","Finish this sentence: 'I feel proud of myself when…'","Share a piece of advice you wish you had heard earlier."]
  },
  savage: {
    truth: ["What is your most harmless but unpopular opinion?","What is a habit you know you should probably fix?","What is the pettiest thing that annoys you?","What is your most dramatic overreaction to something tiny?","What is a trend you would happily retire forever?","What is a funny first impression people might have of you?"],
    dare: ["Roast your own taste in music in one sentence.","Give yourself a brutally honest but funny review.","Describe your most-used excuse like a courtroom confession.","Write a one-star review of getting out of bed."]
  },
  secret: {
    truth: ["What is something you rarely admit out loud?","What is a small secret talent you have?","What is a thought you have more often than people would guess?","What is something you wish you were brave enough to try?","What is a moment you wish you could relive?","What is a question you wish people asked you more often?","What is something you changed your mind about recently?","What is one thing you are still figuring out?"],
    dare: ["Reveal a harmless fun fact most people do not know about you.","Share a tiny win you have not celebrated enough.","Tell a two-sentence story that starts with 'I never told anyone this, but…'","Make up a secret-agent codename for yourself."]
  },
  would: {
    questions: [["Always know when someone is lying","Always know when someone is joking"],["Explore space","Explore the deepest ocean"],["Have a rewind button for life","Have a pause button for life"],["Be able to read minds for one minute a day","Be able to become invisible for one minute a day"],["Have unlimited free food","Have unlimited free travel"],["Be famous for something amazing","Be quietly great at many things"],["Only communicate in memes for a day","Only communicate in song lyrics for a day"]],
  },
  thisthat: {
    questions: [["Sunrise","Midnight"],["Voice notes","Long texts"],["Plan everything","Be spontaneous"],["Sweet snacks","Salty snacks"],["Big city","Quiet countryside"],["Movies at home","Night out"],["Honest advice","Comfort first"],["Mystery","Knowing the plan"]],
  }
};

const state = {
  screen: "home", roomCode: null, playerId: sessionStorage.getItem("aryaPlayerId") || crypto.randomUUID(),
  nickname: "", isHost: false, mode: "truth", category: "funny", choice: "truth",
  cardIndex: 0, roomData: null, unsubscribe: null, createMode: false
};
sessionStorage.setItem("aryaPlayerId", state.playerId);

const $ = id => document.getElementById(id);
const screens = ["home-screen","room-screen","game-screen"];
function showScreen(id) {
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  state.screen = id;
  window.scrollTo({top:0,behavior:"smooth"});
}
let toastTimer;
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
function makeCode() { return Math.random().toString(36).slice(2,8).toUpperCase().replace(/[ILO0]/g, "X"); }
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function updatePlayers(room) {
  const players = room?.players || {};
  const list = Object.entries(players);
  const me = players[state.playerId];
  const other = list.find(([id]) => id !== state.playerId)?.[1];
  $("player-a").textContent = me?.nickname || state.nickname || "You";
  $("avatar-a").textContent = (me?.nickname || state.nickname || "A").slice(0,1).toUpperCase();
  $("player-b").textContent = other?.nickname || "Waiting…";
  $("avatar-b").textContent = other?.nickname ? other.nickname.slice(0,1).toUpperCase() : "?";
  const turnId = room?.currentTurn || state.playerId;
  const turnPlayer = players[turnId];
  $("turn-label").textContent = turnPlayer ? `${turnPlayer.nickname}'s turn` : "Your turn";
  $("turn-note").textContent = other ? `${turnPlayer?.nickname || "Player"} is up next. Keep it fun — anyone can skip.` : "Share the room code to bring in another player.";
}
function setPrompt(text, type) {
  $("prompt-text").textContent = text;
  $("card-type").textContent = type.toUpperCase();
  $("card-number").textContent = `CARD ${String(state.cardIndex).padStart(2,"0")}`;
  $("prompt-card").animate([{transform:"translateY(7px) scale(.985)",opacity:.5},{transform:"translateY(0) scale(1)",opacity:1}],{duration:260,easing:"ease-out"});
}
function drawPrompt() {
  state.cardIndex++;
  if (state.mode === "would" || state.mode === "thisthat") {
    const pair = randomItem(prompts[state.mode].questions);
    const title = state.mode === "would" ? "WOULD YOU RATHER?" : "THIS OR THAT";
    $("game-title").innerHTML = state.mode === "would" ? "Would You <em>Rather?</em>" : "This <em>or That</em>";
    $("truth-dare-choice").innerHTML = `<button class="choice-btn" data-answer="${escapeHtml(pair[0])}">${escapeHtml(pair[0])}</button><button class="choice-btn dare" data-answer="${escapeHtml(pair[1])}">${escapeHtml(pair[1])}</button>`;
    $("truth-dare-choice").querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{toast("Choice locked in: "+b.dataset.answer);syncAction({lastPrompt:title+" "+pair.join(" / "),lastAnswer:b.dataset.answer});}));
    $("card-type").textContent = title;
    setPrompt("Choose the option that feels most like you.", title);
    return;
  }
  $("truth-dare-choice").innerHTML = '<button class="choice-btn" data-choice="truth"><span>✦</span> Truth</button><button class="choice-btn dare" data-choice="dare"><span>⚡</span> Dare</button>';
  $("truth-dare-choice").querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>chooseType(b.dataset.choice)));
  const category = state.mode === "secret" ? "secret" : state.category;
  const type = state.mode === "secret" ? (Math.random()>.25?"truth":"dare") : state.choice;
  const bucket = prompts[category]?.[type] || prompts.funny.truth;
  $("game-title").innerHTML = state.mode === "secret" ? "The <em>Secret Deck</em>" : "Truth or <em>Dare?</em>";
  $("game-eyebrow").textContent = state.mode === "secret" ? "PULL FROM THE SECRET DECK" : "YOUR NEXT MOVE";
  setPrompt(randomItem(bucket),type);
  syncAction({lastPrompt:$("prompt-text").textContent,lastType:type,category,cardIndex:state.cardIndex});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function chooseType(type) {
  state.choice = type;
  $("truth-dare-choice").querySelectorAll("[data-choice]").forEach(b=>b.classList.toggle("selected",b.dataset.choice===type));
  const bucket = prompts[state.category]?.[type] || prompts.funny[type];
  state.cardIndex++;
  setPrompt(randomItem(bucket),type);
  syncAction({lastPrompt:$("prompt-text").textContent,lastType:type,category:state.category,cardIndex:state.cardIndex});
}
async function syncAction(fields) {
  if (!db || !state.roomCode) return;
  try {
    const roomRef = ref(db,`rooms/${state.roomCode}`);
    await update(roomRef,{...fields,updatedAt:serverTimestamp(),lastActionBy:state.playerId});
    // Rotate turn when another player exists.
    const snap = await get(roomRef);
    const room = snap.val();
    const ids = Object.keys(room?.players || {});
    if (ids.length > 1) {
      const next = ids.find(id => id !== state.playerId) || state.playerId;
      await update(roomRef,{currentTurn:next});
    }
  } catch(e) { console.error(e); toast("Could not sync. Check your Firebase setup."); }
}
function listenRoom() {
  if (state.unsubscribe) state.unsubscribe();
  if (!db || !state.roomCode) return;
  state.unsubscribe = onValue(ref(db,`rooms/${state.roomCode}`), snap=>{
    const room = snap.val();
    if (!room) { toast("This room no longer exists."); return; }
    state.roomData = room;
    updatePlayers(room);
    if (room.lastPrompt && room.lastActionBy !== state.playerId) {
      $("prompt-text").textContent = room.lastPrompt;
      if (room.lastType) $("card-type").textContent = room.lastType.toUpperCase();
      if (room.cardIndex) $("card-number").textContent = `CARD ${String(room.cardIndex).padStart(2,"0")}`;
    }
    if (Object.keys(room.players || {}).length >= 2) {
      $("room-status").textContent = "Player connected. You're ready to play!";
      toast("Player joined the room!");
    }
  });
}
async function createRoom() {
  state.nickname = $("nickname-input").value.trim() || "Player One";
  state.roomCode = makeCode(); state.isHost = true;
  if (db) {
    let tries=0;
    while(tries<5) {
      const r=ref(db,`rooms/${state.roomCode}`), snap=await get(r);
      if(!snap.exists()) { await set(r,{createdAt:serverTimestamp(),hostId:state.playerId,currentTurn:state.playerId,players:{[state.playerId]:{nickname:state.nickname,joinedAt:serverTimestamp()}},lastPrompt:"Your question is waiting.",cardIndex:0}); break; }
      state.roomCode=makeCode(); tries++;
    }
  }
  $("room-code-display").textContent=state.roomCode;
  $("room-code-wrap").classList.remove("hidden");
  $("room-main-btn").textContent="Enter the game ↗";
  $("room-status").textContent=db?"Waiting for another player…":"Demo room created. Configure Firebase to enable online play.";
  state.createMode=true;
}
async function joinRoom() {
  const code=$("join-code-input").value.trim().toUpperCase();
  if(code.length<4){toast("Enter a room code first.");return;}
  state.roomCode=code; state.isHost=false;
  if(!db){state.nickname=$("nickname-input").value.trim()||"Player Two"; $("nickname-input").value=state.nickname; showScreen("room-screen"); $("room-code-wrap").classList.remove("hidden"); $("room-code-display").textContent=code; $("room-status").textContent="Demo only — configure Firebase for online play."; $("room-main-btn").textContent="Enter the game ↗"; return;}
  try {
    const r=ref(db,`rooms/${code}`), snap=await get(r);
    if(!snap.exists()){toast("Room not found. Check the code.");return;}
    const room=snap.val();
    if(Object.keys(room.players||{}).length>=2 && !room.players[state.playerId]){toast("This room already has two players.");return;}
    state.nickname=$("nickname-input").value.trim()||"Player Two";
    await update(r,{[`players/${state.playerId}`]:{nickname:state.nickname,joinedAt:serverTimestamp()}});
    showScreen("game-screen"); $("game-room-code").textContent=code; listenRoom(); drawPrompt();
  } catch(e){console.error(e);toast("Could not join. Check Firebase rules and connection.");}
}
function enterGame() {
  state.nickname=$("nickname-input").value.trim()||state.nickname||"Player";
  showScreen("game-screen");
  $("game-room-code").textContent=state.roomCode||"DEMO";
  if(!db){$("turn-label").textContent="Demo mode — one device";$("turn-note").textContent="Connect Firebase to play online with another phone.";toast("Demo mode: online rooms need Firebase setup.");}
  else listenRoom();
  drawPrompt();
}
function setMode(mode) {
  state.mode=mode;
  if(mode==="truth"){state.category="funny";state.choice="truth";}
  if(mode==="secret")state.category="secret";
  if(mode==="would")state.category="funny";
  if(mode==="thisthat")state.category="cute";
  document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b.dataset.category===state.category));
  showScreen("game-screen");enterGame();
}
async function copyCode() {
  if(!state.roomCode)return;
  try{await navigator.clipboard.writeText(state.roomCode);toast("Room code copied!");}
  catch{toast("Your room code is "+state.roomCode);}
}
$("create-room-btn").addEventListener("click",()=>{state.createMode=true;$("room-code-wrap").classList.add("hidden");$("room-main-btn").textContent="Create room ↗";$("room-main-btn").onclick=createRoom;showScreen("room-screen");});
$("join-room-btn").addEventListener("click",joinRoom);
$("room-main-btn").addEventListener("click",()=>state.createMode?createRoom():enterGame());
$("copy-code-btn").addEventListener("click",copyCode);
$("copy-game-code").addEventListener("click",copyCode);
$("leave-game-btn").addEventListener("click",()=>{if(state.unsubscribe)state.unsubscribe();showScreen("home-screen");});
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",()=>showScreen("home-screen")));
document.querySelectorAll(".mode-card").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
document.querySelectorAll(".category").forEach(b=>b.addEventListener("click",()=>{state.category=b.dataset.category;document.querySelectorAll(".category").forEach(c=>c.classList.toggle("active",c===b));drawPrompt();}));
$("next-btn").addEventListener("click",drawPrompt);
$("skip-btn").addEventListener("click",()=>{toast("Skipped. No pressure.");drawPrompt();});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
if(!firebaseReady) console.info("ARYA is in local demo mode. Add Firebase web config to enable shared online rooms.");
