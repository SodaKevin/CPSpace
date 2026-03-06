  // socialSpace/UserProfilePage.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";

import { useRelationship } from "../DMconvo/hooks/useRelationship";
import { useDisplayNames } from "./hooks/useDisplayNames";

import {
  requestRelationship,
  acceptRelationship,
  revokeRelationship,
  blockUser,
  unblockUser
} from "../DMconvo/services/relationshipService";

import PostCard from "./components/PostCard";

import "./userProfile.css";

export default function UserProfilePage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;

  const [userDoc, setUserDoc] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const {
    status,
    isConsented,
    isPending,
    isBlocked
  } = useRelationship(currentUid, uid);

  const isSelf = currentUid === uid;

  /* ---------- LOAD USER DOC ---------- */

  useEffect(() => {
    if (!uid) return;

    async function loadUser() {
      const userSnap = await getDoc(doc(db, "users", uid));
      const profileSnap = await getDoc(
        doc(db, "users", uid, "publicProfile", "profile")
      );

      if (userSnap.exists() && profileSnap.exists()) {
        setUserDoc({
          ...userSnap.data(),
          publicProfile: profileSnap.data(),
        });
      }
    }

    loadUser();
  }, [uid]);

  /* ---------- LOAD POSTS (ONLY IF CONSENTED OR OURSELF) ---------- */

  useEffect(() => {
    if (!isConsented && !isSelf) return;

    async function loadPosts() {
      const q = query(
        collection(db, "posts"),
        where("authorId", "==", uid),
        where("moderationStatus", "in", ["Visible", "Flagged"])
      );

      const snap = await getDocs(q);
      setUserPosts(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    }

    loadPosts();
  }, [isConsented, uid]);

  const displayNameMap = useDisplayNames(userPosts);

  if (!userDoc) return <div>Loading...</div>;

  /* ---------- BLOCKED VIEW ---------- */

  if (isBlocked) {
    return (
      <div className="user-page">
        <h2>Blocked User</h2>
        <button onClick={() => unblockUser(currentUid, uid)}>
          Unblock
        </button>
      </div>
    );
  }

  const profile = userDoc.publicProfile;

  const username =
    profile?.username?.value &&
    profile?.username?.discriminator
      ? `${profile.username.value}#${profile.username.discriminator}`
      : null;

  const pseudonym = profile?.pseudonym || "Anonymous";

  /* ---------- HEADER ---------- */

  return (
    <div className="user-page">

      {/* Placeholder Profile Pic */}
      <div className="profile-circle">
        {(isConsented && username
          ? username
          : pseudonym)[0]?.toUpperCase()}
      </div>

      <h2>
        {(isSelf || isConsented) && username
          ? username
          : pseudonym}
      </h2>

      {/* RELATIONSHIP BUTTONS */}
      {!isSelf && (
        <>
          {status === "none" || status === "revoked" ? (
            <button
              onClick={() =>
                requestRelationship(currentUid, uid)
              }
            >
              Request Consent
            </button>
          ) : null}

          {isPending && (
            <>
              <AcceptButton
                currentUid={currentUid}
                targetUid={uid}
              />
              <button disabled>Pending</button>
            </>
          )}

          {isConsented && (
            <>
              <button
                onClick={() =>
                  revokeRelationship(currentUid, uid)
                }
              >
                Revoke
              </button>

              <button
                onClick={() =>
                  blockUser(currentUid, uid)
                }
              >
                Block
              </button>
            </>
          )}
        </>
      )}

      {/* POSTS */}
      {(isSelf || isConsented) && (
        <div className="user-posts">
          <h3>Posts</h3>
          {userPosts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              pseudonym={
                displayNameMap[p.authorId] ||
                "Anonymous"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- ACCEPT BUTTON LOGIC ---------- */

function AcceptButton({ currentUid, targetUid }) {
  const [canAccept, setCanAccept] = useState(false);

  useEffect(() => {
    async function checkInitiator() {
      const snap = await getDoc(
        doc(
          db,
          "conversations",
          [currentUid, targetUid].sort().join("_")
        )
      );

      if (snap.exists()) {
        const data = snap.data();
        if (data.consent?.[currentUid] === false) {
          setCanAccept(true);
        }
      }
    }

    checkInitiator();
  }, [currentUid, targetUid]);

  if (!canAccept) return null;

  return (
    <button
      onClick={() =>
        acceptRelationship(currentUid, targetUid)
      }
    >
      Accept
    </button>
  );
}
