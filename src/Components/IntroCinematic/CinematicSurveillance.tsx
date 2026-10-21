import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { CaseConfig } from "../../types/case";
import GrainOverlay from "./GrainOverlay";
import desk from "./img/desk.webp";
import mysteryWoman from "./img/mysteryWoman.webp";
import styles from "./CinematicSurveillance.module.scss";

interface Props {
  caseData: CaseConfig;
  onDone: () => void;
}

type Phase = "who" | "fan" | "scroll" | "lock" | "unlock";

const WHO_ASK_MS = 1300;
const WHO_REVEAL_MS = 2800;
const FAN_STEP_MS = 420;
const TARGET_GLOW_MS = 500;
// Trình tự "vỡ" ảnh cặp đôi: đen trắng dần -> hiện tim vỡ -> mờ dần -> tách
// thành 2 thẻ mới.
const CRACK_BW_MS = 400;
const CRACK_HEART_MS = 700;
const CRACK_BLUR_MS = 450;
const PATTERN_HOLD_MS = 700;
const UNLOCK_MS = 700;
// Hình chữ U tự vẽ trên lưới 9 chấm — không cần đúng mật khẩu thật, chỉ cần
// người chơi kéo tay qua đủ các chấm theo thứ tự này (trên-trái xuống dưới
// rồi vòng lên trên-phải).
const UNLOCK_PATTERN = ["1", "4", "7", "8", "9", "6", "3"];
// Bán kính bắt điểm (đơn vị viewBox 0-200) — rộng hơn bán kính vẽ của chấm để
// dễ chạm trên màn hình nhỏ.
const DIGIT_HIT_RADIUS = 26;

interface Spot {
  top: string;
  left: string;
  rot: number;
  size: number;
  back?: boolean;
}

// 4 thẻ nhỏ rải quanh (kích thước/khoảng cách khác nhau — tạo bối cảnh
// trước-sau), luôn úp mặt "?" — chỉ để trang trí bàn, không lật.
const SIDE_SPOTS: Spot[] = [
  { top: "20%", left: "30%", rot: -14, size: 30, back: true },
  { top: "24%", left: "68%", rot: 10, size: 36 },
  { top: "76%", left: "26%", rot: 11, size: 35 },
  { top: "80%", left: "70%", rot: -9, size: 28, back: true },
];

// Thẻ thứ 5, rơi xuống giữa bàn sau 4 thẻ phụ — vẫn là thẻ úp mặt "?" như
// các thẻ kia. Rơi xong thì sáng lên rồi lật ra ảnh cặp đôi chung (onboarding
// slide 2) — MỘT thẻ duy nhất. Đến đúng dòng "He's asleep..." trong phần dẫn
// truyện, thẻ này mới "vỡ" tách thành 2 thẻ ở TARGET_SPOTS: 1 là Miles, 1 là
// cô gái lạ chưa tìm ra (ảnh tối màu, không lộ mặt).
const SINGLE_SPOT: Spot = { top: "46%", left: "48%", rot: -2, size: 48 };
const TARGET_SPOTS: Spot[] = [
  { top: "42%", left: "38%", rot: -5, size: 36 },
  { top: "50%", left: "62%", rot: 5, size: 36 },
];

// Vị trí 9 số trên bàn phím pattern-lock kiểu Android, viewBox 0 0 200 200.
const DIGIT_POS: Record<string, [number, number]> = {
  "1": [24, 24],
  "2": [100, 24],
  "3": [176, 24],
  "4": [24, 100],
  "5": [100, 100],
  "6": [176, 100],
  "7": [24, 176],
  "8": [100, 176],
  "9": [176, 176],
};

type EvidenceItem =
  | { kind: "letter"; text: string }
  | { kind: "message"; text: string; time?: string }
  | { kind: "bill"; merchant: string; amount: string; date?: string }
  | { kind: "pin"; name: string; subtitle?: string };

