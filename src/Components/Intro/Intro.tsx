import { useEffect, useRef, useState } from "react";
import type { CaseConfig, HireStep } from "../../types/case";
import handHint from "../../Assets/UI/hand-hint.webp";
import styles from "./Intro.module.scss";

interface IntroProps {
  caseData: CaseConfig;
  onDone: () => void;
}

type LogStep = Extract<HireStep, { type: "msgs" | "tinderReveal" | "appReveal" }>;

const TYPING_MS = 900;
const GAP_MS = 350;
const CARD_MS = 1800;

/**
 * v4 intro — một đoạn chat ngắn gọn từ số lạ (thay cho bảng ghim nhiều ảnh
 * của v1-v3): mỗi tin nhắn hiện 3 chấm "đang nhập" rồi mới đổi thành text
 * thật, xen giữa đúng 1 ảnh "hành vi" hiện dạng card app thật — tự động
 * chạy hết, không có nút mũi tên/thanh tiến trình. Chỉ dừng lại chờ người
 * chơi bấm khi tới 2 lựa chọn phản hồi ở cuối.
 */
export default function Intro({ caseData, onDone }: IntroProps) {
  const steps = caseData.client.hire;
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(steps[0]?.type === "msgs");
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const current = steps[revealed];

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [revealed, typing]);

  useEffect(() => {
    const step = steps[revealed];
    if (!step || step.type === "choices" || step.type === "cta") {
      setTyping(false);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (step.type === "msgs") {
      setTyping(true);
      timers.push(
        setTimeout(() => {
          setTyping(false);
          timers.push(setTimeout(() => setRevealed((r) => r + 1), GAP_MS));
        }, TYPING_MS),
      );
    } else {
      setTyping(false);
      timers.push(setTimeout(() => setRevealed((r) => r + 1), CARD_MS));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  const logEntries = steps
    .map((s, idx) => ({ s, idx }))
    .slice(0, revealed + 1)
    .filter((e): e is { s: LogStep; idx: number } =>
      e.s.type === "msgs" || e.s.type === "tinderReveal" || e.s.type === "appReveal",
    );

  return (
    <div className={styles.stage}>
      <div className={styles.top}>
        <span className={styles.fictionBadge}>Fictional mystery game</span>
        <button type="button" className={styles.skip} onClick={onDone}>
          Skip
        </button>
      </div>

      <div className={styles.chatWrap}>
        <div className={styles.header}>
          <img className={styles.headerAvatar} src={caseData.client.avatar} alt="" />
          <span className={styles.headerName}>{caseData.client.name}</span>
        </div>

        <div className={styles.log}>
          {logEntries.map(({ s, idx }) => {
            const isCurrent = idx === revealed;

            if (s.type === "tinderReveal" || s.type === "appReveal") {
              const appLabel = s.type === "tinderReveal" ? "Tinder" : s.appLabel;
              return (
                <div key={idx} className={`${styles.appCard} ${styles.on}`}>
                  <img className={styles.appCardPhoto} src={s.src} alt="" />
                  {s.type === "appReveal" && (
                    <div className={styles.appCardBadge}>
                      <img src={s.appIcon} alt="" />
                      <span>{appLabel}</span>
                    </div>
                  )}
                  <div className={styles.appCardScrim} />
                  <div className={styles.appCardInfo}>
                    <span className={styles.appCardName}>
                      {s.name}
                      {s.type === "tinderReveal" ? `, ${s.age}` : ""}
                    </span>
                    <span className={styles.appCardSub}>
                      <span className={styles.appCardDot} />
                      {s.subtitle}
                    </span>
                  </div>
                </div>
              );
            }

            if (isCurrent && typing) {
              return (
                <div key={idx} className={`${styles.bubble} ${styles.on} ${styles.typingBubble}`}>
                  <span className={styles.dots}>
                    <i /><i /><i />
                  </span>
                </div>
              );
            }
            return (
              <div key={idx} className={`${styles.bubble} ${styles.on}`}>
                {s.text}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>

      {current?.type === "cta" ? (
        <div className={styles.ctaWrap}>
          <button type="button" className={styles.cta} onClick={onDone}>
            {current.label}
          </button>
        </div>
      ) : current?.type === "choices" ? (
        <div className={styles.choicesWrap}>
          <div className={styles.choices}>
            {current.options.map((opt, i) => (
              <button key={opt} type="button" className={styles.choice} onClick={() => setRevealed((r) => r + 1)}>
                {opt}
                {i === 0 && <img className={styles.choiceHint} src={handHint} alt="" />}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
