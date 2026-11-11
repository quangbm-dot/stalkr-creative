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
        <span className={styles.backWrap}>
          <button type="button" className={styles.back} onClick={onBack} aria-label="Back">
            ‹
          </button>
          {/* Đang ở đúng app cần tìm manh mối chưa có cách báo rõ ràng (vd
              Phone không highlight được dòng cụ thể), hoặc đang ở sai app —
              bàn tay trỏ vào nút back để dẫn người chơi thoát ra, xem logic
              activeHand trong App.tsx. */}
          <span className={styles.backHint}>👆</span>
        </span>
        <span className={styles.title}>{title}</span>
        <span />
      </div>
      <div className={`${styles.appbody} ${bodyPadding ? styles.padded : ""}`}>{children}</div>
    </div>
  );
}
