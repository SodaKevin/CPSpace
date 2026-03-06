// socialSpace/hooks/useRecentEmotion.js

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";

const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hours

function getCacheKey(uid) {
  return `recentEmotion:${uid}`;
}

function readCache(uid) {
  try {
    const raw = localStorage.getItem(getCacheKey(uid));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.updatedAt > CACHE_TTL) {
      localStorage.removeItem(getCacheKey(uid));
      return null;
    }

    return parsed.emotion;
  } catch {
    return null;
  }
}

function writeCache(uid, emotion) {
  try {
    localStorage.setItem(
      getCacheKey(uid),
      JSON.stringify({
        emotion,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // fail silently (storage quota / private mode)
  }
}

/**
 * Returns user's most recent emotion category.
 * Cached defensively to reduce Firestore reads.
 */
export function useRecentEmotion() {
  const auth = getAuth();
  const [emotion, setEmotion] = useState(null);

useEffect(() => {
  const unsub = auth.onAuthStateChanged(user => {
    if (!user) return;

    const uid = user.uid;

    async function load() {
      const q = query(
        collection(db, "users", uid, "diaries"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const snap = await getDocs(q);

      const latestEmotion = snap.empty
        ? null
        : snap.docs[0].data().category;

      setEmotion(latestEmotion);
    }

    load();
  });

  return () => unsub();
}, []);

  return emotion;
}
