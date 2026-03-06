// socialSpace/components/CommentInput.jsx

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";
import { moderateText } from "../../../services/aiModerationService";
import "./Comment.css";

export default function CommentInput({ postId }) {
  const [text, setText] = useState("");
  const [showFlagNotice, setShowFlagNotice] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    if (!showFlagNotice) return undefined;

    const timer = setTimeout(() => {
      setShowFlagNotice(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, [showFlagNotice]);

  const submit = async () => {
    if (!text.trim()) return;

    const { label, confidence } = await moderateText(text);
    const moderationStatus = label === "Negative" && confidence >= 0.7 ? "Flagged" : "Visible";

    await addDoc(collection(db, "posts", postId, "comments"), {
      authorId: auth.currentUser.uid,
      body: text.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEdited: false,
      moderationStatus,
      ai: {
        label,
        confidence,
        lastChecked: serverTimestamp(),
      },
    });

    setText("");

    if (moderationStatus === "Flagged") {
      setShowFlagNotice(true);
    }
  };

  return (
    <>
      <div className="comment-input">
        <input
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button onClick={submit} disabled={!text.trim()}>
          Send
        </button>
      </div>

      {showFlagNotice && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            maxWidth: "360px",
            background: "var(--bg-card)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "12px 14px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
            zIndex: 9999,
            lineHeight: 1.45,
          }}
        >
          Your comment has been submitted for review.
          <br />
          We encourage respectful and constructive communication within the community.
        </div>
      )}
    </>
  );
}
