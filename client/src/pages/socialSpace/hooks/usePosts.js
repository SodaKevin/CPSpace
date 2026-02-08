// socialSpace/hooks/usePosts.js

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "firebase/firestore";
import { useState } from "react";
import { db } from "../../../firebaseConfig";

const PAGE_SIZE = 5;

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInitial = async () => {
    setLoading(true);

    const q = query(
      collection(db, "posts"),
      where("moderationStatus", "in", ["Visible", "Flagged"]),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);

    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;

    const q = query(
      collection(db, "posts"),
      where("moderationStatus", "in", ["Visible", "Flagged"]),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snap = await getDocs(q);

    setPosts(prev => [
      ...prev,
      ...snap.docs.map(d => ({ id: d.id, ...d.data() }))
    ]);

    setLastDoc(snap.docs[snap.docs.length - 1]);
  };

  return { posts, loadInitial, loadMore, loading };
}
