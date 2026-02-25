import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStrategyById } from "../../services/adminHubService";
import { getUserDiaries } from "../../services/diaryService";
import { buildEmotionProfile } from "../../services/hubRecommendationService";
import { increment} from "firebase/firestore";
import { TAG_LABELS } from "../../domain/tagLabels";
import { Link } from "react-router-dom";
import "./strategyDetail.css";

import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function StrategyDetail() {
  const { id } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const auth = getAuth();

  const statsRef = doc(db, "strategyEmotionStats", id);

  useEffect(() => {
    async function fetchStrategy() {
      try {
        const data = await getStrategyById(id);
        setStrategy(data);
      } catch (err) {
        console.error("Failed to load strategy:", err);
      } finally {
        setLoading(false);
      }

      const user = auth.currentUser;
      if (user) {
        const bookmarkRef = doc(
          db,
          "users",
          user.uid,
          "bookmarks",
          id
        );

        const snap = await getDoc(bookmarkRef);
        setIsBookmarked(snap.exists());
      }
    }

    fetchStrategy();
  }, [id]);

  if (loading) {
    return <p>Loading strategy...</p>;
  }

  if (!strategy) {
    return <div className="strategy-not-found">Strategy not found.</div>;
  }

  const toggleBookmark = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const bookmarkRef = doc(
      db,
      "users",
      user.uid,
      "bookmarks",
      id
    );

    const statsRef = doc(db, "strategyEmotionStats", id);

    try {
      const snap = await getDoc(bookmarkRef);

      const diaries = await getUserDiaries(user.uid);
      const profile = buildEmotionProfile(diaries);

      const dominantEmotion =
        Object.entries(profile)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      if (snap.exists()) {
        await deleteDoc(bookmarkRef);

        if (dominantEmotion) {
          await setDoc(
            statsRef,
            { [dominantEmotion]: increment(-1) },
            { merge: true }
          );
        }

        setIsBookmarked(false);

      } else {
        await setDoc(bookmarkRef, {
          strategyId: id,
          dominantEmotion,
          createdAt: serverTimestamp(),
        });

        if (dominantEmotion) {
          await setDoc(
            statsRef,
            { [dominantEmotion]: increment(1) },
            { merge: true }
          );
        }

        setIsBookmarked(true);
      }

    } catch (err) {
      console.error("Toggle bookmark failed:", err);
    }
  };

  return(
    <div className="strategy-detail-page">
    <div className="strategy-title-row">
      <h2 className="strategy-title">{strategy.title}</h2>

      <button
        className={`bookmark-detail ${isBookmarked ? "active" : ""}`}
        onClick={toggleBookmark}
        aria-label="Bookmark strategy"
      >
        {isBookmarked ? "⭐" : "☆"}
      </button>
    </div>

      <div className="strategy-meta">
        <span>Author: {strategy.author}</span>
        {Array.isArray(strategy.tags) &&
          strategy.tags.map(tag => (
            <Link
              key={tag}
              to="/coping-hub"
              state={{ tag }}
              className="hub-tag"
            >
              {TAG_LABELS[tag] || tag}
            </Link>
        ))}
      </div>

      <div className="strategy-description">
        {strategy.description}
      </div>

      {strategy.audioUrl && (
        <div className="strategy-audio">
          <audio controls src={strategy.audioUrl} />
        </div>
      )}

      {strategy.videoUrl && (
        <div className="strategy-media">
          <video controls src={strategy.videoUrl} />
        </div>
      )}

      <div className="strategy-description">
        <strong>Instructions</strong>
        <p>{strategy.instructions}</p>
      </div>
    </div>
  );
}
