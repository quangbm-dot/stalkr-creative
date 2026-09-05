import styles from "./Confetti.module.scss";

const COLORS = ["#2f8fe0", "#ff5f5f", "#ffd166", "#34c759", "#ffffff"];
const PIECES = Array.from({ length: 40 }, (_, i) => i);

/** Vài mảnh giấy màu rơi + xoay, tự chạy 1 lần khi mount — dùng lúc hoàn
 *  thành toàn bộ evidence, trước khi chuyển sang EndCard. */
export default function Confetti() {
  return (
    <div className={styles.confetti}>
      {PIECES.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const duration = 1.8 + Math.random() * 0.9;
        const color = COLORS[i % COLORS.length];
        const rotate = Math.random() * 360;
        const drift = (Math.random() - 0.5) * 60;
        return (
          <span
            key={i}
            className={styles.piece}
            style={{
              left: `${left}%`,
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              ["--rot" as string]: `${rotate}deg`,
              ["--drift" as string]: `${drift}px`,
            }}
          />
        );
      })}
    </div>
  );
}
