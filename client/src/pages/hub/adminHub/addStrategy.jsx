import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addStrategy } from "../../../services/adminHubService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import "./addStrategy.css";

export default function AddStrategy() {
  const navigate = useNavigate();

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    instructions: "",
    tags: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("SUBMIT CLICKED");

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
      tags: form.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),

      audioUrl,
      videoUrl,
    };

    await addStrategy(payload);
    navigate("/admin/strategies");
  }

  return (
    <div className="add-strategy-page">
      <h2>Add Coping Strategy</h2>

      <form className="add-strategy-form" onSubmit={handleSubmit}>
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

        <div className="add-actions">
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
