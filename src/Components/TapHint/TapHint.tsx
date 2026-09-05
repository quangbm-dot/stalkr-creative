import { useEffect, useState } from "react";
import handIcon from "../../Assets/UI/tap-hand.webp";
import styles from "./TapHint.module.scss";

interface TapHintProps {
  /** CSS selector của phần tử cần trỏ vào, vd: '[data-hint="app-hinge"]' */
  targetSelector: string;
  /** Số ms không thao tác gì thì hiện gợi ý */
  idleMs?: number;
}

/**
 * Icon bàn tay chạm-nhắc, tự hiện sau khi người chơi đứng im idleMs,
 * tự ẩn ngay khi có tương tác (tap/scroll) bất kỳ trong khung điện thoại.
 */
export default function TapHint({ targetSelector, idleMs = 3500 }: TapHintProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const showHint = () => {
      const el = document.querySelector(targetSelector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Bỏ qua nếu phần tử chưa layout xong / nằm ngoài viewport (rect rỗng
      // hoặc âm) — tránh hiện bàn tay ở vị trí sai lệch.
      if (r.width === 0 || r.height === 0 || r.top < 0 || r.left < 0) return;
      setRect(r);
    };

    const resetIdle = () => {
      setRect(null);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(showHint, idleMs);
    };

    resetIdle();
    window.addEventListener("pointerdown", resetIdle);
    window.addEventListener("scroll", resetIdle, true);
    window.addEventListener("resize", resetIdle);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", resetIdle);
      window.removeEventListener("scroll", resetIdle, true);
      window.removeEventListener("resize", resetIdle);
    };
  }, [targetSelector, idleMs]);

  if (!rect) return null;

  return (
    <div
      className={styles.hand}
      style={{ left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 }}
    >
      <span className={styles.pulse} />
      <img className={styles.handImg} src={handIcon} alt="" />
    </div>
  );
}
