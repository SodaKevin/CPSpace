// socialSpace/components/CreatePostModal.jsx

import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";
import { moderateText } from "../../../services/aiModerationService";

const EMPTY_FEELINGS = { pos: [], neu: [], neg: [] };

export default function CreatePostModal({ onClose }) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  /* ===============================
     STATE (MATCH DIARY MODAL)
  =============================== */

  const [category, setCategory] = useState(null); // pos | neu | neg
  const [selected, setSelected] = useState([]);
  const [feelings, setFeelings] = useState(EMPTY_FEELINGS);

  const [body, setBody] = useState("");
  const [showFlagNotice, setShowFlagNotice] = useState(false);

  /* ===============================
     LOAD EFFECTIVE FEELINGS
  =============================== */
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

      setFeelings({
        pos: defaults.pos.filter((f) => !removed.pos.includes(f)).concat(added.pos),
        neu: defaults.neu.filter((f) => !removed.neu.includes(f)).concat(added.neu),
        neg: defaults.neg.filter((f) => !removed.neg.includes(f)).concat(added.neg),
      });
    }

    loadFeelings();
  }, [uid]);

  useEffect(() => {
    if (!showFlagNotice) return undefined;

    const timer = setTimeout(() => {
      setShowFlagNotice(false);
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [showFlagNotice, onClose]);

  function toggleFeeling(f) {
    setSelected((prev) =>
      prev.includes(f)
        ? prev.filter((x) => x !== f)
        : [...prev, f]
    );
  }

  /* ===============================
     SAVE POST
  =============================== */
  async function handleSave() {
    if (!auth.currentUser) return;

    const { label, confidence } = await moderateText(body);
    const moderationStatus = label === "Negative" && confidence >= 0.7 ? "Flagged" : "Visible";

    await addDoc(collection(db, "posts"), {
      authorId: auth.currentUser.uid,
      body: body.trim(),
      emotionCategory:
        category === "pos"
          ? "pleasant"
          : category === "neu"
          ? "neutral"
          : "unpleasant",
      feelings: selected,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEdited: false,
      moderationStatus,
      ai: {
        label,
        confidence,
        lastChecked: serverTimestamp(),
      },
      stats: { up: 0, down: 0 },
    });

    if (moderationStatus === "Flagged") {
      setShowFlagNotice(true);
      return;
    }

    onClose();
  }

  /* ===============================
     UI
  =============================== */
  return (
    <>
      <div className="modal-backdrop">
        <div className="modal">
          <h3>Create a Post</h3>

          {/* EMOTION CATEGORY */}
          <div className="emotion-categories">
            {["pos", "neu", "neg"].map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => {
                  setCategory(c);
                  setSelected([]); // reset feelings on change
                }}
              >
                {c === "pos"
                  ? "Pleasant"
                  : c === "neu"
                  ? "Neutral"
                  : "Unpleasant"}
              </button>
            ))}
          </div>

          {/* FEELINGS */}
          {category && (
            <div className="feelings">
              {feelings[category]?.map((f) => (
                <span
                  key={f}
                  className={selected.includes(f) ? "tag active" : "tag"}
                  onClick={() => toggleFeeling(f)}
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* BODY (AFTER EMOTION SELECTION, AS REQUESTED) */}
          <textarea
            className="diary-textarea"
            placeholder="What’s on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
            style={{ marginTop: "16px" }}
          />

          {/* ACTIONS */}
          <div className="modal-actions">
            <button onClick={onClose}>Cancel</button>
            <button
              disabled={
                !category ||
                selected.length === 0 ||
                !body.trim()
              }
              onClick={handleSave}
            >
              Post
            </button>
          </div>
        </div>
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
          Your post has been submitted for review.
          <br />
          We encourage respectful and constructive communication within the community.
        </div>
      )}
    </>
  );
}
