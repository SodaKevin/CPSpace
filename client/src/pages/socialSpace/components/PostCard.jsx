// socialSpace/components/PostCard.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  runTransaction
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { timeAgo } from "../../../utils/timeAgo";

import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import "./PostCard.css";

const EMPTY_FEELINGS = { pos: [], neu: [], neg: [] };

export default function PostCard({
  post,
  pseudonym,
  onPostUpdated,
  loadMore
}) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const navigate = useNavigate();
  const isOwner = uid === post.authorId;

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
    if (loadMore) loadMore();
  }

  function handleDownvote() {
    if (myVote === -1) {
      applyVote(0);   // cancel
    } else {
      applyVote(-1);
    }
    if (loadMore) loadMore();
  }

  async function handleReport() {
    if (!window.confirm("Report this post?")) return;

    await updateDoc(doc(db, "posts", post.id), {
      moderationStatus: "Flagged",
      updatedAt: serverTimestamp()
    });

    alert("Post submitted for review.");
  }

  useEffect(() => {
    if (!uid) return;

    async function loadMyVote() {
      const voteRef = doc(
        db,
        "posts",
        post.id,
        "votes",
        uid
      );

      const snap = await getDoc(voteRef);

      if (snap.exists()) {
        setMyVote(snap.data().value); // 1 | -1 | 0
      } else {
        setMyVote(null);
      }
    }

    loadMyVote();
  }, [post.id, uid]);

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
  const [allFeelings, setAllFeelings] = useState(EMPTY_FEELINGS);

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
      const [defaultSnap, userSnap] = await Promise.all([
        getDoc(doc(db, "defaultFeelings", "default")),
        uid ? getDoc(doc(db, "users", uid)) : Promise.resolve(null),
      ]);

      const defaults = defaultSnap.exists()
        ? {
            pos: defaultSnap.data()?.pos ?? [],
            neu: defaultSnap.data()?.neu ?? [],
            neg: defaultSnap.data()?.neg ?? [],
          }
        : EMPTY_FEELINGS;

      const preferenceFeelings = userSnap?.exists()
        ? userSnap.data()?.preferences?.feelings
        : null;

      const added = {
        pos: preferenceFeelings?.added?.pos ?? [],
        neu: preferenceFeelings?.added?.neu ?? [],
        neg: preferenceFeelings?.added?.neg ?? [],
      };

      const removed = {
        pos: preferenceFeelings?.removed?.pos ?? [],
        neu: preferenceFeelings?.removed?.neu ?? [],
        neg: preferenceFeelings?.removed?.neg ?? [],
      };

      setAllFeelings({
        pos: defaults.pos.filter((f) => !removed.pos.includes(f)).concat(added.pos),
        neu: defaults.neu.filter((f) => !removed.neu.includes(f)).concat(added.neu),
        neg: defaults.neg.filter((f) => !removed.neg.includes(f)).concat(added.neg),
      });
    }

    loadFeelings();
  }, [uid]);

  return (
    <div className="post-card">
      <div className="post-header">
        <strong
          onClick={() => navigate(`/user/${post.authorId}`)}
          style={{ cursor: "pointer" }}
        >
          {pseudonym}
        </strong>

        <span className="post-time">
          · {timeAgo(post.createdAt)}
        </span>

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
            {[...(allFeelings[category] ?? []), ...selected.filter((f) => !(allFeelings[category] ?? []).includes(f))].map(f => (
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
          onClick={() => {
            setShowAllComments(v => !v);
            if (loadMore) loadMore();
          }}
          style={{
            color: showAllComments ? "var(--accent)" : undefined
          }}
        >
          💬 Comment
        </button>

        <button onClick={handleReport}>
          🚩 Report
        </button>

        {/* Emotion category display */}
        <span className={`emotion-badge ${post.emotionCategory}`}>
          {post.emotionCategory}
        </span>
      </div>

      <CommentList
        postId={post.id}
        expanded={showAllComments}
      />

      {showAllComments && <CommentInput postId={post.id} />}
    </div>
  );
}
