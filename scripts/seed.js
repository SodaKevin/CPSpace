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
    username: {
      value: "BrianChen", // default is same as pseudonym
      discriminator: "4821", // random 4 digit number
      lastChangedAt: FieldValue.serverTimestamp() // creation is same as user creation time so same
    }, 
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
    blockedUsers: [] // default is empty
  });

  await db.collection("users").doc("user00002").set({
    firebaseID: "user00002",
    createdAt: FieldValue.serverTimestamp(),
    username: {
      value: "KevinNg",
      discriminator: "4206",
      lastChangedAt: FieldValue.serverTimestamp()
    }, 
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
    blockedUsers: []
  });

  await db.collection("users").doc("user00003").set({
    firebaseID: "user00003",
    createdAt: FieldValue.serverTimestamp(),
    username: {
      value: "SaraGoh",
      discriminator: "7852",
      lastChangedAt: FieldValue.serverTimestamp()
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

  await db.collection("users").doc("user00004").set({
    firebaseID: "user00004",
    createdAt: FieldValue.serverTimestamp(), 
    username: {
      value: "MuthuSami",
      discriminator: "5107",
      lastChangedAt: FieldValue.serverTimestamp()
    },
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
    blockedUsers: ["user00003"]
  });

  await db.collection("users").doc("user00005").set({
    firebaseID: "user00005",
    createdAt: FieldValue.serverTimestamp(),
    username: {
      value: "Kamilah",
      discriminator: "1448",
      lastChangedAt: FieldValue.serverTimestamp()
    }, 
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
    blockedUsers: []
  });

  await db.collection("users").doc("user00006").set({
    firebaseID: "user00006",
    createdAt: FieldValue.serverTimestamp(),
    username: {
      value: "Jamima",
      discriminator: "9666",
      lastChangedAt: FieldValue.serverTimestamp()
    }, 
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
    blockedUsers: ["user00003", "user00004", "user00005"]
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
    .add({
      publicUID: "user00001", // for adding friend purpose
      pseudonym: "FirebaseIsLit55", // default is like what you generated randomly
      username: {
        value: "BrianChen", // default is same as pseudonym
        discriminator: "4821", // random 4 digit number
      }, 
  });

  await db
    .collection("users")
    .doc("user00002")
    .collection("publicProfile")
    .add({
      publicUID: "user00002", // for adding friend purpose
      pseudonym: "dunkMeme1231", // default is like what you generated randomly
      username: {
        value: "KevinNg", // default is same as pseudonym
        discriminator: "4206", // random 4 digit number
      }, 
  });

  await db
    .collection("users")
    .doc("user00003")
    .collection("publicProfile")
    .add({
      publicUID: "user00003", // for adding friend purpose
      pseudonym: "youngBoyIsBroke", // default is like what you generated randomly
      username: {
        value: "SaraGoh", // default is same as pseudonym
        discriminator: "7852", // random 4 digit number
      }, 
  });

  await db
    .collection("users")
    .doc("user00004")
    .collection("publicProfile")
    .add({
      publicUID: "user00004", // for adding friend purpose
      pseudonym: "weRtheBest", // default is like what you generated randomly
      username: {
        value: "MuthuSami", // default is same as pseudonym
        discriminator: "5107", // random 4 digit number
      }, 
  });

  await db
    .collection("users")
    .doc("user00005")
    .collection("publicProfile")
    .add({
      publicUID: "user00005", // for adding friend purpose
      pseudonym: "work_King", // default is like what you generated randomly
      username: {
        value: "Kamilah", // default is same as pseudonym
        discriminator: "1448", // random 4 digit number
      }, 
  });

  await db
    .collection("users")
    .doc("user00006")
    .collection("publicProfile")
    .add({
      publicUID: "user00006", // for adding friend purpose
      pseudonym: "hyer22", // default is like what you generated randomly
      username: {
        value: "Jamima", // default is same as pseudonym
        discriminator: "9666", // random 4 digit number
      }, 
  });

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





  /*Posts Entires, 12 entries*/
  const postRef1 = await db.collection("posts").add({
    authorId: "user00001",
    body: "Some days just feel heavier than others.",
    emotionCategory: "unpleasant",
    feelings: ["Hopeless"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible",
    stats: { up: 3, down: 0 }
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
    stats: { up: 1, down: 5 }
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
    stats: { up: 1, down: 1 }
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
    stats: { up: 2, down: 4 } 
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
    stats: { up: 3, down: 2 } 
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
    moderationStatus: "Visible"
  });

  const convoRef2 = await db.collection("conversations").doc("user00001_user00006").set({
    participants: ["user00001", "user00006"],
    consent: {
      user00001: true,
      user00006: false
    },
    nextSeq: 7,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Visible"
  });

  const convoRef3 = await db.collection("conversations").doc("user00002_user00004").set({
    participants: ["user00002", "user00004"],
    consent: {
      user00002: true,
      user00004: true
    },
    nextSeq: 8,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Flagged"
  });

  const convoRef4 = await db.collection("conversations").doc("user00003_user00004").set({
    participants: ["user00003", "user00004"],
    consent: {
      user00003: true,
      user00004: true
    },
    nextSeq: 8,
    lastMessageAt: FieldValue.serverTimestamp(),
    moderationStatus: "Hidden"
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
      tags: ["Relaxation", "Stress Relief"],
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
      tags: ["Relaxation", "Mindfulness"],
      description:
        "Quiet Moments Flow is a gentle stretching routine aimed at calming the nervous system. It encourages slow, intentional movement to help you reconnect with your breath and cultivate inner stillness, making it ideal before sleep or during moments of overwhelm.",
      instructions:
        "Start in a seated position with your back straight. Slowly roll your shoulders and gently tilt your head side to side. Stretch your arms overhead while inhaling, then lower them while exhaling. Continue for 10–15 minutes, moving at your own pace.",
      videoUrl: null,
      audioUrl: null,
    },

    {
      id: "cs_003",
      title: "Pause & Ponder: A Guided Self-Reflection Practice",
      author: "Amelia Tan",
      tags: ["Reflection", "Emotional Awareness"],
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
      tags: ["Breathing", "Anxiety Relief"],
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
      tags: ["Meditation", "Relaxation"],
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
      tags: ["Journaling", "Emotional Processing"],
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
      tags: ["Stretching", "Energy Balance"],
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
      tags: ["Stress Relief", "Relaxation"],
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
      tags: ["Mindfulness", "Movement"],
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
      tags: ["Sleep", "Relaxation"],
      description:
        "This evening wind-down routine helps signal to your body that it is time to rest. By combining light stretching, breathing, and reflection, it prepares you for a more restful sleep.",
      instructions:
        "Dim the lights and sit or lie down comfortably. Perform gentle stretches and take slow breaths. Reflect on one positive moment from your day. End the routine by lying still for a few minutes before going to bed.",
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