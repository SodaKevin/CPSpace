export function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthLabel(date) {
  return date.toLocaleString("en-US", { month: "long" });
}
// Firestore queries
// < November button text
// Calendar headers

export function getWeekDates(activeDate) {
  const date = new Date(activeDate);
  const day = date.getDay(); // 0 = Sun, 1 = Mon
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday

  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
// Monday → Sunday
// Locale-safe
// No mutation bugs

export function getMonthGrid(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startDay);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
}
// Always returns 6 weeks (42 cells) → stable layout
// Monday-based
// Perfect for month view

export function getYearRange(centerDate) {
  const currentYear = centerDate.getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
}

export function getLocalDateParts(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1–12
  const day = date.getDate();

  const dateKey =
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return { dateKey, year, month, day };
}