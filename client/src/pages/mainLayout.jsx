import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./mainLayout.css";

const COLOR_MAP = {
  blue: { accent: "#60a5fa", soft: "#dbeafe" },
  green: { accent: "#34d399", soft: "#d1fae5" },
  yellow: { accent: "#facc15", soft: "#fef3c7" },
  orange: { accent: "#fb923c", soft: "#ffedd5" },
  pink: { accent: "#f472b6", soft: "#fce7f3" },
};

export default function MainLayout() {
  const auth = getAuth();

  const [userData, setUserData] = useState(null);
  const [ready, setReady] = useState(false);
  const isAdmin = userData?.roles?.includes("admin");
  
  useEffect(() => {
    let unsubUser = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUserData(null);
        setReady(true);
        return;
      }

      const userRef = doc(db, "users", user.uid);

      // 🔥 REALTIME LISTENER (single source of truth)
      unsubUser = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();
        console.log("🔥 Sidebar user update:", data);

        setUserData(data);

        // Apply theme immediately
        const p = data.preferences;
        if (p) {
          document.documentElement.setAttribute(
            "data-theme",
            p.themeMode || "light"
          );

          if (p.colorPalette && COLOR_MAP[p.colorPalette]) {
            document.documentElement.style.setProperty(
              "--accent",
              COLOR_MAP[p.colorPalette].accent
            );
            document.documentElement.style.setProperty(
              "--accent-soft",
              COLOR_MAP[p.colorPalette].soft
            );
          }
        }

        setReady(true);
      });
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, [auth]);

  if (!ready) return null;

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar main-sidebar">
        <div className="logo">CPSPACE</div>

        <nav>
          <NavLink to="/diary" className="main-link">Diary</NavLink>
          <NavLink to="/social-space" className="main-link">Social Space</NavLink>
          <NavLink to="/chats" className="main-link">Chats</NavLink>
          <NavLink to="/chatbot" className="main-link">Chatbot</NavLink>
          <NavLink to="/coping-hub" className="main-link">Coping Hub</NavLink>
          <NavLink to="/assessments" className="main-link">Assessments</NavLink>
          <NavLink to="/settings" className="main-link">Settings</NavLink>

          {isAdmin && (
            <NavLink to="/admin/strategies" className="main-link">
              Manage Strategies
            </NavLink>
          )}
        </nav>

        <button
          onClick={() => signOut(auth)}
          style={{
            marginTop: "155px",
            padding: "0.75rem",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Log out
        </button>

        {/* USER INFO */}
        {userData && (
          <div className="sidebar-user">
            <img
              src={userData.profileImageUrl || "/avatar.jpg"}
              alt="User"
              referrerPolicy="no-referrer"
            />
            <span>
              {userData.profileDisplayName ||
                `${userData.username?.value}#${userData.username?.discriminator}`}
            </span>
          </div>
        )}
      </aside>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}