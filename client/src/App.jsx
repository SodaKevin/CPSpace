import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import MainLayout from "./pages/mainLayout";
import AuthGate from "./auth/AuthGate";
import "./App.css";

// Layouts
import SettingsLayout from "./pages/settings/settingsLayout";

// Settings pages
import Profile from "./pages/settings/profile";
import Preferences from "./pages/settings/preferences";
import About from "./pages/settings/about";
import Help from "./pages/settings/help";

// Assessments
import AssessmentIntro from "./pages/assessments/introduction";
import AssessmentSelect from "./pages/assessments/selection";
import PHQ9 from "./pages/assessments/phq9";
import GAD7 from "./pages/assessments/gad7";
import AssessmentReport from "./pages/assessments/report";
import AssessmentHistory from "./pages/assessments/history";

// Chatbot
import Chatbot from "./pages/chatbot/chatbot";

// Coping hub
import CopingHub from "./pages/hub/copingHub";
import StrategyDetail from "./pages/hub/strategyDetail";
import StrategyList from "./pages/hub/adminHub/strategyList";
import AddStrategy from "./pages/hub/adminHub/addStrategy";
import EditStrategy from "./pages/hub/adminHub/editStrategy";

// Diary
import DiaryPage from "./pages/diaries/diaryPage";
import CalendarPage from "./pages/diaries/CalendarPage";

// Social Space
import SocialSpace from "./pages/socialSpace/SocialSpace";

function App() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [appReady, setAppReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleResendEmail = async () => {
    if (!auth.currentUser || countdown > 0) return;

    try {
      await sendEmailVerification(auth.currentUser);

      const until = Date.now() + 60_000; // 60 seconds
      localStorage.setItem("verifyCooldownUntil", until.toString());

      setCountdown(60);
    } catch (err) {
      console.error(err);
    }
  };


  const handleRefresh = async () => {
    await auth.currentUser.reload();
    setUser({ ...auth.currentUser });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setAppReady(true);
        return;
      }

      await u.reload();
      setUser(u);

      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.data();

      // ✅ ADMIN CHECK
      setIsAdmin(Array.isArray(data?.roles) && data.roles.includes("admin"));

      // ✅ APPLY PREFERENCES
      const prefs = data?.preferences;
      if (prefs) {
        // Theme
        const theme = prefs.theme || "light";
        document.documentElement.setAttribute(
          "data-theme",
          prefs.themeMode || "light"
        );

        // ✅ STEP 2: persist theme for instant load
        localStorage.setItem("theme", theme);

        // Color palette
        const COLOR_MAP = {
          blue: ["#60a5fa", "#dbeafe"],
          green: ["#34d399", "#d1fae5"],
          yellow: ["#facc15", "#fef3c7"],
          orange: ["#fb923c", "#ffedd5"],
          pink: ["#f472b6", "#fce7f3"],
        };

        const palette = COLOR_MAP[prefs.colorPalette] || COLOR_MAP.blue;
        document.documentElement.style.setProperty("--accent", palette[0]);
        document.documentElement.style.setProperty("--accent-soft", palette[1]);
      }

      setLoading(false);
      setAppReady(true);
    });

    return unsub;
  }, [auth]);

  useEffect(() => {
    const storedUntil = localStorage.getItem("verifyCooldownUntil");

    if (storedUntil) {
      const remaining = Math.floor(
        (Number(storedUntil) - Date.now()) / 1000
      );
      if (remaining > 0) {
        setCountdown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          localStorage.removeItem("verifyCooldownUntil");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  if (loading || !appReady) return null;
  if (!user) return <AuthGate />;

  if (!user.emailVerified) {
    return (
      <div className="verifyWrapper">
        <div className="verifyCard">
          <h2>Please verify your email</h2>
          <p>
            A verification email has been sent to <b>{user.email}</b>.
          </p>

          <div className="verifyActions">
            <button
              className={`primary-btn ${
                countdown > 0 ? "disabled-btn" : ""
              }`}
              onClick={handleResendEmail}
              disabled={countdown > 0}
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend Email"}
            </button>

            <button className="verified-btn" onClick={handleRefresh}>
              I've Verified
            </button>

            <button
              className="secondary-btn"
              onClick={() => signOut(auth)}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT REDIRECT */}
        <Route path="/" element={<Navigate to="/settings" replace />} />

        {/* MAIN APP */}
        <Route element={<MainLayout />}>

          {/* DIARY */}
          <Route path="diary" element={<DiaryPage />} />
          {/* CALENDAR */}
          <Route path="calendar" element={<CalendarPage />} />

          {/* SOCIAL SPACE */}
          <Route path="social-space" element={<SocialSpace />} />

          {/* CHATBOT */}
          <Route path="chatbot" element={<Chatbot />} />

          {/* COPING HUB */}
          <Route path="coping-hub" element={<CopingHub />} />
          <Route path="coping-hub/:id" element={<StrategyDetail />} />
          <Route
            path="/admin/strategies/new"
            element={isAdmin ? <AddStrategy /> : <Navigate to="/coping-hub" />}
          />
          <Route
            path="/admin/strategies/edit/:id"
            element={isAdmin ? <EditStrategy /> : <Navigate to="/coping-hub" />}
          />
          <Route
            path="/admin/strategies"
            element={isAdmin ? <StrategyList /> : <Navigate to="/coping-hub" />}
          />

          {/* ASSESSMENTS */}
          <Route path="assessments" element={<AssessmentIntro />} />
          <Route path="assessments/selection" element={<AssessmentSelect />} />
          <Route path="assessments/phq-9" element={<PHQ9 />} />
          <Route path="assessments/gad-7" element={<GAD7 />} />
          <Route path="assessments/report" element={<AssessmentReport />} />
          <Route path="assessments/history" element={<AssessmentHistory />} />

          {/* SETTINGS */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="about" element={<About />} />
            <Route path="help" element={<Help />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
