// socialSpace/components/CommentItem.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import "./Comment.css";
import { timeAgo } from "../../../utils/timeAgo";

export default function CommentItem({ comment, pseudonym }) {
  const auth = getAuth();
  const navigate = useNavigate();
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

  async function reportComment() {
    if (!window.confirm("Report this comment?")) return;

    await updateDoc(
      doc(db, "posts", comment.postId, "comments", comment.id),
      {
        moderationStatus: "Flagged",
        updatedAt: serverTimestamp()
      }
    );

    alert("Comment submitted for review.");
  }

  return (
    <div className="comment">
      <span className="comment-author"
        onClick={() =>
          navigate(`/user/${comment.authorId}`)
        }
        style={{ cursor: "pointer" }}
      >
        {pseudonym}
        {comment.createdAt && ` · ${timeAgo(comment.createdAt)}`}
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

      <div className="comment-actions">
        <button onClick={reportComment}>Report</button>
      </div>
    </div>
  );
}
