// socialSpace/components/CommentItem.jsx

import { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import "./Comment.css";

export default function CommentItem({ comment, pseudonym }) {
  const auth = getAuth();
  const isOwner = auth.currentUser?.uid === comment.authorId;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.body);

  const save = async () => {
    if (!comment?.id || !comment?.postId) {
      console.error("Invalid comment reference", comment);
      return;
    }

    await updateDoc(
      doc(db, "posts", comment.postId, "comments", comment.id),
      {
        body: text,
        isEdited: true,
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );

    setEditing(false);
  };

  const remove = async () => {
    await updateDoc(
      doc(db, "posts", comment.postId, "comments", comment.id),
      { moderationStatus: "Hidden" }
    );
  };

  return (
    <div className="comment">
      <span className="comment-author">
        {pseudonym}
        {comment.isEdited && " · edited"}
      </span>

      {editing ? (
        <>
          <input value={text} onChange={e => setText(e.target.value)} />
          <button onClick={save}>Save</button>
        </>
      ) : (
        <p>{comment.body}</p>
      )}

      {isOwner && (
        <div className="comment-actions">
          <button onClick={() => setEditing(v => !v)}>Edit</button>
          <button onClick={remove}>Delete</button>
        </div>
      )}
    </div>
  );
}
