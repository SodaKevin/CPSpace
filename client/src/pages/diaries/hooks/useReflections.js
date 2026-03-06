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

export function useReflections(user, activeDate) {
  const getDateKey = () =>
    getLocalDateParts(activeDate).dateKey;

  async function loadReflections() {
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
      .filter(d => d.type === "reflection");
  }

  async function createReflection({ category, feelings, body }) {
    if (!user) return;

    await addDoc(
      collection(db, "users", user.uid, "diaries"),
      {
        type: "reflection",
        category,
        feelings,
        body,
        createdAt: serverTimestamp(),
        ...getLocalDateParts(activeDate),
      }
    );
  }

  async function updateReflection(entryId, { category, feelings, body }) {
    if (!user) return;

    await updateDoc(
      doc(db, "users", user.uid, "diaries", entryId),
      {
        category,
        feelings,
        body,
      }
    );
  }

  async function deleteReflection(entryId) {
    if (!user) return;

    const ok = window.confirm("Delete this diary entry?");
    if (!ok) return;

    await deleteDoc(
      doc(db, "users", user.uid, "diaries", entryId)
    );
  }

  return {
    loadReflections,
    createReflection,
    updateReflection,
    deleteReflection,
  };
}
