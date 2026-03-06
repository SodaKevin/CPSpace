import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";

export default function ConversationList({ selected, onSelect }) {
  const [conversations, setConversations] = useState([]);
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUid) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid)
    );

    const unsub = onSnapshot(q, async snap => {
      const raw = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.relationshipStatus !== "blocked");

      const enriched = await Promise.all(
        raw.map(async c => {
          const other = c.participants.find(
            p => p !== currentUid
          );

          // Self safeguard (just in case)
          if (!other) {
            return { ...c, displayName: "You" };
          }

          const profileSnap = await getDoc(
            doc(db, "users", other, "publicProfile", "profile")
          );

          if (!profileSnap.exists()) {
            return { ...c, displayName: "Anonymous" };
          }

          const profile = profileSnap.data();

          let displayName = profile.pseudonym || "Anonymous";

          if (
            c.relationshipStatus === "consented" &&
            profile.username?.value &&
            profile.username?.discriminator
          ) {
            displayName =
              profile.username.value +
              "#" +
              profile.username.discriminator;
          }

          return {
            ...c,
            other,
            displayName
          };
        })
      );

      setConversations(enriched);
    });

    return () => unsub();
  }, [currentUid]);

  return (
    <div className="dm-list">
      {conversations.map(c => (
        <div
          key={c.id}
          className={`dm-list-item ${
            selected?.id === c.id ? "active" : ""
          }`}
          onClick={() => onSelect(c)}
        >
          <div className="dm-item-left">
            <div className="dm-avatar">
              {c.displayName[0]?.toUpperCase()}
            </div>

            <div className="dm-item-text">
              <div className="dm-name">
                {c.displayName}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}