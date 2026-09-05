import { useState } from "react";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Calculator.module.scss";

interface CalculatorProps {
  onBack: () => void;
}

const KEYS = ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", "."];

export default function Calculator({ onBack }: CalculatorProps) {
  const [display, setDisplay] = useState("0");

  const pressKey = (key: string) => {
    if (key === "C") return setDisplay("0");
    if (key === "±") return setDisplay((d) => (d.startsWith("-") ? d.slice(1) : "-" + d));
    setDisplay((d) => (d === "0" && /\d/.test(key) ? key : d + key));
  };

  return (
    <AppScreen title="Calculator" onBack={onBack} bodyPadding>
      <div className={styles.display}>{display}</div>
      <div className={styles.keys}>
        {KEYS.map((k) => (
          <button key={k} type="button" className={styles.key} onClick={() => pressKey(k)}>
            {k}
          </button>
        ))}
        <button type="button" className={`${styles.key} ${styles.equals}`} onClick={() => setDisplay("0")}>
          =
        </button>
      </div>
    </AppScreen>
  );
}
