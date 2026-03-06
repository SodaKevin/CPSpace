// socialSpace/hooks/useComments.js

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export function useComments(postId) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      where("moderationStatus", "in", ["Visible", "Flagged"]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, snap => {
      setComments(
        snap.docs.map(d => ({
          id: d.id,
          postId,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, [postId]);

  return comments;
}
