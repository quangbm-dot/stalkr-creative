import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Notes.module.scss";

interface NotesProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Notes({ caseData, onBack }: NotesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const note = openIndex !== null ? caseData.notes[openIndex] : null;

  if (note) {
    return (
      <AppScreen title="Notes" onBack={() => setOpenIndex(null)} theme="light" bodyPadding>
        <h2 className={styles.detailTitle}>{note.title}</h2>
        <p className={styles.detailBody}>{note.body}</p>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Notes" onBack={onBack} theme="light">
      <div className={styles.wrap}>
        <div className={styles.group}>
          {caseData.notes.map((n, i) => (
            <button key={i} type="button" className={styles.row} onClick={() => setOpenIndex(i)}>
              <span className={styles.title}>{n.title}</span>
              <span className={styles.preview}>{n.body}</span>
            </button>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
