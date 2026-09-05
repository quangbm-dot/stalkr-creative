import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Settings.module.scss";

interface SettingsProps {
  caseData: CaseConfig;
  onBack: () => void;
}

const ROWS = ["Airplane Mode", "Wi-Fi", "Bluetooth", "Notifications", "Sounds", "Privacy"];

export default function Settings({ caseData, onBack }: SettingsProps) {
  return (
    <AppScreen title="Settings" onBack={onBack}>
      <div className={styles.profile}>
        <img className={styles.avatar} src={caseData.owner.avatar} alt={caseData.owner.full} />
        <div>
          <div className={styles.name}>{caseData.owner.full}</div>
          <div className={styles.sub}>Apple ID, iCloud</div>
        </div>
      </div>
      <div className={styles.list}>
        {ROWS.map((row) => (
          <div key={row} className={styles.row}>
            <span>{row}</span>
            <span className={styles.caret}>›</span>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
