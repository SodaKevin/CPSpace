import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { deriveMinSeverity } from "../domain/tagSeverityMap";

// =====================
// READ (ALL)
// =====================
export async function getAllStrategies() {
  const snapshot = await getDocs(collection(db, "copingStrategies"));
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

// =====================
// READ (ONE)
// =====================
export async function getStrategyById(id) {
  const ref = doc(db, "copingStrategies", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data()
  };
}

// =====================
// CREATE
// =====================
export async function addStrategy(data) {
  const minSeverity = deriveMinSeverity(data.tags);

  await addDoc(collection(db, "copingStrategies"), {
    ...data,
    minSeverity,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// =====================
// UPDATE
// =====================
export async function updateStrategy(id, data) {
  const minSeverity = deriveMinSeverity(data.tags);

  const ref = doc(db, "copingStrategies", id);
  await updateDoc(ref, {
    ...data,
    minSeverity,
    updatedAt: new Date(),
  });
}


// =====================
// DELETE
// =====================
export async function deleteStrategy(id) {
  await deleteDoc(doc(db, "copingStrategies", id));
}