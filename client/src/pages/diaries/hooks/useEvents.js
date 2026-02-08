import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getLocalDateParts } from "../utils/dateUtils";

export function useEvents(user, activeDate) {
  const getDateKey = () =>
    getLocalDateParts(activeDate).dateKey;

  async function loadEvents() {
    if (!user) return [];

    const q = query(
      collection(
        db,
        "users",
        user.uid,
        "diaryDays",
        getDateKey(),
        "events"
      ),
      orderBy("createdAt", "asc")
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  }

  async function createEvent(payload) {
    if (!user) return;

    await addDoc(
      collection(
        db,
        "users",
        user.uid,
        "diaryDays",
        getDateKey(),
        "events"
      ),
      {
        ...payload,
        createdAt: serverTimestamp(),
        currentEmotion: {
          category: payload.category,
          feelings: payload.feelings,
          changedAt: serverTimestamp(),
        },
        emotionHistory: [
          {
            category: payload.category,
            feelings: payload.feelings,
            changedAt: new Date(),
            note: payload.note || "",
          },
        ],
      }
    );
  }

  async function updateEventEmotion(eventId, payload) {
    if (!user || !payload) return;
    const { category, feelings, note } = payload;
    if (!category || !feelings) return;

    const ref = doc(
      db,
      "users",
      user.uid,
      "diaryDays",
      getDateKey(),
      "events",
      eventId
    );

    await updateDoc(ref, {
      currentEmotion: {
        category: payload.category,
        feelings: payload.feelings,
        changedAt: serverTimestamp(),
      },
      emotionHistory: arrayUnion({
        category: payload.category,
        feelings: payload.feelings,
        changedAt: new Date(),
        note: payload.note || "",
      }),
    });
  }

  async function deleteEvent(eventId) {
    if (!user) return;

    const ok = window.confirm("Delete this event entry?");
    if (!ok) return;

    await deleteDoc(
      doc(
        db,
        "users",
        user.uid,
        "diaryDays",
        getDateKey(),
        "events",
        eventId
      )
    );
  }

  return {
    loadEvents,
    createEvent,
    updateEventEmotion,
    deleteEvent,
  };
}
