import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { generateConversationId } from "../utils/conversationId";

export function useRelationship(currentUid, targetUid) {
  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUid || !targetUid) return;

    const conversationId = generateConversationId(currentUid, targetUid);
    const ref = doc(db, "conversations", conversationId);

    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) {
        setStatus("none");
      } else {
        setStatus(snap.data().relationshipStatus);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUid, targetUid]);

  const familiarityLevel =
    status === "consented" ? 2 : 1;

  return {
    status,
    familiarityLevel,
    isConsented: status === "consented",
    isPending: status === "pending",
    isBlocked: status === "blocked",
    canChat: status === "consented",
    loading,
  };
}
