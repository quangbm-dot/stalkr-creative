import type { ReactNode } from "react";
import styles from "./AppScreen.module.scss";

interface AppScreenProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
  /** Nội dung app tối (mặc định) hay sáng — mỗi app tự khai báo theo giao diện gốc của nó. */
  theme?: "dark" | "light";
  /** Bỏ padding/scroll mặc định của appbody (dùng cho minigame/board tự vẽ layout). */
  bodyPadding?: boolean;
}

export default function AppScreen({
  title,
  onBack,
  children,
  theme = "dark",
  bodyPadding = false,
}: AppScreenProps) {
  return (
    <div className={`${styles.appscreen} ${theme === "light" ? styles.light : styles.dark}`}>
      <div className={styles.appbar}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
          ‹
        </button>
        <span className={styles.title}>{title}</span>
        <span />
      </div>
      <div className={`${styles.appbody} ${bodyPadding ? styles.padded : ""}`}>{children}</div>
    </div>
  );
}
