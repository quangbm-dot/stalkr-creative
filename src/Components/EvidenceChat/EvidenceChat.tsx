import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseConfig } from "../../types/case";
import Confetti from "../Confetti/Confetti";
import openLinkApp, { trackPlayableEvent } from "../../services/AdController";
import endLogo from "../../Assets/UI/icon-end-card.webp";
import styles from "./EvidenceChat.module.scss";

interface EvidenceChatProps {
  caseData: CaseConfig;
  onEvidenceFound: () => void;
  onAllSolved: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Đã mở đúng app chứa manh mối của câu hiện tại ít nhất 1 lần chưa — false
   * thì 4 lựa chọn hiện khoá (🔒), không bấm được, phải đi "snooping" trước. */
  unlocked: boolean;
}

const NEXT_DELAY_MS = 2500;
// Emoji đổi theo câu cho bong bóng đáp án của người chơi, đỡ lặp.
const PICK_EMOJIS = ["🔍", "🕵️", "💡", "👀", "📌", "🧩"];
const TEASER_AFTER_ROUND = 8;

/**
 * v10: clone y hệt popup câu hỏi của V8 — 1 "thẻ câu hỏi" tĩnh (không phải
 * khung chat cuộn dần như v4/v9): header căn giữa (nút thu gọn, "Question
 * x/y", avatar+icon mắt, tên), rồi tới card trắng (Question x/y + 💡, câu
 * hỏi, 4 lựa chọn khoá), rồi nút "keep snooping his phone" để đóng lại.
 */
