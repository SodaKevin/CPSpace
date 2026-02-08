import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./chatbot.css";
import { getTodaysEmotion } from "../../services/diaryService";
import { recommendCopingStrategies } from "../../services/copingStrategyService";

export default function Chatbot() {
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 🔹 Feedback state (ADDED ONLY)
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const menuRef = useRef(null);
  const sendingRef = useRef(false);

  const [chatRiskLevel, setChatRiskLevel] = useState("LOW");
  const [strategyCache, setStrategyCache] = useState({});

  const [chatbotTone, setChatbotTone] = useState("casual");

  const generateGreeting = async () => {
    const diary = await getTodaysEmotion(user.uid);

    if (!diary) {
      return `Hey ${displayName}! How are you feeling today?`;
    }

    if (diary.category === "pleasant" || diary.category === "neutral") {
      return `Hey ${displayName}! Hope your day is going okay.`;
    }

    const feeling = diary.feelings?.[0]?.toLowerCase() || "a bit off";

    return `Hey ${displayName}, I noticed you’re feeling ${feeling} today. Do you want to talk about what happened?`;
  };

  /* =====================
     AUTH + LOAD SESSIONS
  ====================== */
  useEffect(() => {
    let unsubSessions = null;
    let unsubPrefs = null; // ✅ lifted to outer scope

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);

      const ref = collection(
        db,
        "users",
        currentUser.uid,
        "chatbotSessions"
      );

      const userRef = doc(db, "users", currentUser.uid);

      unsubPrefs = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          const allowedTones = ["casual", "friendly", "professional"];

          const toneFromDB = data.preferences?.chatbotTone;

          setChatbotTone(
            allowedTones.includes(toneFromDB) ? toneFromDB : "casual"
          );

          setDisplayName(data.profileDisplayName || "there");
        }
      });

      unsubSessions = onSnapshot(ref, (snap) => {
        const loaded = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "New Chat",
            messages: Array.isArray(data.messages) ? data.messages : [],
            createdAt: data.createdAt,
          };
        });

        if (!sendingRef.current) {
          setSessions(loaded);
        }

        // 🔒 keep current session if it exists
        setActiveSessionId((prev) => {
          if (prev && loaded.some((s) => s.id === prev)) {
            return prev;
          }
          return loaded[0]?.id || null;
        });
      });
    });

    return () => {
      if (unsubSessions) unsubSessions();
      if (unsubPrefs) unsubPrefs(); // ✅ now safe
      unsubAuth();
    };
  }, [auth]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    async function hydrateStrategies() {
      const ids = new Set();

      sessions.forEach(s =>
        s.messages.forEach(m => {
          if (m.strategyId) ids.add(m.strategyId);
        })
      );

      const missing = [...ids].filter(id => !strategyCache[id]);
      if (missing.length === 0) return;

      const fetched = {};
      for (const id of missing) {
        const snap = await getDoc(doc(db, "copingStrategies", id));
        if (snap.exists()) fetched[id] = snap.data();
      }

      setStrategyCache(prev => ({ ...prev, ...fetched }));
    }

    hydrateStrategies();
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  /* =====================
     BACKEND CALLS (UNCHANGED)
  ====================== */
  const getAIReply = async (message, history) => {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.map((m) => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.text,
        })),
        tone: chatbotTone,
      }),
    });

    const data = await res.json();
    return data;
  };

  const generateAITitle = async (message) => {
    const res = await fetch("http://localhost:5000/api/chat-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data.title;
  };

  /* =====================
     SEND MESSAGE (UNCHANGED)
  ====================== */
  const sendMessage = async () => {
    if (!input.trim() || !user || !activeSessionId) return;

    sendingRef.current = true; // 🔒 LOCK snapshots

    const userText = input;
    setInput("");

    const session = sessions.find((s) => s.id === activeSessionId);
    if (!session) {
      sendingRef.current = false;
      return;
    }

    const userMessage = {
      role: "user",
      text: userText,
      timestamp: Date.now(),
    };

    const messagesAfterUser = [...session.messages, userMessage];

    // Add typing indicator
    const messagesWithTyping = [
      ...messagesAfterUser,
      {
        role: "bot",
        text: "...",
        timestamp: Date.now(),
        typing: true,
      },
    ];

    // Optimistic UI update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id
          ? { ...s, messages: messagesWithTyping }
          : s
      )
    );

    // AI-generated title (ONLY once)
    if (session.messages.length === 1) {
      generateAITitle(userText)
        .then(async (title) => {
          await updateDoc(
            doc(db, "users", user.uid, "chatbotSessions", session.id),
            { title }
          );

          setSessions((prev) =>
            prev.map((s) =>
              s.id === session.id ? { ...s, title } : s
            )
          );
        })
        .catch(console.error);
    }

    try {
      const aiResponse = await getAIReply(userText, messagesAfterUser);
      const risk = aiResponse.riskLevel || "LOW";
      setChatRiskLevel(risk);

      const aiReply = aiResponse.reply;

      let suggestedStrategy = null;
      let diary = null;

      try {
        diary = await getTodaysEmotion(user.uid);

        if (risk === "HIGH" || risk === "CRITICAL") {
          suggestedStrategy = null;
        } else {
          if (diary?.feelings?.length) {
            const strategies = await recommendCopingStrategies(diary.feelings);
            suggestedStrategy =
              strategies[Math.floor(Math.random() * strategies.length)] || null;
          }

          if (risk === "LOW" && diary?.category === "neutral") {
            suggestedStrategy = null;
          }
        }

        if (risk === "LOW" && diary?.category === "neutral") {
          suggestedStrategy = null;
        }
      } catch (err) {
        console.error("Strategy recommendation failed:", err);
      }

      const finalMessages = [
        ...messagesAfterUser,
        {
          role: "bot",
          text: aiReply,
          timestamp: Date.now(),
          riskLevel: risk,
          strategyId: suggestedStrategy?.id || null
        }
      ];

      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, messages: finalMessages } : s
        )
      );

      await updateDoc(
        doc(db, "users", user.uid, "chatbotSessions", session.id),
        { messages: finalMessages }
      );
    } catch (err) {
      console.error("AI reply failed", err);
    } finally {
      sendingRef.current = false; // 🔓 UNLOCK snapshots
    }
  };

  /* =====================
     NEW CHAT (UNCHANGED)
  ====================== */
  const startNewChat = async () => {
    if (!user) return;

    const greeting = await generateGreeting(); // ✅ REQUIRED

    const ref = collection(db, "users", user.uid, "chatbotSessions");

    const docRef = await addDoc(ref, {
      title: "New Chat",
      createdAt: serverTimestamp(),
      messages: [
        {
          role: "bot",
          text: greeting,
          timestamp: Date.now(),
        },
      ],
    });

    setActiveSessionId(docRef.id);
  };

  /* =====================
     DELETE CHAT (UNCHANGED)
  ====================== */
  const deleteChat = async (sessionId) => {
    if (!user) return;

    await deleteDoc(
      doc(db, "users", user.uid, "chatbotSessions", sessionId)
    );

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setActiveSessionId(remaining[0]?.id || null);
    }
  };

  const handleResetChat = async () => {
    if (!user || !activeSessionId) return;

    const greeting = await generateGreeting(); // ✅ REQUIRED

    const resetMessages = [
      {
        role: "bot",
        text: greeting,
        timestamp: Date.now(),
      },
    ];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: resetMessages }
          : s
      )
    );

    await updateDoc(
      doc(db, "users", user.uid, "chatbotSessions", activeSessionId),
      { messages: resetMessages }
    );

    setMenuOpen(false);
  };

  /* =====================
     SUBMIT FEEDBACK (NEW, ISOLATED)
  ====================== */
  const submitFeedback = async () => {
    if (!user || !activeSessionId || feedbackRating === 0) return;

    setSubmittingFeedback(true);

    try {
      await addDoc(collection(db, "chatbotFeedback"), {
        userId: user.uid,
        sessionId: activeSessionId,
        rating: feedbackRating,
        description: feedbackText.trim(),
        createdAt: serverTimestamp(),
      });

      setFeedbackRating(0);
      setFeedbackText("");
      setShowFeedback(false);
      setMenuOpen(false);
    } catch (err) {
      console.error("Feedback submit failed:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  /* =====================
     UI
  ====================== */
  return (
    <div className="chatbot-page">
      <div className="chat-area">
        <div className="chat-header">
          <h2>{activeSession?.title || "Chatbot"}</h2>

          {/* Feedback menu (ADDED ONLY) */}
          <div className="chat-menu-wrapper" ref={menuRef}>
            <button
              className="chat-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="chat-menu">
                <button onClick={() => setShowFeedback(true)}>
                  Submit Feedback
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(true);
                    setMenuOpen(false);
                  }}
                >
                  Reset Chat
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="chat-messages">
          {activeSession?.messages.map((msg, i) => {
            const strategy = msg.strategyId
              ? strategyCache[msg.strategyId]
              : null;

            return (
              <div key={i} className={`message ${msg.role}`}>
                <p>{msg.text}</p>

                {msg.role === "bot" && strategy && (
                  <div className="strategy-suggestion">
                    <strong>You might find this helpful:</strong>
                    <br />
                    <a
                      href={`/coping-hub/${msg.strategyId}`}
                      className="strategy-link"
                    >
                      {strategy.title}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>

      <aside className="chatbot-sidepanel">
        <div className="side-header">
          <h3>Chats</h3>
          <button className="new-chat-btn" onClick={startNewChat}>+</button>
        </div>

        {sessions.map((s) => (
          <div
            key={s.id}
            className={`side-card ${s.id === activeSessionId ? "active" : ""}`}
          >
            <span onClick={() => setActiveSessionId(s.id)}>
              {s.title}
            </span>
            <button
              className="chat-delete"
              onClick={() => deleteChat(s.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </aside>

      {/* FEEDBACK MODAL (NEW, DOES NOT TOUCH CHAT) */}
      {showFeedback && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Chat Feedback</h3>

            <label>Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${
                    star <= (hoverRating || feedbackRating) ? "filled" : ""
                  }`}
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>

            <label>Description (optional)</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={() => setShowFeedback(false)}>Cancel</button>
              <button
                className="primary"
                onClick={submitFeedback}
                disabled={submittingFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Chat?</h3>

            <p style={{ color: "var(--text-muted)" }}>
              This will clear the current chat and cannot be undone.
            </p>

            <div className="modal-actions">
              <button onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>

              <button
                className="primary"
                onClick={() => {
                  handleResetChat();
                  setShowResetConfirm(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
