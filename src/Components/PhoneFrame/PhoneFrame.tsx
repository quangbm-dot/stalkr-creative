import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./PhoneFrame.module.scss";

interface PhoneFrameProps {
  children: ReactNode;
}

// Canvas thiết kế cố định (iPhone 14/15 logical size) — mọi component bên
// trong dùng px cố định như thiết kế, không cần biết gì về viewport thật
// hay safe-area nữa. .outer đã trừ sẵn safe-area + khoảng chừa nút mạng
// quảng cáo bằng CSS, ta chỉ đo phần còn lại rồi scale canvas vừa khít vào.
const STAGE_W = 393;
const STAGE_H = 852;

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const fit = () => {
      setScale(Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  return (
    <div className={styles.outer} ref={outerRef}>
      <div className={styles.frame} style={{ transform: `scale(${scale})` }}>
        <div className={styles.screen}>{children}</div>
      </div>
    </div>
  );
}
