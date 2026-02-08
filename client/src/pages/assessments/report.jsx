import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./report.css";

import { getAllStrategies } from "../../services/adminHubService";
import { getAssessmentRecommendations } from "../../services/assessmentRecommendationService";
import { ASSESSMENT_TO_DOMAIN_SEVERITY } from "../../domain/tagSeverityMap";

import { Link } from "react-router-dom";
import { TAG_LABELS } from "../../domain/tagLabels";

export default function AssessmentReport() {
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState(null);

  const [recommendations, setRecommendations] = useState([]);

  // 1️⃣ Load from route state if available
  useEffect(() => {
    if (location.state) {
      setReport(location.state);
    }
  }, [location.state]);

  // 2️⃣ Fallback: load latest assessment from Firestore
  useEffect(() => {
    const fetchLatest = async () => {
      if (location.state) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "users", user.uid, "assessments"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setReport({
          type: data.type,
          score: data.score,
          severity: data.severity,
        });
      }
    };

    fetchLatest();
  }, [location.state]);

  useEffect(() => {
    async function loadRecommendations() {
      if (!report?.severity) return;

      try {
        const strategies = await getAllStrategies();

        const domainSeverity =
          ASSESSMENT_TO_DOMAIN_SEVERITY[report.severity];

        if (!domainSeverity) return;

        const recs = getAssessmentRecommendations({
          severity: domainSeverity,
          strategies,
          limit: 3,
        });

        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to load assessment recommendations:", err);
      }
    }

    loadRecommendations();
  }, [report]);

  // Loading guard
  if (!report) {
    return (
      <div className="assessment-panel report">
        <p className="assessment-intro">Loading report...</p>
      </div>
    );
  }

  const { type, score, severity } = report;

  return (
    <div className="assessment-panel report">
      <h2>{type} Assessment Report</h2>

      <p className="assessment-intro">
        This report summarizes your responses based on the assessment you
        completed. It is not a medical diagnosis.
      </p>

      <div className="report-card">
        <div className="report-row">
          <span className="label">Assessment Type</span>
          <span className="value">{type}</span>
        </div>

        <div className="report-row">
          <span className="label">Total Score</span>
          <span className="value">{score}</span>
        </div>

        <div className="report-row">
          <span className="label">Severity Level</span>
          <span className={`value severity ${severity.toLowerCase()}`}>
            {severity}
          </span>
        </div>
      </div>

      <div className="report-note">
        <p>
          If your results indicate moderate or higher levels, you may consider
          exploring coping strategies or seeking professional support.
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="report-card">
          <h3 style={{ marginBottom: "12px" }}>
            Recommended Coping Strategies
          </h3>

          {recommendations.map((s) => (
            <div key={s.id} className="report-row" style={{ alignItems: "flex-start" }}>
              <div>
                <Link to={`/coping-hub/${s.id}`}>
                  <strong>{s.title}</strong>
                </Link>

                <div style={{ marginTop: "6px" }}>
                  {Array.isArray(s.tags) &&
                    s.tags.map(tag => (
                      <span
                        key={tag}
                        className="hub-tag"
                        style={{ marginRight: "6px" }}
                      >
                        {TAG_LABELS[tag] || tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="report-actions">
        <button onClick={() => navigate("/assessments")}>
          Take Another Test
        </button>

        <button
          className="primary"
          onClick={() =>
            navigate("/coping-hub", {
              state: {
                fromAssessment: true,
                severity,
              },
            })
          }
        >
          View Coping Strategies
        </button>
      </div>
    </div>
  );
}
