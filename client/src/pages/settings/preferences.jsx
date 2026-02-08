import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./preferences.css";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";

const COLOR_MAP = {
  blue: { accent: "#60a5fa", soft: "#dbeafe" },
  green: { accent: "#34d399", soft: "#d1fae5" },
  yellow: { accent: "#facc15", soft: "#fef3c7" },
  orange: { accent: "#fb923c", soft: "#ffedd5" },
  pink: { accent: "#f472b6", soft: "#fce7f3" },
};

const DEFAULT_PREFS = {
  chatbotTone: "casual",
  themeMode: "light",
  colorPalette: "blue",
  autoPersonalisation: false,
};

const AUTO_PERSONALISE_API = "http://localhost:5001/auto-personalize";

async function fetchRecentDiaries(userId) {
  const q = query(
    collection(db, "users", userId, "diaries"),
    where("type", "==", "emotion"),
    orderBy("createdAt", "desc"),
    limit(14)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export default function Preferences() {
  const [prefs, setPrefs] = useState(null);
  const auth = getAuth();
  const [showAutoConfirm, setShowAutoConfirm] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  /* === APPLY UI EFFECTS (your old logic) === */
  const applyTheme = (mode) => {
    document.documentElement.setAttribute("data-theme", mode);
  };

  const applyColor = (color) => {
    const palette = COLOR_MAP[color];
    if (!palette) return;
    document.documentElement.style.setProperty("--accent", palette.accent);
    document.documentElement.style.setProperty("--accent-soft", palette.soft);
  };

  /* === LOAD === */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      const data = snap.exists() ? snap.data().preferences : {};
      const merged = { ...DEFAULT_PREFS, ...data };

      setPrefs(merged);
      applyTheme(merged.themeMode);
      applyColor(merged.colorPalette);

      localStorage.setItem("theme", merged.themeMode);
    });

    return unsub;
  }, [auth]);

  /* === SAVE (friend structure, fixed) === */
  const savePrefs = async (updates) => {
    const user = auth.currentUser;
    if (!user) return;

    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);

    await setDoc(
      doc(db, "users", user.uid),
      { preferences: newPrefs },
      { merge: true }
    );
  };

  async function applyAutoPersonalisation(cluster) {
    let newPrefs = {
      autoPersonalisation: true, // ✅ KEEP IT ON
    };

    switch (cluster) {
      case 0:
        Object.assign(newPrefs, {
          themeMode: "dark",
          colorPalette: "blue",
          chatbotTone: "friendly",
        });
        break;

      case 1:
        Object.assign(newPrefs, {
          themeMode: "light",
          colorPalette: "green",
          chatbotTone: "casual",
        });
        break;

      case 2:
        Object.assign(newPrefs, {
          themeMode: "light",
          colorPalette: "yellow",
          chatbotTone: "professional",
        });
        break;

      default:
        return;
    }

    applyTheme(newPrefs.themeMode);
    applyColor(newPrefs.colorPalette);
    await savePrefs(newPrefs);
  }

  if (!prefs) return <p>Loading preferences...</p>;

  return (
    <div className="personalization-panel">
      <h2>Preferences</h2>

      {/* Chatbot Tone */}
      <div className="setting-row">
        <label>Chatbot Tone</label>
        <select
          value={prefs.chatbotTone}
          onChange={(e) =>
            savePrefs({ chatbotTone: e.target.value })
          }
        >
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
        </select>
      </div>

      {/* Theme */}
      <div className="setting-row">
        <label>Theme</label>
        <div className="theme-toggle">
          <div
            className={`theme-circle ${prefs.themeMode === "light" ? "active" : ""}`}
            onClick={() => {
              applyTheme("light");
              localStorage.setItem("theme", "light");
              savePrefs({ themeMode: "light" });
            }}
          />
          <div
            className={`theme-circle dark ${prefs.themeMode === "dark" ? "active" : ""}`}
            onClick={() => {
              applyTheme("dark");
              localStorage.setItem("theme", "dark");
              savePrefs({ themeMode: "dark" });
            }}
          />
        </div>
      </div>

      {/* Color Palette */}
      <div className="setting-row">
        <label>Color Palette</label>
        <div className="color-palette">
          {Object.keys(COLOR_MAP).map((color) => (
            <div
              key={color}
              className={`color-circle ${color} ${
                prefs.colorPalette === color ? "selected" : ""
              }`}
              onClick={() => {
                applyColor(color);
                savePrefs({ colorPalette: color });
              }}
            />
          ))}
        </div>
      </div>

      {/* Auto Personalisation */}
      <div className="setting-row">
        <label>Auto Personalisation</label>
        <div className="yes-no">
          <button
            className={prefs.autoPersonalisation ? "active" : ""}
            onClick={() => {
              if (prefs.autoPersonalisation || showAutoConfirm) return;
              setShowAutoConfirm(true);
            }}
          >
            YES
          </button>
          <button
            className={!prefs.autoPersonalisation ? "active" : ""}
            onClick={() => savePrefs({ autoPersonalisation: false })}
          >
            NO
          </button>
        </div> 
      </div>
      {showAutoConfirm && (
      <div className="pref-modal-overlay">
        <div className="pref-modal-dialog">
          <h3>Enable Auto Personalisation?</h3>

          <p>
            Auto Personalisation will analyse your recent emotional patterns
            and automatically adjust theme, colors, and chatbot tone.
          </p>

          <div className="pref-modal-actions">
            <button
              className="pref-confirm"
              onClick={async () => {
                const user = auth.currentUser;
                if (!user) return;

                setAutoLoading(true);

                await savePrefs({ autoPersonalisation: true });

                const diaries = await fetchRecentDiaries(user.uid);
                console.log("Auto-personalisation diaries:", diaries);

                if (!diaries.length) {
                  alert("Please record at least one emotion diary before using Auto Personalisation.");
                  await savePrefs({ autoPersonalisation: false });
                  setAutoLoading(false);
                  setShowAutoConfirm(false);
                  return;
                }

                const res = await fetch(AUTO_PERSONALISE_API, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ diaries })
                });

                if (!res.ok) {
                  alert("Auto personalisation service is unavailable.");
                  await savePrefs({ autoPersonalisation: false });
                  setAutoLoading(false);
                  setShowAutoConfirm(false);
                  return;
                }

                const result = await res.json();
                await applyAutoPersonalisation(result.cluster);

                setAutoLoading(false);
                setShowAutoConfirm(false);
              }}
            >
              Confirm
            </button>

            <button
              className="pref-cancel"
              onClick={async () => {
                setShowAutoConfirm(false);
                await savePrefs({ autoPersonalisation: false });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
