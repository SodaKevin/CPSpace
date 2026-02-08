// src/pages/diaries/CalendarPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getMonthLabel,
  getMonthGrid,
  getYearRange,
} from "./utils/dateUtils";
import "./calendar.css";

export default function CalendarPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // initial date comes from DiaryPage
  const initialDate = location.state?.activeDate
    ? new Date(location.state.activeDate)
    : new Date();

  const [viewMode, setViewMode] = useState("month"); // "month" | "year"
  const [activeDate, setActiveDate] = useState(initialDate);

  useEffect(() => {
    if (location.state?.activeDate) {
      setActiveDate(new Date(location.state.activeDate));
    }
  }, [location.state]);

  /* ===============================
     NAVIGATION HANDLERS
  =============================== */

  function goBackToDiary(date) {
    navigate("/diary", {
      state: { activeDate: date },
    });
  }

  function changeMonth(offset) {
    const d = new Date(activeDate);
    d.setMonth(d.getMonth() + offset);
    setActiveDate(d);
  }

  function selectDay(date) {
    goBackToDiary(date);
  }

  function selectMonth(monthIndex) {
    const d = new Date(activeDate);
    d.setMonth(monthIndex);
    setActiveDate(d);
    setViewMode("month");
  }

  function selectYear(year) {
    const d = new Date(activeDate);
    d.setFullYear(year);
    setActiveDate(d);
    setViewMode("month");
  }

  /* ===============================
     RENDER
  =============================== */

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        {/* HEADER */}
        <div className="calendar-header">
          <button
            className="calendar-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h2
            className="calendar-title"
            onClick={() =>
              setViewMode(viewMode === "month" ? "year" : "month")
            }
            style={{ cursor: "pointer" }}
          >
            {getMonthLabel(activeDate)} {activeDate.getFullYear()}
          </h2>
        </div>

        {/* BODY */}
        {viewMode === "month" && (
          <MonthView
            activeDate={activeDate}
            onPrev={() => changeMonth(-1)}
            onNext={() => changeMonth(1)}
            onSelectDay={selectDay}
          />
        )}

        {viewMode === "year" && (
          <YearView
            activeDate={activeDate}
            onSelectYear={selectYear}
          />
        )}
      </div>
    </div>
  );
}

/* ===============================
   MONTH VIEW
=============================== */

function MonthView({ activeDate, onPrev, onNext, onSelectDay }) {
  const days = getMonthGrid(activeDate);
  const currentMonth = activeDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="month-view">
      <div className="month-nav">
        <button onClick={onPrev}>‹</button>
        <button onClick={onNext}>›</button>
      </div>

      <div className="week-labels">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="week-label">
            {d}
          </div>
        ))}
      </div>

      <div className="month-grid">
        {days.map((date, idx) => {
          const isCurrentMonth =
            date.getMonth() === currentMonth;

          const cellDate = new Date(date);
          cellDate.setHours(0, 0, 0, 0);

          const isToday = cellDate.getTime() === today.getTime();
          return (
            <div
              key={idx}
              className={`day-cell
                ${isCurrentMonth ? "" : "muted"}
                ${isToday ? "active" : ""}
              `}
              onClick={() => onSelectDay(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===============================
   YEAR VIEW
=============================== */

function YearView({ activeDate, onSelectYear }) {
  const years = getYearRange(activeDate);

  return (
    <div className="year-view">
      {years.map((year) => (
        <div
          key={year}
          className={`year-cell ${
            year === activeDate.getFullYear()
              ? "active"
              : ""
          }`}
          onClick={() => onSelectYear(year)}
        >
          {year}
        </div>
      ))}
    </div>
  );
}
