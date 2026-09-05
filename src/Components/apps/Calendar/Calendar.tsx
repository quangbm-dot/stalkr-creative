import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Calendar.module.scss";

interface CalendarProps {
  caseData: CaseConfig;
  onBack: () => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ caseData, onBack }: CalendarProps) {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  const eventDays = new Set(
    caseData.calendar
      .map((e) => parseInt(e.date.split("/")[1] ?? "", 10))
      .filter((d) => !Number.isNaN(d))
  );

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <AppScreen title="Calendar" onBack={onBack} theme="light">
      <div className={styles.monthHeader}>{monthName}</div>
      <div className={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, i) => (
          <div key={i} className={styles.cell}>
            {day && (
              <div className={day === now.getDate() ? styles.dayToday : styles.day}>
                {day}
                {eventDays.has(day) && <span className={styles.dot} />}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.agenda}>
        {caseData.calendar.map((e, i) => (
          <div key={i} className={styles.agendaRow}>
            <span className={styles.agendaDate}>{e.date}</span>
            <span className={styles.agendaTitle}>{e.title}</span>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
