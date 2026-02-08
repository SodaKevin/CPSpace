import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { getAllStrategies } from "../../services/adminHubService";
import "./bookmark.css";

export default function Bookmark() {
  const [bookmarks, setBookmarks] = useState([]);
  const auth = getAuth();

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const deleteBookmark = async (strategyId) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(
      doc(db, "users", user.uid, "bookmarks", strategyId)
    );

    setBookmarks((prev) =>
      prev.filter((s) => s.id !== strategyId)
    );
  };

  useEffect(() => {
    async function fetchBookmarks() {
      const user = auth.currentUser;
      if (!user) return;

      const bookmarkRef = collection(db, "users", user.uid, "bookmarks");
      const bookmarkSnap = await getDocs(bookmarkRef);

      const strategyIds = bookmarkSnap.docs.map(
        (doc) => doc.data().strategyId
      );

      if (strategyIds.length === 0) {
        setBookmarks([]);
        return;
      }

      // Fetch full strategy objects
      const strategies = await getAllStrategies();

      const bookmarkedStrategies = strategies.filter((s) =>
        strategyIds.includes(s.id)
      );

      setBookmarks(bookmarkedStrategies);
    }

    fetchBookmarks();
  }, []);

  useEffect(() => {
    const container = document.querySelector(".content");
    if (!container) return;

    container.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE);

  const paginatedBookmarks = bookmarks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [bookmarks.length]);

  return (
    <div className="bookmark-page">
      <h2>Bookmarked Strategies</h2>

  {bookmarks.length === 0 ? (
    <p>No bookmarks yet.</p>
  ) : (
    paginatedBookmarks.map((strategy) => (
      <div key={strategy.id} className="bookmark-card">
        <h4>
          <Link
            to={`/coping-hub/${strategy.id}`}
            className="strategy-link"
          >
            {strategy.title}
          </Link>
        </h4>

        <p className="author">Author: {strategy.author}</p>

        <span className="hub-tag">
          {Array.isArray(strategy.tags)
            ? strategy.tags.join(", ")
            : ""}
        </span>

        <p className="desc">
          {strategy.description}
        </p>

        <button
          className="bookmark-remove-btn"
          aria-label="Remove bookmark"
          title="Remove bookmark"
          onClick={() => deleteBookmark(strategy.id)}
        >
          ×
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
          setCurrentPage((p) => p - 1);
        }}
      >
        ‹
      </button>

      {/* PAGE NUMBERS */}
      <div className="page-numbers">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`page-number ${
              page === currentPage ? "active" : ""
            }`}
            onClick={(e) => {
              e.currentTarget.blur();
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
          setCurrentPage((p) => p + 1);
        }}
      >
        ›
      </button>
    </div>
  )}
    </div>
  );
}
