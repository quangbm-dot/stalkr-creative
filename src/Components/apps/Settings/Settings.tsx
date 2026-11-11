import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Settings.module.scss";

interface SettingsProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

const ROWS = ["Airplane Mode", "Wi-Fi", "Bluetooth", "Notifications", "Sounds", "Privacy"];

const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function Settings({ caseData, onBack, hintTargetId, onFoundClue }: SettingsProps) {
  const [showScreenTime, setShowScreenTime] = useState(false);
  const screenTime = caseData.screenTime ?? [];
  // Đáp án nằm trong Screen Time nhưng người chơi chưa bấm vào đó — dòng
  // cần tìm chưa hiện ra để sáng được, phải chỉ tay vào nút "Screen Time"
  // trước (giống lỗi tab Sent của Gmail).
  const needsScreenTime =
    hintTargetId !== undefined && screenTime.some((s) => s.appName === hintTargetId);

  if (showScreenTime) {
    return (
      <AppScreen title="Screen Time" onBack={() => setShowScreenTime(false)}>
        <div className={styles.list}>
          {screenTime.map((s) => {
            const isHot = hintTargetId !== undefined && s.appName === hintTargetId;
            return (
              <button
                key={s.appName}
                type="button"
                className={`${styles.stRow} ${isHot ? styles.hintRow : ""}`}
                onClick={() => isHot && onFoundClue?.()}
              >
                <span>{s.appName}</span>
                <span className={styles.stDuration}>{fmtDuration(s.durationMinutes)}</span>
                {isHot && <span className={styles.hintHand}>👆</span>}
              </button>
            );
          })}
        </div>
      </AppScreen>
    );
  }

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
        {screenTime.length > 0 && (
          <button
            type="button"
            className={`${styles.row} ${needsScreenTime ? styles.hintRow : ""}`}
            data-hint="settings-screentime"
            onClick={() => setShowScreenTime(true)}
          >
            <span>Screen Time</span>
            <span className={styles.caret}>›</span>
            {needsScreenTime && <span className={styles.hintHand}>👆</span>}
          </button>
        )}
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
