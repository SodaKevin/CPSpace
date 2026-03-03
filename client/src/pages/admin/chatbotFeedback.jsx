import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./chatbotFeedback.css"; // keep your layout css
import "../settings/preferences.css"; // reuse modal styles

export default function ChatbotFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const snap = await getDocs(collection(db, "chatbotFeedback"));

        const feedbackData = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();

            const userSnap = await getDoc(doc(db, "users", data.userId));

            let username = data.userId;

            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.username?.value) {
                username = userData.username.discriminator
                  ? `${userData.username.value}#${userData.username.discriminator}`
                  : userData.username.value;
              }
            }

            return {
              id: d.id,
              ...data,
              username,
            };
          })
        );

        feedbackData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setFeedbackList(feedbackData);
      } catch (err) {
        console.error("Failed to load feedback:", err);
      }
    }

    fetchFeedback();
  }, []);

  const confirmDelete = async () => {
    if (!confirmId) return;

    try {
      await deleteDoc(doc(db, "chatbotFeedback", confirmId));
      setFeedbackList((prev) => prev.filter((f) => f.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="chatbot-feedback-page">
      <h2>Chatbot Feedback</h2>

      {feedbackList.length === 0 && (
        <p className="feedback-empty">No feedback yet.</p>
      )}

      {feedbackList.map((f) => (
        <div key={f.id} className="feedback-card">
          <div className="feedback-user">
            User: {f.username || f.userId}
          </div>

          <div className="feedback-rating">
            Rating: {f.rating} / 5
          </div>

          <div className="feedback-message" style={{ whiteSpace: "pre-wrap" }}>
            {f.description || "No description provided."}
          </div>

          <button
            className="feedback-delete-btn"
            onClick={() => setConfirmId(f.id)}
          >
            Delete
          </button>
        </div>
      ))}

      {/* ===== CONFIRM MODAL ===== */}
      {confirmId && (
        <div className="pref-modal-overlay">
          <div className="pref-modal-dialog">
            <h3>Delete Feedback?</h3>
            <p>This action cannot be undone.</p>

            <div className="pref-modal-actions">
              <button
                className="pref-confirm"
                onClick={confirmDelete}
              >
                Delete
              </button>

              <button
                className="pref-cancel"
                onClick={() => setConfirmId(null)}
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
