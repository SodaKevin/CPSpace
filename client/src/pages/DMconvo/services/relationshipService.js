/* client/src/pages/DMconvo/services/relationshipService.js */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { generateConversationId } from "../utils/conversationId";

/* ------------------ GET RELATIONSHIP ------------------ */
export async function getRelationship(uidA, uidB) {
  const conversationId = generateConversationId(uidA, uidB);
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { exists: false, status: "none" };
  }

  return { exists: true, id: snap.id, ...snap.data() };
}

/* ------------------ REQUEST ------------------ */
export async function requestRelationship(currentUid, targetUid) {
  const conversationId = generateConversationId(currentUid, targetUid);
  const ref = doc(db, "conversations", conversationId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [currentUid, targetUid],
      relationshipStatus: "pending",
      consent: {
        [currentUid]: true,
        [targetUid]: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });
  } else {
    await updateDoc(ref, {
      relationshipStatus: "pending",
      [`consent.${currentUid}`]: true,
      [`consent.${targetUid}`]: false,
      updatedAt: serverTimestamp(),
    });
  }
}

/* ------------------ ACCEPT ------------------ */
export async function acceptRelationship(currentUid, targetUid) {
  const conversationId = generateConversationId(currentUid, targetUid);
  const ref = doc(db, "conversations", conversationId);

  await updateDoc(ref, {
    relationshipStatus: "consented",
    [`consent.${currentUid}`]: true,
    updatedAt: serverTimestamp(),
  });
}

/* ------------------ REVOKE ------------------ */
export async function revokeRelationship(currentUid, targetUid) {
  const conversationId = generateConversationId(currentUid, targetUid);
  const ref = doc(db, "conversations", conversationId);

  await updateDoc(ref, {
    relationshipStatus: "revoked",
    [`consent.${currentUid}`]: false,
    [`consent.${targetUid}`]: false,
    updatedAt: serverTimestamp(),
  });
}

/* ------------------ BLOCK ------------------ */
export async function blockUser(currentUid, targetUid) {
  const conversationId = generateConversationId(currentUid, targetUid);
  const convoRef = doc(db, "conversations", conversationId);

  await updateDoc(convoRef, {
    relationshipStatus: "blocked",
    [`consent.${currentUid}`]: true,   // blocker
    [`consent.${targetUid}`]: false,   // blocked user
    updatedAt: serverTimestamp(),
  });
}

/* ------------------ UNBLOCK ------------------ */
export async function unblockUser(currentUid, targetUid) {
  const conversationId = generateConversationId(currentUid, targetUid);
  const convoRef = doc(db, "conversations", conversationId);

  const snap = await getDoc(convoRef);
  if (!snap.exists()) return;

  const data = snap.data();

  // Only the blocker can unblock
  if (!data.consent?.[currentUid]) {
    console.warn("Only blocker can unblock");
    return;
  }

  await updateDoc(convoRef, {
    relationshipStatus: "revoked",
    [`consent.${currentUid}`]: false,
    [`consent.${targetUid}`]: false,
    updatedAt: serverTimestamp(),
  });
}
