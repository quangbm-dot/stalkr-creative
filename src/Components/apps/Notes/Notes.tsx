import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Notes.module.scss";

interface NotesProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

export default function Notes({ caseData, onBack, hintTargetId, onFoundClue }: NotesProps) {
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
          {caseData.notes.map((n, i) => {
            const isHot = hintTargetId !== undefined && n.title === hintTargetId;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
                data-hint={isHot ? "row-clue" : undefined}
                onClick={() => {
                  if (isHot) onFoundClue?.();
                  setOpenIndex(i);
                }}
              >
                <span className={styles.title}>{n.title}</span>
                <span className={styles.preview}>{n.body}</span>
                {isHot && <span className={styles.hintHand}>👆</span>}
              </button>
            );
          })}
        </div>
      </div>
    </AppScreen>
  );
}
