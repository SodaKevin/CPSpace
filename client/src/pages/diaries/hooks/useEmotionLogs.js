import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getLocalDateParts } from "../utils/dateUtils";

export function useEmotionLogs(user, activeDate) {
  const getDateKey = () =>
    getLocalDateParts(activeDate).dateKey;

  async function loadEmotionLogs() {
    if (!user) return [];

    const { dateKey: endKey } = getLocalDateParts(activeDate);

    const startDate = new Date(activeDate);
    startDate.setDate(startDate.getDate() - 10);

    const { dateKey: startKey } = getLocalDateParts(startDate);

    const q = query(
      collection(db, "users", user.uid, "diaries"),
      where("dateKey", ">=", startKey),
      where("dateKey", "<=", endKey)
    );

    const snap = await getDocs(q);

    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => d.type === "emotion");
  }

  async function createEmotion({ category, feelings }) {
    if (!user) return;

    await addDoc(
      collection(db, "users", user.uid, "diaries"),
      {
        type: "emotion",
        category,
        feelings,
        body: "",
        createdAt: serverTimestamp(),
        ...getLocalDateParts(activeDate),
      }
    );
  }

  async function updateEmotion(entryId, { category, feelings }) {
    if (!user) return;

    await updateDoc(
      doc(db, "users", user.uid, "diaries", entryId),
      {
        category,
        feelings,
      }
    );
  }

  async function deleteEmotion(entryId) {
    if (!user) return;
    
    const ok = window.confirm("Delete this emotion log?");
    if (!ok) return;

    await deleteDoc(
      doc(db, "users", user.uid, "diaries", entryId)
    );
  }

  return {
    loadEmotionLogs,
    createEmotion,
    updateEmotion,
    deleteEmotion,
  };
}
