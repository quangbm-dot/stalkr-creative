import { useEffect, useRef, useState } from "react";
import type { CaseConfig, HireStep } from "../../types/case";
import handHint from "../../Assets/UI/hand-hint.webp";
import styles from "./Intro.module.scss";

interface IntroProps {
  caseData: CaseConfig;
  onDone: () => void;
}

type LogStep = Extract<HireStep, { type: "msgs" | "img" | "reveal" | "tinderReveal" | "appReveal" }>;

const AUTO_ADVANCE_MS = 2200;
// Câu chú thích dài hơn ngưỡng này thì bắt đầu được cộng thêm thời gian hiện.
const TEXT_BASE_LEN = 45;

/** Text càng dài thì thời lượng tự chuyển bước càng lâu — tối thiểu +20%
 *  so với AUTO_ADVANCE_MS ngay khi vượt ngưỡng, tăng dần cho câu rất dài. */
function getStepDuration(text: string | null): number {
  if (!text || text.length <= TEXT_BASE_LEN) return AUTO_ADVANCE_MS;
  const ratio = (text.length - TEXT_BASE_LEN) / TEXT_BASE_LEN;
  const multiplier = 1 + Math.min(1, Math.max(0.2, ratio * 0.6));
  return Math.round(AUTO_ADVANCE_MS * multiplier);
}

/**
 * v4 intro — một đoạn chat ngắn gọn từ số lạ (thay cho bảng ghim nhiều ảnh
 * của v1-v3): vài bong bóng chat + đúng 1 ảnh "hành vi" hiện dạng card app
 * thật, rồi tới 2 lựa chọn phản hồi. Nền dùng luôn wallpaper thật của case
 * (như đang xem màn khoá máy nhận tin nhắn).
 */
export default function Intro({ caseData, onDone }: IntroProps) {
  const [step, setStep] = useState(0);
  const steps = caseData.client.hire;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isAuto =
    current.type === "msgs" ||
    current.type === "img" ||
    current.type === "reveal" ||
    current.type === "tinderReveal" ||
    current.type === "appReveal";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const logSteps = steps.slice(0, step + 1).filter((s): s is LogStep => s.type !== "choices" && s.type !== "cta");

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [step]);

  const advance = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isLast) onDone();
    else setStep((s) => s + 1);
  };

  const currentText = isAuto && "text" in current ? current.text : null;

  // Câu text càng dài thì hiện càng lâu (tối thiểu +20% so với thời lượng
  // gốc khi vượt ngưỡng "bình thường"), để người chơi có đủ thời gian đọc.
  const stepDuration = getStepDuration(currentText);

  // Tự động chuyển bước sau stepDuration nếu người chơi không bấm Next,
  // trừ lúc đang chờ chọn choices/cta.
  useEffect(() => {
    if (!isAuto) return;
    timerRef.current = setTimeout(advance, stepDuration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className={styles.stage} style={{ backgroundImage: `url(${caseData.wallpaper})` }}>
      <div className={styles.scrim} />

      <div className={styles.top}>
        <span className={styles.fictionBadge}>Fictional mystery game</span>
        <button type="button" className={styles.skip} onClick={onDone}>
          Skip
        </button>
      </div>

      <div className={styles.chatWrap} onClick={() => isAuto && advance()}>
        <div className={styles.header}>
          <img className={styles.headerAvatar} src={caseData.client.avatar} alt="" />
          <span className={styles.headerName}>{caseData.client.name}</span>
        </div>

        <div className={styles.log}>
          {logSteps.map((s, i) => {
            if (s.type === "tinderReveal" || s.type === "appReveal") {
              const appLabel = s.type === "tinderReveal" ? "Tinder" : s.appLabel;
              return (
                <div key={i} className={`${styles.appCard} ${styles.on}`}>
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
            const text = "text" in s ? s.text : "";
            return (
              <div key={i} className={`${styles.bubble} ${styles.on}`}>
                {text}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>

      {current.type === "cta" ? (
        <div className={styles.ctaWrap}>
          <button type="button" className={styles.cta} onClick={advance}>
            {current.label}
          </button>
        </div>
      ) : current.type === "choices" ? (
        <div className={styles.choicesWrap}>
          <div className={styles.choices}>
            {current.options.map((opt, i) => (
              <button key={opt} type="button" className={styles.choice} onClick={advance}>
                {opt}
                {i === 0 && <img className={styles.choiceHint} src={handHint} alt="" />}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.progressWrap}>
          <div className={styles.progressRow}>
            <div className={styles.track}>
              <div
                key={step}
                className={styles.fill}
                style={{ animationDuration: `${stepDuration}ms` }}
              />
            </div>
            <button type="button" className={styles.nextBtn} onClick={advance} aria-label="Next">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
