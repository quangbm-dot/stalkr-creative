import type { CaseConfig } from "../../types/case";
import openLinkApp from "../../services/AdController";
import styles from "./EndCard.module.scss";

interface EndCardProps {
  caseData: CaseConfig;
}

export default function EndCard({ caseData }: EndCardProps) {
  return (
    <div className={styles.overlay}>
      <span className={styles.icon}>🔍</span>
      <h2 className={styles.headline}>{caseData.endCard.question}</h2>
      <div className={styles.choices}>
        {caseData.endCard.choices.map((choice, i) => (
          <button
            key={choice}
            type="button"
            className={`${styles.choiceBtn} ${i === 1 ? styles.choiceBtnAlt : ""}`}
            onClick={openLinkApp}
          >
            {choice}
            {i === 1 && <span className={styles.choiceEyes}>👀</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
