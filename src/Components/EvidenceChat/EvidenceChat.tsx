import { useEffect, useRef, useState } from "react";
import type { CaseConfig } from "../../types/case";
import Confetti from "../Confetti/Confetti";
import openLinkApp from "../../services/AdController";
import endLogo from "../../Assets/UI/icon-end-card.webp";
import endText from "../../Assets/UI/endcard-text.webp";
import endButton from "../../Assets/UI/endcard-button.webp";
import styles from "./EvidenceChat.module.scss";

interface EvidenceChatProps {
  caseData: CaseConfig;
  onEvidenceFound: () => void;
  onAllSolved: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const MAX_WRONG = 3;
// Bấm hint quá số này (lần thứ 3 trở đi) cũng coi như đang bí — hiện luôn
// overlay EndCard giống lúc trả lời đúng, nhắc tải app để xem full lời giải.
const MAX_HINTS_BEFORE_TEASER = 2;

interface ChatBubble {
  from: "informant" | "me";
  text: string;
  correct?: boolean;
}

export default function EvidenceChat({
  caseData,
  onEvidenceFound,
  onAllSolved,
  expanded,
  onExpandedChange,
}: EvidenceChatProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(caseData.hintBudget);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  // Đếm tổng số lần chọn sai (tính chung cả case) — sai quá MAX_WRONG lần
  // thì kết thúc sớm, chuyển sang EndCard thay vì cho trả lời vô hạn.
  const [wrongCount, setWrongCount] = useState(0);
  // Hiện sẵn các lựa chọn trả lời ngay từ câu đầu tiên.
  const [choicesOpen, setChoicesOpen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  // Sau khi trả lời đúng câu 1 — teaser EndCard che kín toàn màn hình, có
  // nút mũi tên nhỏ ở trên để thu gọn lại, tiếp tục chơi câu 2/3.
  const [showEndTeaser, setShowEndTeaser] = useState(false);
  const [history, setHistory] = useState<ChatBubble[]>(() => [
    { from: "informant", text: caseData.evidenceRounds[0]?.prompt ?? "" },
  ]);
  const historyRef = useRef<HTMLDivElement>(null);

  // Tự cuộn xuống cuối mỗi khi có tin nhắn mới hoặc bấm hint — tránh nội
  // dung mới (đặc biệt bong bóng hint) bị khuất phía dưới, che mất đáp án.
  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [history, showHint]);

  const rounds = caseData.evidenceRounds;
  const round = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;

  const pick = (choice: string) => {
    if (!round) return;
    setShowHint(false);
    if (choice === round.correct) {
      setWrongPick(null);
      const nextHistory: ChatBubble[] = [
        ...history,
        { from: "me", text: choice, correct: true },
        { from: "informant", text: round.correctReply },
      ];
      setHistory(nextHistory);
      onEvidenceFound();

      // Confetti ở mọi câu trả lời đúng. Teaser EndCard thì mở khoá riêng
      // sau khi xong 2 câu.
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      if (roundIndex === 1) {
        setTimeout(() => setShowEndTeaser(true), 700);
      }

      if (isLastRound) {
        setTimeout(onAllSolved, 1600);
      } else {
        setTimeout(() => {
          const next = rounds[roundIndex + 1];
          setRoundIndex(roundIndex + 1);
          setHistory((h) => [...h, { from: "informant", text: next.prompt }]);
          // Mở sẵn lựa chọn cho câu tiếp theo luôn, khỏi bấm lại ô nhập.
          setChoicesOpen(true);
        }, 1000);
      }
    } else {
      const nextWrongCount = wrongCount + 1;
      setWrongCount(nextWrongCount);
      setWrongPick(choice);
      const replyIndex = Math.min(nextWrongCount - 1, round.wrongReply.length - 1);
      setHistory((h) => [...h, { from: "informant", text: round.wrongReply[replyIndex] }]);

      if (nextWrongCount >= MAX_WRONG) {
        // Sai quá số lần cho phép — hiện overlay EndCard giống lúc trả lời
        // đúng, thay vì kết thúc case luôn.
        setTimeout(() => setShowEndTeaser(true), 1200);
      } else {
        setTimeout(() => setWrongPick(null), 900);
      }
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) return;
    setHintsLeft((h) => h - 1);
    setShowHint(true);
    const nextHintsUsed = hintsUsed + 1;
    setHintsUsed(nextHintsUsed);
    if (nextHintsUsed > MAX_HINTS_BEFORE_TEASER) {
      setShowEndTeaser(true);
    }
  };

  if (!expanded) {
    return (
      <button type="button" className={styles.bar} onClick={() => onExpandedChange(true)}>
        {round && <img className={styles.barAvatar} src={round.informant.avatar} alt="" />}
        <span className={styles.barText}>
          {round ? round.prompt : "Tap to continue"}
        </span>
        <span className={styles.barBadge}>
          Q{roundIndex + 1}/{caseData.evidenceTotal}
        </span>
      </button>
    );
  }

  return (
    <>
      <div className={styles.backdrop} onClick={() => onExpandedChange(false)} />
      <div className={styles.sheet}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => onExpandedChange(false)}
            aria-label="Collapse"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path
                d="M5 9l7 7 7-7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {round && (
            <>
              <img className={styles.avatar} src={round.informant.avatar} alt={round.informant.name} />
              <span className={styles.name}>{round.informant.name}</span>
            </>
          )}
          <span className={styles.spacer} />
          <span className={styles.qBadge}>Q{roundIndex + 1}/{caseData.evidenceTotal}</span>
        </div>

        <div className={styles.history} ref={historyRef}>
          {history.map((b, i) => (
            <div key={i} className={b.from === "me" ? styles.bubbleMe : styles.bubbleThem}>
              {b.correct && (
                <svg className={styles.checkIcon} viewBox="0 0 24 24" width="13" height="13" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {b.text}
            </div>
          ))}
          {showHint && round && <div className={styles.hintBubble}>💡 {round.hint}</div>}
        </div>

        {showConfetti && <Confetti />}

        {round && choicesOpen && (
          <div className={styles.choices}>
            {round.choices.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.chip} ${wrongPick === c ? styles.chipWrong : ""}`}
                onClick={() => pick(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputRow}>
          <button type="button" className={styles.inputPill} onClick={() => setChoicesOpen(true)}>
            Your Answer…
          </button>
          <button type="button" className={styles.hintBtn} onClick={useHint} disabled={hintsLeft <= 0}>
            💡<span className={styles.hintCount}>{hintsLeft}</span>
          </button>
        </div>
      </div>

      {showEndTeaser && (
        <div className={styles.fullTeaser}>
          <button
            type="button"
            className={styles.fullTeaserCollapse}
            onClick={() => setShowEndTeaser(false)}
            aria-label="Collapse"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M5 9l7 7 7-7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <img className={styles.fullTeaserLogo} src={endLogo} alt="Stalkr" />
          <img className={styles.fullTeaserText} src={endText} alt={caseData.endCard.headline} />
          <button type="button" className={styles.fullTeaserCta} onClick={openLinkApp}>
            <img src={endButton} alt={caseData.endCard.ctaLabel} />
          </button>
        </div>
      )}
    </>
  );
}
