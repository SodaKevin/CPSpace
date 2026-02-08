// src/pages/assessments/selection.jsx
import { useNavigate } from "react-router-dom";
import "./selection.css";

export default function AssessmentSelect() {
  const navigate = useNavigate();

  return (
    <div className="assessment-panel">
      <h2>Mental Health Assessments</h2>

      <p className="assessment-intro">
        These self-assessment tools help you reflect on your emotional
        well-being. They are not a medical diagnosis.
      </p>

      <div className="assessment-cards">
        <div className="assessment-card">
          <h3>PHQ-9</h3>
          <p>
            Assesses depressive symptoms experienced over the past two weeks.
          </p>
          <button onClick={() => navigate("/assessments/phq-9")}>
            Start PHQ-9
          </button>
        </div>

        <div className="assessment-card">
          <h3>GAD-7</h3>
          <p>
            Measures anxiety severity and how often symptoms occur.
          </p>
          <button onClick={() => navigate("/assessments/gad-7")}>
            Start GAD-7
          </button>
        </div>
      </div>

      {/* RETURN BUTTON */}
      <div className="form-actions">
        <button onClick={() => navigate("/assessments")}>
          Return
        </button>
      </div>
    </div>
  );
}
