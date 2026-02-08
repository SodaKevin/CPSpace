import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStrategyById } from "../../services/adminHubService";
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

    if (isBookmarked) {
      await deleteDoc(bookmarkRef);
      setIsBookmarked(false);
    } else {
      await setDoc(bookmarkRef, {
        strategyId: id,
        createdAt: serverTimestamp(),
      });
      setIsBookmarked(true);
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
        <span className="hub-tag">
          {Array.isArray(strategy.tags) ? strategy.tags.join(", ") : ""}
        </span>
      </div>

      <div className="strategy-description">
        {strategy.description}
      </div>

      {strategy.audioUrl && (
        <audio controls src={strategy.audioUrl} />
      )}

      {strategy.videoUrl && (
        <video controls src={strategy.videoUrl} />
      )}

      <div className="strategy-description">
        <strong>Instructions</strong>
        <p>{strategy.instructions}</p>
      </div>
    </div>
  );
}
