// socialSpace/components/CommentInput.jsx

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";
import "./Comment.css";

export default function CommentInput({ postId }) {
  const [text, setText] = useState("");
  const auth = getAuth();

  const submit = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      authorId: auth.currentUser.uid,
      body: text.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEdited: false,
      moderationStatus: "Visible"
    });

    setText("");
  };

  return (
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
  );
}
