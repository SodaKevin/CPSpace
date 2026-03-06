import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getStrategyById,
  updateStrategy,
} from "../../../services/adminHubService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import { TAG_LABELS } from "../../../domain/tagLabels";
import "./strategyLayout.css";

export default function EditStrategy() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;

  const [loading, setLoading] = useState(true);

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [descLength, setDescLength] = useState(0);
  const [instLength, setInstLength] = useState(0);

  const [existingAudio, setExistingAudio] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    instructions: "",
    tags: [],
  });

  useEffect(() => {
    async function fetchStrategy() {
      try {
        const data = await getStrategyById(id);
        if (!data) {
        navigate(`/admin/strategies?page=${page}`, { replace: true });
          return;
        }

        setForm({
          title: data.title || "",
          author: data.author || "",
          description: data.description || "",
          instructions: data.instructions || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
        });
        
        setDescLength((data.description || "").length);
        setInstLength((data.instructions || "").length);

        setExistingAudio(data.audioUrl || null);
        setExistingVideo(data.videoUrl || null);
      } catch (err) {
        console.error("Failed to load strategy:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStrategy();
  }, [id, navigate]);

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

    let audioUrl = existingAudio;
    let videoUrl = existingVideo;

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

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
      tags: form.tags,
      audioUrl,
      videoUrl,
    };

    try {
      await updateStrategy(id, payload);
      navigate(`/admin/strategies?page=${page}`, { replace: true });
    } catch (err) {
      console.error("Failed to update strategy:", err);
    }
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

  if (loading) return <p>Loading strategy...</p>;

  return (
    <div className="strategy-page">
      <h2>Edit Coping Strategy</h2>

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
        {existingAudio && (
          <small>Existing audio will be kept unless replaced</small>
        )}

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

          {existingAudio && !audioFile && (
            <button
              type="button"
              className="file-remove"
              onClick={() => setExistingAudio(null)}
              title="Remove existing audio"
            >
              ×
            </button>
          )}
        </div>

        <label>Video (optional)</label>
        {existingVideo && (
          <small>Existing video will be kept unless replaced</small>
        )}

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

          {existingVideo && !videoFile && (
            <button
              type="button"
              className="file-remove"
              onClick={() => setExistingVideo(null)}
              title="Remove existing video"
            >
              ×
            </button>
          )}
        </div>

        <div className="strategy-actions">
          <button type="submit">Save Changes</button>
          <button
            type="button"
            className="secondary"
            onClick={() => navigate(`/admin/strategies?page=${page}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
