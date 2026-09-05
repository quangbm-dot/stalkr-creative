import { useState } from "react";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Clock.module.scss";

interface ClockProps {
  onBack: () => void;
}

const ALARMS = [
  { time: "6:30", label: "Wake up", on: true },
  { time: "8:00", label: "Gym", on: false },
  { time: "22:30", label: "Sleep", on: true },
];

export default function Clock({ onBack }: ClockProps) {
  const [alarms, setAlarms] = useState(ALARMS);

  return (
    <AppScreen title="Alarm" onBack={onBack} bodyPadding>
      <div className={styles.list}>
        {alarms.map((a, i) => (
          <div key={i} className={a.on ? styles.row : styles.rowOff}>
            <span className={styles.time}>{a.time}</span>
            <span className={styles.label}>{a.label}</span>
            <button
              type="button"
              className={a.on ? styles.toggleOn : styles.toggleOff}
              onClick={() =>
                setAlarms(alarms.map((x, xi) => (xi === i ? { ...x, on: !x.on } : x)))
              }
            >
              <span className={styles.knob} />
            </button>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
