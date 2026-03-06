import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";
import { unblockUser } from "../services/relationshipService";

import "../dm.css";

export default function BlockListModal({ onClose }) {
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;

  const [blockedList, setBlockedList] = useState([]);

  useEffect(() => {
    if (!currentUid) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid),
      where("relationshipStatus", "==", "blocked")
    );

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.consent?.[currentUid]) // I am blocker
        .map(c => {
          const other = c.participants.find(
            p => p !== currentUid
          );
          return {
            conversationId: c.id,
            uid: other
          };
        });

      setBlockedList(data);
    });

    return () => unsub();
  }, [currentUid]);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Blocked Users</h3>

        {blockedList.length === 0 && (
          <p>No blocked users.</p>
        )}

        {blockedList.map(user => (
          <div key={user.uid} className="modal-item">
            <span>{user.uid}</span>

            <button
              onClick={() =>
                unblockUser(currentUid, user.uid)
              }
            >
              Unblock
            </button>
          </div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}