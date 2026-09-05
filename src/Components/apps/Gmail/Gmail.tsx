import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Gmail.module.scss";

interface GmailProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Gmail({ caseData, onBack }: GmailProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const entry = openIndex !== null ? caseData.gmail[openIndex] : null;

  if (entry) {
    return (
      <AppScreen title={entry.sender} onBack={() => setOpenIndex(null)} theme="light" bodyPadding>
        <h2 className={styles.detailSubject}>{entry.subject}</h2>
        <p className={styles.detailBody}>{entry.preview}</p>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Inbox" onBack={onBack} theme="light">
      <div className={styles.list}>
        {caseData.gmail.map((g, i) => (
          <button key={i} type="button" className={styles.row} onClick={() => setOpenIndex(i)}>
            <span className={styles.avatar}>{g.sender.charAt(0)}</span>
            <span className={styles.text}>
              <span className={styles.sender}>{g.sender}</span>
              <span className={styles.subject}>{g.subject}</span>
              <span className={styles.preview}>{g.preview}</span>
            </span>
          </button>
        ))}
      </div>
      <button type="button" className={styles.fab} aria-label="Compose">
        ✎
      </button>
    </AppScreen>
  );
}
