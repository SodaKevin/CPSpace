import { useNavigate } from "react-router-dom";
import "./introduction.css";

export default function AssessmentIntroduction() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="assessment-panel introduction">
        <h2>WELCOME TO MENTAL HEALTH SELF-ASSESSMENT PAGE</h2>

        <div className="introduction-box">
          <p>
            This self-assessment consists of two short questionnaires, PHQ-9 and
            GAD-7, designed to help you reflect on your current mood and anxiety
            levels. The test usually takes 3–5 minutes to complete, and your
            responses will be kept private within CPSpace.
          </p>

          <p>
            This assessment is not a medical diagnosis, but it provides insight
            into your emotional well-being and helps us recommend suitable coping
            strategies for you.
          </p>
        </div>

        <p className="introduction-quote">
          “Reflect on your well-being through validated mental health screening
          tools.”
        </p>

        <div className="introduction-actions">
          <button
            className="secondary"
            onClick={() => navigate("/assessments/history")}
          >
            TEST HISTORY
          </button>

          <button
            className="primary"
            onClick={() => navigate("/assessments/selection")}
          >
            TAKE TEST
          </button>
        </div>
      </div>
    </div>
  );
}
