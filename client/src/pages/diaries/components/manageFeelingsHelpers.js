import { getAuth } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export const CATEGORIES = ["pos", "neu", "neg"];
export const TAB_LABELS = {
  pos: "Pleasant",
  neu: "Neutral",
  neg: "Unpleasant",
};
export const MAX_CUSTOM_PER_CATEGORY = 5;
export const MAX_FEELING_LENGTH = 20;
const EMOJI_REGEX = /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;

export const EMPTY_FEELINGS = {
  pos: [],
  neu: [],
  neg: [],
};

function toTitleCase(value) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeForCompare(value) {
  return value.trim().toLowerCase();
}

export function sanitizeFeelingInput(value) {
  return toTitleCase(value ?? "");
}

export function validateFeeling({
  rawValue,
  category,
  defaultFeelings,
  addedFeelings,
  editingOldValue,
}) {
  const sanitized = sanitizeFeelingInput(rawValue);
  const normalized = normalizeForCompare(sanitized);

  if (!sanitized) {
    return { valid: false, message: "Feeling cannot be empty." };
  }

  if (sanitized.length > MAX_FEELING_LENGTH) {
    return {
      valid: false,
      message: `Feeling must be ${MAX_FEELING_LENGTH} characters or fewer.`,
    };
  }

  if (EMOJI_REGEX.test(sanitized)) {
    return { valid: false, message: "Emoji are not allowed." };
  }

  const oldNormalized = editingOldValue
    ? normalizeForCompare(editingOldValue)
    : null;

  const duplicateInDefaults = (defaultFeelings[category] ?? []).some(
    (feeling) => normalizeForCompare(feeling) === normalized
  );

  const duplicateInAdded = (addedFeelings[category] ?? []).some((feeling) => {
    const candidate = normalizeForCompare(feeling);
    if (oldNormalized && candidate === oldNormalized) return false;
    return candidate === normalized;
  });

  if (duplicateInDefaults || duplicateInAdded) {
    return { valid: false, message: "Duplicate feeling is not allowed." };
  }

  return { valid: true, sanitized };
}

export async function addFeeling({ uid, category, value, defaultFeelings, addedFeelings }) {
  if (!CATEGORIES.includes(category)) {
    throw new Error("Invalid feeling category.");
  }

  if ((addedFeelings[category] ?? []).length >= MAX_CUSTOM_PER_CATEGORY) {
    throw new Error(`Maximum ${MAX_CUSTOM_PER_CATEGORY} custom feelings reached.`);
  }

  const validation = validateFeeling({
    rawValue: value,
    category,
    defaultFeelings,
    addedFeelings,
  });

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  await updateDoc(doc(db, "users", uid), {
    [`preferences.feelings.added.${category}`]: arrayUnion(validation.sanitized),
  });

  return validation.sanitized;
}

export async function editFeeling({
  uid,
  category,
  oldValue,
  newValue,
  defaultFeelings,
  addedFeelings,
}) {
  if (!CATEGORIES.includes(category)) {
    throw new Error("Invalid feeling category.");
  }

  const existing = addedFeelings[category] ?? [];
  if (!existing.includes(oldValue)) {
    throw new Error("Only custom feelings can be edited.");
  }

  const validation = validateFeeling({
    rawValue: newValue,
    category,
    defaultFeelings,
    addedFeelings,
    editingOldValue: oldValue,
  });

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  await updateDoc(doc(db, "users", uid), {
    [`preferences.feelings.added.${category}`]: arrayRemove(oldValue),
  });

  await updateDoc(doc(db, "users", uid), {
    [`preferences.feelings.added.${category}`]: arrayUnion(validation.sanitized),
  });

  return validation.sanitized;
}

export async function deleteFeeling({ uid, category, value }) {
  if (!CATEGORIES.includes(category)) {
    throw new Error("Invalid feeling category.");
  }

  await updateDoc(doc(db, "users", uid), {
    [`preferences.feelings.added.${category}`]: arrayRemove(value),
  });
}

export async function hideDefaultFeeling({ uid, category, value }) {
  if (!CATEGORIES.includes(category)) {
    throw new Error("Invalid feeling category.");
  }

  await updateDoc(doc(db, "users", uid), {
    [`preferences.feelings.removed.${category}`]: arrayUnion(value),
  });
}

export async function restoreDefaultFeeling({ uid, category, value }) {
  await updateDoc(doc(db, "users", uid), {
    [`preferences.feelings.removed.${category}`]: arrayRemove(value),
  });
}

export async function restoreAllFeelings(uid) {
  await updateDoc(doc(db, "users", uid), {
    "preferences.feelings.added": { ...EMPTY_FEELINGS },
    "preferences.feelings.removed": { ...EMPTY_FEELINGS },
  });
}

export async function fetchFeelingsData(uid) {
  const [defaultSnap, userSnap] = await Promise.all([
    getDoc(doc(db, "defaultFeelings", "default")),
    getDoc(doc(db, "users", uid)),
  ]);

  const fetchedDefaults = defaultSnap.exists()
    ? {
        pos: defaultSnap.data().pos ?? [],
        neu: defaultSnap.data().neu ?? [],
        neg: defaultSnap.data().neg ?? [],
      }
    : EMPTY_FEELINGS;

  const preferenceFeelings = userSnap.exists()
    ? userSnap.data()?.preferences?.feelings
    : null;

  return {
    defaultFeelings: fetchedDefaults,
    addedFeelings: {
      pos: preferenceFeelings?.added?.pos ?? [],
      neu: preferenceFeelings?.added?.neu ?? [],
      neg: preferenceFeelings?.added?.neg ?? [],
    },
    removedFeelings: {
      pos: preferenceFeelings?.removed?.pos ?? [],
      neu: preferenceFeelings?.removed?.neu ?? [],
      neg: preferenceFeelings?.removed?.neg ?? [],
    },
  };
}

export function getCurrentUid() {
  return getAuth().currentUser?.uid;
}
