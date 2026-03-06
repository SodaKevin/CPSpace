import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../firebase/serviceAccountKey.json"),
    "utf8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const { FieldValue } = admin.firestore;

const TAGS = [
  "BREATHING",
  "RELAXATION",
  "JOURNALING",
  "SELF_REFLECTION",
  "GROUNDING",
  "DISTRACTION",
  "SLEEP",
  "AFFIRMATION",
  "MOTIVATION",
  "PHYSICAL",
  "THERAPY",
  "GRATITUDE",
];

const TAG_MIN_SEVERITY = {
  BREATHING: "NONE",
  RELAXATION: "MILD",
  SLEEP: "NONE",
  GRATITUDE: "NONE",
  AFFIRMATION: "NONE",

  MOTIVATION: "MILD",
  PHYSICAL: "MILD",

  JOURNALING: "MODERATE",
  SELF_REFLECTION: "MODERATE",
  GROUNDING: "MODERATE",

  THERAPY: "SEVERE",
};

const SEVERITY_ORDER = [
  "NONE",
  "MILD",
  "MODERATE",
  "MODERATELY SEVERE",
  "SEVERE",
];

function deriveMinSeverity(tags = []) {
  let highest = "NONE";

  for (const tag of tags) {
    const tagSeverity = TAG_MIN_SEVERITY[tag];
    if (
      tagSeverity &&
      SEVERITY_ORDER.indexOf(tagSeverity) >
        SEVERITY_ORDER.indexOf(highest)
    ) {
      highest = tagSeverity;
    }
  }

  return highest;
}

