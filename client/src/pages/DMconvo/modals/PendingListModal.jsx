import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";
import { acceptRelationship } from "../services/relationshipService";

import "../dm.css";

export default function PendingListModal({ onClose }) {
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;

  const [pendingList, setPendingList] = useState([]);

  useEffect(() => {
    async function loadPending() {
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", currentUid),
            where("relationshipStatus", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, snap => {
        const list = [];

        snap.docs.forEach(d => {
            const data = d.data();
            const other = data.participants.find(
            p => p !== currentUid
            );

            if (
            data.relationshipStatus === "pending" &&
            data.consent?.[currentUid] === false
            ) {
            list.push(other);
            }
        });

        setPendingList(list);
        });

        return () => unsubscribe();

    }

    loadPending();
  }, [currentUid]);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Pending Requests</h3>

        {pendingList.length === 0 && (
          <p>No pending requests.</p>
        )}

        {pendingList.map(uid => (
          <div key={uid} className="modal-item">
            <span>{uid}</span>

            <button
              onClick={() =>
                acceptRelationship(currentUid, uid)
              }
            >
              Accept
            </button>
          </div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
