import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { bootstrapUser } from "../services/userBootstrap";

const provider = new GoogleAuthProvider();

export default function AuthGate({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login | signup
  const [error, setError] = useState("");

  async function handlePasswordReset() {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      let cred;

      if (mode === "signup") {
        cred = await createUserWithEmailAndPassword(auth, email, password);

        // 🔐 Create user document (idempotent)
        await bootstrapUser(cred.user.uid);

        // 📧 Send verification email ONCE
        await sendEmailVerification(cred.user);
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);

        // 🔐 Ensure user exists (safe even if already created)
        await bootstrapUser(cred.user.uid);
      }

      onAuth(cred.user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogleSignIn() {
    setError("");

    try {
      const cred = await signInWithPopup(auth, provider);

      // 🔐 Create user document if missing
      await bootstrapUser(cred.user.uid);

      onAuth(cred.user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2>{mode === "login" ? "Log In" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit">
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <div style={styles.footer}>
          {mode === "login" && (
            <button
              type="button"
              onClick={handlePasswordReset}
              style={styles.linkBtn}
            >
              Forgot password?
            </button>
          )}

          <p>
            {mode === "login" ? "No account?" : "Already have an account?"}{" "}
            <button
              onClick={() =>
                setMode(mode === "login" ? "signup" : "login")
              }
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={styles.googleBtn}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}

const styles = {
    wrapper: {
        display: "flex",
        justifyContent: "center", // Horizontal centering
        alignItems: "center",     // Vertical centering
        height: "100vh",          // Full screen height
        width: "100vw",           // Full screen width
    },
    container: {
        width: 280,
        minHeight: 320,
        padding: "2rem",
        border: "1px solid #ddd",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", // Optional: makes it pop
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    footer: {
        minHeight: 40,   // prevents jumping
        textAlign: "center",
        fontSize: "0.9rem",
    },
    error: {
        color: "red",
        fontSize: "0.9rem",
    },
    switch: {
        marginTop: "1rem",
        fontSize: "0.9rem",
    },
    googleBtn: {
        marginTop: "1rem",
        background: "#fff",
        color: "#000",
        border: "1px solid #ccc",
    },
    linkBtn: {
        background: "none",
        border: "none",
        color: "#aaa",
        fontSize: "0.85rem",
        cursor: "pointer",
        marginTop: "0.5rem",
    },
};
