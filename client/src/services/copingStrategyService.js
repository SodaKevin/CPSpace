import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

import { EMOTION_GROUPS } from "../domain/emotionMap";

const CATEGORY_TO_TAGS = {
  pleasant: [],
  neutral: [],
  unpleasant: [
    "AFFIRMATION",
    "SELF_REFLECTION",
    "RELAXATION",
    "GROUNDING",
    "BREATHING",
  ],
};

export async function recommendCopingStrategies(feelings = []) {
  if (!Array.isArray(feelings) || feelings.length === 0) {
    return [];
  }

  const tagSet = new Set();

  feelings.forEach(feeling => {
    const key = feeling.toLowerCase().trim();
    const category = EMOTION_GROUPS[key];

    if (!category) return;

    CATEGORY_TO_TAGS[category]?.forEach(tag => tagSet.add(tag));
  });

  const tags = Array.from(tagSet);
  if (tags.length === 0) return [];

  const q = query(
    collection(db, "copingStrategies"),
    where("tags", "array-contains-any", tags)
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
