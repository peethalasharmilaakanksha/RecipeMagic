// static/js/script.js
import { auth, db } from "./firebase.js"; // Import auth and db from your firebase.js

// Auth state listener
auth.onAuthStateChanged((user) => {
  // Changed from firebase.auth().onAuthStateChanged
  const authDiv = document.getElementById("auth-buttons");
  if (user) {
    authDiv.innerHTML = `
      <span class="text-light me-2">Hi, ${user.email || "User"}!</span>
      <button class="btn btn-outline-light btn-sm" onclick="logout()">Logout</button>
    `;
  } else {
    authDiv.innerHTML = `
      <button class="btn btn-outline-light btn-sm me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
        Login
      </button>
      <button class="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#signupModal">
        Sign Up
      </button>
    `;
  }
});

// Handle Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await auth.signInWithEmailAndPassword(email, password); // Changed from firebase.auth().signInWithEmailAndPassword
    bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
  } catch (error) {
    alert(`Login failed: ${error.message}`);
  }
});

// Handle Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const dietaryPrefs = Array.from(
    document.getElementById("dietaryPrefs").selectedOptions
  ).map((opt) => opt.value);

  try {
    const { user } = await auth.createUserWithEmailAndPassword(email, password); // Changed from firebase.auth().createUserWithEmailAndPassword

    // Save user data to Firestore
    await db.collection("users").doc(user.uid).set({
      // Changed from firebase.firestore().collection
      email: user.email,
      dietaryPrefs: dietaryPrefs,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), // NOTE: firebase.firestore.FieldValue is from compat SDK. If this throws error, need modular equivalent.
    });

    bootstrap.Modal.getInstance(document.getElementById("signupModal")).hide();
  } catch (error) {
    alert(`Signup failed: ${error.message}`);
  }
});

// Google Login
async function loginWithGoogle() {
  const provider = new auth.GoogleAuthProvider(); // Changed from firebase.auth.GoogleAuthProvider
  try {
    const result = await auth.signInWithPopup(provider); // Changed from firebase.auth().signInWithPopup
    // Create user document if new user
    if (result.additionalUserInfo.isNewUser) {
      await db.collection("users").doc(result.user.uid).set({
        // Changed from firebase.firestore().collection
        email: result.user.email,
        dietaryPrefs: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // NOTE: Same as above
      });
    }
    bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
  } catch (error) {
    alert(`Google login failed: ${error.message}`);
  }
}

// Logout
function logout() {
  auth.signOut(); // Changed from firebase.auth().signOut
}

// Generate Recipe (remains unchanged as it doesn't use Firebase directly)
async function generateTutorial() {
  const components = document.querySelector("#components").value;
  const output = document.querySelector("#output");
  output.textContent = "Cooking a recipe for you...";

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `components=${encodeURIComponent(components)}`,
    });
    const newOutput = await response.text();
    output.textContent = newOutput;
  } catch (error) {
    output.textContent = "Failed to generate recipe. Please try again.";
  }
}

// Copy to clipboard (remains unchanged)
function copyToClipboard() {
  const output = document.querySelector("#output");
  navigator.clipboard
    .writeText(output.textContent)
    .then(() => alert("Copied to clipboard!"))
    .catch(() => alert("Failed to copy"));
}