function CardFace({ item }: { item: EvidenceItem }) {
  if (item.kind === "letter") {
    return (
      <div className={styles.letterCard}>
        <span className={styles.letterSeal}>✉️</span>
        <p className={styles.letterText}>{item.text}</p>
      </div>
    );
  }
  if (item.kind === "message") {
    return (
      <div className={styles.msgCard}>
        <span className={styles.msgTagPrivate}>❤️</span>
        <p className={styles.msgText}>&ldquo;{item.text}&rdquo;</p>
        {item.time && <span className={styles.msgTime}>{item.time}</span>}
      </div>
    );
  }
  if (item.kind === "bill") {
    return (
      <div className={styles.billCard}>
        <span className={styles.billLabel}>RECEIPT</span>
        <span className={styles.billMerchant}>{item.merchant}</span>
        <span className={styles.billAmount}>{item.amount}</span>
        {item.date && <span className={styles.billDate}>{item.date}</span>}
      </div>
    );
  }
  return (
    <div className={styles.pinCard}>
      <span className={styles.pinIcon}>📍</span>
      <span className={styles.pinName}>{item.name}</span>
      {item.subtitle && <span className={styles.pinSub}>{item.subtitle}</span>}
    </div>
  );
}

// Không hỏi tên người chơi trong bản cinematic — "{{name}}, " trong data gốc bỏ gọn.
const withName = (text: string) => {
  const stripped = text.replace(/\{\{name\}\},?\s*/g, "");
  return stripped !== text ? stripped.charAt(0).toUpperCase() + stripped.slice(1) : stripped;
};

