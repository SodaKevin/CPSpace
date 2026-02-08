import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./gad7.css";

const QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const OPTIONS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

// GAD-7 severity interpretation
const getGAD7Severity = (score) => {
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  return "Severe";
};

export default function GAD7() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  const handleChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    // Validation
    if (Object.keys(answers).length !== QUESTIONS.length) {
      setError("Please answer all questions before proceeding.");
      return;
    }

    setError("");

    // Scoring
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    const severity = getGAD7Severity(score);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to save assessment results.");
        return;
      }

      // Save to Firestore
      await addDoc(
        collection(db, "users", user.uid, "assessments"),
        {
          type: "GAD-7",
          score,
          severity,
          createdAt: serverTimestamp(),
        }
      );

      // Navigate to report
      navigate("/assessments/report", {
        state: {
          type: "GAD-7",
          score,
          severity,
        },
      });
    } catch (err) {
      console.error("Error saving GAD-7 result:", err);
      setError("Failed to save assessment. Please try again.");
    }
  };

  return (
    <div className="assessment-panel">
      <h2 className="form-title">GAD-7 Assessment Form</h2>

      <p className="assessment-intro">
        Over the last 2 weeks, how often have you been bothered by the following
        problems? Please select your answers.
      </p>

      {/* HEADER */}
      <div className="form-grid header">
        <div />
        {OPTIONS.map((option) => (
          <div key={option} className="header-cell">
            {option}
          </div>
        ))}
      </div>

      {/* QUESTIONS */}
      {QUESTIONS.map((question, qIndex) => (
        <div key={qIndex} className="form-grid">
          <div className="question-cell">
            {qIndex + 1}. {question}
          </div>

          {OPTIONS.map((_, value) => (
            <label key={value} className="option-cell">
              <input
                type="radio"
                name={`q-${qIndex}`}
                value={value}
                checked={answers[qIndex] === value}
                onChange={() => handleChange(qIndex, value)}
              />
              <span className="radio-custom" />
            </label>
          ))}
        </div>
      ))}

      {/* ERROR */}
      {error && <div className="form-error">{error}</div>}

      {/* ACTIONS */}
      <div className="form-actions">
        <button onClick={() => navigate("/assessments/selection")}>
          Return
        </button>
        <button className="primary" onClick={handleSubmit}>
          Proceed
        </button>
      </div>
    </div>
  );
}
