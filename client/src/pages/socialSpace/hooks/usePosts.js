// socialSpace/hooks/usePosts.js

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";

const PAGE_SIZE = 20;
const FETCH_SIZE = 100;

/* ---------- HOT SCORE ---------- */

function wilsonLowerBound(up, down) {
  const n = up + down;
  if (n === 0) return 0;

  const z = 1.96;
  const phat = up / n;

  return (
    (phat + (z * z) / (2 * n) -
      z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n)) /
    (1 + (z * z) / n)
  );
}

function computeHotScore(post) {
  const up = post.stats?.up || 0;
  const down = post.stats?.down || 0;

  const wilson = wilsonLowerBound(up, down);

  const createdAt = post.createdAt?.toDate?.();
  if (!createdAt) return wilson;

  const ageHours =
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  return wilson / (1 + ageHours / 8);
}

/* ---------- HELPER: CHUNK ARRAY ---------- */

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/* ---------- HOOK ---------- */

export function usePosts(mode = "newest") {
  const [allPosts, setAllPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;

  /* ---------- LOAD BLOCKED + CONSENTED ---------- */

  async function fetchRelationshipData() {
    if (!currentUid) return { blocked: new Set(), consented: [] };

    const convoQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUid)
    );

    const snap = await getDocs(convoQuery);

    const blocked = new Set();
    const consented = [];

    snap.docs.forEach(d => {
      const data = d.data();
      const other = data.participants.find(p => p !== currentUid);

      if (!other) return;

      if (data.relationshipStatus === "blocked") {
        blocked.add(other);
      }

      if (data.relationshipStatus === "consented") {
        consented.push(other);
      }
    });

    return { blocked, consented };
  }

  /* ---------- INITIAL LOAD ---------- */

  const loadInitial = async () => {
    if (!currentUid) return;

    setLoading(true);

    const { blocked, consented } =
      await fetchRelationshipData();

    let data = [];

    /* ---------- RELEVANT MODE ---------- */

    if (mode === "relevant") {
      if (consented.length === 0) {
        setAllPosts([]);
        setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const chunks = chunkArray(consented, 10);
      const results = [];

      for (const chunk of chunks) {
        const q = query(
          collection(db, "posts"),
          where("authorId", "in", chunk),
          where("moderationStatus", "in", ["Visible", "Flagged"]),
          orderBy("createdAt", "desc"),
          limit(FETCH_SIZE)
        );

        const snap = await getDocs(q);
        snap.docs.forEach(d =>
          results.push({ id: d.id, ...d.data() })
        );
      }

      data = results
        .map(p => ({ ...p, _score: computeHotScore(p) }))
        .sort((a, b) => b._score - a._score);
    }

    /* ---------- NEWEST / HOT ---------- */

    else {
      const q = query(
        collection(db, "posts"),
        where("moderationStatus", "in", ["Visible", "Flagged"]),
        orderBy("createdAt", "desc"),
        limit(FETCH_SIZE)
      );

      const snap = await getDocs(q);

      data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // filter blocked authors
      data = data.filter(p => !blocked.has(p.authorId));

      if (mode === "hot") {
        data = data
          .map(p => ({ ...p, _score: computeHotScore(p) }))
          .sort((a, b) => b._score - a._score);
      }
    }

    setAllPosts(data);
    setPosts(data.slice(0, PAGE_SIZE));
    setPage(1);
    setHasMore(data.length > PAGE_SIZE);
    setLoading(false);
  };

  /* ---------- LOAD MORE ---------- */

  const loadMore = () => {
    if (loading || !hasMore) return;

    setPage(p => {
      const next = p + 1;
      const nextPosts = allPosts.slice(0, next * PAGE_SIZE);

      setPosts(nextPosts);
      setHasMore(nextPosts.length < allPosts.length);

      return next;
    });
  };

  useEffect(() => {
    loadInitial();
  }, [mode, currentUid]);

  return {
    posts,
    loadInitial,
    loadMore,
    loading,
    hasMore
  };
}
