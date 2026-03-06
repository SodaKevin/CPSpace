import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./chatbotFeedback.css"; // keep your layout css
import "../settings/preferences.css"; // reuse modal styles

export default function ChatbotFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(feedbackList.length / ITEMS_PER_PAGE);

  const paginatedFeedback = feedbackList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const navigate = useNavigate();

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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto"
    });
  }, [currentPage]);

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

      {paginatedFeedback.map((f) => (
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

          <span className="feedback-date">
            {f.createdAt
              ? new Date(f.createdAt.seconds * 1000).toLocaleDateString()
              : ""}
          </span>

          <div className="feedback-actions">

          <button
            className="feedback-detail-btn"
            onClick={() => navigate(`/admin/chatbot-feedback/${f.id}`)}
          >
            Detail
          </button>

            <button
              className="feedback-delete-btn"
              onClick={() => setConfirmId(f.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="pagination">

          <button
            className="page-nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ‹
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-number ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="page-nav"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            ›
          </button>

        </div>
      )}

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
