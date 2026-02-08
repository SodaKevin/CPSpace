import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Generate random numeric discriminator (Discord-style)
 */
function generateDiscriminator() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate public friend UID (opaque, game-style)
 */
function generatePublicUid(length = 12) {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(values)
    .map((x) => charset[x % charset.length])
    .join('');
}

/**
 * Generate default pseudonym (anonymous, human-readable)
 */
function generatePseudonym() {
  const adjectives = [
    "Quiet", "Silent", "Calm", "Lost", "Gentle",
    "Hidden", "Ethereal", "Vivid", "Misty", "Lunar",
    "Cold", "Amber", "Velvet", "Swift", "Radiant"
  ];

  const nouns = [
    "Fox", "Owl", "Wolf", "Whale", "Raven",
    "Lynx", "Deer", "Ghost", "Storm", "Orbit",
    "Pulse", "Cedar", "Echo", "Siren", "Panda"
  ];

  const suffix = Math.floor(1000 + Math.random() * 9000);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}${suffix}`;
}

export async function bootstrapUser(firebaseUid) {
  const userRef = doc(db, "users", firebaseUid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const pseudonym = generatePseudonym();
    const publicUid = generatePublicUid();
    const discriminator = generateDiscriminator();

    await setDoc(userRef, {
      firebaseID: firebaseUid,
      publicUID: publicUid,
      createdAt: serverTimestamp(),

      pseudonym,

      username: {
        value: pseudonym,
        discriminator,
        lastChangedAt: serverTimestamp()
      },

      activeStatus: "active",
      roles: ["user"],

      preferences: {
        theme: "light",
        colorPalette: "default",
        chatbotTone: "default",
        autoPersonalisation: true,
        revealToFamiliarity: true,
        notifyOnConsent: true,
        enableDMRequests: true,
        contentFilters: true,
        language: "en",
        feelings: {
          added: { pos: [], neu: [], neg: [] },
          removed: { pos: [], neu: [], neg: [] }
        }
      },

      blockedUsers: []
    });
  }
}