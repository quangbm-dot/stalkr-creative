import type { CaseConfig } from "../../types/case";
import openLinkApp from "../../services/AdController";
import logo from "../../Assets/UI/icon-end-card.webp";
import endText from "../../Assets/UI/endcard-text.webp";
import endButton from "../../Assets/UI/endcard-button.webp";
import styles from "./EndCard.module.scss";

interface EndCardProps {
  caseData: CaseConfig;
}

export default function EndCard({ caseData }: EndCardProps) {
  return (
    <div className={styles.overlay}>
      <img className={styles.logo} src={logo} alt="Stalkr" />
      <img className={styles.text} src={endText} alt={caseData.endCard.headline} />
      <button type="button" className={styles.cta} onClick={openLinkApp}>
        <img src={endButton} alt={caseData.endCard.ctaLabel} />
      </button>
    </div>
  );
}
