import { useEffect } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Settings.module.scss";

interface SettingsProps {
  caseData: CaseConfig;
  onBack: () => void;
  onFoundClue?: () => void;
}

const ROWS = ["Airplane Mode", "Wi-Fi", "Bluetooth", "Notifications", "Sounds", "Privacy"];

export default function Settings({ caseData, onBack, onFoundClue }: SettingsProps) {
  // Settings không có dòng cụ thể để chạm (không như Messages/Notes/...) —
  // mở app là thấy ngay tên chủ máy, nên chỉ cần MỞ app là đủ để tìm thấy
  // manh mối (onFoundClue chỉ được truyền khi đây đang là hintApp hiện tại).
  useEffect(() => {
    onFoundClue?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppScreen title="Settings" onBack={onBack}>
      <div className={`${styles.profile} ${onFoundClue ? styles.hintRow : ""}`}>
        <img className={styles.avatar} src={caseData.owner.avatar} alt={caseData.owner.full} />
        <div>
          <div className={styles.name}>{caseData.owner.full}</div>
          <div className={styles.sub}>Apple ID, iCloud</div>
        </div>
        {onFoundClue && <span className={styles.hintHand}>👆</span>}
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
