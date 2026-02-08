// socialSpace/components/PostCard.jsx

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  runTransaction,
  collection,
  setDoc
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import "./PostCard.css";

export default function PostCard({ post, pseudonym, onPostUpdated }) {
  const auth = getAuth();
  const isOwner = auth.currentUser?.uid === post.authorId;

  const [showAllComments, setShowAllComments] = useState(false);

  // POST EDIT STATE
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(post.body);

  // VOTE STATE
  const [myVote, setMyVote] = useState(null); // 1 | -1 | 0 | null

  async function applyVote(nextValue) {
    if (!auth.currentUser) return;

    const postRef = doc(db, "posts", post.id);
    const voteRef = doc(
      db,
      "posts",
      post.id,
      "votes",
      auth.currentUser.uid
    );

    await runTransaction(db, async (tx) => {
      const postSnap = await tx.get(postRef);
      if (!postSnap.exists()) return;

      const postData = postSnap.data();
      const stats = postData.stats || { up: 0, down: 0 };

      let prevValue = null;

      const voteSnap = await tx.get(voteRef);
      if (voteSnap.exists()) {
        prevValue = voteSnap.data().value;
      }

      // ---------- STAT ADJUSTMENT ----------
      let up = stats.up;
      let down = stats.down;

      // remove previous vote
      if (prevValue === 1) up -= 1;
      if (prevValue === -1) down -= 1;

      // apply new vote
      if (nextValue === 1) up += 1;
      if (nextValue === -1) down += 1;

      // ---------- WRITE ----------
      tx.update(postRef, {
        "stats.up": up,
        "stats.down": down,
        updatedAt: serverTimestamp()
      });

      if (voteSnap.exists()) {
        tx.update(voteRef, {
          value: nextValue,
          updatedAt: serverTimestamp()
        });
      } else {
        tx.set(voteRef, {
          value: nextValue,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });

    setMyVote(nextValue);
  }

  function handleUpvote() {
    if (myVote === 1) {
      applyVote(0);   // cancel
    } else {
      applyVote(1);
    }
  }

  function handleDownvote() {
    if (myVote === -1) {
      applyVote(0);   // cancel
    } else {
      applyVote(-1);
    }
  }

  useEffect(() => {
    if (!auth.currentUser) return;

    async function loadMyVote() {
      const voteRef = doc(
        db,
        "posts",
        post.id,
        "votes",
        auth.currentUser.uid
      );

      const snap = await getDoc(voteRef);

      if (snap.exists()) {
        setMyVote(snap.data().value); // 1 | -1 | 0
      } else {
        setMyVote(null);
      }
    }

    loadMyVote();
  }, [post.id]);

  // map stored category → internal key
  function toKey(cat) {
    return cat === "pleasant" ? "pos" : cat === "neutral" ? "neu" : "neg";
  }

  function toLabel(key) {
    return key === "pos" ? "pleasant" : key === "neu" ? "neutral" : "unpleasant";
  }

  function toggleFeeling(f) {
    setSelected(prev =>
      prev.includes(f)
        ? prev.filter(x => x !== f)
        : [...prev, f]
    );
  }

  const [category, setCategory] = useState(toKey(post.emotionCategory));
  const [selected, setSelected] = useState(post.feelings || []);
  const [allFeelings, setAllFeelings] = useState({ pos: [], neu: [], neg: [] });

  const savePost = async () => {
    await updateDoc(doc(db, "posts", post.id), {
      body,
      emotionCategory: toLabel(category),
      feelings: selected,
      isEdited: true,
      editedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setEditing(false);
    onPostUpdated(); // 👈 soft refresh
  };

  const deletePost = async () => {
    await updateDoc(doc(db, "posts", post.id), {
      moderationStatus: "Hidden"
    });

    onPostUpdated(); // 👈 soft refresh
  };

  useEffect(() => {
    async function loadFeelings() {
      const snap = await getDoc(doc(db, "defaultFeelings", "default"));
      if (snap.exists()) {
        setAllFeelings(snap.data());
      }
    }
    loadFeelings();
  }, []);

  return (
    <div className="post-card">
      <div className="post-header">
        <strong>{pseudonym}</strong>
        {post.isEdited && <span className="edited-label"> · edited</span>}
      </div>

      {editing ? (
        <>
          {/* CATEGORY */}
          <div className="emotion-categories">
            {["pos", "neu", "neg"].map(c => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => {
                  setCategory(c);
                  setSelected([]); // reset feelings when category changes
                }}
              >
                {c === "pos" ? "Pleasant" : c === "neu" ? "Neutral" : "Unpleasant"}
              </button>
            ))}
          </div>

          {/* FEELINGS */}
          <div className="feelings">
            {allFeelings[category]?.map(f => (
              <span
                key={f}
                className={selected.includes(f) ? "tag active" : "tag"}
                onClick={() => toggleFeeling(f)}
              >
                {f}
              </span>
            ))}
          </div>

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="diary-textarea"
          />


          <button onClick={savePost}>Save</button>
        </>
      ) : (
        <p>{post.body}</p>
      )}

      {isOwner && (
        <div className="post-owner-actions">
          <button onClick={() => setEditing(v => !v)}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={deletePost}>Delete</button>
        </div>
      )}

      <div className="post-actions">
        <button
          onClick={handleUpvote}
          style={{ color: myVote === 1 ? "var(--accent)" : undefined }}
        >
          ▲ Upvote
        </button>

        <button
          onClick={handleDownvote}
          style={{ color: myVote === -1 ? "var(--accent)" : undefined }}
        >
          ▼ Downvote
        </button>

        <button
          onClick={() => setShowAllComments(v => !v)}
          style={{
            color: showAllComments ? "var(--accent)" : undefined
          }}
        >
          💬 Comment
        </button>
      </div>

      <CommentList
        postId={post.id}
        expanded={showAllComments}
      />

      {showAllComments && <CommentInput postId={post.id} />}
    </div>
  );
}
