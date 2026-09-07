import { useEffect, useRef, useState } from "react";
import handIcon from "../../Assets/UI/tap-hand.webp";
import styles from "./TapHint.module.scss";

interface TapHintProps {
  /** CSS selector của phần tử cần trỏ vào, vd: '[data-hint="app-hinge"]' */
  targetSelector: string;
}

/**
 * Icon bàn tay chạm-nhắc. Việc quyết định KHI NÀO hiện (đứng im bao lâu,
 * có cần tự chuyển trang cho đúng app trước không) là trách nhiệm của
 * component cha (HomeScreen) — component này chỉ lo phần hiển thị: theo
 * dõi vị trí target liên tục qua rAF (không chụp toạ độ 1 lần rồi giữ
 * nguyên) để luôn khớp đúng vị trí thật, kể cả khi target đang cuộn vào
 * màn hình; và tự ẩn ngay khi có chạm thật trong lúc đang hiện.
 */
export default function TapHint({ targetSelector }: TapHintProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    let rafId: number | null = null;

    const track = () => {
      if (dismissedRef.current) return;
      const el = document.querySelector(targetSelector);
      const r = el?.getBoundingClientRect();
      const valid = r && r.width > 0 && r.height > 0 && r.top >= 0 && r.left >= 0;
      setRect(valid ? r! : null);
      rafId = requestAnimationFrame(track);
    };
    track();

    const dismiss = () => {
      dismissedRef.current = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      setRect(null);
    };
    window.addEventListener("pointerdown", dismiss);

    return () => {
      dismissedRef.current = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, [targetSelector]);

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
