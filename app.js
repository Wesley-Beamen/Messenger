// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDDE4oFkx1NCOspiYjvssG0zpUjoM79WCY",
  authDomain: "weasel-messenger.firebaseapp.com",
  projectId: "weasel-messenger",
  storageBucket: "weasel-messenger.appspot.com",
  messagingSenderId: "5201389357",
  appId: "1:5201389357:web:0aa5ec26d209979f5815a4",
  measurementId: "G-W1CD52FVK0"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// UI elements
const loginBox = document.getElementById("login-box");
const signupBox = document.getElementById("signup-box");
const appScreen = document.getElementById("app-screen");

// Panels
const profilePanel = document.getElementById("profile-panel");
const addFriendPanel = document.getElementById("add-friend-panel");
const settingsPanel = document.getElementById("settings-panel");
const messagesPanel = document.getElementById("messages-panel");
const newChatPanel = document.getElementById("new-chat-panel");
const dmPanel = document.getElementById("dm-panel");

// Sidebar buttons
const profileBtn = document.getElementById("profile-btn");
const addFriendBtn = document.getElementById("add-friend-btn");
const messagesBtn = document.getElementById("messages-btn");
const settingsBtn = document.getElementById("settings-btn");

// Settings controls
const textSizeSlider = document.getElementById("text-size-slider");
const themeRadios = document.querySelectorAll("input[name='theme-mode']");

// DM chat globals
let currentChatId = null;
let unsubscribeDM = null;


// Switch login/signup
document.getElementById("show-signup").onclick = () => {
  loginBox.classList.add("hidden");
  signupBox.classList.remove("hidden");
};

document.getElementById("show-login").onclick = () => {
  signupBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
};


// AUTO LOGIN
onAuthStateChanged(auth, async user => {
  if (user) {
    loginBox.classList.add("hidden");
    signupBox.classList.add("hidden");
    appScreen.classList.remove("hidden");

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      document.getElementById("profile-username").innerText =
        "Username: " + snap.data().username;
      document.getElementById("profile-email").innerText =
        "Email: " + snap.data().email;
    }

    loadConversationList();
  } else {
    appScreen.classList.add("hidden");
    loginBox.classList.remove("hidden");
  }
});


// SIGNUP
document.getElementById("signup-btn").onclick = async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const username = document.getElementById("signup-username").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      username,
      email,
      friends: [],
      createdAt: serverTimestamp()
    });

    alert("Account created!");
  } catch (error) {
    alert(error.message);
  }
};


// LOGIN
document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};


// LOGOUT
document.getElementById("logout-btn").onclick = () => {
  signOut(auth);
};


// Hide all panels
function hidePanels() {
  profilePanel.classList.add("hidden");
  addFriendPanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");
  messagesPanel.classList.add("hidden");
  newChatPanel.classList.add("hidden");
  dmPanel.classList.add("hidden");

  profileBtn.classList.remove("active");
  addFriendBtn.classList.remove("active");
  settingsBtn.classList.remove("active");
  messagesBtn.classList.remove("active");
}


// Sidebar buttons
profileBtn.onclick = () => {
  hidePanels();
  profilePanel.classList.remove("hidden");
  profileBtn.classList.add("active");
};

addFriendBtn.onclick = () => {
  hidePanels();
  addFriendPanel.classList.remove("hidden");
  addFriendBtn.classList.add("active");
};

settingsBtn.onclick = () => {
  hidePanels();
  settingsPanel.classList.remove("hidden");
  settingsBtn.classList.add("active");
};

messagesBtn.onclick = () => {
  hidePanels();
  messagesPanel.classList.remove("hidden");
  messagesBtn.classList.add("active");
  loadConversationList();
};


// TEXT SIZE
textSizeSlider.oninput = (e) => {
  document.body.style.fontSize = e.target.value + "px";
};


// THEME MODE
themeRadios.forEach(radio => {
  radio.onchange = (e) => {
    const mode = e.target.value;

    const body = document.body;
    const sidebar = document.querySelector(".sidebar");
    const panels = document.querySelectorAll(".panel");

    if (mode === "light") {
      body.style.background = "var(--bg-color-light)";
      body.style.color = "var(--text-color-light)";
      sidebar.style.background = "var(--sidebar-color-light)";
      panels.forEach(p => {
        p.style.background = "var(--panel-color-light)";
        p.style.color = "var(--text-color-light)";
      });
    }

    if (mode === "dark") {
      body.style.background = "var(--bg-color-dark)";
      body.style.color = "var(--text-color-dark)";
      sidebar.style.background = "var(--sidebar-color-dark)";
      panels.forEach(p => {
        p.style.background = "var(--panel-color-dark)";
        p.style.color = "var(--text-color-dark)";
      });
    }
  };
});


