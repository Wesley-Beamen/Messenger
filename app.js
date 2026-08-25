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

// Switch screens
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

    // Load profile
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      document.getElementById("profile-username").innerText = "Username: " + snap.data().username;
      document.getElementById("profile-email").innerText = "Email: " + snap.data().email;
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

// Sidebar buttons
document.getElementById("profile-btn").onclick = () => {
  hidePanels();
  profilePanel.classList.remove("hidden");
};

document.getElementById("add-friend-btn").onclick = () => {
  hidePanels();
  addFriendPanel.classList.remove("hidden");
};

document.getElementById("settings-btn").onclick = () => {
  hidePanels();
  settingsPanel.classList.remove("hidden");
};

function hidePanels() {
  profilePanel.classList.add("hidden");
  addFriendPanel.classList.add("hidden");
  settingsPanel.classList.add("hidden");
}

// Settings
document.getElementById("theme-select").onchange = (e) => {
  const theme = e.target.value;

  document.body.classList.remove("light-theme", "blue-theme");

  if (theme === "light") document.body.classList.add("light-theme");
  if (theme === "blue") document.body.classList.add("blue-theme");
};

document.getElementById("text-size-select").onchange = (e) => {
  const size = e.target.value;

  document.body.classList.remove("text-large", "text-xlarge");

  if (size === "large") document.body.classList.add("text-large");
  if (size === "xlarge") document.body.classList.add("text-xlarge");
};
