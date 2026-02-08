import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getStrategyById,
  updateStrategy,
} from "../../../services/adminHubService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import "./EditStrategy.css";

export default function EditStrategy() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [existingAudio, setExistingAudio] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    instructions: "",
    tags: "",
  });

  useEffect(() => {
    async function fetchStrategy() {
      try {
        const data = await getStrategyById(id);
        if (!data) {
          navigate("/admin/strategies");
          return;
        }

        setForm({
          title: data.title || "",
          author: data.author || "",
          description: data.description || "",
          instructions: data.instructions || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        });

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
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

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
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),

      audioUrl,
      videoUrl,
    };

    try {
      await updateStrategy(id, payload);
      navigate("/admin/strategies");
    } catch (err) {
      console.error("Failed to update strategy:", err);
    }
  }

  if (loading) return <p>Loading strategy...</p>;

  return (
    <div className="edit-strategy-page">
      <h2>Edit Coping Strategy</h2>

      <form className="edit-strategy-form" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
          onChange={handleChange}
          required
        />

        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
        />

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

        <div className="edit-actions">
          <button type="submit">Save Changes</button>
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
