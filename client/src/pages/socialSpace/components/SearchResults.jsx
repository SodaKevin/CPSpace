// socialSpace/components/SearchResults.jsx

import PostCard from "./PostCard";

export default function SearchResults({
  results,
  loading,
  searchedAll,
  onSearchMore,
  pseudonymMap,
  query
}) {
  return (
    <div className="social-space__feed">
      <h3 style={{ marginBottom: 16 }}>
        Search results for “{query}”
      </h3>

      {results.map(p => (
        <PostCard
          key={p.id}
          post={p}
          pseudonym={pseudonymMap[p.authorId] || "Anonymous"}
        />
      ))}

      {loading && <div>Searching…</div>}

      {!searchedAll && results.length > 0 && (
        <button
          className="social-space__load-more"
          onClick={onSearchMore}
        >
          Search more
        </button>
      )}

      {searchedAll && (
        <div className="end-of-feed">
          <div className="end-of-feed__text">
            You’ve searched the entire space
          </div>
        </div>
      )}
    </div>
  );
}
