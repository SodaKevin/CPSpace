  // socialSpace/SocialSpace.jsx
import { useEffect, useState } from "react";
import { usePosts } from "./hooks/usePosts";
import PostCard from "./components/PostCard";
import "./socialSpace.css";
import { usePublicPseudonyms } from "./hooks/usePublicPseudonyms";
import CreatePostModal from "./components/CreatePostModal";

export default function SocialSpace() {
  const { posts, loadInitial, loadMore, loading } = usePosts();
  const [query, setQuery] = useState("");
  const pseudonymMap = usePublicPseudonyms();

  const [showCreatePost, setShowCreatePost] = useState(false);

  function refreshFeed() {
    loadInitial();
  }

  useEffect(() => {
    loadInitial();
  }, []);

  const filtered = posts.filter(p =>
    p.body.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="social-space-page">
      {/* TOP BAR */}
      <div className="social-space-topbar">
        <div className="topbar-left">
          <span className="topbar-title">Social Space</span>
        </div>

        <div className="topbar-center">
          <button disabled>Newest</button>
          <button disabled>Hot</button>
          <button disabled>Relevant</button>
        </div>

        <div className="topbar-right">
          {/* future actions */}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="social-space-layout">
      
        {/* FEED */}
        <div className="social-space">
          <div className="social-space__feed">
            {filtered.map(p => (
              <PostCard
                key={p.id}
                post={p}
                pseudonym={pseudonymMap[p.authorId] || "Anonymous"}
                onPostUpdated={refreshFeed}
              />
            ))}
          </div>

          <button
            className="social-space__load-more"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <aside className="social-space__side">
          <h3>Search</h3>

          <input
            className="side-search"
            placeholder="Search a post"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <div className="trending">
            <div>⭐ No.1 Trending<br />KFC</div>
            <div>⭐ No.2 Trending<br />Kota Kinabalu</div>
            <div>⭐ No.3 Trending<br />Donald Duck</div>
          </div>
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