export default function EvidenceChat({
  caseData,
  onEvidenceFound,
  onAllSolved,
  expanded,
  onExpandedChange,
  unlocked,
}: EvidenceChatProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  // Không giới hạn tổng số gợi ý, nhưng mỗi câu chỉ dùng 1 lần (chống spam).
  const [hintUsedThisRound, setHintUsedThisRound] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [correctPick, setCorrectPick] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // Sau khi trả lời đúng câu 1 — teaser EndCard che kín toàn màn hình, có
  // nút mũi tên nhỏ ở trên để thu gọn lại, tiếp tục chơi câu 2/3.
  const [showEndTeaser, setShowEndTeaser] = useState(false);
  // Thanh câu hỏi thu gọn không còn nằm trong màn hình điện thoại nữa — nó
  // portal ra div #phone-below-bar mà PhoneFrame dựng sẵn bên dưới khung
  // điện thoại (khối riêng, nền đen). Node đó chưa có ở lần render đầu nên
  // phải đợi mount xong mới lấy được, rồi mới có gì để portal vào.
  const [belowBarNode, setBelowBarNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setBelowBarNode(document.getElementById("phone-below-bar"));
  }, []);

  // Báo cho AppLovin biết người chơi bắt đầu phần hỏi-đáp manh mối (ngay khi
  // thẻ câu hỏi đầu tiên hiện ra, cùng lúc màn "phone" mount).
  useEffect(() => {
    trackPlayableEvent("CHALLENGE_STARTED");
  }, []);

  const rounds = caseData.evidenceRounds;
  const round = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;

  // Reset trạng thái "đang chọn" mỗi khi sang câu mới.
  useEffect(() => {
    setShowHint(false);
    setHintUsedThisRound(false);
    setWrongPick(null);
    setCorrectPick(null);
  }, [roundIndex]);

  // Sau khi trả lời đúng: đoạn chat dẫn truyện ở lại ~5s rồi tự sang câu sau.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mốc % câu đã trả lời đúng đã báo cho AppLovin rồi — mỗi mốc chỉ báo 1 lần
  // (case 3 câu có thể nhảy qua nhiều mốc cùng lúc ở 1 câu).
  const milestonesFired = useRef<Set<25 | 50 | 75>>(new Set());
  const goNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (isLastRound) onAllSolved();
    else setRoundIndex((r) => r + 1);
  };
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const pick = (choice: string) => {
    if (!round || !unlocked || correctPick) return;
    setShowHint(false);
    if (choice === round.correct) {
      setWrongPick(null);
      setCorrectPick(choice);
      onEvidenceFound();

      const pct = ((roundIndex + 1) / caseData.evidenceTotal) * 100;
      for (const m of [25, 50, 75] as const) {
        if (pct >= m && !milestonesFired.current.has(m)) {
          milestonesFired.current.add(m);
          trackPlayableEvent(`CHALLENGE_PASS_${m}`);
        }
      }
      if (isLastRound) trackPlayableEvent("CHALLENGE_SOLVED");

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Teaser EndCard hiện sau khi xong câu thứ 8 (hoặc câu cuối nếu case ngắn hơn).
      if (roundIndex === Math.min(TEASER_AFTER_ROUND, rounds.length) - 1) {
        setTimeout(() => setShowEndTeaser(true), 700);
      }

      advanceTimer.current = setTimeout(goNext, NEXT_DELAY_MS);
    } else {
      setWrongPick(choice);
      setTimeout(() => setWrongPick(null), 1200);
    }
  };

  const useHint = () => {
    if (hintUsedThisRound) return;
    setHintUsedThisRound(true);
    setShowHint(true);
  };

  if (!expanded) {
    if (!belowBarNode) return null;
    return createPortal(
      <button type="button" className={styles.bar} onClick={() => onExpandedChange(true)}>
        {round && <img className={styles.barAvatar} src={round.informant.avatar} alt="" />}
        <span className={styles.barText}>
          {round ? round.prompt : "Tap to continue"}
        </span>
        <span className={styles.barBadge}>
          Q{roundIndex + 1}/{caseData.evidenceTotal}
        </span>
        {/* Đã tìm thấy manh mối (unlocked) nhưng chưa quay lại trả lời —
            "peek" của bản gốc: trỏ vào đúng thanh thu gọn này để nhắc mở
            lại thẻ câu hỏi. */}
        {unlocked && !correctPick && <span className={styles.barHint}>👆</span>}
      </button>,
      belowBarNode,
    );
  }

  return (
    <>
      <div className={styles.backdrop} onClick={() => onExpandedChange(false)} />
      <div className={styles.sheet}>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => onExpandedChange(false)}
          aria-label="Collapse"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className={styles.topQBadge}>
          Question {roundIndex + 1}/{caseData.evidenceTotal}
        </span>

        {round && (
          <div className={styles.avatarRow}>
            <img className={styles.avatar} src={round.informant.avatar} alt={round.informant.name} />
            <svg className={styles.eyeIcon} viewBox="0 0 40 24" fill="none">
              <path
                d="M2 12c4-8 12-10 18-10s14 2 18 10c-4 8-12 10-18 10S6 20 2 12z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="20" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        )}
        {round && <span className={styles.name}>{round.informant.name}</span>}

        {round && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardQBadge}>
                Question {roundIndex + 1}/{caseData.evidenceTotal}
              </span>
              <button type="button" className={styles.hintBtn} onClick={useHint} disabled={hintUsedThisRound}>
                💡
              </button>
            </div>

            <p className={styles.questionText}>{round.prompt}</p>

            {correctPick ? (
              // Trả lời đúng: thay 4 lựa chọn bằng đoạn chat dẫn truyện — câu
              // người chơi vừa chọn, rồi lời đáp của nhân vật.
              <div className={styles.replyChat}>
                <div className={styles.replyMe}>
                  {correctPick} {PICK_EMOJIS[roundIndex % PICK_EMOJIS.length]}
                </div>
                <div className={styles.replyThem}>{round.correctReply}</div>
              </div>
            ) : (
              <div className={styles.choices}>
                {round.choices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.chip} ${!unlocked ? styles.chipLocked : ""} ${
                      wrongPick === c ? styles.chipWrong : ""
                    }`}
                    onClick={() => pick(c)}
                    disabled={!unlocked}
                  >
                    <span className={wrongPick === c ? styles.chipX : styles.chipLock}>
                      {wrongPick === c ? "✕" : unlocked ? "" : "🔒"}
                    </span>
                    {c}
                  </button>
                ))}
              </div>
            )}

            {showHint && !correctPick && (
              <div className={styles.hintBox}>
                <span className={styles.hintBoxIcon}>💡</span>
                <span>{round.hint}</span>
              </div>
            )}
          </div>
        )}

        {round && correctPick && (
          <div className={styles.snoopWrap}>
            <button type="button" className={styles.nextLink} onClick={goNext}>
              {isLastRound ? "Finish" : "Next"} &gt;
            </button>
          </div>
        )}

        {round && !correctPick && (
          <div className={styles.snoopWrap}>
            <button type="button" className={styles.snoopBtn} onClick={() => onExpandedChange(false)}>
              🔍 keep snooping his phone
            </button>
            {/* Đáp án đang khoá — bàn tay trỏ vào đây để dẫn người chơi quay
                lại màn hình tìm manh mối trước, giống hệt bản gốc. */}
            {!unlocked && <span className={styles.snoopHint}>👆</span>}
          </div>
        )}
      </div>

      {showConfetti && <Confetti />}

      {showEndTeaser && (
        <div className={styles.fullTeaser}>
          <button
            type="button"
            className={styles.fullTeaserCollapse}
            onClick={() => setShowEndTeaser(false)}
            aria-label="Collapse"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <img className={styles.fullTeaserLogo} src={endLogo} alt="Stalkr" />
          <h2 className={styles.fullTeaserHeadline}>{caseData.endCard.headline}</h2>
          <p className={styles.fullTeaserSubhead}>{caseData.endCard.subhead}</p>
          <span className={styles.fullTeaserBadge}>Fictional mystery game</span>
          <button type="button" className={styles.fullTeaserCta} onClick={openLinkApp}>
            {caseData.endCard.ctaLabel}
          </button>
        </div>
      )}
    </>
  );
}
