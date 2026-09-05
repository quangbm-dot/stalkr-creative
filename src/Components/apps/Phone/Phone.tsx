import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Phone.module.scss";

interface PhoneProps {
  caseData: CaseConfig;
  onBack: () => void;
}

const TYPE_ICON: Record<string, string> = {
  incoming: "↙",
  outgoing: "↗",
  missed: "↙",
};

export default function Phone({ caseData, onBack }: PhoneProps) {
  return (
    <AppScreen title="Recents" onBack={onBack} theme="light">
      <div className={styles.list}>
        {caseData.calls.map((c, i) => (
          <div key={i} className={styles.row}>
            <span className={c.type === "missed" ? styles.iconMissed : styles.icon}>
              {TYPE_ICON[c.type]}
            </span>
            <span className={styles.meta}>
              <span className={c.type === "missed" ? styles.nameMissed : styles.name}>{c.name}</span>
              <span className={styles.time}>{c.time}</span>
            </span>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