export default function CinematicSurveillance({ caseData, onDone }: Props) {
  const revealStep = caseData.client.hire.find((s) => s.type === "reveal");
  const suspectThread = caseData.messages.find((t) => t.title === "Do not pick up") ?? caseData.messages[0];
  const privateLine = suspectThread?.msgs.find((m) => /❤️|😘|💕/.test(m.text));
  const bill = caseData.revolut.transactions.find((t) => /airbnb|venice/i.test(t.name));
  const place = caseData.maps.locations.find((l) => l.name.includes("Pace")) ?? caseData.maps.locations[0];

  const sideItems: EvidenceItem[] = [
    ...(revealStep?.type === "reveal" ? [{ kind: "letter" as const, text: revealStep.text }] : []),
    ...(bill ? [{ kind: "bill" as const, merchant: bill.name, amount: bill.amount, date: bill.date }] : []),
    ...(place ? [{ kind: "pin" as const, name: place.name, subtitle: place.subtitle }] : []),
    ...(privateLine ? [{ kind: "message" as const, text: privateLine.text, time: suspectThread?.time }] : []),
  ].slice(0, SIDE_SPOTS.length);

  // Mỗi lần bấm Next, lộ thêm 1 câu thật trong đoạn kể của Casey về mối quan
  // hệ (onboarding slide 2) cạnh ảnh mục tiêu — thông tin thật về cặp đôi,
  // không phải manh mối vụ án (địa điểm/hoá đơn).
  const coupleFacts = (caseData.coupleIntro?.text ?? "").split(/(?<=[.!?])\s+/).filter(Boolean);

  // Chỉ thẻ Miles có ảnh thật — fallback về owner nếu case không có dữ liệu
  // slide riêng (vd case v9). Cô gái lạ luôn là ảnh tối màu generated, không
  // lộ mặt (xem mysteryWoman.webp).
  const milesPhoto = caseData.targetPeople?.[0] ?? { image: caseData.owner.avatar, name: caseData.owner.full };

  const totalCards = sideItems.length + 1;

  const [laidCount, setLaidCount] = useState(0);
  const [phase, setPhase] = useState<Phase>(caseData.coupleIntro ? "who" : "fan");
  const [whoStep, setWhoStep] = useState<"ask" | "reveal">("ask");
  const [stepIdx, setStepIdx] = useState(0);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [targetGlow, setTargetGlow] = useState(false);
  const [targetFlipped, setTargetFlipped] = useState(false);
  // 0 = bình thường, 1 = đen trắng, 2 = hiện tim vỡ, 3 = mờ dần (ngay trước
  // khi tách thẻ).
  const [crackStage, setCrackStage] = useState(0);
  const [split, setSplit] = useState(false);
  const [soloRevealed, setSoloRevealed] = useState(false);
  // Chấm sáng chạy lần lượt qua 4 thẻ phụ ("đang quét tìm manh mối"), chạy
  // suốt từ lúc rải xong tới khi vỡ ảnh cặp đôi thì dừng hẳn.
  const [scanIdx, setScanIdx] = useState(0);
  // Hiệu ứng gõ chữ dần cho dòng text trong khung ribbon, thay vì hiện cả
  // câu cùng lúc.
  const [typedLen, setTypedLen] = useState(0);
  const draggingRef = useRef(false);
  const gridRef = useRef<SVGSVGElement>(null);

  const hire = caseData.client.hire;
  const pleaStep1 = hire.find((s) => s.type === "msgs" && s.text.includes("asleep"));
  const pleaStep2 = hire.find((s) => s.type === "msgs" && s.text.includes("nobody else"));
  const ctaStep = hire.find((s) => s.type === "cta");
  // Gộp hết mô tả về 2 người (đoạn kể mối quan hệ + lời cầu xin của Casey)
  // vào CÙNG 1 khung chat (ribbon) thay vì tách 1 phần ra 1 ô riêng cạnh
  // ảnh — đỡ rối, chỉ 1 chỗ để đọc.
  const crackStepIdx = coupleFacts.length; // vị trí dòng "He's asleep..." trong steps
  const steps = [
    ...coupleFacts.map((text) => ({ text, label: "Next ›" })),
    {
      text: pleaStep1?.type === "msgs" ? withName(pleaStep1.text) : "He's asleep. I have his phone, but not for long.",
      label: "Next ›",
    },
    {
      text: pleaStep2?.type === "msgs" ? withName(pleaStep2.text) : "Please — there's nobody else I can ask.",
      label: "Next ›",
    },
    { text: "Help me find out who she is.", label: "Next ›" },
    {
      text: "Please — help me unlock his phone. I remember his pattern traces a “U”.",
      label: ctaStep?.type === "cta" ? ctaStep.label : "Open his phone 🔍",
    },
  ];
  const currentStep = steps[stepIdx];
  const isLastStep = stepIdx === steps.length - 1;

  // Màn mở đầu "Who is next?" rồi lộ ảnh + tên cặp đôi trước khi vào bàn.
  useEffect(() => {
    if (phase !== "who") return;
    if (whoStep === "ask") {
      const t = setTimeout(() => setWhoStep("reveal"), WHO_ASK_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("fan"), WHO_REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase, whoStep]);

  // Rải lần lượt 4 thẻ phụ rồi tới 1 thẻ ảnh cặp đôi — thẻ đầu rơi ngay lập
  // tức (không khựng lại chờ), các thẻ sau cách nhau theo nhịp. Thẻ cuối rơi
  // xong thì sáng lên rồi lật ra ảnh cặp đôi (1 thẻ duy nhất), rồi mới sang
  // bước dẫn truyện — thẻ chưa vỡ vội.
  useEffect(() => {
    if (phase !== "fan") return;
    if (laidCount === 0 && totalCards > 0) {
      setLaidCount(1);
      return;
    }
    if (laidCount < totalCards) {
      const t = setTimeout(() => setLaidCount((n) => n + 1), FAN_STEP_MS);
      return () => clearTimeout(t);
    }
    if (!targetGlow) {
      const t = setTimeout(() => setTargetGlow(true), 300);
      return () => clearTimeout(t);
    }
    if (!targetFlipped) {
      const t = setTimeout(() => setTargetFlipped(true), TARGET_GLOW_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("scroll"), 500);
    return () => clearTimeout(t);
  }, [phase, laidCount, totalCards, targetGlow, targetFlipped]);

  // Đúng lúc dòng "He's asleep..." hiện lên: ảnh cặp đôi đen trắng dần ->
  // hiện tim vỡ -> mờ dần -> tách thành 2 thẻ (Miles + cô gái lạ) -> đổi
  // luôn sang ảnh riêng từng người.
  useEffect(() => {
    if (phase !== "scroll" || stepIdx !== crackStepIdx) return;
    if (crackStage === 0) {
      const t = setTimeout(() => setCrackStage(1), 250);
      return () => clearTimeout(t);
    }
    if (crackStage === 1) {
      const t = setTimeout(() => setCrackStage(2), CRACK_BW_MS);
      return () => clearTimeout(t);
    }
    if (crackStage === 2) {
      const t = setTimeout(() => setCrackStage(3), CRACK_HEART_MS);
      return () => clearTimeout(t);
    }
    if (!split) {
      // Mờ xong là hiện thẳng 2 thẻ với ảnh riêng từng người luôn — không
      // còn hiện lại ảnh cặp đôi (crop 2 nửa) ở bước này nữa, tránh cảm giác
      // "vẫn còn 2 thẻ ảnh cũ" ngay sau khi vừa mờ xong.
      const t = setTimeout(() => {
        setSplit(true);
        setSoloRevealed(true);
      }, CRACK_BLUR_MS);
      return () => clearTimeout(t);
    }
  }, [phase, stepIdx, crackStepIdx, crackStage, split]);

  // 4 thẻ phụ sáng lần lượt từng thẻ 1 ("đang quét tìm manh mối") suốt từ
  // lúc rải xong tới khi ảnh cặp đôi vỡ thì dừng hẳn.
  useEffect(() => {
    if (split || laidCount < sideItems.length) return;
    const t = setInterval(() => setScanIdx((i) => (i + 1) % SIDE_SPOTS.length), 900);
    return () => clearInterval(t);
  }, [split, laidCount, sideItems.length]);

  // Chữ trong khung ribbon tự gõ dần ra thay vì hiện cả câu cùng lúc.
  useEffect(() => {
    setTypedLen(0);
  }, [stepIdx]);
  useEffect(() => {
    if (phase !== "scroll") return;
    if (typedLen >= currentStep.text.length) return;
    const t = setTimeout(() => setTypedLen((n) => n + 1), 20);
    return () => clearTimeout(t);
  }, [phase, typedLen, currentStep.text]);

  // Gõ xong câu thì tự động chuyển bước nếu người chơi chưa bấm Next — câu
  // cuối (mở màn mật khẩu) cho lâu hơn (5s) để kịp đọc + bấm, các câu còn
  // lại 3s.
  useEffect(() => {
    if (phase !== "scroll" || typedLen < currentStep.text.length) return;
    const t = setTimeout(
      () => {
        if (isLastStep) setPhase("lock");
        else setStepIdx((i) => i + 1);
      },
      isLastStep ? 5000 : 3000,
    );
    return () => clearTimeout(t);
  }, [phase, typedLen, currentStep.text.length, isLastStep]);

  // Người chơi tự kéo tay vẽ xong hình chữ U thì giữ 1 nhịp rồi mới mở khoá.
  useEffect(() => {
    if (phase !== "lock") return;
    if (drawn.length < UNLOCK_PATTERN.length) return;
    const t = setTimeout(() => setPhase("unlock"), PATTERN_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, drawn]);

  useEffect(() => {
    if (phase !== "unlock") return;
    const t = setTimeout(onDone, UNLOCK_MS);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  const advanceStep = () => {
    if (isLastStep) setPhase("lock");
    else setStepIdx((i) => i + 1);
  };

  // Tìm chấm gần điểm chạm nhất trong bán kính bắt điểm — đổi tọa độ màn
  // hình thật sang tọa độ viewBox 0-200 của lưới.
  const nearestDigit = (clientX: number, clientY: number) => {
    const svg = gridRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 200;
    const y = ((clientY - rect.top) / rect.height) * 200;
    let best: string | null = null;
    let bestDist = Infinity;
    for (const [d, [dx, dy]] of Object.entries(DIGIT_POS)) {
      const dist = Math.hypot(dx - x, dy - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    return bestDist <= DIGIT_HIT_RADIUS ? best : null;
  };

  const onPatternDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (drawn.length >= UNLOCK_PATTERN.length) return;
    const d = nearestDigit(e.clientX, e.clientY);
    if (d !== UNLOCK_PATTERN[0]) return;
    draggingRef.current = true;
    setDrawn([d]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPatternMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingRef.current) return;
    const d = nearestDigit(e.clientX, e.clientY);
    if (!d) return;
    setDrawn((prev) => {
      const next = UNLOCK_PATTERN[prev.length];
      return d === next ? [...prev, d] : prev;
    });
  };

  const onPatternUp = () => {
    draggingRef.current = false;
    setDrawn((prev) => (prev.length === UNLOCK_PATTERN.length ? prev : []));
  };

  const showLock = phase === "lock" || phase === "unlock";

  return (
    <div className={styles.stage}>
      <div className={`${styles.table} ${phase !== "fan" ? styles.tablePan : ""} ${showLock ? styles.tableDim : ""}`}>
        <img className={styles.deskBg} src={desk} alt="" />
        <div className={styles.deskShade} />

        {Array.from({ length: Math.min(laidCount, sideItems.length) }).map((_, i) => {
          const spot = SIDE_SPOTS[i];
          const posStyle = {
            top: spot.top,
            left: spot.left,
            width: `${spot.size}%`,
            "--rot": `${spot.rot}deg`,
            zIndex: i + 1,
          } as React.CSSProperties;

          return (
            <div
              key={i}
              className={`${styles.itemSlot} ${spot.back ? styles.itemSlotBack : ""} ${!split && i === scanIdx ? styles.scanGlow : ""}`}
              style={posStyle}
            >
              <span className={styles.deskPin} />
              <div className={styles.flipInner}>
                <div className={styles.cardBack}>
                  <span className={styles.cardBackMark}>?</span>
                </div>
                <div className={styles.cardFront}>
                  <CardFace item={sideItems[i]} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Thẻ ảnh cặp đôi — 1 thẻ duy nhất, trước khi "vỡ" tách làm 2. */}
        {laidCount > sideItems.length && !split && (
          <div
            className={`${styles.itemSlot} ${targetGlow && !targetFlipped ? styles.targetGlowSlot : ""}`}
            style={
              {
                top: SINGLE_SPOT.top,
                left: SINGLE_SPOT.left,
                width: `${SINGLE_SPOT.size}%`,
                "--rot": `${SINGLE_SPOT.rot}deg`,
                zIndex: 10,
              } as React.CSSProperties
            }
          >
            <span className={styles.deskPin} />
            <div className={`${styles.flipInner} ${targetFlipped ? styles.flipped : ""}`}>
              <div className={styles.cardBack}>
                <span className={styles.cardBackMark}>?</span>
              </div>
              <div className={styles.cardFront}>
                {caseData.coupleIntro && (
                  <div className={styles.targetFace}>
                    <img
                      className={`${styles.targetImg} ${crackStage >= 1 ? styles.crackBw : ""} ${crackStage >= 3 ? styles.crackBlur : ""}`}
                      src={caseData.coupleIntro.image}
                      alt=""
                    />
                    {crackStage >= 2 && <span className={styles.crackHeart}>💔</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vỡ xong — 2 thẻ: Miles (trái) + cô gái lạ (phải, có reticle). */}
        {split &&
          TARGET_SPOTS.map((spot, targetIdx) => (
            <div
              key={targetIdx}
              className={styles.splitCard}
              style={
                {
                  top: spot.top,
                  left: spot.left,
                  width: `${spot.size}%`,
                  "--rot": `${spot.rot}deg`,
                  zIndex: 10 + targetIdx,
                } as React.CSSProperties
              }
            >
              <span className={styles.deskPin} />
              <div className={styles.targetFace}>
                {!soloRevealed ? (
                  caseData.coupleIntro && (
                    <img
                      className={styles.targetImg}
                      src={caseData.coupleIntro.image}
                      alt=""
                      style={{ objectPosition: targetIdx === 0 ? "22% 28%" : "80% 28%" }}
                    />
                  )
                ) : targetIdx === 0 ? (
                  <img className={styles.targetImg} src={milesPhoto.image} alt="" />
                ) : (
                  <>
                    <img className={styles.targetImg} src={mysteryWoman} alt="" style={{ objectPosition: "50% 30%" }} />
                    {/* viewBox cùng tỉ lệ 3:4 với thẻ (thay vì 120x120 vuông bị letterbox
                        lệch tâm) — vòng tròn đặt ở ~47% chiều cao, đúng vùng mặt. */}
                    <svg className={styles.targetReticle} viewBox="0 0 90 120" fill="none">
                      <path d="M6 2H2v6M84 2h4v6M6 118H2v-6M84 118h4v-6" stroke="#ff2b2b" strokeWidth="2" />
                      <circle cx="45" cy="56" r="30" stroke="#ff2b2b" strokeWidth="1.4" opacity="0.85" />
                      <path d="M45 18v14M45 94v14M11 56h14M70 56h14" stroke="#ff2b2b" strokeWidth="1.4" opacity="0.85" />
                    </svg>
                  </>
                )}
              </div>
              {soloRevealed && (
                <span className={styles.targetNameTag}>{targetIdx === 0 ? milesPhoto.name : "?"}</span>
              )}
            </div>
          ))}
      </div>

      {phase === "scroll" && (
        <div className={styles.scrollWrap}>
          <div key={stepIdx} className={styles.scrollPaper}>
            {currentStep.text.slice(0, typedLen)}
            {typedLen < currentStep.text.length && <span className={styles.typeCursor} />}
          </div>
          <button type="button" className={`${styles.nextBtn} ${isLastStep ? styles.ctaBtn : ""}`} onClick={advanceStep}>
            {currentStep.label}
          </button>
        </div>
      )}

      {showLock && (
        <div className={`${styles.lockScreen} ${phase === "unlock" ? styles.lockScreenUnlock : ""}`}>
          <img className={styles.lockWallpaper} src={caseData.wallpaper} alt="" />
          <div className={styles.lockDim} />
          <span className={styles.lockTime}>9:41</span>
          <span className={styles.lockLine}>
            {drawn.length >= UNLOCK_PATTERN.length ? `Passcode cracked: ${caseData.vaultCode}` : "Draw a “U” to crack his passcode"}
          </span>

          <svg
            ref={gridRef}
            className={`${styles.patternGrid} ${drawn.length >= UNLOCK_PATTERN.length ? styles.patternSuccess : ""}`}
            viewBox="0 0 200 200"
            onPointerDown={onPatternDown}
            onPointerMove={onPatternMove}
            onPointerUp={onPatternUp}
            onPointerCancel={onPatternUp}
          >
            {Object.entries(DIGIT_POS).map(([d, [x, y]]) => (
              <circle
                key={d}
                cx={x}
                cy={y}
                r={7}
                className={`${styles.patternDot} ${drawn.length === 0 && d === UNLOCK_PATTERN[0] ? styles.patternDotStart : ""}`}
              />
            ))}
            {drawn.map((d, i) => {
              const [x, y] = DIGIT_POS[d];
              return <circle key={d + i} cx={x} cy={y} r={11} className={styles.patternDotHit} />;
            })}
            {drawn.slice(1).map((d, i) => {
              const [x1, y1] = DIGIT_POS[drawn[i]];
              const [x2, y2] = DIGIT_POS[d];
              return <line key={d + i} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.patternLine} />;
            })}
          </svg>
        </div>
      )}

      <GrainOverlay opacity={0.1} />
    </div>
  );
}
