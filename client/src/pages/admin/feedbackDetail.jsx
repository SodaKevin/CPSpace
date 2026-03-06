import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

import "./feedbackDetail.css";

export default function FeedbackDetail() {
     const { id } = useParams();

    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
    async function loadFeedback() {
        const snap = await getDoc(doc(db, "chatbotFeedback", id));

        if (!snap.exists()) return;

        const data = snap.data();

        let username = data.userId;

        const userSnap = await getDoc(doc(db, "users", data.userId));

        if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.username?.value) {
            username = userData.username.discriminator
            ? `${userData.username.value}#${userData.username.discriminator}`
            : userData.username.value;
        }
        }

        setFeedback({
        ...data,
        username
        });
    }

    loadFeedback();
    }, [id]);

    if (!feedback) {
      return <div className="feedback-detail-page">Loading...</div>;
    }

    return (
        <div className="feedback-detail-page">
            <h2>Feedback Detail</h2>

            <div className="feedback-detail-card">

            <div className="detail-row">
            <strong>User:</strong> {feedback.username || feedback.userId}
            </div>

            <div className="detail-row">
            <strong>Rating:</strong> {feedback.rating} / 5
            </div>

            <div className="detail-row">
            <strong>Date:</strong>{" "}
            {feedback.createdAt
                ? new Date(feedback.createdAt.seconds * 1000).toLocaleString()
                : ""}
            </div>

            <div className="detail-message">
            <strong>Description</strong>
            <p>{feedback.description || "No description provided."}</p>
            </div>

        </div>

    </div>
  );
}