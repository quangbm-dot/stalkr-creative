import StatusBar from "../PhoneFrame/StatusBar";
import TrustMeter from "../TrustMeter/TrustMeter";
import openLinkApp from "../../services/AdController";
import downloadBtn from "../../Assets/UI/download.webp";
import type { CaseConfig, VictimRef } from "../../types/case";
import VictimTray from "../VictimTray/VictimTray";
import styles from "./TopBar.module.scss";

interface TopBarProps {
  caseData: CaseConfig;
  /** Câu hiện tại (1-indexed) — xong câu cuối thì = total + 1 */
  current: number;
  total: number;
  /** v13: các cô gái đã thu thập */
  collected?: VictimRef[];
}

/**
 * v13: dải trên cùng = StatusBar giả + tên case/Download + thanh Trust (tụt
 * theo số manh mối đã tìm được). Render bên trong dải nền riêng
 * (PhoneFrame.aboveBar), luôn hiện cùng màn hình với điện thoại + câu hỏi.
 */
export default function TopBar({ caseData, current, total, collected = [] }: TopBarProps) {
  const solved = Math.min(Math.max(current - 1, 0), total);
  const trust = Math.round(100 - (100 * solved) / total);
  const t = caseData.trust;
  const reaction = t ? (t.clientReactions.find((r) => trust >= r.min)?.text ?? "") : "";
  return (
    <div className={styles.wrap}>
      <div className={styles.statusSlot}>
        <StatusBar dark />
      </div>
      <div className={styles.bar}>
        <span className={styles.subtitle}>Fictional case · {caseData.owner.first}'s phone</span>
        <button type="button" className={styles.download} onClick={openLinkApp}>
          <img src={downloadBtn} alt="Download" />
        </button>
      </div>
      {t && (
        <TrustMeter
          value={trust}
          label={t.label}
          avatar={caseData.client.avatar}
          reaction={reaction}
          rightSlot={caseData.endCard.victims ? <VictimTray slots={caseData.endCard.victims.length} collected={collected} /> : undefined}
        />
      )}
    </div>
  );
}
