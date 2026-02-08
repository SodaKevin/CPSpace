// src/pages/diaries/EventItem.jsx

function formatDateTime(ts) {
  if (!ts) return "";

  const date = ts.toDate ? ts.toDate() : new Date(ts);

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventItem({
  eventId,
  title,
  currentEmotion,
  emotionHistory,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <div className="event-item">
      <div
        className="event-header"
        onClick={() => onToggle(eventId)}
      >
        <div className="event-title">{title}</div>

        <div className="event-emotion">
          <span className="event-feelings">
            {currentEmotion.feelings.join(", ")}
          </span>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="event-actions">
            <span
              className="event-action"
              title="Edit emotion"
              onClick={() => onEdit(eventId)}
            >
              ✏️
            </span>
            <span
              className="event-action"
              title="Delete event"
              onClick={() => onDelete(eventId)}
            >
              🗑
            </span>
          </div>

          <div className="event-timeline">
            {emotionHistory.map((e, idx) => (
              <div key={idx} className="timeline-entry">
                <div className="timeline-time">
                  {formatDateTime(e.changedAt)}
                </div>

                <div className="timeline-emotion">
                  <strong>{e.category}</strong> —{" "}
                  {e.feelings.join(", ")}
                </div>

                {e.note && (
                  <div className="timeline-note">{e.note}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
