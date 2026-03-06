import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import {
  getAllStrategies,
  deleteStrategy,
} from "../../../services/adminHubService";
import { TAG_LABELS } from "../../../domain/tagLabels";
import "./strategyList.css";
import "../../settings/preferences.css";

export default function AdminStrategyList() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 20;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const setCurrentPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const scrollTopRef = useRef(null);
  const location = useLocation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState(null);

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

  async function confirmDelete() {
    if (!strategyToDelete) return;

    try {
      await deleteStrategy(strategyToDelete);
      setStrategies((prev) => {
        const updated = prev.filter((s) => s.id !== strategyToDelete);

        const newTotalPages = Math.ceil(updated.length / ITEMS_PER_PAGE);

        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }

        return updated;
      });
    } catch (err) {
      console.error("Failed to delete strategy:", err);
    } finally {
      setShowDeleteConfirm(false);
      setStrategyToDelete(null);
    }
  }

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
        onChange={(e) => {
          const value = e.target.value;
          setSearchQuery(value);

          const params = new URLSearchParams(searchParams);
          params.set("q", value);
          params.set("page", 1);
          setSearchParams(params);
        }}
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
                  {Array.isArray(s.tags)
                    ? s.tags
                        .map(tag => TAG_LABELS[tag] || tag)
                        .join(", ")
                    : ""}
                </td>
                <td className="actions">
                <Link
                  to={`/admin/strategies/edit/${s.id}?page=${currentPage}`}
                  replace={false}
                  className="edit-btn"
                >
                  Edit
                </Link>

                  <button
                    className="delete-btn"
                    onClick={() => {
                      setStrategyToDelete(s.id);
                      setShowDeleteConfirm(true);
                    }}
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
          onClick={() => setCurrentPage(currentPage - 1)}
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
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          ›
        </button>
      </div>
    )}
    {showDeleteConfirm && (
      <div className="pref-modal-overlay">
        <div className="pref-modal-dialog">
          <h3>Delete Feedback?</h3>

          <p>
            This action cannot be undone.
          </p>

          <div className="pref-modal-actions">
            <button
              className="pref-confirm"
              onClick={confirmDelete}
            >
              Delete
            </button>

            <button
              className="pref-cancel"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
