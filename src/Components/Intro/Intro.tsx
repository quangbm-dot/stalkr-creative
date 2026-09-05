import { useEffect, useMemo, useRef, useState } from "react";
import type { CaseConfig, HireStep } from "../../types/case";
import tinderHeader from "../../Assets/UI/tinder-header.webp";
import girlSilhouette from "../../Assets/UI/girl-silhouette.jpg";
import eyesLogo from "../../Assets/UI/eyes.webp";
import styles from "./Intro.module.scss";

interface IntroProps {
  caseData: CaseConfig;
  onDone: () => void;
}

type PhotoStep = Extract<HireStep, { type: "img" } | { type: "reveal" } | { type: "mysteryReveal" }>;

const AUTO_ADVANCE_MS = 2500;
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

// Vị trí cố định cho tối đa 4 khung polaroid trên "bảng chứng cứ" — top tính
// bằng px (so với .board), left/width tính theo % để co giãn theo bề ngang
// màn hình. Ảnh mới xuất hiện sẽ nối dây tới ghim của ảnh liền trước.
const SLOTS = [
  { top: 0, left: 0, rotate: -6 },
  { top: 30, left: 52, rotate: 5 },
  { top: 186, left: 0, rotate: -4 },
  { top: 216, left: 50, rotate: 4 },
];
const SLOT_WIDTH = 46;
const PIN_Y_OFFSET = -6;
// .board có max-width 320px (khớp với viewBox dưới) — dùng hệ toạ độ px
// thật cho cả 2 trục khi vẽ dây nối, tránh scale lệch trục (x theo %, y
// theo px) làm nét dây bị méo/ngắn khi animate stroke-dasharray.
const BOARD_REF_WIDTH = 320;

export default function Intro({ caseData, onDone }: IntroProps) {
  // Đôi mắt logo Stalkr hiện xuyên suốt bước text đầu tiên, mờ dần biến mất
  // ngay khi qua bước 2 (giữ mounted thêm 1 nhịp để chạy hết animation mờ).
  const [step, setStep] = useState(0);
  const [brandFlashMounted, setBrandFlashMounted] = useState(true);
  useEffect(() => {
    if (step === 0) return;
    const t = setTimeout(() => setBrandFlashMounted(false), 500);
    return () => clearTimeout(t);
  }, [step]);
  const steps = caseData.client.hire;
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isAuto =
    current.type === "msgs" ||
    current.type === "img" ||
    current.type === "reveal" ||
    current.type === "tinderReveal" ||
    current.type === "mysteryReveal";
  const tinderIdx = useMemo(() => steps.findIndex((s) => s.type === "tinderReveal"), [steps]);
  const tinderStep = tinderIdx >= 0 ? (steps[tinderIdx] as Extract<HireStep, { type: "tinderReveal" }>) : null;
  const tinderState = tinderIdx < 0 ? "pre" : step < tinderIdx ? "pre" : step === tinderIdx ? "active" : "done";
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealed = useMemo(
    () =>
      steps
        .slice(0, step + 1)
        .filter(
          (s): s is PhotoStep =>
            s.type === "img" || s.type === "reveal" || s.type === "mysteryReveal",
        ),
    [steps, step],
  );
  // Cố định chiều cao board theo slot xa nhất (4 khung) để bảng không co
  // giãn/giật mỗi khi có ảnh mới hoặc độ dài text thay đổi.
  const boardHeight = SLOTS[SLOTS.length - 1].top + 176;

  const advance = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isLast) onDone();
    else setStep((s) => s + 1);
  };

  const currentText =
    current.type === "msgs" ||
    current.type === "reveal" ||
    current.type === "tinderReveal" ||
    current.type === "mysteryReveal"
      ? current.text
      : null;

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
    <div className={styles.stage}>
      <div className={styles.top}>
        <span className={styles.title}>{caseData.caseTitle}</span>
        <button type="button" className={styles.skip} onClick={onDone}>
          Skip
        </button>
      </div>

      <div className={styles.boardWrap} onClick={() => isAuto && advance()}>
        {brandFlashMounted && (
          <div className={`${styles.brandFlash} ${step > 0 ? styles.brandFlashOut : ""}`}>
            <img className={styles.brandFlashEyes} src={eyesLogo} alt="Stalkr" />
          </div>
        )}
        <div className={styles.board} style={{ height: boardHeight }}>
          <svg
            className={styles.strings}
            viewBox={`0 0 ${BOARD_REF_WIDTH} ${boardHeight}`}
            preserveAspectRatio="none"
          >
            {revealed.slice(1).map((_, i) => {
              const from = SLOTS[i];
              const to = SLOTS[i + 1];
              return (
                <line
                  key={i}
                  x1={((from.left + SLOT_WIDTH / 2) / 100) * BOARD_REF_WIDTH}
                  y1={from.top + PIN_Y_OFFSET}
                  x2={((to.left + SLOT_WIDTH / 2) / 100) * BOARD_REF_WIDTH}
                  y2={to.top + PIN_Y_OFFSET}
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                  className={styles.string}
                />
              );
            })}
          </svg>

          {revealed.map((photo, i) => {
            const slot = SLOTS[i];
            return (
              <div
                key={i}
                className={styles.card}
                style={{
                  top: slot.top,
                  left: `${slot.left}%`,
                  width: `${SLOT_WIDTH}%`,
                  ["--rot" as string]: `${slot.rotate}deg`,
                }}
              >
                <span className={styles.pin} />
                {photo.type === "mysteryReveal" ? (
                  <div className={styles.mysteryPhoto}>
                    <img className={styles.mysterySilhouette} src={girlSilhouette} alt="" />
                    <span className={styles.mysteryMark}>?</span>
                    <svg className={styles.mysteryScribble} viewBox="0 0 100 100" preserveAspectRatio="none">
                      <ellipse cx="48" cy="45" rx="40" ry="34" transform="rotate(-8 48 45)" vectorEffect="non-scaling-stroke" />
                      <ellipse cx="52" cy="52" rx="38" ry="32" transform="rotate(6 52 52)" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                ) : (
                  <img className={styles.cardPhoto} src={photo.src} alt="" />
                )}
                {photo.label && <span className={styles.cardCaption}>{photo.label}</span>}
              </div>
            );
          })}
        </div>

        {tinderStep && (
          <div className={`${styles.tinderCard} ${styles[tinderState]}`}>
            <div className={styles.tinderInner}>
              <img className={styles.tinderPhoto} src={tinderStep.src} alt="" />
              <img className={styles.tinderLogo} src={tinderHeader} alt="Tinder" />
              <div className={styles.tinderScrim} />
              <div className={styles.tinderInfo}>
                <span className={styles.tinderName}>
                  {tinderStep.name}, {tinderStep.age}
                </span>
                <span className={styles.tinderSub}>
                  <span className={styles.tinderDot} />
                  {tinderStep.subtitle}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {current.type === "cta" ? (
        <div className={styles.ctaWrap}>
          <button type="button" className={styles.cta} onClick={advance}>
            {current.label}
          </button>
        </div>
      ) : (
        <div className={styles.dialog}>
          {currentText && (
            <>
              <span className={styles.cardLabel}>{caseData.client.name}</span>
              <p className={styles.cardText}>{currentText}</p>
            </>
          )}

          {isAuto && (
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
          )}

          {current.type === "choices" && (
            <div className={styles.choices}>
              {current.options.map((opt) => (
                <button key={opt} type="button" className={styles.choice} onClick={advance}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
