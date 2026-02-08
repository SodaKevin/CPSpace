import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getAllStrategies,
  deleteStrategy,
} from "../../../services/adminHubService";
import "./strategyList.css";

export default function AdminStrategyList() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const scrollTopRef = useRef(null);

  useEffect(() => {
    async function fetchStrategies() {
      try {
        const data = await getAllStrategies();
        setStrategies(data);
      } catch (err) {
        console.error("Failed to load strategies:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStrategies();
  }, []);

  useEffect(() => {
    scrollTopRef.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }, [currentPage]);

  async function handleDelete(id) {
    const ok = window.confirm(
      "Are you sure you want to delete this strategy?"
    );
    if (!ok) return;

    try {
      await deleteStrategy(id);
      setStrategies((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete strategy:", err);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return <p>Loading strategies...</p>;
  }

  const filteredStrategies = strategies.filter((s) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;

    return (
      s.title?.toLowerCase().includes(q) ||
      s.author?.toLowerCase().includes(q) ||
      (Array.isArray(s.tags) &&
        s.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  });

  const totalPages = Math.ceil(filteredStrategies.length / ITEMS_PER_PAGE);

  const paginatedStrategies = filteredStrategies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="admin-strategy-page">
      <div ref={scrollTopRef} />

    <div className="admin-header">
      <h2>Manage Strategies</h2>

      <Link to="/admin/strategies/new" className="add-btn">
        + Add Strategy
      </Link>
    </div>

    {/* SEARCH BAR */}
    <div className="admin-search-row">
      <input
        type="text"
        placeholder="Search strategies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="admin-search"
      />
    </div>

      {strategies.length === 0 ? (
        <p>No strategies found.</p>
      ) : (
        <table className="strategy-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedStrategies.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.author}</td>
                <td>
                  {Array.isArray(s.tags) ? s.tags.join(", ") : ""}
                </td>
                <td className="actions">
                  <Link
                    to={`/admin/strategies/edit/${s.id}`}
                    className="edit-btn"
                  >
                    Edit
                  </Link>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {totalPages > 1 && (
      <div className="pagination">
        {/* PREV */}
        <button
          className="page-nav"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          ‹
        </button>

        {/* PAGE NUMBERS */}
        <div className="page-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-number ${page === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        {/* NEXT */}
        <button
          className="page-nav"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          ›
        </button>
      </div>
    )}
    </div>
  );
}
