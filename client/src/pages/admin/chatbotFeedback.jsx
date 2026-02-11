import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
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

        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setFeedbackList(data);
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

          <div className="feedback-message">
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
