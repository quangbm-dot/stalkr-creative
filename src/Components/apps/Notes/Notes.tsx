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
  // v13: ghi chú khoá PIN — index đã mở khoá, và index đang hiện bàn phím nhập mã
  const [unlockedNotes, setUnlockedNotes] = useState<Set<number>>(new Set());
  const [padFor, setPadFor] = useState<number | null>(null);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const note = openIndex !== null ? caseData.notes[openIndex] : null;

  const pressDigit = (d: string) => {
    if (padFor === null) return;
    const code = caseData.notes[padFor].lock ?? "";
    const next = (pin + d).slice(0, code.length);
    setPin(next);
    if (next.length !== code.length) return;
    if (next === code) {
      setUnlockedNotes((s) => new Set(s).add(padFor));
      setOpenIndex(padFor);
      setPadFor(null);
      setPin("");
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 400);
    }
  };

  if (padFor !== null) {
    const n = caseData.notes[padFor];
    return (
      <AppScreen title="Locked note" onBack={() => { setPadFor(null); setPin(""); }} theme="light" bodyPadding>
        <div className={`${styles.padWrap} ${shake ? styles.nudge : ""}`}>
          <h2 className={styles.padTitle}>🔒 {n.title}</h2>
          {n.lockHint && <p className={styles.padHint}>{n.lockHint}</p>}
          <div className={styles.dots}>
            {Array.from({ length: (n.lock ?? "").length }).map((_, i) => (
              <span key={i} className={i < pin.length ? styles.dotFilled : styles.dot} />
            ))}
          </div>
          <div className={styles.keys}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) => (
              <button
                key={i}
                type="button"
                className={styles.key}
                disabled={k === ""}
                onClick={() => (k === "⌫" ? setPin(pin.slice(0, -1)) : pressDigit(k))}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </AppScreen>
    );
  }

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
                  if (n.lock && !unlockedNotes.has(i)) setPadFor(i);
                  else setOpenIndex(i);
                }}
              >
                <span className={styles.title}>{n.lock && !unlockedNotes.has(i) ? "🔒 " : ""}{n.title}</span>
                <span className={styles.preview}>{n.lock && !unlockedNotes.has(i) ? "Locked — enter the PIN" : n.body}</span>
                {isHot && <span className={styles.hintHand}>👆</span>}
              </button>
            );
          })}
        </div>
      </div>
    </AppScreen>
  );
}
