import { useEffect } from "react";
import type { CaseConfig } from "../../types/case";
import openLinkApp, { trackPlayableEvent } from "../../services/AdController";
import logo from "../../Assets/UI/icon-end-card.webp";
import styles from "./EndCard.module.scss";

interface EndCardProps {
  caseData: CaseConfig;
}

export default function EndCard({ caseData }: EndCardProps) {
  // Màn EndCard CỦA RIÊNG playable (không phải endcard do mạng quảng cáo tự
  // vẽ đè sau khi đóng) — báo ngay khi nó hiện ra.
  useEffect(() => {
    trackPlayableEvent("ENDCARD_SHOWN");
  }, []);

  return (
    <div className={styles.overlay}>
      <img className={styles.logo} src={logo} alt="Stalkr" />
      <h2 className={styles.headline}>{caseData.endCard.headline}</h2>
      <p className={styles.subhead}>{caseData.endCard.subhead}</p>
      <span className={styles.fictionBadge}>Fictional mystery game</span>
      <button type="button" className={styles.cta} onClick={openLinkApp}>
        {caseData.endCard.ctaLabel}
      </button>
    </div>
  );
}
