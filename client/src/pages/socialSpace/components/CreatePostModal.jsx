// socialSpace/components/CreatePostModal.jsx

import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";

export default function CreatePostModal({ onClose }) {
  const auth = getAuth();

  /* ===============================
     STATE (MATCH DIARY MODAL)
  =============================== */

  const [category, setCategory] = useState(null); // pos | neu | neg
  const [selected, setSelected] = useState([]);
  const [feelings, setFeelings] = useState({ pos: [], neu: [], neg: [] });

  const [body, setBody] = useState("");

  /* ===============================
     LOAD DEFAULT FEELINGS
  =============================== */
  useEffect(() => {
    async function loadFeelings() {
      const snap = await getDoc(doc(db, "defaultFeelings", "default"));
      if (snap.exists()) {
        setFeelings(snap.data());
      }
    }
    loadFeelings();
  }, []);

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
      moderationStatus: "Visible",
      stats: { up: 0, down: 0 },
    });

    onClose();
  }

  /* ===============================
     UI
  =============================== */
  return (
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
  );
}
