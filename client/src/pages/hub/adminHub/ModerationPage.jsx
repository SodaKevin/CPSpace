import { useState } from "react";
import FlaggedPostsPage from "./FlaggedPostsPage";
import FlaggedCommentsPage from "./FlaggedCommentsPage";
import HiddenContentPage from "./HiddenContentPage";
import "./adminModeration.css";

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState("flaggedPosts");
  const [showHidden, setShowHidden] = useState(false);

    return (
    <div className="admin-layout">
        <div className="admin-main">
        <h2 className="admin-title">Moderation Panel</h2>

        {/* SEGMENTED TAB */}
        <div className="admin-segment">
            <button
            className={`admin-segment-btn ${
                !showHidden && activeTab === "flaggedPosts" ? "active" : ""
            }`}
            onClick={() => {
                setShowHidden(false);
                setActiveTab("flaggedPosts");
            }}
            >
            Flagged Posts
            </button>

            <button
            className={`admin-segment-btn ${
                !showHidden && activeTab === "flaggedComments" ? "active" : ""
            }`}
            onClick={() => {
                setShowHidden(false);
                setActiveTab("flaggedComments");
            }}
            >
            Flagged Comments
            </button>

            <button
            className={`admin-segment-btn ${
                showHidden ? "active" : ""
            }`}
            onClick={() => setShowHidden(true)}
            >
            Hidden Content
            </button>
        </div>

        {/* CONTENT */}
        <div>
            {!showHidden && activeTab === "flaggedPosts" && <FlaggedPostsPage />}
            {!showHidden && activeTab === "flaggedComments" && <FlaggedCommentsPage />}
            {showHidden && <HiddenContentPage />}
        </div>
        </div>
    </div>
    );
}