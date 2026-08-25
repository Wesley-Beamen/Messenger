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
  serverTimestamp
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

// Initialize Firebase
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

// Sidebar buttons
const profileBtn = document.getElementById("profile-btn");
const addFriendBtn = document.getElementById("add-friend-btn");
const settingsBtn = document.getElementById("settings-btn");

// Settings controls
const textSizeSlider = document.getElementById("text-size-slider");
const themeRadios = document.querySelectorAll("input[name='theme-mode']");

// Switch screens (login <-> signup)
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

    // Load profile data
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      document.getElementById("profile-username").innerText =
        "Username: " + snap.data().username;

      document.getElementById("profile-email").innerText =
        "Email: " + snap.data().email;
    }

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
      createdAt: serverTimestamp(),
      friends: [],
      description: "",
      lastOnline: serverTimestamp()
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

  profileBtn.classList.remove("active");
  addFriendBtn.classList.remove("active");
  settingsBtn.classList.remove("active");
}

// Sidebar button logic
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

// TEXT SIZE SLIDER
textSizeSlider.oninput = (e) => {
  const size = e.target.value + "px";
  document.body.style.fontSize = size;
};

// THEME MODE RADIO BUTTONS
themeRadios.forEach(radio => {
  radio.onchange = (e) => {
    const mode = e.target.value;

    if (mode === "light") {
      document.body.style.background = "var(--bg-color-light)";
      document.body.style.color = "var(--text-color-light)";
      document.querySelector(".sidebar").style.background = "var(--sidebar-color-light)";

      document.querySelectorAll(".panel").forEach(p => {
        p.style.background = "var(--panel-color-light)";
        p.style.color = "var(--text-color-light)";
      });
    }

    if (mode === "dark") {
      document.body.style.background = "var(--bg-color-dark)";
      document.body.style.color = "var(--text-color-dark)";
      document.querySelector(".sidebar").style.background = "var(--sidebar-color-dark)";

      document.querySelectorAll(".panel").forEach(p => {
        p.style.background = "var(--panel-color-dark)";
        p.style.color = "var(--text-color-dark)";
      });
    }
  };
});
