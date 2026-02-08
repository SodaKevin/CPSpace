import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./history.css";

export default function AssessmentHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "users", user.uid, "assessments"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type,
            score: data.score,
            severity: data.severity,
            date: data.createdAt
              ? data.createdAt.toDate().toISOString().split("T")[0]
              : "—",
          };
        });

        setHistory(results);
      } catch (err) {
        console.error("Failed to load assessment history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="assessment-panel history">
        <p className="assessment-intro">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="assessment-panel history">
      <h2>Assessment History</h2>

      <p className="assessment-intro">
        Below is a record of your previous mental health self-assessments.
      </p>

      {history.length === 0 ? (
        <div className="history-empty">
          <p>You have not completed any assessments yet.</p>
          <button onClick={() => navigate("/assessments/selection")}>
            Take an Assessment
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-main">
                <h3>{item.type}</h3>
                <span className="history-date">{item.date}</span>
              </div>

              <div className="history-meta">
                <span>Score: {item.score}</span>
                <span className={`severity ${item.severity.toLowerCase()}`}>
                  {item.severity}
                </span>
              </div>

              <div className="history-actions">
                <button
                  onClick={() =>
                    navigate("/assessments/report", {
                      state: {
                        type: item.type,
                        score: item.score,
                        severity: item.severity,
                      },
                    })
                  }
                >
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
