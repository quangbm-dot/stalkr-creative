import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./TrustMeter.module.scss";

interface TrustMeterProps {
  /** 0–100 — giá trị đích; số hiển thị, thanh và ngọn lửa cùng chạy tới đó. */
  value: number;
  label: string;
  avatar: string;
  /** Lời bạn thân ứng với mức trust hiện tại */
  reaction: string;
  /** Giá trị bắt đầu khi mount (mặc định = value). Intro dùng 0 để thanh chạy từ 0 → 100. */
  from?: number;
  /** Thời gian chạy tới giá trị mới (ms). */
  durationMs?: number;
  /** Ẩn dòng phản ứng của bạn thân (intro không cần). */
  hideReaction?: boolean;
  /** Nội dung đặt bên phải dòng nhãn (v13: khay thu thập nạn nhân). */
  rightSlot?: ReactNode;
}

const toneOf = (v: number) => (v > 60 ? "good" : v > 30 ? "warn" : "bad");

/**
 * v13: thanh "Trust" luôn hiện ở đầu màn chơi (cùng màn hình với điện thoại).
 * Số %, độ dài thanh và quả cầu lửa ở đầu thanh dùng CHUNG 1 giá trị đang chạy.
 * Giá trị đó được ghi thẳng vào DOM bằng ref trong rAF (transform: không layout,
 * không re-render React mỗi frame) nên không giật — kể cả khi chạm 100%. React
 * chỉ re-render khi đổi màu (tone) hoặc lúc rung.
 */
export default function TrustMeter({
  value,
  label,
  avatar,
  reaction,
  from,
  durationMs = 700,
  hideReaction = false,
  rightSlot,
}: TrustMeterProps) {
  const start = from ?? value;
  const fillRef = useRef<HTMLDivElement>(null);
  const fireRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const shownRef = useRef(start);
  const [tone, setTone] = useState(toneOf(start));
  const [shake, setShake] = useState(false);
  const prevTarget = useRef(value);

  const paint = (v: number) => {
    // translateX(%) tính theo bề ngang chính phần tử (= bề ngang thanh): phần tử luôn
    // rộng 100%, dịch sang trái (100 - v)% nên mép phải của nó đứng đúng ở v%.
    const tx = `translate3d(${v - 100}%, 0, 0)`;
    if (fillRef.current) fillRef.current.style.transform = tx;
    if (fireRef.current) fireRef.current.style.transform = tx;
    if (pctRef.current) pctRef.current.textContent = `${Math.round(v)}%`;
    // Màu chạy liên tục theo giá trị: xanh lá (100%) → vàng → cam → ĐỎ (0%). Hue 118 → 0.
    const h = Math.round(Math.max(0, Math.min(100, v)) * 1.18);
    if (fillRef.current) {
      fillRef.current.style.background = `linear-gradient(90deg, hsl(${Math.max(h - 14, 0)} 78% 40%), hsl(${h} 82% 52%))`;
    }
    if (pctRef.current) pctRef.current.style.color = `hsl(${h} 88% 58%)`;
  };

  useEffect(() => {
    paint(shownRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const from0 = shownRef.current;
    const delta = value - from0;
    if (delta === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min((now - t0) / durationMs, 1);
      const v = from0 + delta * (1 - Math.pow(1 - k, 3));
      shownRef.current = v;
      paint(v);
      const nt = toneOf(Math.round(v));
      setTone((cur) => (cur === nt ? cur : nt)); // chỉ re-render khi đổi màu
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  useEffect(() => {
    if (value < prevTarget.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      prevTarget.current = value;
      return () => clearTimeout(t);
    }
    prevTarget.current = value;
  }, [value]);

  return (
    <div className={`${styles.wrap} ${shake ? styles.shake : ""}`}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {rightSlot}
      </div>
      <div className={styles.barRow}>
        <div className={styles.track}>
          <div className={styles.clip}>
            <div ref={fillRef} className={`${styles.fill} ${styles[tone]}`} />
          </div>
          {/* Quả cầu lửa tròn ở đầu thanh — nằm gọn trong chiều cao thanh. */}
          <div ref={fireRef} className={styles.mover} aria-hidden>
            <div className={`${styles.fire} ${styles[`fire_${tone}`]}`}>
              <i /><i /><i /><i /><i />
            </div>
          </div>
        </div>
        <span ref={pctRef} className={`${styles.pct} ${styles[tone]}`} />
      </div>
      {!hideReaction && (
        <div className={styles.reaction}>
          <img className={styles.avatar} src={avatar} alt="" />
          <span key={reaction} className={styles.bubble}>{reaction}</span>
        </div>
      )}
    </div>
  );
}
