import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebaseConfig";
import { moderateText } from "../../../services/aiModerationService";

import "./adminModeration.css";

function formatCreatedAt(createdAt) {
  if (!createdAt) return "-";

  if (typeof createdAt.toDate === "function") {
    return createdAt.toDate().toLocaleString();
  }

  return "-";
}

export default function FlaggedCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsubscribePosts = onSnapshot(collection(db, "posts"), (postSnap) => {
      const unsubscribers = [];
      const aggregated = [];

      postSnap.docs.forEach((postDoc) => {
        const postId = postDoc.id;

        const q = query(
          collection(db, "posts", postId, "comments"),
          where("moderationStatus", "==", "Flagged")
        );

        const unsub = onSnapshot(q, (commentSnap) => {
          commentSnap.docs.forEach((commentDoc) => {
            aggregated.push({
              id: commentDoc.id,
              postId,
              ...commentDoc.data(),
            });
          });

          setComments([...aggregated]);
          setLoading(false);
        });

        unsubscribers.push(unsub);
      });

      return () => unsubscribers.forEach((u) => u());
    });

    return unsubscribePosts;
  }, []);

  const updateModerationStatus = useCallback(async (comment, status) => {
    setBusyId(comment.id);

    try {
      await updateDoc(
        doc(db, "posts", comment.postId, "comments", comment.id),
        {
          moderationStatus: status,
          updatedAt: serverTimestamp(),
        }
      );
    } finally {
      setBusyId(null);
    }
  }, []);

  const reanalyseComment = useCallback(async (comment) => {
    setBusyId(comment.id);

    try {
      const { label, confidence } = await moderateText(comment.body ?? "");

      await updateDoc(
        doc(db, "posts", comment.postId, "comments", comment.id),
        {
          "ai.label": label,
          "ai.confidence": confidence,
          "ai.lastChecked": serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    } finally {
      setBusyId(null);
    }
  }, []);

    return (
        <div className="admin-content">
            <h2 className="admin-title">Flagged Comments</h2>

            {loading ? (
                <p className="admin-meta">Loading flagged comments...</p>
            ) : comments.length === 0 ? (
                <p className="admin-meta">No flagged comments found.</p>
            ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                {comments.map((comment) => {
                    const isBusy = busyId === comment.id;

                    return (
                    <div
                        key={`${comment.postId}-${comment.id}`}
                        className="admin-card"
                    >
                        <div className="admin-meta">
                        <strong>Created:</strong>{" "}
                        {formatCreatedAt(comment.createdAt)}
                        </div>

                        <p>
                        <strong>Body:</strong> {comment.body || "-"}
                        </p>

                        <p>
                        <strong>AI Label:</strong> {comment.ai?.label || "-"}
                        </p>

                        <p>
                        <strong>AI Confidence:</strong>{" "}
                        {typeof comment.ai?.confidence === "number"
                            ? comment.ai.confidence
                            : "-"}
                        </p>

                        <div className="admin-actions">
                        <button
                            className="admin-btn"
                            onClick={() =>
                            updateModerationStatus(comment, "Visible")
                            }
                            disabled={isBusy}
                        >
                            Approve
                        </button>

                        <button
                            className="admin-btn"
                            onClick={() =>
                            updateModerationStatus(comment, "Hidden")
                            }
                            disabled={isBusy}
                        >
                            Delete
                        </button>

                        <button
                            className="admin-btn"
                            onClick={() => reanalyseComment(comment)}
                            disabled={isBusy}
                        >
                            Re-analyse
                        </button>
                        </div>
                    </div>
                    );
                })}
                </div>
            )}
        </div>
    );
}