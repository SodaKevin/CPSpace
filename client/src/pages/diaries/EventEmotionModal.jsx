// src/pages/diaries/EventEmotionModal.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function EventEmotionModal({
  title,
  initialCategory,
  initialFeelings = [],
  initialNote = "",
  onClose,
  onSave,
}) {
  const [category, setCategory] = useState(
    initialCategory
      ? initialCategory === "pleasant"
        ? "pos"
        : initialCategory === "neutral"
        ? "neu"
        : "neg"
      : null
  );

  const [selected, setSelected] = useState(initialFeelings);
  const [note, setNote] = useState(initialNote);

  const [feelings, setFeelings] = useState({ pos: [], neu: [], neg: [] });

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

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Event Emotion</h3>
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          {title}
        </div>

        {/* CATEGORY */}
        <div className="emotion-categories">
          {["pos", "neu", "neg"].map((c) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
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

        {/* OPTIONAL NOTE */}
        <textarea
          className="diary-textarea"
          placeholder="Optional note (e.g. before / after)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          style={{ minHeight: "100px" }}
        />

        {/* ACTIONS */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={!category || selected.length === 0}
            onClick={() =>
              onSave({
                category:
                  category === "pos"
                    ? "pleasant"
                    : category === "neu"
                    ? "neutral"
                    : "unpleasant",
                feelings: selected,
                note: note.trim(),
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
