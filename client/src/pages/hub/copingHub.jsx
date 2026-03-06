// CopingHub.jsx
// User-facing, read-only Coping Strategy Hub

import "./copingHub.css";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getAllStrategies } from "../../services/adminHubService";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";

import bookmarkIcon from "../../assets/bookmark.png";
import searchGlass from "../../assets/searchGlass.png";

import { getUserDiaries } from "../../services/diaryService";
import { getRecommendedStrategies } from "../../services/hubRecommendationService";
import { increment } from "firebase/firestore";
import { buildEmotionProfile } from "../../services/hubRecommendationService";
import { TAG_LABELS } from "../../domain/tagLabels";

export default function CopingHub() {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [strategies, setStrategies] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Filtering
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const [user, setUser] = useState(null);
  const location = useLocation();

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const scrollTopRef = useRef(null);

  function handleTagClick(tag) {
    const label = TAG_LABELS[tag] || tag;
    setInputValue(label);     // pretty text
    setSearchQuery(tag);      // canonical value for search
  }
  
  function handleSearchClick(value) {
    setInputValue(value);
    setSearchQuery(value);
  }

  useEffect(() => {
    async function fetchStrategies() {
      try {
        const data = await getAllStrategies();
        setStrategies(data);
      } catch (error) {
        console.error("Failed to load strategies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStrategies();
  }, []);

  useEffect(() => {
    async function loadRecommendations() {
      if (!strategies.length || !user) return;

      try {
        // 1️⃣ Get user diaries
        const diaries = await getUserDiaries(user.uid);

        // 2️⃣ Load collaborative stats
        const statsSnap = await getDocs(
          collection(db, "strategyEmotionStats")
        );

        const statsMap = {};
        statsSnap.forEach(doc => {
          statsMap[doc.id] = doc.data();
        });

        // 3️⃣ Get hybrid recommendations
        const recs = getRecommendedStrategies({
          strategies,
          diaries,
          statsMap,
          limit: 4,
        });

        setRecommended(recs);

      } catch (err) {
        console.error("Failed to load recommendations:", err);
      }
    }

    loadRecommendations();
  }, [user, strategies]);

  useEffect(() => {
    if (location.state?.fromAssessment) {
      console.log(
        "Entered Coping Hub from Assessment:",
        location.state.severity
      );
    }
  }, []);

  useEffect(() => {
    if (location.state?.tag) {
      const tag = location.state.tag;

      setInputValue(TAG_LABELS[tag] || tag);
      setSearchQuery(tag);

      // Clear state so refresh won't repeat it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredStrategies = strategies.filter((strategy) => {
    const q = searchQuery.toLowerCase();
    const title = strategy.title?.toLowerCase() || "";
    const author = strategy.author?.toLowerCase() || "";
    const description = strategy.description?.toLowerCase() || "";
    const tags = Array.isArray(strategy.tags) ? strategy.tags : [];

    const matchesSearch =
      !q ||
      title.includes(q) ||
      author.includes(q) ||
      description.includes(q) ||
      tags.some(tag => tag.toLowerCase().includes(q));

    const matchesAuthor =
      !selectedAuthor || strategy.author === selectedAuthor;

    const matchesTag =
      !selectedTag || tags.includes(selectedTag);

    return matchesSearch && matchesAuthor && matchesTag;
  });

  const totalPages = Math.ceil(
    filteredStrategies.length / ITEMS_PER_PAGE
  );

  const paginatedStrategies = filteredStrategies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const auth = getAuth();

  const toggleBookmark = async (strategyId) => {
    const user = auth.currentUser;
    if (!user) return;

    const bookmarkRef = doc(
      db,
      "users",
      user.uid,
      "bookmarks",
      strategyId
    );

    const statsRef = doc(
      db,
      "strategyEmotionStats",
      strategyId
    );

    try {
      const snap = await getDoc(bookmarkRef);

      // 🔹 Get dominant emotion
      const diaries = await getUserDiaries(user.uid);
      const profile = buildEmotionProfile(diaries);

      const dominantEmotion =
        Object.entries(profile)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      if (snap.exists()) {
        // ===== REMOVE BOOKMARK =====
        await deleteDoc(bookmarkRef);

        if (dominantEmotion) {
          await setDoc(
            statsRef,
            { [dominantEmotion]: 0 },
            { merge: true }
          );
        }

        setBookmarkedIds(prev =>
          prev.filter(id => id !== strategyId)
        );

      } else {
        // ===== ADD BOOKMARK =====
        await setDoc(bookmarkRef, {
          strategyId,
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

        setBookmarkedIds(prev =>
          [...prev, strategyId]
        );
      }

    } catch (err) {
      console.error("Toggle bookmark failed:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadBookmarks() {
      try {
        const snap = await getDocs(
          collection(db, "users", user.uid, "bookmarks")
        );

        setBookmarkedIds(snap.docs.map((doc) => doc.id));
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      }
    }

    loadBookmarks();
  }, [user]);
  
  useEffect(() => {
    const container = document.querySelector(".content");
    if (!container) return;

    container.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [currentPage]);

  return (
    <div className="copinghub-page">

      {/* ===== HEADER ===== */}
      <header className="copinghub-header">
        <div className="hub-title">
          <h1>CP HUB</h1>
        </div>

        <div className="hub-search">
            <input
            type="text"
            placeholder="Search your strategy here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                setSearchQuery(inputValue);
                }
            }}
            />
            <button onClick={() => setSearchQuery(inputValue)}>
              <img 
                src={searchGlass} 
                alt="Search" 
                className="search-icon"
              />
            </button>
        </div>

        <div className="hub-actions">
          <button
            className="filter-btn"
            onClick={() => setFilterOpen(prev => !prev)}
          >
            Filter
          </button>

          <Link to="/coping-hub/bookmarks">
            <img
              src={bookmarkIcon}
              alt="Bookmarked strategies"
              className="bookmark-icon"
            />
          </Link>
        </div>
      </header>

      {filterOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Author</label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              <option value="">All</option>
              {[...new Set(strategies.map(s => s.author))].sort().map(author => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All</option>
              {Object.keys(TAG_LABELS).sort().map(tag => (
                <option key={tag} value={tag}>
                  {TAG_LABELS[tag]}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-filter-btn"
            onClick={() => {
              setSelectedAuthor("");
              setSelectedTag("");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="copinghub-content">

        {/* LEFT COLUMN */}
        <aside className="copinghub-left">
          <h3>Recommended Strategy for You</h3>

          <p className="recommendation-note">
            Recommendations are based on emotions recorded in your diary over the past 14 days.
          </p>

          {recommended.length === 0 ? (
            <p>No recommendations available yet.</p>
          ) : (
            recommended.map((s) => (
              <div key={s.id} className="strategy-card">
                <Link to={`/coping-hub/${s.id}`}>
                  {s.title}
                </Link>

                <p className="author">
                  Author:{" "}
                  <span
                    className="author-clickable"
                    onClick={() => handleSearchClick(s.author)}
                  >
                    {s.author}
                  </span>
                </p>

                {s.tags?.map(tag => (
                  <span
                    key={tag}
                    className="hub-tag"
                    onClick={() => handleTagClick(tag)}
                  >
                    {TAG_LABELS[tag] || tag}
                  </span>
                ))}

                <p className="desc">
                  {s.description}
                </p>
              </div>
            ))
          )}
        </aside>

        {/* RIGHT COLUMN */}
        <main className="copinghub-right">
          <div ref={scrollTopRef} />
          <h3>
            Search result:{" "}
            {searchQuery
              ? TAG_LABELS[searchQuery] || searchQuery
              : "All"}
          </h3>

        {loading ? (
            <p>Loading strategies...</p>
        ) : paginatedStrategies.length === 0 ? (
            <p>No strategies found.</p>
        ) : (
            paginatedStrategies.map((strategy) => (
            <div key={strategy.id} className="result-card">
                <h4>
                <Link
                    to={`/coping-hub/${strategy.id}`}
                    className="strategy-link"
                >
                    {strategy.title}
                </Link>
                </h4>

                <p className="author">
                  Author:{" "}
                  <span
                    className="author-clickable"
                    onClick={() => handleSearchClick(strategy.author)}
                  >
                    {strategy.author}
                  </span>
                </p>
                {Array.isArray(strategy.tags) &&
                  strategy.tags.map(tag => (
                    <span
                      key={tag}
                      className="hub-tag"
                      onClick={() => handleTagClick(tag)}
                    >
                      {TAG_LABELS[tag] || tag}
                    </span>
                  ))}
                <p className="desc">
                {strategy.description}
                </p>
                <button
                  className={`bookmark ${
                    bookmarkedIds.includes(strategy.id) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleBookmark(strategy.id);
                  }}
                >
                  {bookmarkedIds.includes(strategy.id) ? "★" : "☆"}
                </button>
            </div>
            ))
        )}

        {totalPages > 1 && (
          <div className="pagination">
            {/* PREV */}
            <button
              className="page-nav"
              disabled={currentPage === 1}
              onClick={(e) => {
                e.currentTarget.blur();
                setCurrentPage(p => p - 1);
              }}
            >
              ‹
            </button>

            {/* PAGE NUMBERS (GROUPED) */}
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-number ${page === currentPage ? "active" : ""}`}
                  onClick={(e) => {
                    e.currentTarget.blur();   // 🔑 key line
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* NEXT */}
            <button
              className="page-nav"
              disabled={currentPage === totalPages}
              onClick={(e) => {
                e.currentTarget.blur();
                setCurrentPage(p => p + 1);
              }}
            >
              ›
            </button>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
