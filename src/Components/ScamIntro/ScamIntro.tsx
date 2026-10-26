import { useEffect, useRef, useState } from "react";
import type { CaseConfig } from "../../types/case";
import TrustMeter from "../TrustMeter/TrustMeter";
import openLinkApp from "../../services/AdController";
import styles from "./ScamIntro.module.scss";

interface ScamIntroProps {
  caseData: CaseConfig;
  onDone: () => void;
}

// Mỗi thẻ có chỗ riêng (tự do, hơi lộn xộn như ảnh ghim lên bảng) thay vì hàng/quạt đều tăm tắp.
const SPOTS: { left: number; top: number; w: number; rot: number }[] = [
  { left: 0, top: 40, w: 80, rot: -8 },
  { left: 20, top: 0, w: 84, rot: 5 },
  { left: 41, top: 62, w: 92, rot: -3 },
  { left: 62, top: 0, w: 84, rot: 7 },
  { left: 79, top: 64, w: 76, rot: -6 },
];

// Nhịp intro nhanh: 5 thẻ rơi gần như liền nhau, thanh chạy ngắn, chữ + CTA hiện ngay sau đó (~2.5s tổng).
const CARD_START_MS = 120;
const CARD_STEP_MS = 100;
const CARD_ANIM_MS = 350;
const METER_AFTER_MS = 150; // sau thẻ cuối
const FILL_MS = 1000;
const AUTO_START_MS = 4000; // tính từ lúc nút "Expose Daniel" hiện ra: không bấm thì sau 4s vẫn tự vào màn chơi
const TEXT_GAP_MS = 50; // từ lúc thanh chạy xong tới khi chữ hiện
const CTA_OFFSET_MS = 0; // chữ, tin nhắn của Chloe và nút hiện CÙNG 1 LÚC
const RISE_MS = 300; // thời lượng animation hiện nút

/**
 * v13 intro: không còn đoạn chat dẫn chuyện — mở thẳng bằng cú hook thị giác:
 * ảnh Daniel → từng thẻ cô gái (ảnh blur có sẵn, không bao giờ hiện nét) rơi
 * vào các vị trí tự do → thanh Trust chạy 0 → 100% kèm ngọn lửa → câu chốt +
 * bong bóng của Chloe + nút "Expose Daniel".
 */
export default function ScamIntro({ caseData, onDone }: ScamIntroProps) {
  const intro = caseData.scamIntro;
  const victims = caseData.endCard.victims ?? [];
  const lastCardAt = CARD_START_MS + CARD_STEP_MS * Math.max(victims.length - 1, 0);
  const meterAt = lastCardAt + CARD_ANIM_MS + METER_AFTER_MS;
  const tail = meterAt + 100 + FILL_MS + TEXT_GAP_MS; // chữ + CTA hiện sau khi thanh đã chạy xong hẳn
  const ctaShownAt = tail + CTA_OFFSET_MS + RISE_MS;

  // Tự vào màn chơi AUTO_START_MS sau khi nút Expose hiện ra nếu chưa ai bấm (App unmount intro khi chuyển stage nên timer tự dọn).
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), ctaShownAt + AUTO_START_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Thanh bắt đầu ở 0, tới đúng lúc thì mới được set 100 để chạy.
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), meterAt + 100);
    return () => clearTimeout(t);
  }, [meterAt]);

  if (!intro) return null;
  const after = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <div className={styles.stage}>
      <div className={styles.top}>
        <button type="button" className={styles.download} onClick={openLinkApp}>
          ⬇ Download
        </button>
      </div>

      <div className={styles.daniel}>
        <img src={caseData.owner.avatar} alt="" />
        <span className={styles.verified}>✔ Verified doctor</span>
      </div>

      <div className={styles.board}>
        {victims.map((v, i) => {
          const s = SPOTS[i % SPOTS.length];
          return (
            <div
              key={v.name}
              className={styles.card}
              style={{
                left: `${s.left}%`,
                top: s.top,
                width: s.w,
                ["--r" as string]: `${s.rot}deg`,
                ...after(CARD_START_MS + i * CARD_STEP_MS),
              }}
            >
              <img src={v.blurAvatar ?? v.avatar} alt="" />
              <span className={styles.lock}>🔒</span>
            </div>
          );
        })}
      </div>

      {caseData.trust && (
        <div className={styles.meter} style={after(meterAt)}>
          <TrustMeter
            value={filled ? 100 : 0}
            from={0}
            durationMs={FILL_MS}
            hideReaction
            label={caseData.trust.label}
            avatar={caseData.client.avatar}
            reaction=""
          />
        </div>
      )}

      <h1 className={styles.headline} style={after(tail)}>{intro.headline}</h1>
      {intro.sub && <p className={styles.sub} style={after(tail)}>{intro.sub}</p>}

      <div className={styles.bubbleRow} style={after(tail)}>
        <img className={styles.bubbleAvatar} src={caseData.client.avatar} alt="" />
        <div className={styles.bubble}>{intro.bubble}</div>
      </div>

      <div className={styles.ctaWrap} style={after(tail + CTA_OFFSET_MS)}>
        <button type="button" className={styles.cta} onClick={onDone}>
          {intro.cta}
        </button>
        <span className={styles.hand}>👆</span>
      </div>
    </div>
  );
}
