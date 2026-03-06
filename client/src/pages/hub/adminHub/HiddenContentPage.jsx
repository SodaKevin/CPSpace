import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebaseConfig";

import "./adminModeration.css";

export default function HiddenContentPage() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const unsubPosts = onSnapshot(
      query(collection(db, "posts"), where("moderationStatus", "==", "Hidden")),
      (postSnap) => {
        const hiddenPosts = postSnap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        setPosts(hiddenPosts);

        // Now fetch hidden comments under each post
        const unsubscribers = [];
        const aggregatedComments = [];

        postSnap.docs.forEach((postDoc) => {
          const postId = postDoc.id;

          const q = query(
            collection(db, "posts", postId, "comments"),
            where("moderationStatus", "==", "Hidden")
          );

          const unsub = onSnapshot(q, (commentSnap) => {
            commentSnap.docs.forEach((commentDoc) => {
              aggregatedComments.push({
                id: commentDoc.id,
                postId,
                ...commentDoc.data(),
              });
            });

            setComments([...aggregatedComments]);
          });

          unsubscribers.push(unsub);
        });

        return () => unsubscribers.forEach((u) => u());
      }
    );

    return unsubPosts;
  }, []);

  async function restorePost(postId) {
    await updateDoc(doc(db, "posts", postId), {
      moderationStatus: "Visible",
      updatedAt: serverTimestamp(),
    });
  }

  async function restoreComment(comment) {
    await updateDoc(
      doc(db, "posts", comment.postId, "comments", comment.id),
      {
        moderationStatus: "Visible",
        updatedAt: serverTimestamp(),
      }
    );
  }

    return (
        <div className="admin-content">
        <h2 className="admin-title">Hidden Content</h2>

        {/* Hidden Posts */}
        <h3 className="admin-section-title">Hidden Posts</h3>

        {posts.length === 0 ? (
            <p className="admin-meta">No hidden posts.</p>
        ) : (
            <div style={{ display: "grid", gap: "16px" }}>
            {posts.map((p) => (
                <div key={p.id} className="admin-card">
                <p><strong>Body:</strong> {p.body}</p>

                <div className="admin-actions">
                    <button
                    className="admin-btn"
                    onClick={() => restorePost(p.id)}
                    >
                    Restore
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}

        {/* Hidden Comments */}
        <h3 className="admin-section-title" style={{ marginTop: "24px" }}>
            Hidden Comments
        </h3>

        {comments.length === 0 ? (
            <p className="admin-meta">No hidden comments.</p>
        ) : (
            <div style={{ display: "grid", gap: "16px" }}>
            {comments.map((c) => (
                <div
                key={`${c.postId}-${c.id}`}
                className="admin-card"
                >
                <p><strong>Body:</strong> {c.body}</p>

                <div className="admin-actions">
                    <button
                    className="admin-btn"
                    onClick={() => restoreComment(c)}
                    >
                    Restore
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}