// src/services/diaryService.js
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function getTodaysEmotion(uid) {
  if (!uid) return null;

  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  const dateKey = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const q = query(
    collection(db, "users", uid, "diaries"),
    where("dateKey", "==", dateKey),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  return snap.docs[0].data();
}

export async function getUserDiaries(uid, days = 14) {
  if (!uid) return [];

  const q = query(
    collection(db, "users", uid, "diaries"),
    orderBy("createdAt", "desc"),
    limit(days * 5) // safe upper bound
  );

  const snap = await getDocs(q);

  return snap.docs
    .map(d => d.data())
    .filter(d => Array.isArray(d.feelings));
}