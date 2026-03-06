  // socialSpace/SocialSpace.jsx
import { useEffect, useState, useRef } from "react";
import "./socialSpace.css";
import { usePublicPseudonyms } from "./hooks/usePublicPseudonyms";
import { useGlobalSearch } from "./hooks/useGlobalSearch";
import { usePosts } from "./hooks/usePosts";
import { useDisplayNames } from "./hooks/useDisplayNames";

import PostCard from "./components/PostCard";
import CreatePostModal from "./components/CreatePostModal";
import SearchResults from "./components/SearchResults";

export default function SocialSpace() {
  const [query, setQuery] = useState("");

  const [showCreatePost, setShowCreatePost] = useState(false);

  const [searchActive, setSearchActive] = useState(false);

  const [mode, setMode] = useState("newest");
  const { posts, loadInitial, loadMore, loading, hasMore } =
    usePosts(mode);

  const [searchInput, setSearchInput] = useState("");
  const {
    results,
    loading: searching,
    searchedAll,
    search,
    searchMore,
    clearSearch,
    clearHistory,
    history,
    currentQuery
  } = useGlobalSearch();

  const isSearching = currentQuery !== "";

  const displayNameMap = useDisplayNames(posts);
  const searchDisplayMap = useDisplayNames(results);
  
  function refreshFeed() {
    loadInitial();
  }

  function handleSearch(e) {
    e.preventDefault();
    search(searchInput.trim());
  }

  useEffect(() => {
    loadInitial();
  }, [mode]);

  useEffect(() => {
    function onScroll() {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300;

      if (nearBottom && !loading && hasMore) {
        loadMore();
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore, loading, hasMore]);

  return (
    <div className="social-space-page">
      {/* TOP BAR */}
      <div className="social-space-topbar">
        <div className="topbar-left">
          <span
            className="topbar-title"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSearchInput("");
              clearSearch();
              loadInitial();
            }}
          >
            Social Space
          </span>
        </div>

        {!isSearching && (
          <div className="topbar-center">
            <button
              className={mode === "newest" ? "active" : ""}
              onClick={() => setMode("newest")}
            >
              Newest
            </button>

            <button
              className={mode === "hot" ? "active" : ""}
              onClick={() => setMode("hot")}
            >
              Hot
            </button>

            <button
              className={mode === "relevant" ? "active" : ""}
              onClick={() => setMode("relevant")}
            >
              Relevant
            </button>
          </div>
        )}

        <div className="topbar-right">
          {/* future actions */}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="social-space-layout">
      
        {/* FEED */}
        <div className="social-space">
          {isSearching ? (
            <SearchResults
              results={results}
              loading={searching}
              searchedAll={searchedAll}
              onSearchMore={searchMore}
              pseudonymMap={searchDisplayMap}
              query={currentQuery}
            />
          ) : (
            <div className="social-space__feed">
              {posts.map(p => (
                <PostCard
                  key={p.id}
                  post={p}
                  pseudonym={displayNameMap[p.authorId] || "Anonymous"}
                  onPostUpdated={refreshFeed}
                  loadMore={loadMore}
                />
              ))}
            </div>
          )}

          {!isSearching && !hasMore && (
            <div className="end-of-feed">
              <div className="end-of-feed__icon">🌱</div>
              <div className="end-of-feed__text">
                You’re all caught up
              </div>
            </div>
          )}

          {!isSearching && hasMore && (
            <button
              className="social-space__load-more"
              onClick={loadMore}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </div>

        {/* RIGHT PANEL */}
        <aside className="social-space__side">
          <h3>Search</h3>

          <div style={{ position: "relative" }}>
            <form onSubmit={handleSearch}>
              <input
                className="side-search"
                placeholder="Search posts"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onFocus={() => setSearchActive(true)}
                onBlur={() => {
                  if (!searchInput) setSearchActive(false);
                }}
              />
            </form>

            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  clearSearch();
                  loadInitial();
                  setSearchActive(false);
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-100%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 16
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="trending">
            {/* Trending */}
            <div
              onClick={() => {
                setSearchInput("KFC");
                setSearchActive(true);
                search("KFC");
              }}
            >
              ⭐ No.1 Trending<br />KFC
            </div>

            <div
              onClick={() => {
                setSearchInput("Kota Kinabalu");
                setSearchActive(true);
                search("Kota Kinabalu");
              }}
            >
              ⭐ No.2 Trending<br />Kota Kinabalu
            </div>

            <div
              onClick={() => {
                setSearchInput("Donald Duck");
                setSearchActive(true);
                search("Donald Duck");
              }}
            >
              ⭐ No.3 Trending<br />Donald Duck
            </div>

            {/* Search History */}
            {history.map(h => (
              <div
                key={h}
                onClick={() => {
                  setSearchInput(h);
                  setSearchActive(true);
                  search(h);
                }}
              >
                🔍 {h}
              </div>
            ))}
          </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  clearHistory();
                  clearSearch();
                  setSearchInput("");
                }}
                style={{
                  marginTop: 16,
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                Clear search history
              </button>
            )}
        </aside>
      </div>

      <button
        className="floating-create-btn"
        onClick={() => setShowCreatePost(true)}
      >
        +
      </button>

      {showCreatePost && (
        <CreatePostModal
          onClose={() => {
            setShowCreatePost(false);
            loadInitial();
          }}
        />
      )}

    </div>
  );
}