// LOAD CONVERSATION LIST
async function loadConversationList() {
  const user = auth.currentUser;
  if (!user) return;

  const list = document.getElementById("conversation-list");
  list.innerHTML = "Loading...";

  const chatsRef = collection(db, "dmChats");
  const q = query(chatsRef);

  const snap = await getDocs(q);

  list.innerHTML = "";

  snap.forEach(chatDoc => {
    const chatId = chatDoc.id;
    if (!chatId.includes(user.uid)) return;

    const otherUid = chatId.replace(user.uid, "").replace("_", "");

    loadConversationEntry(otherUid, chatId);
  });
}


// LOAD EACH CONVERSATION ENTRY
async function loadConversationEntry(otherUid, chatId) {
  const list = document.getElementById("conversation-list");

  const userSnap = await getDoc(doc(db, "users", otherUid));
  if (!userSnap.exists()) return;

  const username = userSnap.data().username;

  const div = document.createElement("div");
  div.className = "conversation-entry";
  div.innerText = username;

  div.onclick = () => {
    openDMChat(otherUid, username);
  };

  list.appendChild(div);
}


// NEW CHAT BUTTON
document.getElementById("new-chat-btn").onclick = () => {
  hidePanels();
  newChatPanel.classList.remove("hidden");
  loadNewChatFriends();
};


// LOAD FRIEND LIST INTO NEW CHAT PANEL
async function loadNewChatFriends() {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  const friends = snap.data().friends || [];

  const container = document.getElementById("new-chat-friends");
  container.innerHTML = "";

  for (let uid of friends) {
    const friendSnap = await getDoc(doc(db, "users", uid));
    if (!friendSnap.exists()) continue;

    const div = document.createElement("div");
    div.className = "conversation-entry";
    div.innerText = friendSnap.data().username;

    div.onclick = () => {
      openDMChat(uid, friendSnap.data().username);
    };

    container.appendChild(div);
  }
}


// START CHAT BY USERNAME
document.getElementById("new-chat-start").onclick = async () => {
  const username = document.getElementById("new-chat-search").value.trim();
  if (!username) return;

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const snap = await getDocs(q);

  if (snap.empty) {
    alert("User not found");
    return;
  }

  const otherUid = snap.docs[0].id;
  openDMChat(otherUid, username);
};


// OPEN DM CHAT
async function openDMChat(otherUid, otherUsername) {
  const user = auth.currentUser;
  if (!user) return;

  const chatId = [user.uid, otherUid].sort().join("_");
  currentChatId = chatId;

  hidePanels();
  dmPanel.classList.remove("hidden");
  document.getElementById("dm-title").innerText = "Chat with " + otherUsername;

  if (unsubscribeDM) unsubscribeDM();

  const messagesRef = collection(db, "dmChats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp"));

  unsubscribeDM = onSnapshot(q, (snap) => {
    const area = document.getElementById("dm-messages");
    area.innerHTML = "";

    snap.forEach(doc => {
      const msg = doc.data();
      const bubble = document.createElement("div");

      bubble.className = msg.sender === user.uid ? "message-blue" : "message-gray";
      bubble.innerText = msg.text;

      area.appendChild(bubble);
    });

    area.scrollTop = area.scrollHeight;
  });
}


// SEND MESSAGE
document.getElementById("dm-send").onclick = async () => {
  const input = document.getElementById("dm-input");
  const text = input.value.trim();
  const user = auth.currentUser;

  if (!text || !user || !currentChatId) return;

  const msgRef = doc(collection(db, "dmChats", currentChatId, "messages"));

  await setDoc(msgRef, {
    text,
    sender: user.uid,
    timestamp: serverTimestamp()
  });

  input.value = "";

  const area = document.getElementById("dm-messages");
  area.scrollTop = area.scrollHeight;
};


// ENTER TO SEND
document.getElementById("dm-input").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("dm-send").click();
  }
});
