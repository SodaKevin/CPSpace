// src/pages/diaries/DiaryEmotionModal.jsx
import { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const EMPTY_FEELINGS = { pos: [], neu: [], neg: [] };

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
  const [defaultFeelings, setDefaultFeelings] = useState(EMPTY_FEELINGS);
  const [addedFeelings, setAddedFeelings] = useState(EMPTY_FEELINGS);
  const [removedFeelings, setRemovedFeelings] = useState(EMPTY_FEELINGS);

  useEffect(() => {
    async function loadFeelings() {
      const uid = getAuth().currentUser?.uid;

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

      setDefaultFeelings(defaults);
      setAddedFeelings({
        pos: preferenceFeelings?.added?.pos ?? [],
        neu: preferenceFeelings?.added?.neu ?? [],
        neg: preferenceFeelings?.added?.neg ?? [],
      });
      setRemovedFeelings({
        pos: preferenceFeelings?.removed?.pos ?? [],
        neu: preferenceFeelings?.removed?.neu ?? [],
        neg: preferenceFeelings?.removed?.neg ?? [],
      });
    }

    loadFeelings();
  }, []);

  const effectiveFeelings = useMemo(() => {
    const result = { pos: [], neu: [], neg: [] };

    ["pos", "neu", "neg"].forEach((c) => {
      result[c] = (defaultFeelings[c] ?? [])
        .filter((feeling) => !(removedFeelings[c] ?? []).includes(feeling))
        .concat(addedFeelings[c] ?? []);
    });

    return result;
  }, [defaultFeelings, removedFeelings, addedFeelings]);

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
            {effectiveFeelings[category]?.map((f) => (
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
