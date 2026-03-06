// socialSpace/hooks/useDisplayNames.js

/*
1) Can try to use Promise.all. for abtch load
2) Can try centralize relationship state in a global context
*/

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";

export function useDisplayNames(posts) {
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;
  const [map, setMap] = useState({});

  useEffect(() => {
    if (!currentUid || posts.length === 0) return;

    async function load() {
      // 1️⃣ Get consented users
      const convoQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", currentUid)
      );

      const convoSnap = await getDocs(convoQuery);
      const consentedSet = new Set();

      convoSnap.docs.forEach(d => {
        const data = d.data();
        const other = data.participants.find(p => p !== currentUid);

        if (data.relationshipStatus === "consented") {
          consentedSet.add(other);
        }
      });

      // 2️⃣ Collect unique authors
      const authorIds = [...new Set(posts.map(p => p.authorId))];

      const result = {};

      for (const uid of authorIds) {
        if (uid === currentUid) {
          result[uid] = "You";
          continue;
        }

        const profileSnap = await getDoc(
          doc(db, "users", uid, "publicProfile", "profile")
        );

        if (!profileSnap.exists()) {
          result[uid] = "Anonymous";
          continue;
        }

        const profile = profileSnap.data();

        // If consented → show username
        if (consentedSet.has(uid)) {
          if (
            profile.username?.value &&
            profile.username?.discriminator
          ) {
            result[uid] =
              profile.username.value +
              "#" +
              profile.username.discriminator;
            continue;
          }
        }

        // Not consented → show pseudonym
        result[uid] = profile.pseudonym || "Anonymous";
      }

      setMap(result);
    }

    load();
  }, [posts, currentUid]);

  return map;
}