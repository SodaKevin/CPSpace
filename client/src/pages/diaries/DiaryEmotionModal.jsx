// src/pages/diaries/DiaryEmotionModal.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function DiaryEmotionModal({
  mode = "emotion",
  initialCategory,
  initialFeelings = [],
  diaryText,
  setDiaryText,
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
        <h3>Select Today’s Emotion</h3>

        <div className="emotion-categories">
          {["pos", "neu", "neg"].map((c) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c === "pos" ? "Pleasant" : c === "neu" ? "Neutral" : "Unpleasant"}
            </button>
          ))}
        </div>

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

        {mode === "reflection" && (
          <textarea
            className="diary-textarea"
            placeholder="Write your diary..."
            value={diaryText}
            onChange={(e) => setDiaryText(e.target.value)}
            maxLength={4000}
            style={{ marginTop: "16px" }}
          />
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={
              !category ||
              selected.length === 0 ||
              (mode === "reflection" && !diaryText.trim())
            }
            onClick={() =>
              onSave({
                category:
                  category === "pos"
                    ? "pleasant"
                    : category === "neu"
                    ? "neutral"
                    : "unpleasant",
                feelings: selected,
              })
            }
          >
            {mode === "reflection" ? "Save Diary" : "Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