function makeStrategy({
  id,
  title,
  author,
  tags,
  description,
}) {
  return {
    id,
    title,
    author,
    tags,
    minSeverity: deriveMinSeverity(tags), // ✅ IMPORTANT
    description,
    instructions: "Follow the steps mindfully at your own pace.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

/* node scripts/seed.js */

async function main() {
  /*Users Entires, 6 entries*/
  await db.collection("users").doc("user00001").set({
    firebaseID: "user00001", // for linking and handling purpose
    createdAt: FieldValue.serverTimestamp(),
    activeStatus: "active", // default is active
    roles: ["admin"], // default is user, it is either user or admin but sign in is as user only
    preferences: {
      theme: "light", 
      colorPalette: "default", // default is default
      chatbotTone: "default", // default is default
      autoPersonalisation: true, // default is true
      revealToFamiliarity: true, // default is true
      notifyOnConsent: true, // default is true
      enableDMRequests: true, // default is true
      contentFilters: true, // default is true
      language: "en", // default is en
      feelings: {
        added: { pos: [], neu: [], neg: [] },
        removed: { pos: [], neu: [], neg: [] }
      } // default is empty
    },
  });

  await db.collection("users").doc("user00002").set({
    firebaseID: "user00002",
    createdAt: FieldValue.serverTimestamp(),
    activeStatus: "active",
    roles: ["admin"],
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
  });

  await db.collection("users").doc("user00003").set({
    firebaseID: "user00003",
    createdAt: FieldValue.serverTimestamp(),
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
  });

  await db.collection("users").doc("user00004").set({
    firebaseID: "user00004",
    createdAt: FieldValue.serverTimestamp(), 
    activeStatus: "active",
    roles: ["user"],
    preferences: {
      theme: "dark",
      colorPalette: "default",
      chatbotTone: "default",
      autoPersonalisation: false,
      revealToFamiliarity: false,
      notifyOnConsent: false,
      enableDMRequests: false,
      contentFilters: false,
      language: "en",
      feelings: {
        added: { pos: [], neu: [], neg: [] },
        removed: { pos: [], neu: [], neg: [] }
      }
    },
  });

  await db.collection("users").doc("user00005").set({
    firebaseID: "user00005",
    createdAt: FieldValue.serverTimestamp(),
    activeStatus: "active",
    roles: ["user"],
    preferences: {
      theme: "light",
      colorPalette: "default",
      chatbotTone: "default",
      autoPersonalisation: true,
      revealToFamiliarity: false,
      notifyOnConsent: true,
      enableDMRequests: false,
      contentFilters: true,
      language: "en",
      feelings: {
        added: { pos: [], neu: [], neg: [] },
        removed: { pos: [], neu: [], neg: [] }
      }
    },
  });

  await db.collection("users").doc("user00006").set({
    firebaseID: "user00006",
    createdAt: FieldValue.serverTimestamp(),
    activeStatus: "active",
    roles: ["user"],
    preferences: {
      theme: "light",
      colorPalette: "default",
      chatbotTone: "default",
      autoPersonalisation: false,
      revealToFamiliarity: true,
      notifyOnConsent: false,
      enableDMRequests: true,
      contentFilters: false,
      language: "en",
      feelings: {
        added: { pos: [], neu: [], neg: [] },
        removed: { pos: [], neu: [], neg: [] }
      }
    },
  });
console.log("Users seeded");


  /*Default Feelings Entires, 1 entries only*/
  await db.collection("defaultFeelings").doc("default").set({
    pos: [
      "Amazed",
      "Excited",
      "Joyful",
      "Proud",
      "Hopeful",
      "Relieved",
      "Grateful"
    ],
    neu: [
      "Indifferent",
      "Peaceful",
      "Calm",
      "Content"
    ],
    neg: [
      "Lonely",
      "Angry",
      "Anxious",
      "Afraid",
      "Disgusted",
      "Annoyed",
      "Guilty",
      "Hopeless",
      "Drained"
    ],
    version: 1,
    updatedAt: FieldValue.serverTimestamp()
  });
console.log("Default Feelings seeded");


  /*Users's Public Data Entires, 6 entries*/
  await db
    .collection("users")
    .doc("user00001")
    .collection("publicProfile")
    .doc("profile")
    .set({
      publicUID: "user00001",
      pseudonym: "FirebaseIsLit55",
      username: {
        value: "BrianChen",
        discriminator: "4821",
      }
    });

  await db
    .collection("users")
    .doc("user00002")
    .collection("publicProfile")
    .doc("profile")
    .set({
      publicUID: "user00002",
      pseudonym: "dunkMeme1231",
      username: {
        value: "KevinNg",
        discriminator: "4206",
      }
    });

  await db
    .collection("users")
    .doc("user00003")
    .collection("publicProfile")
    .doc("profile")
    .set({
      publicUID: "user00003",
      pseudonym: "youngBoyIsBroke",
      username: {
        value: "SaraGoh",
        discriminator: "7852",
      }
    });

  await db
    .collection("users")
    .doc("user00004")
    .collection("publicProfile")
    .doc("profile")
    .set({
      publicUID: "user00004",
      pseudonym: "weRtheBest",
      username: {
        value: "MuthuSami",
        discriminator: "5107",
      }
    });

  await db
    .collection("users")
    .doc("user00005")
    .collection("publicProfile")
    .doc("profile")
    .set({
      publicUID: "user00005",
      pseudonym: "work_King",
      username: {
        value: "Kamilah",
        discriminator: "1448",
      }
    });

  await db
    .collection("users")
    .doc("user00006")
    .collection("publicProfile")
    .doc("profile")
    .set({
      publicUID: "user00006",
      pseudonym: "hyer22",
      username: {
        value: "Jamima",
        discriminator: "9666",
      }
    });
console.log("Public Profile seeded");



  /*Users's Diaries Entires, 10 entries*/
  await db
    .collection("users")
    .doc("user00001")
    .collection("diaries")
    .add({
      authorId: "user00003",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "unpleasant",
      feelings: ["Lonely"],
      body: "Felt mentally exhausted today."
    });

  await db
    .collection("users")
    .doc("user00002")
    .collection("diaries")
    .add({
      authorId: "user00003",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "pleasant",
      feelings: ["Relieved", "Grateful"],
      body: "Things improved after talking to someone."
    });

  await db
    .collection("users")
    .doc("user00003")
    .collection("diaries")
    .add({
      authorId: "user00004",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "unpleasant",
      feelings: ["Drained", "Anxious"],
      body: "Spent hours debugging a memory leak in the backend. Feeling like I'm running in circles today."
    });

  await db
    .collection("users")
    .doc("user00004")
    .collection("diaries")
    .add({
      authorId: "user00004",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "pleasant",
      feelings: ["Proud", "Relieved"],
      body: "Finally hit my 3.75 GPA goal for the semester. The hard work is starting to pay off."
    });

  await db
    .collection("users")
    .doc("user00004")
    .collection("diaries")
    .add({
      authorId: "user00004",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "neutral",
      feelings: ["Calm", "Peaceful"],
      body: "Took a walk after dinner without my phone. It was nice to just exist without notifications for a while."
    });

      /*Users's Diaries Entires, 6 -- 10 entries*/
  await db
    .collection("users")
    .doc("user00005")
    .collection("diaries")
    .add({
      authorId: "user00005",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "pleasant",
      feelings: ["Joyful", "Grateful"],
      body: "Had a great dinner with the family today. It's rare that we all get to sit down together without someone being busy."
    });

  await db
    .collection("users")
    .doc("user00006")
    .collection("diaries")
    .add({
      authorId: "user00006",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "unpleasant",
      feelings: ["Anxious", "Hopeless"],
      body: "Checking my expenses for the month and realizing I overspent on dining out. Need to be more disciplined with my budget."
    });

  await db
    .collection("users")
    .doc("user00006")
    .collection("diaries")
    .add({
      authorId: "user00006",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "neutral",
      feelings: ["Indifferent", "Content"],
      body: "Just finished some basic housekeeping and car maintenance. Nothing exciting, but it feels good to have a clear to-do list."
    });

  await db
    .collection("users")
    .doc("user00001")
    .collection("diaries")
    .add({
      authorId: "user00006",
      createdAt: FieldValue.serverTimestamp(),
      emotionCategory: "unpleasant",
      feelings: ["Annoyed", "Guilty"],
      body: "Staring at a blank VS Code window for two hours. I know what I need to build, but I just can't find the motivation to start the first line."
    });
console.log("Diaries seeded");

  /*Users's Assessment*/
  await db
  .collection("users")
  .doc("user00001")
  .collection("assessments")
  .add({
    type: "PHQ-9",
    score: 6,
    severity: "Mild",
    createdAt: FieldValue.serverTimestamp()
  });

  await db
    .collection("users")
    .doc("user00001")
    .collection("assessments")
    .add({
      type: "GAD-7",
      score: 4,
      severity: "Minimal",
      createdAt: FieldValue.serverTimestamp()
    });

  await db
    .collection("users")
    .doc("user00002")
    .collection("assessments")
    .add({
      type: "PHQ-9",
      score: 14,
      severity: "Moderate",
      createdAt: FieldValue.serverTimestamp()
    });

  await db
    .collection("users")
    .doc("user00003")
    .collection("assessments")
    .add({
      type: "GAD-7",
      score: 16,
      severity: "Severe",
      createdAt: FieldValue.serverTimestamp()
    });

  await db
    .collection("users")
    .doc("user00003")
    .collection("assessments")
    .add({
      type: "PHQ-9",
      score: 18,
      severity: "Moderately Severe",
      createdAt: FieldValue.serverTimestamp()
    });
console.log("Assessments seeded");





  /*Posts Entires, 82 entries*/
  const postRef1 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Some days just feel heavier than others.",
    emotionCategory: "unpleasant",
    feelings: ["Hopeless"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef2 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Trying to focus on small positive moments.",
    emotionCategory: "pleasant",
    feelings: ["Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 1 }
  });

  const postRef3 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Finally understood the recursive logic for that tree algorithm. My brain is fried but it's a good kind of tired.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 2 }
  });

  const postRef4 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Rainy afternoon in KL. Just watching the traffic and sipping on some coffee. No plans, no stress.",
    emotionCategory: "neutral",
    feelings: ["Peaceful", "Calm"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef5 = await db.collection("posts").add({
    authorId: "user00005",
    body: "The project deadline is creeping up and I'm still stuck on the CSS layout. Why is centering a div so hard?",
    emotionCategory: "unpleasant",
    feelings: ["Annoyed", "Drained"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef6 = await db.collection("posts").add({
    authorId: "user00006",
    body: "I hate the one who is selling sausage, he is just a seller but he is making a scene. He should just die.",
    emotionCategory: "unpleasant",
    feelings: ["Disgusted"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Hidden",
    stats: { up: 0, down: 0 }
  });

  const postRef7 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Why the hell everyone is hanging out with him, he is just an idiot.",
    emotionCategory: "unpleasant",
    feelings: ["Lonely", "Hopeless"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Flagged",
    stats: { up: 5, down: 0 }
  });

  const postRef8 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Just spent way too much on a new mechanical keyboard. It sounds great, but my wallet is definitely feeling the hit.",
    emotionCategory: "neutral",
    feelings: ["Indifferent", "Content"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 } 
  });

  const postRef9 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Looking at everyone's LinkedIn updates and feeling like I'm lagging behind. Hard to stay focused when you're comparing your 'behind-the-scenes' to their 'highlight reel'.",
    emotionCategory: "unpleasant",
    feelings: ["Anxious", "Lonely"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 } 
  });

  const postRef10 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Finally cleared my backlog of Jira tickets. There is no better feeling than seeing a completely empty 'To Do' column.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 6, down: 0 } 
  });

  const postRef11 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Tried to explain my FYP project to my non-tech friends and they just stared at me blankly. It's frustrating when you can't share your excitement.",
    emotionCategory: "unpleasant",
    feelings: ["Annoyed", "Lonely"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Flagged",
    stats: { up: 5, down: 0 } 
  });

  const postRef12 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Found a roadside stall that sells the best Nasi Lemak I've had in years. Sometimes the simplest things make the best days.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Content"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 } 
  }); 

  const postRef13 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Finally pushed my first open-source contribution today. It was just a documentation fix, but seeing my name on the repo feels amazing!",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Amazed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef14 = await db.collection("posts").add({
    authorId: "user00005",
    body: "The library is absolutely packed today. I've been walking around for 20 minutes and still can't find a seat with a power outlet.",
    emotionCategory: "unpleasant",
    feelings: ["Annoyed", "Drained"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef15 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Just finished a long coding session. Sitting on the balcony now, listening to the rain. Doing absolutely nothing for a while.",
    emotionCategory: "neutral",
    feelings: ["Peaceful", "Calm"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef16 = await db.collection("posts").add({
    authorId: "user00006",
    body: "My laptop screen just went black in the middle of a build. I haven't backed up my recent changes to GitHub. I'm actually shaking right now.",
    emotionCategory: "unpleasant",
    feelings: ["Afraid", "Anxious"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef17 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Passed the technical interview! I honestly thought I messed up the live coding part, but the recruiter just called with an offer.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Excited"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef18 = await db.collection("posts").add({
    authorId: "user00004",
    body: "The sunset over the twin towers tonight was breathtaking. Reminds me why I love living in this city despite the heat.",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef19 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Just another Tuesday. Coffee is decent, the code is compiling, and I'm just cruising through my tasks.",
    emotionCategory: "neutral",
    feelings: ["Indifferent", "Content"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 1 }
  });

  const postRef20 = await db.collection("posts").add({
    authorId: "user00001",
    body: "I forgot to save my progress before my VM crashed. Three hours of debugging down the drain. I want to throw my monitor out the window.",
    emotionCategory: "unpleasant",
    feelings: ["Angry", "Annoyed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef21 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Finally submitted my thesis proposal. I feel like a massive weight has been lifted off my shoulders. Time to sleep for 12 hours.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef22 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Sitting in the canteen alone again. It's weird how you can be surrounded by hundreds of people and still feel completely invisible.",
    emotionCategory: "unpleasant",
    feelings: ["Lonely", "Hopeless"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef23 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Found a bug in a library I've been using for months. Turns out it wasn't my logic that was flawed after all. What a massive weight off my mind!",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef24 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Watching the Grab drivers navigate the flash flood outside. Just another chaotic evening in the city while I'm safe indoors.",
    emotionCategory: "neutral",
    feelings: ["Calm", "Indifferent"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 1 }
  });

  const postRef25 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Group project members are MIA again. Deadline is in 48 hours and I'm the only one committing code. This happens every single semester.",
    emotionCategory: "unpleasant",
    feelings: ["Angry", "Drained"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef26 = await db.collection("posts").add({
    authorId: "user00002",
    body: "The prompt for the hackathon just dropped and the ideas are already flowing. I can't wait to start building this weekend!",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 0 }
  });

  const postRef27 = await db.collection("posts").add({
    authorId: "user00006",
    body: "I’ve been staring at this LeetCode 'Hard' problem for two hours. I feel like I’ve learned nothing in the last three years of my degree.",
    emotionCategory: "unpleasant",
    feelings: ["Anxious", "Guilty"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 1, down: 5 }
  });

  const postRef28 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Finally hit my 100-day streak on LeetCode. It’s a small win, but it makes the job hunt feel a little less daunting.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef29 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Checking the LRT schedule and realizing I just missed the train by 10 seconds. Now I'm just standing here staring at the tracks.",
    emotionCategory: "neutral",
    feelings: ["Indifferent", "Calm"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 1, down: 1 }
  });

  const postRef30 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Spent all morning refactoring a legacy module only to realize I've introduced three new race conditions. My head is spinning.",
    emotionCategory: "unpleasant",
    feelings: ["Drained", "Annoyed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 2 }
  });

  const postRef31 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Got an unexpected 'A' for my OS assignment. I was so sure I'd messed up the process synchronization part!",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef32 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Looking at the rain outside the TARUMT library. It’s peaceful, but the cold is starting to make me feel a bit isolated.",
    emotionCategory: "unpleasant",
    feelings: ["Lonely", "Anxious"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 1 }
  });

  const postRef33 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Just finished a 4-hour lecture. Walking to the bus stop now. My mind is completely blank, just vibing with the evening breeze.",
    emotionCategory: "neutral",
    feelings: ["Content", "Calm"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 0 }
  });

  const postRef34 = await db.collection("posts").add({
    authorId: "user00003",
    body: "I finally got my Flutter environment set up without any CocoaPods errors! I've been fighting this for two days straight.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Excited"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef35 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Tried a new Spicy Pan Mee place near campus. It was way too hot and now I'm just sitting here regretting my life choices.",
    emotionCategory: "unpleasant",
    feelings: ["Disgusted", "Annoyed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef36 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Applied to 20 internships today. The radio silence from recruiters is starting to get to me. Is my portfolio even good enough?",
    emotionCategory: "unpleasant",
    feelings: ["Anxious", "Lonely"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 2 }
  });

  const postRef37 = await db.collection("posts").add({
    authorId: "user00002",
    body: "The project demo went perfectly. The lecturer actually smiled and said our UI/UX was 'impressive'. I'm on cloud nine!",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef38 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Finally figured out how to use Docker volumes correctly. No more losing my database data every time I restart the container!",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef39 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Standing in line for the campus shuttle. It's late again, but the weather is actually quite nice today, so I don't really mind.",
    emotionCategory: "neutral",
    feelings: ["Peaceful", "Indifferent"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 1 }
  });

  const postRef40 = await db.collection("posts").add({
    authorId: "user00001",
    body: "I’ve been stuck on this recursion problem for five hours. I feel like my logic is just circling the drain at this point.",
    emotionCategory: "unpleasant",
    feelings: ["Drained", "Annoyed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 1, down: 3 }
  });

  const postRef41 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Someone stole my umbrella from the library entrance. Now I have to walk back to the hostel in the pouring rain. People can be so selfish.",
    emotionCategory: "unpleasant",
    feelings: ["Angry", "Disgusted"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  // 42 ++ all are pleasant (40 are pleasant)
  const postRef42 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Just saw the preview for the upcoming tech symposium at TARUMT. Some really cool speakers are coming. Definitely feeling inspired.",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef43 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Finally understood how to implement the Observer pattern in my project. It’s like a lightbulb just went off in my head!",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Amazed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef44 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Found a hidden gem of a cafe near the Wangsa Maju LRT. The quiet atmosphere and good coffee are exactly what I needed to focus.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef45 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Just got the confirmation that our team made it to the finals of the inter-varsity hackathon! Let's go!",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef46 = await db.collection("posts").add({
    authorId: "user00004",
    body: "The new documentation I wrote for the club's repo actually helped a junior fix their first bug. Seeing them succeed feels great.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef47 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Managed to optimize a query that was taking 10 seconds down to 200ms. I feel like a wizard right now.",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 1 }
  });

  const postRef48 = await db.collection("posts").add({
    authorId: "user00006",
    body: "The rain stopped just in time for my walk home. The air is so fresh and the sky looks incredible.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 0 }
  });

  const postRef49 = await db.collection("posts").add({
    authorId: "user00001",
    body: "The feedback from my supervisor on my FYP draft was surprisingly positive. I was so worried, but now I feel I can actually finish this.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef50 = await db.collection("posts").add({
    authorId: "user00002",
    body: "My mechanical keyboard finally arrived! The typing experience is a whole new level of satisfaction.",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef51 = await db.collection("posts").add({
    authorId: "user00003",
    body: "A total stranger helped me find my lost student ID at the block C entrance. There's still so much kindness in the world.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Amazed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef52 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Starting a new personal project using the latest tech stack. The potential of what I can build is making me really look forward to the weekend.",
    emotionCategory: "pleasant",
    feelings: ["Hopeful", "Excited"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef53 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Finally hit 100% test coverage on my latest module. No more anxiety about edge cases breaking the production build!",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef54 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Watching the sunrise from the rooftop after an all-night hackathon. We actually built something functional from scratch!",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef55 = await db.collection("posts").add({
    authorId: "user00006",
    body: "A junior student reached out to thank me for my explanation on Data Structures. It feels great to know I made their learning easier.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef56 = await db.collection("posts").add({
    authorId: "user00002",
    body: "The new framework update fixed that annoying bug that's been bothering me for weeks. It’s a good day to be a developer.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef57 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Just saw a stray cat on campus and it actually let me pet it. Best 5 minutes of my entire week.",
    emotionCategory: "pleasant",
    feelings: ["Joyful", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef58 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Finally secured an interview with that top tech firm in Mid Valley. This is the opportunity I've been waiting for.",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef59 = await db.collection("posts").add({
    authorId: "user00001",
    body: "I actually won the lucky draw at the CS society event. New noise-canceling headphones, here I come!",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Excited"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef60 = await db.collection("posts").add({
    authorId: "user00005",
    body: "That satisfying feeling when your code runs on the first try after a major refactor. Absolute bliss.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef61 = await db.collection("posts").add({
    authorId: "user00002",
    body: "The group discussion today was actually productive. Everyone contributed and we're way ahead of the project timeline.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef62 = await db.collection("posts").add({
    authorId: "user00006",
    body: "The library air conditioning is finally fixed. Studying for finals just became 100% more bearable.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 0 }
  });

  const postRef63 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Finally submitted the final version of my mobile app to the Play Store. Seeing that 'Review in progress' status is the best feeling ever.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef64 = await db.collection("posts").add({
    authorId: "user00001",
    body: "The sunset over the TARUMT sports complex was absolutely stunning today. Really makes you appreciate the little things.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Amazed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef65 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Got a surprise high distinction for my Discrete Math paper! I was so sure I flunked the logic section.",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef66 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Just secured a ticket for the tech conference in Mid Valley. Can't wait to meet some industry experts!",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef67 = await db.collection("posts").add({
    authorId: "user00004",
    body: "My mentor gave me a shoutout during the stand-up meeting for the way I handled the API integration. Feeling validated.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef68 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Managed to finish all my assignments for the week by Thursday night. Three-day weekend, here I come!",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef69 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Just had an amazing deep-dive conversation about AI ethics with some friends. It's so refreshing to share ideas like this.",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef70 = await db.collection("posts").add({
    authorId: "user00003",
    body: "The gym was empty this morning. Had a perfect workout session and now I'm feeling super energized for my 10 AM class.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 0 }
  });

  const postRef71 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Found a really helpful open-source library that solves exactly the problem I was having. Massive shoutout to the contributors!",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Amazed"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef72 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Successfully cooked a meal for my housemates tonight and they actually liked it! It’s nice to take a break from coding.",
    emotionCategory: "pleasant",
    feelings: ["Joyful", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef73 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Just saw the results for the Google Cloud Certification. I passed! All those late nights in the library finally paid off.",
    emotionCategory: "pleasant",
    feelings: ["Proud", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef74 = await db.collection("posts").add({
    authorId: "user00002",
    body: "The campus orientation for the new intake was so lively today. Seeing all the fresh faces makes me so hopeful for the new semester.",
    emotionCategory: "pleasant",
    feelings: ["Hopeful", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef75 = await db.collection("posts").add({
    authorId: "user00001",
    body: "I finally automated my morning routine with a Python script and a Raspberry Pi. It's a small thing, but it feels like magic.",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 1 }
  });

  const postRef76 = await db.collection("posts").add({
    authorId: "user00005",
    body: "Got picked for a fully-funded internship program in Singapore! I can't wait to see what the international tech scene is like.",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef77 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Managed to finish my entire FYP documentation today. I can finally enjoy a stress-free weekend without any looming deadlines.",
    emotionCategory: "pleasant",
    feelings: ["Relieved", "Joyful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef78 = await db.collection("posts").add({
    authorId: "user00006",
    body: "Shared some of my old notes with a first-year student today and they were so thankful. It's nice to give back to the community.",
    emotionCategory: "pleasant",
    feelings: ["Grateful", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
  });

  const postRef79 = await db.collection("posts").add({
    authorId: "user00001",
    body: "The project I've been working on just hit 500 stars on GitHub! I never expected this much support from the dev community.",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Hopeful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });

  const postRef80 = await db.collection("posts").add({
    authorId: "user00004",
    body: "Finally bought that ergonomic chair I've been eyeing. My back is already thanking me. No more coding-induced posture pain!",
    emotionCategory: "pleasant",
    feelings: ["Joyful", "Relieved"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 2, down: 0 }
  });

  const postRef81 = await db.collection("posts").add({
    authorId: "user00002",
    body: "Had a great brainstorming session with the team at the canteen. We've finally nailed down the system architecture for our project.",
    emotionCategory: "pleasant",
    feelings: ["Excited", "Proud"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 4, down: 0 }
  });

  const postRef82 = await db.collection("posts").add({
    authorId: "user00003",
    body: "Found an old hard drive with some of my very first HTML/CSS projects. It’s amazing to see how far I've come since then.",
    emotionCategory: "pleasant",
    feelings: ["Amazed", "Grateful"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 5, down: 0 }
  });
console.log("Posts seeded");


  /*Comments Entires, 30 entries*/
  await db
    .collection("posts")
    .doc(postRef1.id)
    .collection("comments")
    .add({
      authorId: "user00002",
      body: "You’re not alone. I relate to this.",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      moderationStatus: "Visible"
    });

  await db
    .collection("posts")
    .doc(postRef1.id)
    .collection("comments")
    .add({
      authorId: "user00001",
      body: "Thanks for understanding.",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      moderationStatus: "Visible"
    });

  // Comment 3: on Post 2
  await db.collection("posts").doc(postRef2.id).collection("comments").add({
    authorId: "user00003",
    body: "This is exactly what I needed to hear today. Perspective is everything.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 4: on Post 3
  await db.collection("posts").doc(postRef3.id).collection("comments").add({
    authorId: "user00004",
    body: "Recursion is a nightmare until it finally 'clicks'. Congrats on the breakthrough!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 5: on Post 4
  await db.collection("posts").doc(postRef4.id).collection("comments").add({
    authorId: "user00005",
    body: "KL rain is the best for productivity, as long as you don't have to drive in it!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 6: on Post 5
  await db.collection("posts").doc(postRef5.id).collection("comments").add({
    authorId: "user00001",
    body: "Try using Flexbox instead of the old school margins. `place-items: center` is a lifesaver.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 7: on Post 8
  await db.collection("posts").doc(postRef8.id).collection("comments").add({
    authorId: "user00006",
    body: "Which switches did you get? Linear or Tactile? I'm looking for a new board too.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 8: on Post 9
  await db.collection("posts").doc(postRef9.id).collection("comments").add({
    authorId: "user00002",
    body: "Comparison is the thief of joy. Take a break from social media for a few days.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 9: on Post 10
  await db.collection("posts").doc(postRef10.id).collection("comments").add({
    authorId: "user00003",
    body: "Zero inbox/Zero Jira is the ultimate developer high. Enjoy the peace while it lasts!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 10: on Post 12
  await db.collection("posts").doc(postRef12.id).collection("comments").add({
    authorId: "user00004",
    body: "Drop the location! I'm always looking for good Nasi Lemak around here.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 11: on Post 1
  await db.collection("posts").doc(postRef1.id).collection("comments").add({
    authorId: "user00005",
    body: "Consistency is key. Even if it's just one line of code, keep going.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 12: on Post 2
  await db.collection("posts").doc(postRef2.id).collection("comments").add({
    authorId: "user00006",
    body: "I had a similar experience last week. It gets better with time, trust me.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 13: on Post 3
  await db.collection("posts").doc(postRef3.id).collection("comments").add({
    authorId: "user00002",
    body: "Can you share the resource you used for tree algorithms? I'm struggling with them too.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 14: on Post 8
  await db.collection("posts").doc(postRef8.id).collection("comments").add({
    authorId: "user00001",
    body: "Custom keycaps are the next rabbit hole. Good luck to your bank account!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 15: on Post 10
  await db.collection("posts").doc(postRef10.id).collection("comments").add({
    authorId: "user00005",
    body: "The feeling of a clean board is unmatched. Time for a well-deserved break.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 16: on Post 12
  await db.collection("posts").doc(postRef12.id).collection("comments").add({
    authorId: "user00003",
    body: "Is that the stall near the LRT station? I think I've been there!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 17: on Post 4
  await db.collection("posts").doc(postRef4.id).collection("comments").add({
    authorId: "user00002",
    body: "The atmosphere of a quiet cafe during the rain is pure bliss.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 18: on Post 9
  await db.collection("posts").doc(postRef9.id).collection("comments").add({
    authorId: "user00004",
    body: "Focus on your own pace. Everyone's journey is different.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 19: on Post 1 
  await db.collection("posts").doc(postRef1.id).collection("comments").add({
    authorId: "user00006",
    body: "Stop whining like a little b*tch and just get the job done. This site is for pros.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Flagged" 
  });

  // Comment 20: on Post 5 
  await db.collection("posts").doc(postRef5.id).collection("comments").add({
    authorId: "user00006",
    body: "You are a f***ing idiot if you can't center a div. Go k*ll yourself and quit coding, you useless piece of sh*t.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Hidden" 
  });

  // Comment 21: on Post 10
  await db.collection("posts").doc(postRef10.id).collection("comments").add({
    authorId: "user00001",
    body: "Wait, did you use a script to clear those tickets or was it all manual? That's impressive speed.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 22: on Post 12
  await db.collection("posts").doc(postRef12.id).collection("comments").add({
    authorId: "user00005",
    body: "Agreed. Good food is the ultimate productivity hack for Malaysians.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 23: on Post 2
  await db.collection("posts").doc(postRef2.id).collection("comments").add({
    authorId: "user00004",
    body: "Sometimes we forget that we're human beings, not just coding machines. Rest is part of the work.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 24: on Post 8
  await db.collection("posts").doc(postRef8.id).collection("comments").add({
    authorId: "user00003",
    body: "Once you go mechanical, you can never go back to membrane keyboards. Enjoy the thock!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 25: on Post 9
  await db.collection("posts").doc(postRef9.id).collection("comments").add({
    authorId: "user00006",
    body: "I feel you. I deleted my LinkedIn app last week just to clear my head. It actually helps.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 26: on Post 4
  await db.collection("posts").doc(postRef4.id).collection("comments").add({
    authorId: "user00001",
    body: "I usually listen to Lo-Fi beats when it rains like this. Vibe is unmatched.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 27: on Post 3
  await db.collection("posts").doc(postRef3.id).collection("comments").add({
    authorId: "user00005",
    body: "The logic for Tree Traversal used to give me nightmares. Glad you conquered it!",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 28: on Post 10
  await db.collection("posts").doc(postRef10.id).collection("comments").add({
    authorId: "user00002",
    body: "Teach me your secrets for staying focused. I get distracted every 10 minutes.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 29: on Post 5
  await db.collection("posts").doc(postRef5.id).collection("comments").add({
    authorId: "user00004",
    body: "Don't beat yourself up. Modern CSS is powerful but definitely weird sometimes.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  // Comment 30: on Post 1
  await db.collection("posts").doc(postRef1.id).collection("comments").add({
    authorId: "user00006",
    body: "Small steps lead to big changes. Just keep showing up every day.",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });
console.log("Comment seeded");




  /*conversations Entires, 4 entries*/
  const convoRef1 = await db.collection("conversations").doc("user00001_user00002").set({
    participants: ["user00001", "user00002"],
    consent: {
      user00001: true,
      user00002: true
    },
    nextSeq: 9,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    familiarityLevel: 2
  });

  const convoRef2 = await db.collection("conversations").doc("user00001_user00006").set({
    participants: ["user00001", "user00006"],
    consent: {
      user00001: true,
      user00006: false
    },
    nextSeq: 7,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    familiarityLevel: 1
  });

  const convoRef3 = await db.collection("conversations").doc("user00002_user00004").set({
    participants: ["user00002", "user00004"],
    consent: {
      user00002: true,
      user00004: true
    },
    nextSeq: 8,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Flagged",
    familiarityLevel: 2
  });

  const convoRef4 = await db.collection("conversations").doc("user00003_user00004").set({
    participants: ["user00003", "user00004"],
    consent: {
      user00003: true,
      user00004: true
    },
    nextSeq: 8,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Hidden",
    familiarityLevel: 2
  });
console.log("Conversation seeded");



  /*messages Entires, 28 entries*/
  /* Convo 1 - user00001 & user00002 */
  const convo1Msgs = [
    { seq:1, s: "user00001", b: "Hey, saw your post about the algorithm struggle. Want to sync up?" },
    { seq:2, s: "user00002", b: "Please! I'm stuck on the time complexity analysis." },
    { seq:3, s: "user00001", b: "It's O(n log n) because of the divide and conquer approach." },
    { seq:4, s: "user00002", b: "Ah, that makes sense. I was overthinking the merge step." },
    { seq:5, s: "user00001", b: "Happens to the best of us. You free this evening?" },
    { seq:6, s: "user00002", b: "Yeah, around 8 PM works for me." },
    { seq:7, s: "user00001", b: "Cool, I'll send a Zoom link then." },
    { seq:8, s: "user00002", b: "Thanks a lot, Brian. Appreciate the help." }
  ];

  for (const m of convo1Msgs) {
    await db.collection("conversations").doc("user00001_user00002").collection("messages").add({
      senderId: m.s,
      body: m.b,
      seq: m.seq, 
      createdAt: FieldValue.serverTimestamp(),
      hiddenUntilConsent: false
    });
  }

  /* Convo 2 - user00001 to user00006 (Pending Consent) */
  const convo2Msgs = [
    { seq: 1, s: "user00001", b: "Hey user00006, I noticed we're both in the same Software Engineering cohort." },
    { seq: 2, s: "user00001", b: "I saw your project on GitHub and had a few questions about your backend setup." },
    { seq: 3, s: "user00001", b: "Are you using Redis for the caching layer or just internal memory?" },
    { seq: 4, s: "user00001", b: "No rush to reply, just thought it was a cool implementation." },
    { seq: 5, s: "user00001", b: "I'm working on something similar called ChronosCache." },
    { seq: 6, s: "user00001", b: "Let me know if you're open to chatting about it!" }
  ];

  for (const m of convo2Msgs) {
    await db.collection("conversations").doc("user00001_user00006").collection("messages").add({
      senderId: m.s,
      body: m.b,
      seq: m.seq,
      createdAt: FieldValue.serverTimestamp(),
      hiddenUntilConsent: true
    });
  }

  /* Convo 3 - user00002 & user00004 (Mild/Flagged) */
  const convo3Msgs = [
    { seq: 1, s: "user00002", b: "Did you seriously push code that broke the main branch?" },
    { seq: 2, s: "user00004", b: "It passed my local tests, I didn't think it would fail in prod." },
    { seq: 3, s: "user00002", b: "You didn't think? That's your problem. You're being lazy." },
    { seq: 4, s: "user00004", b: "Don't call me lazy. It was a simple mistake." },
    { seq: 5, s: "user00002", b: "A simple mistake that cost us 4 hours of downtime. You're an idiot." },
    { seq: 6, s: "user00004", b: "Watch your mouth. I'm trying my best here." },
    { seq: 7, s: "user00002", b: "Your best is trash. Fix it now or I'm reporting this to the lead." }
  ];

  for (const m of convo3Msgs) {
    await db.collection("conversations").doc("user00002_user00004").collection("messages").add({
      senderId: m.s,
      body: m.b,
      seq: m.seq,
      createdAt: FieldValue.serverTimestamp(),
      hiddenUntilConsent: false
    });
  }

  /* Convo 4 - user00003 & user00004 (Filthy/Hidden) */
  const convo4Msgs = [
    { seq: 1, s: "user00003", b: "Why are you even in this degree? You clearly can't code for sh*t." },
    { seq: 2, s: "user00004", b: "Leave me alone. I'm just trying to learn." },
    { seq: 3, s: "user00003", b: "Learn? You're a f***ing waste of space. Everyone hates working with you." },
    { seq: 4, s: "user00004", b: "Please stop. This is harassment." },
    { seq: 5, s: "user00003", b: "I'll stop when you quit. You're a pathetic b*tch. K*ll yourself." },
    { seq: 6, s: "user00004", b: "I'm reporting this chat." },
    { seq: 7, s: "user00003", b: "Report it, you f***ing coward. No one will believe a loser like you." }
  ];

  for (const m of convo4Msgs) {
    await db.collection("conversations").doc("user00003_user00004").collection("messages").add({
      senderId: m.s,
      body: m.b,
      seq: m.seq,
      createdAt: FieldValue.serverTimestamp(),
      hiddenUntilConsent: false
    });
  }
console.log("Messages seeded");

await db
  .collection("users")
  .doc("user00001")
  .collection("chatbotSessions")
  .add({
    title: "Feeling Overwhelmed",
    createdAt: FieldValue.serverTimestamp(),
    messages: [
      {
        role: "bot",
        text: "Hello Brian. I’m here to listen. What’s been weighing on you lately?",
        timestamp: new Date(),
      },
      {
        role: "user",
        text: "I feel like everything is piling up and I can’t keep up.",
        timestamp: new Date(),
      },
      {
        role: "bot",
        text: "That sounds exhausting. It’s okay to take things one step at a time.",
        timestamp: new Date(),
      },
    ],
  });

/* User 00002 chatbot session */
await db
  .collection("users")
  .doc("user00002")
  .collection("chatbotSessions")
  .add({
    title: "Late Night Thoughts",
    createdAt: FieldValue.serverTimestamp(),
    messages: [
      {
        role: "bot",
        text: "Hi Kevin. You seem thoughtful tonight. Want to share what’s on your mind?",
        timestamp: new Date(),
      },
      {
        role: "user",
        text: "I’m worried about my future after graduation.",
        timestamp: new Date(),
      },
      {
        role: "bot",
        text: "That’s a very common worry. You’re not alone in feeling this way.",
        timestamp: new Date(),
      },
    ],
  });

  console.log("Chatbot seeded");

  const copingStrategies = [
    {
      id: "cs_001",
      title: "Relax & Release: A Calm Flow to Unwind Your Body and Mind",
      author: "Aria Lin",
      tags: ["RELAXATION"],
      description:
        "This calming yoga flow is designed to help you gently release physical tension and mental stress accumulated throughout the day. By combining slow stretches with mindful breathing, the practice encourages relaxation and grounding, allowing your body and mind to unwind naturally.",
      instructions:
        "Find a quiet space and sit or lie down comfortably. Begin by taking five slow, deep breaths. Gently stretch your neck, shoulders, and spine while breathing deeply. Move slowly between stretches, focusing on areas that feel tense. End by lying still for two minutes, allowing your body to fully relax.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_002",
      title: "Quiet Moments Flow: A Soft Stretch Journey for Deep Relaxation",
      author: "Mira Solace",
      tags: ["RELAXATION", "PHYSICAL"],
      description:
        "Quiet Moments Flow is a gentle stretching routine aimed at calming the nervous system. It encourages slow, intentional movement to help you reconnect with your breath and cultivate inner stillness, making it ideal before sleep or during moments of overwhelm.",
      instructions:
        "Start in a seated position with your back straight. Slowly roll your shoulders and gently tilt your head side to side.\n\nStretch your arms overhead while inhaling, then lower them while exhaling.\n\nContinue moving slowly through light stretches for 10–15 minutes, focusing on your breathing and allowing tension to release naturally.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_003",
      title: "Pause & Ponder: A Guided Self-Reflection Practice",
      author: "Amelia Tan",
      tags: ["SELF_REFLECTION"],
      description:
        "Pause & Ponder helps you slow down and reflect on your thoughts and emotions without judgment. This practice is designed to improve emotional awareness and promote self-understanding through gentle introspection.",
      instructions:
        "Sit comfortably with a notebook nearby. Close your eyes and take three deep breaths. Ask yourself how you are feeling in this moment. Write down any thoughts or emotions that arise without filtering them. Spend 5–10 minutes reflecting before gently closing the session.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_004",
      title: "Grounding Breath: Reconnect with the Present Moment",
      author: "Daniel Wong",
      tags: ["BREATHING", "RELAXATION"],
      description:
        "Grounding Breath is a simple breathing exercise designed to reduce anxiety and bring your attention back to the present moment. It is especially helpful during moments of panic or heightened stress.",
      instructions:
        "Place one hand on your chest and the other on your abdomen. Inhale slowly through your nose for four seconds, feeling your abdomen rise. Hold for two seconds, then exhale through your mouth for six seconds. Repeat for 5–7 minutes.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_005",
      title: "Body Scan Meditation for Emotional Release",
      author: "Sofia Karim",
      tags: ["GROUNDING", "RELAXATION"],
      description:
        "This body scan meditation guides your attention through different parts of the body to help you identify and release stored tension. It promotes relaxation and enhances mind–body awareness.",
      instructions:
        "Lie down in a comfortable position. Close your eyes and take a few deep breaths. Slowly move your attention from your toes upward, noticing sensations in each body part. If you feel tension, imagine it softening with each exhale. Continue until you reach your head.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_006",
      title: "Emotion Journaling: Writing Through Your Feelings",
      author: "Rachel Lim",
      tags: ["JOURNALING", "SELF_REFLECTION"],
      description:
        "Emotion journaling provides a safe space to express and process your feelings through writing. It helps clarify emotions, reduce mental clutter, and improve emotional regulation.",
      instructions:
        "Set aside 10–15 minutes in a quiet space. Write freely about how you are feeling without worrying about grammar or structure. Focus on honesty rather than perfection. When finished, take a moment to read what you wrote and acknowledge your emotions.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_007",
      title: "Gentle Morning Stretch to Start Your Day Calmly",
      author: "Leo Hart",
      tags: ["PHYSICAL", "RELAXATION"],
      description:
        "This gentle morning stretch routine is designed to wake up the body while maintaining a sense of calm. It helps improve circulation and prepares you mentally for the day ahead.",
      instructions:
        "Stand or sit comfortably. Stretch your arms overhead and gently twist your torso side to side. Roll your shoulders and stretch your legs if standing. Breathe deeply throughout the routine for about 5–10 minutes.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_008",
      title: "Progressive Muscle Relaxation for Stress Reduction",
      author: "Nina Alvarez",
      tags: ["RELAXATION", "BREATHING"],
      description:
        "Progressive Muscle Relaxation involves tensing and releasing muscle groups to reduce stress and physical tension. It is effective for managing anxiety and improving sleep quality.",
      instructions:
        "Sit or lie down comfortably. Starting from your feet, tense the muscles for five seconds, then release. Move upward through your legs, abdomen, arms, shoulders, and face. Notice the contrast between tension and relaxation.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_009",
      title: "Mindful Walking: Moving with Awareness",
      author: "Jason Khoo",
      tags: ["PHYSICAL", "GROUNDING"],
      description:
        "Mindful walking combines gentle movement with focused awareness, making it a great practice for those who find seated meditation challenging. It encourages presence and mental clarity.",
      instructions:
        "Walk slowly in a quiet area. Focus on the sensation of your feet touching the ground. Pay attention to your breathing and surroundings without judgment. Continue for 10–20 minutes.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_010",
      title: "Evening Wind-Down Routine for Better Sleep",
      author: "Hannah Lee",
      tags: ["SLEEP", "RELAXATION"],
      description:
        "This evening wind-down routine helps signal to your body that it is time to rest. By combining light stretching, breathing, and reflection, it prepares you for a more restful sleep.",
      instructions:
        "Dim the lights and sit or lie down comfortably. Perform gentle stretches and take slow breaths. Reflect on one positive moment from your day. End the routine by lying still for a few minutes before going to bed.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_011",
      title: "Gratitude Reflection: Appreciating the Small Moments",
      author: "Daniela Cruz",
      tags: ["GRATITUDE"],
      description:
        "Gratitude Reflection encourages you to pause and recognize positive experiences that often go unnoticed during busy days. By consciously identifying moments of appreciation, this practice can shift your attention away from persistent worries and toward meaningful aspects of your life.\n\nRegular gratitude reflection has been shown to improve emotional resilience and increase feelings of contentment. Even small observations — such as enjoying a warm drink or receiving a kind message — can become powerful reminders that not every moment is defined by stress.",
      instructions:
        "Sit comfortably with a notebook or digital note.\n\nTake three slow breaths and allow your body to relax.\n\nWrite down three things from your day that you feel grateful for. These can be simple or significant moments.\n\nSpend a moment reflecting on why each experience mattered to you.\n\nFinish by taking a deep breath and acknowledging that even small positive moments deserve recognition.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_012",
      title: "Positive Affirmation Pause",
      author: "Maya Fernandez",
      tags: ["AFFIRMATION"],
      description:
        "Positive affirmations are short statements that reinforce supportive and compassionate beliefs about yourself. During stressful moments, our thoughts can become overly critical or negative. Practicing affirmations helps interrupt these patterns and replace them with balanced and encouraging perspectives.\n\nWhile affirmations may feel unusual at first, repeating them regularly helps reinforce healthier self-talk and emotional stability.",
      instructions:
        "Find a quiet moment where you can focus without interruption.\n\nChoose one or two simple affirmations such as:\n“I am doing the best I can today.”\n“I deserve patience and understanding.”\n\nRepeat the statement slowly several times.\n\nPay attention to how your body and breathing respond as you say the words.\n\nContinue for two to three minutes before returning to your daily activities.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_013",
      title: "Motivation Reset: A Small Step Forward",
      author: "Kevin Patel",
      tags: ["MOTIVATION"],
      description:
        "Motivation Reset focuses on taking small, achievable actions when tasks feel overwhelming. Instead of trying to solve everything at once, the goal is to regain momentum through manageable progress.\n\nCompleting even a small task can improve confidence and reduce the feeling of being stuck.",
      instructions:
        "Identify one task that feels achievable within five minutes.\n\nBreak the task down into the smallest possible action.\n\nFocus only on completing that step without thinking about the entire project.\n\nOnce finished, pause briefly and acknowledge the progress you made.\n\nDecide whether to continue with another small step or take a short break.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_014",
      title: "Gentle Breathing for Evening Calm",
      author: "Sora Nakamura",
      tags: ["BREATHING", "RELAXATION"],
      description:
        "This breathing exercise is designed to help slow your heart rate and reduce physical tension before rest. Slow breathing activates the body's relaxation response, making it easier to transition from a stressful day into a calm evening routine.\n\nThe practice is intentionally simple so that it can be used anywhere — before sleep, during a break, or after a demanding activity.",
      instructions:
        "Sit or lie in a comfortable position.\n\nClose your eyes and inhale slowly through your nose for four seconds.\n\nHold the breath gently for two seconds.\n\nExhale slowly through your mouth for six seconds.\n\nRepeat the breathing cycle for five to eight minutes while allowing your shoulders and jaw to relax.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_015",
      title: "Mindful Body Grounding Practice",
      author: "Elena Park",
      tags: ["GROUNDING", "RELAXATION"],
      description:
        "Mindful Body Grounding helps reconnect attention to the present moment through physical awareness. When thoughts become overwhelming, directing attention to bodily sensations can stabilize emotions and reduce anxiety.\n\nThis technique is commonly used in mindfulness practices and can be performed almost anywhere.",
      instructions:
        "Sit comfortably and place both feet on the ground.\n\nTake a few slow breaths and notice the sensation of the floor beneath your feet.\n\nBring awareness to different areas of your body — starting from your feet and moving upward.\n\nNotice temperature, pressure, or subtle sensations without trying to change them.\n\nContinue the scan for several minutes before slowly opening your eyes.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_016",
      title: "Movement Break to Refresh Your Energy",
      author: "Lucas Almeida",
      tags: ["PHYSICAL", "RELAXATION"],
      description:
        "Short movement breaks can help release tension and improve mental clarity. Even gentle stretching or walking can improve blood circulation and refresh your focus during long periods of studying or working.\n\nThis routine is intentionally simple and flexible so it can fit into busy schedules.",
      instructions:
        "Stand up and stretch your arms overhead.\n\nRoll your shoulders slowly forward and backward several times.\n\nTake a short walk around your room or workspace.\n\nBreathe deeply while moving to encourage relaxation.\n\nContinue the movement for five minutes before returning to your task.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_017",
      title: "Reflective Writing for Emotional Clarity",
      author: "Alicia Wong",
      tags: ["JOURNALING", "SELF_REFLECTION"],
      description:
        "Reflective writing provides a structured way to understand your emotional experiences. By describing situations and thoughts in writing, you create distance from immediate reactions and gain clearer insight into what you are feeling.\n\nMany people find that writing regularly helps organize thoughts and reduce mental clutter.",
      instructions:
        "Open a notebook or writing app.\n\nWrite about a recent experience that affected your emotions.\n\nDescribe what happened, how you felt, and what thoughts appeared at the time.\n\nAsk yourself what you learned from the experience.\n\nFinish by writing one supportive message to yourself.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_018",
      title: "Grounding Breath and Reflection",
      author: "Sara Ibrahim",
      tags: ["BREATHING", "GROUNDING", "SELF_REFLECTION"],
      description:
        "This combined exercise integrates breathing, grounding, and reflection to support emotional awareness. The breathing phase helps stabilize the body, grounding reconnects attention to the present moment, and reflection allows thoughtful processing of emotions.\n\nTogether, these steps create a balanced routine for managing overwhelming feelings.",
      instructions:
        "Begin with slow breathing for one minute.\n\nNotice the sensations in your body and surroundings.\n\nAsk yourself what emotion you are currently experiencing.\n\nWrite a few words describing the feeling without judgment.\n\nFinish by taking three slow breaths and gently returning to your activities.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_019",
      title: "Calm Stretch and Breathing Routine",
      author: "Tara Sullivan",
      tags: ["PHYSICAL", "BREATHING", "RELAXATION"],
      description:
        "This routine combines light physical movement with slow breathing to release tension stored in the body. Stretching improves circulation while breathing techniques activate relaxation responses in the nervous system.\n\nTogether they help create a calm, refreshed state of mind.",
      instructions:
        "Stand comfortably and take a deep breath.\n\nStretch your arms upward while inhaling.\n\nLower your arms slowly while exhaling.\n\nGently stretch your neck and shoulders.\n\nRepeat the breathing and stretching sequence for five to ten minutes.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_020",
      title: "Sleep Preparation Reflection",
      author: "Isabella Chen",
      tags: ["SLEEP", "RELAXATION", "GRATITUDE"],
      description:
        "Sleep Preparation Reflection helps transition from a busy day into restful sleep. By combining gratitude reflection with calming breathing and relaxation, this practice signals to the body that it is time to slow down.\n\nRegularly practicing a calming bedtime routine can improve sleep quality and emotional balance.",
      instructions:
        "Dim the lights and sit or lie comfortably.\n\nTake five slow breaths while allowing your body to relax.\n\nThink of one positive moment from your day.\n\nWrite or mentally note why that moment mattered.\n\nAllow your breathing to slow naturally as you prepare for sleep.",
      videoUrl: null,
      audioUrl: null,
    },
  ];

  const copingRef = db.collection("copingStrategies");

  for (const strategy of copingStrategies) {
    const { id, ...data } = strategy;

    await copingRef.doc(id).set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log("Coping strategies seeded");
}

main()
  .then(() => {
    console.log("✅ Seed completed successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });