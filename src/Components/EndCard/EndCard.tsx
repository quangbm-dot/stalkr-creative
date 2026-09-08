import type { CaseConfig } from "../../types/case";
import openLinkApp from "../../services/AdController";
import logo from "../../Assets/UI/icon-end-card.webp";
import styles from "./EndCard.module.scss";

interface EndCardProps {
  caseData: CaseConfig;
}

export default function EndCard({ caseData }: EndCardProps) {
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
