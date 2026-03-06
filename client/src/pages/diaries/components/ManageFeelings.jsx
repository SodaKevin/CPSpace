import { useEffect, useMemo, useState } from "react";
import {
  addFeeling,
  CATEGORIES,
  EMPTY_FEELINGS,
  fetchFeelingsData,
  getCurrentUid,
  hideDefaultFeeling,
  MAX_CUSTOM_PER_CATEGORY,
  MAX_FEELING_LENGTH,
  restoreAllFeelings,
  restoreDefaultFeeling,
  TAB_LABELS,
  deleteFeeling,
  editFeeling,
} from "./manageFeelingsHelpers";
import { useNavigate } from "react-router-dom";

import "./manageFeelings.css";

export default function ManageFeelings() {
  const [activeTab, setActiveTab] = useState("pos");
  const [defaultFeelings, setDefaultFeelings] = useState(EMPTY_FEELINGS);
  const [addedFeelings, setAddedFeelings] = useState(EMPTY_FEELINGS);
  const [removedFeelings, setRemovedFeelings] = useState(EMPTY_FEELINGS);
  const [newFeeling, setNewFeeling] = useState("");
  const [editingFeeling, setEditingFeeling] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uid = getCurrentUid();

  const navigate = useNavigate();

  async function loadData() {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchFeelingsData(uid);
      setDefaultFeelings(data.defaultFeelings);
      setAddedFeelings(data.addedFeelings);
      setRemovedFeelings(data.removedFeelings);
    } catch (err) {
      setError(err.message || "Failed to load feelings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const effectiveFeelings = useMemo(() => {
    const computed = { pos: [], neu: [], neg: [] };

    CATEGORIES.forEach((category) => {
      computed[category] = (defaultFeelings[category] ?? [])
        .filter((feeling) => !(removedFeelings[category] ?? []).includes(feeling))
        .concat(addedFeelings[category] ?? []);
    });

    return computed;
  }, [defaultFeelings, removedFeelings, addedFeelings]);

  const customCount = (addedFeelings[activeTab] ?? []).length;

  async function handleAdd() {
    if (!uid) return;
    setError("");
    setSaving(true);

    try {
      await addFeeling({
        uid,
        category: activeTab,
        value: newFeeling,
        defaultFeelings,
        addedFeelings,
      });

      setNewFeeling("");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to add feeling.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(oldValue) {
    if (!uid) return;
    setError("");
    setSaving(true);

    try {
      await editFeeling({
        uid,
        category: activeTab,
        oldValue,
        newValue: editingValue,
        defaultFeelings,
        addedFeelings,
      });
      setEditingFeeling("");
      setEditingValue("");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to edit feeling.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustom(value) {
    if (!uid) return;
    setError("");
    setSaving(true);

    try {
      await deleteFeeling({ uid, category: activeTab, value });
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete feeling.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleDefault(value, isHidden) {
    if (!uid) return;
    setError("");
    setSaving(true);

    try {
      if (isHidden) {
        await restoreDefaultFeeling({ uid, category: activeTab, value });
      } else {
        await hideDefaultFeeling({ uid, category: activeTab, value });
      }

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update default feeling visibility.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestoreAll() {
    if (!uid) return;

    const confirmed = window.confirm(
      "Restore all feelings to default? This will remove all custom feelings, restore hidden defaults, and cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setSaving(true);

    try {
      await restoreAllFeelings(uid);
      setNewFeeling("");
      setEditingFeeling("");
      setEditingValue("");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to restore feelings.");
    } finally {
      setSaving(false);
    }
  }

  if (!uid) {
    return <div>Please sign in to manage feelings.</div>;
  }

  if (loading) {
    return <div>Loading feelings...</div>;
  }

  const currentDefaults = defaultFeelings[activeTab] ?? [];
  const currentRemoved = removedFeelings[activeTab] ?? [];
  const currentCustom = addedFeelings[activeTab] ?? [];

  return (
    <div className="manage-layout">
      <div className="manage-container">

        <div className="manage-header">
          <h2 className="manage-title">Manage Feelings</h2>
          <button
            className="manage-back-btn"
            onClick={() => navigate("/diary")}
          >
            ← Back
          </button>
        </div>

        <div className="manage-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`manage-tab ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              {TAB_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* DEFAULT SECTION */}
        <div className="manage-section">
          <div className="manage-section-title">Default Feelings</div>
          <div className="manage-tag-grid">
            {currentDefaults.map((f) => {
              const hidden = currentRemoved.includes(f);
              return (
                <div key={f} className="manage-tag-item">
                  <span className={`manage-tag ${hidden ? "hidden" : ""}`}>
                    {f}
                  </span>
                  <span
                    className="manage-tag-action"
                    onClick={() =>
                      handleToggleDefault(f, hidden)
                    }
                  >
                    {hidden ? "Restore" : "Hide"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUSTOM SECTION */}
        <div className="manage-section">
          <div className="manage-section-title">
            Custom Feelings ({customCount}/5)
          </div>

          <div className="manage-tag-grid">
            {currentCustom.map((f) => (
              <div key={f} className="manage-tag-item">
                <span className="manage-tag custom">{f}</span>
                <span
                  className="manage-tag-action"
                  onClick={() => setEditingFeeling(f)}
                >
                  Edit
                </span>
                <span
                  className="manage-tag-action"
                  onClick={() => handleDeleteCustom(f)}
                >
                  Delete
                </span>
              </div>
            ))}
          </div>

          <div className="manage-add-row">
            <input
              className="manage-input"
              value={newFeeling}
              onChange={(e) => setNewFeeling(e.target.value)}
              placeholder="Add custom feeling"
              maxLength={20}
            />
            <button
              className="manage-add-btn"
              onClick={handleAdd}
              disabled={customCount >= 5}
            >
              Add
            </button>
          </div>

          <div className="manage-meta">
            {newFeeling.length}/20 characters
          </div>
        </div>

        <button
          className="manage-restore-all"
          onClick={handleRestoreAll}
        >
          Restore All Feelings to Default
        </button>

      </div>
    </div>
  );
}
