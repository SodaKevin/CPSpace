// socialSpace/hooks/usePublicPseudonyms.js

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

/**
 * Maps userId -> public pseudonym
 * Reads ONLY publicProfile subcollection
 */
export function usePublicPseudonyms() {
  const [map, setMap] = useState({});

  useEffect(() => {
    const load = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const result = {};

      for (const userDoc of usersSnap.docs) {
        const publicSnap = await getDocs(
          collection(db, "users", userDoc.id, "publicProfile")
        );

        // assume 1 public profile doc per user
        publicSnap.forEach(p => {
          const data = p.data();
          if (data?.pseudonym) {
            result[userDoc.id] = data.pseudonym;
          }
        });
      }

      setMap(result);
    };

    load();
  }, []);

  return map;
}