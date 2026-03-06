import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addStrategy } from "../../../services/adminHubService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import { TAG_LABELS } from "../../../domain/tagLabels";
import "./strategyLayout.css";

export default function AddStrategy() {
  const navigate = useNavigate();

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [descLength, setDescLength] = useState(0);
  const [instLength, setInstLength] = useState(0);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    instructions: "",
    tags: [],
  });

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "description") {
      if (value.length > 500) return;
      setDescLength(value.length);
    }

    if (name === "instructions") {
      if (value.length > 2000) return;
      setInstLength(value.length);
    }

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

async function handleSubmit(e) {
    e.preventDefault();

    if (form.tags.length === 0) {
      alert("Please select at least one tag.");
      return;
    }

    let audioUrl = null;
    let videoUrl = null;

    /* ===== AUDIO UPLOAD ===== */
    if (audioFile) {
      if (audioFile.size > 20 * 1024 * 1024) {
        alert("Audio must be under 20MB");
        return;
      }

      const audioRef = ref(
        storage,
        `strategies/audio/${Date.now()}_${audioFile.name}`
      );

      await uploadBytes(audioRef, audioFile);
      audioUrl = await getDownloadURL(audioRef);
    }

    /* ===== VIDEO UPLOAD ===== */
    if (videoFile) {
      if (videoFile.size > 100 * 1024 * 1024) {
        alert("Video must be under 100MB");
        return;
      }

      const videoRef = ref(
        storage,
        `strategies/video/${Date.now()}_${videoFile.name}`
      );

      await uploadBytes(videoRef, videoFile);
      videoUrl = await getDownloadURL(videoRef);
    }

    /* ===== FINAL PAYLOAD ===== */
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
      tags: form.tags,
      audioUrl,
      videoUrl,
    };

    await addStrategy(payload);
    navigate("/admin/strategies");
  }

  function toggleTag(tag) {
    setForm(prev => {
      const exists = prev.tags.includes(tag);

      if (exists) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        };
      }
    });
  }

  return (
    <div className="strategy-page">
      <h2>Add Coping Strategy</h2>

      <form className="strategy-form" onSubmit={handleSubmit}>
        <label>Title</label>

        <input
          name="title"
          placeholder="Enter title..."
          value={form.title}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <label>Author</label>

        <input
          name="author"
          placeholder="Enter author..."
          value={form.author}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <label>Description</label>

        <div className="strategy-textarea-wrapper">
          <textarea
            name="description"
            placeholder="Enter description..."
            value={form.description}
            onChange={handleChange}
            maxLength={500}
            required
          />

          <span className={`strategy-counter ${descLength > 450 ? "limit" : ""}`}>
            {descLength} / 500
          </span>
        </div>

        {descLength >= 450 && descLength < 500 && (
          <p className="strategy-warning">
            You are nearing the character limit.
          </p>
        )}

        {descLength === 500 && (
          <p className="strategy-error">
            You have reached the maximum character limit.
          </p>
        )}

        <label>Instructions</label>

        <div className="strategy-textarea-wrapper">
          <textarea
            name="instructions"
            placeholder="Enter instructions..."
            value={form.instructions}
            onChange={handleChange}
            maxLength={2000}
            required
          />

          <span className={`strategy-counter ${instLength > 1800 ? "limit" : ""}`}>
            {instLength} / 2000
          </span>
        </div>

        {instLength >= 1800 && instLength < 2000 && (
          <p className="strategy-warning">
            You are nearing the character limit.
          </p>
        )}

        {instLength === 2000 && (
          <p className="strategy-error">
            You have reached the maximum character limit.
          </p>
        )}

        <div className="tag-selection">
          <label className="section-label">Select Tags</label>

          <div className="tag-options">
            {Object.entries(TAG_LABELS).map(([key, label]) => (
              <label key={key} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={form.tags.includes(key)}
                  onChange={() => toggleTag(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <label>Audio (optional)</label>
        <div className="file-input-row">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files[0])}
          />

          {audioFile && (
            <button
              type="button"
              className="file-remove"
              onClick={() => setAudioFile(null)}
            >
              ×
            </button>
          )}
        </div>

        <label>Video (optional)</label>
        <div className="file-input-row">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />

          {videoFile && (
            <button
              type="button"
              className="file-remove"
              onClick={() => setVideoFile(null)}
            >
              ×
            </button>
          )}
        </div>

        <div className="strategy-actions">
        <button type="submit">Add Strategy</button>

        <button
            type="button"
            className="secondary"
            onClick={() => navigate("/admin/strategies")}
        >
            Cancel
        </button>
        </div>
      </form>
    </div>
  );
}
