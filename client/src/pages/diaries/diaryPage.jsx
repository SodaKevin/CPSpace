// src/pages/diaries/diaryPage.jsx
import "./diary.css";
import "../mainLayout.css";

import { getAuth } from "firebase/auth";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getMonthLabel, getWeekDates, getLocalDateParts } from "./utils/dateUtils";
import { computeDailyScores } from "./utils/emotionAggregation";
import { build7DayTrend } from "./utils/trendBuilder";
import { saveWindowToCache, loadWindowFromCache, } from "./utils/diaryCache";

import EmotionTrendChart from "./components/EmotionTrendChart";

import EventItem from "./EventItem";
import DiaryEmotionModal from "./DiaryEmotionModal";
import EventEmotionModal from "./EventEmotionModal";

import { useEvents } from "./hooks/useEvents";
import { useEmotionLogs } from "./hooks/useEmotionLogs";
import { useReflections } from "./hooks/useReflections";

function formatTime(ts) {
  if (!ts || !ts.toDate) return "";
  const date = ts.toDate();
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WeekStrip({ activeDate, onSelectDate, onPrevWeek, onNextWeek }) {
  const weekDates = getWeekDates(activeDate);

  return (
    <div className="week-strip-wrapper">
      <button
        className="week-nav-btn"
        onClick={onPrevWeek}
        aria-label="Previous week"
      >
        ‹
      </button>

      <div className="week-strip">
        {weekDates.map((date) => {
          const isActive =
            date.toDateString() === activeDate.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`week-day ${isActive ? "active" : ""}`}
              onClick={() => onSelectDate(date)}
            >
              <div className="week-day-label">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="week-day-number">{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      <button
        className="week-nav-btn"
        onClick={onNextWeek}
        aria-label="Next week"
      >
        ›
      </button>
    </div>
  );
}

export default function DiaryPage() {

  // basic inits
  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();
  const navigate = useNavigate();

  // general inits
  const loading = false;
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  // "all" | "pleasant" | "neutral" | "unpleasant"
  const [activeDate, setActiveDate] = useState(
    location.state?.activeDate
      ? new Date(location.state.activeDate)
      : new Date()
  );

  // emotion log inits
  const [emotionDiaries, setEmotionDiaries] = useState([]);
  const [editingEmotion, setEditingEmotion] = useState(null);

  // diary inits
  const [reflectionDiaries, setReflectionDiaries] = useState([]);
  const [editingReflection, setEditingReflection] = useState(null);
  const [isReflectionMode, setIsReflectionMode] = useState(false);
  const [diaryText, setDiaryText] = useState("");

  // event inits
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [showEventTitleInput, setShowEventTitleInput] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [showEventEmotionModal, setShowEventEmotionModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  
  const { dateKey: activeDateKey } = getLocalDateParts(activeDate);

  const todaysEmotionDiaries = emotionDiaries.filter(
    d => d.dateKey === activeDateKey
  );

  const todaysReflectionDiaries = reflectionDiaries.filter(
    d => d.dateKey === activeDateKey
  );

  const mergedEntries = [
    ...emotionDiaries,
    ...reflectionDiaries,
  ];

  const dailyScores = computeDailyScores(mergedEntries);
  const trendData = build7DayTrend(dailyScores, activeDate);

  const {
    loadEvents,
    createEvent,
    updateEventEmotion,
    deleteEvent,
  } = useEvents(user, activeDate);

  const {
    loadEmotionLogs,
    createEmotion,
    updateEmotion,
    deleteEmotion,
  } = useEmotionLogs(user, activeDate);

  const {
    loadReflections,
    createReflection,
    updateReflection,
    deleteReflection,
  } = useReflections(user, activeDate);

  const filteredEmotionDiaries =
    activeCategory === "all"
      ? emotionDiaries
      : emotionDiaries.filter(
          (d) => d.category === activeCategory
        );

  function toggleEvent(id) {
    setExpandedEventId(prev => (prev === id ? null : id));
  }

  function goPrevWeek() {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 7);
    setActiveDate(d);
  }

  function goNextWeek() {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 7);
    setActiveDate(d);
  }

  // edit function
  function handleEditEmotion(entry) {
    setEditingEmotion(entry);
    setIsReflectionMode(false);      // ensure emotion mode
    setShowEmotionModal(true);
  }

  function handleEditReflection(entry) {
    setEditingReflection(entry);
    setDiaryText(entry.body);
    setIsReflectionMode(true);
    setShowEmotionModal(true);
  }

  function handleEditEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    setEditingEvent(event);
    setShowEditEventModal(true);
  }

  // save function
  async function saveEmotionDiary({ category, feelings }) {
    if (!user) return;

    // EDIT MODE
    if (editingEmotion) {
      await updateEmotion(editingEmotion.id, { category, feelings });
    } 
    // CREATE MODE
    else {
      await createEmotion({ category, feelings });  
    }

    setEditingEmotion(null);
    setShowEmotionModal(false);
    reloadEmotionLogs();
  }

  async function saveReflectionDiary({ category, feelings }) {
    if (!user) return;
    if (!diaryText.trim()) return;

    // EDIT MODE
    if (editingReflection) {
      await updateReflection(editingReflection.id, {
        category,
        feelings,
        body: diaryText,
      });
    }
    // CREATE MODE
    else {
      await createReflection({
        category,
        feelings,
        body: diaryText,
      });
    }

    setEditingReflection(null);
    setDiaryText("");
    setShowEmotionModal(false);
    reloadReflections();
  }

  // delete function
  async function handleDeleteEmotion(entryId) {
    if (!user) return;
    await deleteEmotion(entryId);
    reloadEmotionLogs();
  }

  async function handleDeleteReflection(entryId) {
    if (!user) return;
    await deleteReflection(entryId);
    reloadReflections();
  }

  // reloading (relaod)
  async function reloadEmotionLogs() {
    const cacheKey = `window-${activeDateKey}`;

    try {
      const list = await loadEmotionLogs();
      list.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

      setEmotionDiaries(list);

      await saveWindowToCache(cacheKey + "-emotion", list);
    } catch (err) {
      console.warn("Firestore failed, using cache", err);

      const cached = await loadWindowFromCache(cacheKey + "-emotion");
      if (cached) {
        setEmotionDiaries(cached);
      }
    }
  }

  async function reloadReflections() {
    const list = await loadReflections();
    list.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
    setReflectionDiaries(list);
  }

  async function reloadEvents() {
    const data = await loadEvents();
    setEvents(data);
  }

  useEffect(() => {
    if (!user) return;

    reloadEmotionLogs();
    reloadReflections();
    reloadEvents();
  }, [user, activeDate]);

  useEffect(() => {
    if (location.state?.activeDate) {
      setActiveDate(new Date(location.state.activeDate));
    }
  }, [location.state]);

  return (
    <div className="diary-layout">
      {/* CENTER */}
      <main className="diary-main">
        <div className="diary-top-center">
          <div className="diary-actions">
            <button
              onClick={() =>
                navigate("/calendar", {
                  state: { activeDate },
                })
              }
            >
              {getMonthLabel(activeDate)}
            </button>

            <button onClick={() => setShowEmotionModal(true)}>
              Today’s Emotion +
            </button>

            <button
              onClick={() => {
                setIsReflectionMode(true);
                setShowEmotionModal(true);
              }}
            >
              Diary +
            </button>

            <button
              onClick={() => navigate("/diaries/manage-feelings")}
            >
              Manage Feelings
            </button>
          </div>

          <WeekStrip
            activeDate={activeDate}
            onSelectDate={setActiveDate}
            onPrevWeek={goPrevWeek}
            onNextWeek={goNextWeek}
          />

          {/* EMOTION CATEGORY FILTER BAR */}
          <div className="emotion-segment">
            {["pleasant", "neutral", "unpleasant"].map((cat) => (
              <button
                key={cat}
                className={`emotion-segment-btn ${
                  activeCategory === cat ? "active" : ""
                }`}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? "all" : cat)
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div> 

        {loading ? (
          <div className="diary-placeholder">
            Loading today’s diary...
          </div>
        ) : (
          <>
            {/* TOP: Emotion-only diaries */}
            <div className="diary-entry">
              {todaysEmotionDiaries.length === 0 ? (
                <div className="diary-placeholder">
                  You haven’t recorded today’s emotion yet.
                  <br />
                  Click <strong>“Today’s Emotion +”</strong> to record.
                </div>
              ) : (
                <div className="diary-meta">

                  {(activeCategory === "all"
                    ? todaysEmotionDiaries
                    : todaysEmotionDiaries.filter(
                        (d) => d.category === activeCategory
                      )
                  ).map((entry) => (
                    <div key={entry.id} className="emotion-bubble">
                      <span className="emotion-time">
                        {formatTime(entry.createdAt)}
                      </span>

                      <span className="emotion-feelings">
                        {entry.feelings.join(", ")}
                      </span>

                      <span
                        className="emotion-action"
                        onClick={() => handleEditEmotion(entry)}
                        title="Edit"
                      >
                        ✎
                      </span>

                      <span
                        className="emotion-action"
                        onClick={() => handleDeleteEmotion(entry.id)}
                        title="Delete"
                      >
                        🗑
                      </span>
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* BOTTOM: Reflection diaries */}
            <div className="diary-entry" style={{ marginTop: "32px" }}>
              {todaysReflectionDiaries.length === 0 ? (
                <div className="diary-placeholder">
                  You haven’t written a diary yet.
                  <br />
                  Click <strong>“Diary +”</strong> to write one.
                </div>
              ) : (

                todaysReflectionDiaries.map((entry) => (
                  <div key={entry.id} className="diary-card">
                    <div className="diary-time-title">
                      {formatTime(entry.createdAt)}
                    </div>

                    <div className="diary-meta">
                      <span className="diary-emotion">{entry.category}</span>
                      {entry.feelings.map((f) => (
                        <span key={f} className="tag active">{f}</span>
                      ))}

                      <span
                        className="emotion-action"
                        onClick={() => handleEditReflection(entry)}
                        title="Edit"
                      >
                        ✎
                      </span>

                      <span
                        className="emotion-action"
                        onClick={() => handleDeleteReflection(entry.id)}
                        title="Delete"
                      >
                        🗑
                      </span>
                    </div>

                    <p className="diary-body">{entry.body}</p>
                  </div>
                ))
              )}
            </div>

            <EmotionTrendChart trendData={trendData} />

          </>
        )}

      </main>

      {/* RIGHT PANEL */}
      <aside className="diary-side">
        <h3>Today’s Event List</h3>
        <button
          onClick={() => {
            setShowEventTitleInput(true);
            setEventTitle("");
          }}
        >
          Record an event +
        </button>

        {showEventTitleInput && (
          <div style={{ marginTop: "12px", width: "100%" }}>
            <input
              type="text"
              placeholder="What is the event?"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              maxLength={100}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid var(--border-color)",
                fontSize: "14px",
                outline: "none",
              }}
            />

            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <button
                disabled={!eventTitle.trim()}
                onClick={() => {
                  setShowEventEmotionModal(true);
                }}
              >
                Continue
              </button>

              <button
                onClick={() => {
                  setShowEventTitleInput(false);
                  setEventTitle("");
                }}
                style={{ background: "transparent", color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showEventEmotionModal && (
          <EventEmotionModal
            title={eventTitle}
            onClose={() => {
              setShowEventEmotionModal(false);
              setShowEventTitleInput(false);
              setEventTitle("");
            }}
            onSave={(data) => {
              createEvent({
                title: eventTitle,
                ...data,
              });

              reloadEvents();

              setShowEventEmotionModal(false);
              setShowEventTitleInput(false);
              setEventTitle("");
            }}
          />
        )}

        {showEditEventModal && editingEvent && (
          <EventEmotionModal
            title={editingEvent.title}
            initialCategory={editingEvent.currentEmotion.category}
            initialFeelings={editingEvent.currentEmotion.feelings}
            onClose={() => {
              setShowEditEventModal(false);
              setEditingEvent(null);
            }}
            onSave={(data) => {
              updateEventEmotion(editingEvent.id, data);
              reloadEvents();

              setShowEditEventModal(false);
              setEditingEvent(null);
            }}
          />
        )}

        {events.length === 0 ? (
          <div className="diary-placeholder">
            No events recorded today.
          </div>
        ) : (
              events.map(event => (
                <EventItem
                  key={event.id}
                  eventId={event.id}
                  title={event.title}
                  currentEmotion={event.currentEmotion}
                  emotionHistory={event.emotionHistory}
                  isExpanded={expandedEventId === event.id}
                  onToggle={toggleEvent}
                  onEdit={handleEditEvent}
                  onDelete={async (id) => {
                    await deleteEvent(id);
                    reloadEvents();
                  }}
                />
              ))
            )
        }
      </aside>

      {showEmotionModal && (
        <DiaryEmotionModal
          mode={isReflectionMode ? "reflection" : "emotion"}
          initialCategory={editingEmotion?.category}
          initialFeelings={editingEmotion?.feelings}
          diaryText={diaryText}
          setDiaryText={setDiaryText}
          onClose={() => {
            setShowEmotionModal(false);
            setEditingEmotion(null);
            setIsReflectionMode(false);
            setDiaryText("");
          }}
          onSave={
            isReflectionMode
              ? saveReflectionDiary
              : saveEmotionDiary
          }
        />
      )}
    </div>
  );
}

