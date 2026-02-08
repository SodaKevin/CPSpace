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

import { getUserDiaries } from "../../services/diaryService";
import { getRecommendedStrategies } from "../../services/hubRecommendationService";

import { TAG_LABELS } from "../../domain/tagLabels";

export default function CopingHub() {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [strategies, setStrategies] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const [user, setUser] = useState(null);
  const location = useLocation();

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const scrollTopRef = useRef(null);

  function handleTagClick(tag) {
    setInputValue(tag);
    setSearchQuery(tag);
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
      if (!strategies.length) return;

      const diaries = await getUserDiaries(user.uid);
      const statsMap = {};

      const recs = getRecommendedStrategies({
        strategies,
        diaries,
        statsMap,
        limit: 4,
      });

      setRecommended(recs);
    }

    if (user) loadRecommendations();
  }, [user, strategies]);

  useEffect(() => {
    if (location.state?.fromAssessment) {
      console.log(
        "Entered Coping Hub from Assessment:",
        location.state.severity
      );
    }
  }, []);

  const filteredStrategies = strategies.filter((strategy) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;

    const title = strategy.title?.toLowerCase() || "";
    const author = strategy.author?.toLowerCase() || "";
    const description = strategy.description?.toLowerCase() || "";
    const tags = Array.isArray(strategy.tags) ? strategy.tags : [];

    return (
      title.includes(q) ||
      author.includes(q) ||
      description.includes(q) ||
      tags.some(tag => tag.toLowerCase().includes(q))
    );
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

    try {
      const snap = await getDoc(bookmarkRef);

      if (snap.exists()) {
        await deleteDoc(bookmarkRef);
        setBookmarkedIds((prev) =>
          prev.filter((id) => id !== strategyId)
        );
      } else {
        await setDoc(bookmarkRef, {
          strategyId,
          createdAt: serverTimestamp(),
        });
        setBookmarkedIds((prev) => [...prev, strategyId]);
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
            🔍
            </button>
        </div>

        <div className="hub-actions">
          <a href="/coping-hub/bookmarks">
            <img
              src={bookmarkIcon}
              alt="Bookmarked strategies"
              className="bookmark-icon"
            />
          </a>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="copinghub-content">

        {/* LEFT COLUMN */}
        <aside className="copinghub-left">
          <h3>Recommended Strategy for You</h3>

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
        <h3>Search result: {searchQuery || "All"}</h3>

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
                  {bookmarkedIds.includes(strategy.id) ? "⭐" : "☆"}
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
