import styles from "./StatusBar.module.scss";

interface StatusBarProps {
  /** true (mặc định) = chữ/icon trắng, cho nền tối (loader/phone/endcard).
   *  false = chữ/icon đen, cho nền sáng (intro nền xanh nhạt). */
  dark?: boolean;
}

/**
 * Thanh trạng thái giả (giờ/sóng/wifi/pin) — vẽ cố định "9:41" + đầy sóng,
 * không đọc giờ/pin thật của máy. Nhiều mạng quảng cáo không tự hiện status
 * bar thật trong webview quảng cáo, nên bản gốc tự vẽ luôn 1 cái tĩnh làm
 * phần của UI, hiện xuyên suốt mọi màn (Loader/Intro/Phone/EndCard).
 */
export default function StatusBar({ dark = true }: StatusBarProps) {
  return (
    <div className={`${styles.bar} ${dark ? styles.dark : styles.light}`}>
      <span className={styles.time}>9:41</span>
      <div className={styles.icons}>
        <svg viewBox="0 0 18 12" width="18" height="12" fill="currentColor">
          <rect x="0" y="7" width="3" height="5" rx="0.5" />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg viewBox="0 0 16 12" width="16" height="12" fill="none">
          <path
            d="M1 4.5C4 1.5 12 1.5 15 4.5M3.3 7C5.3 5 10.7 5 12.7 7M5.8 9.3C7 8 9 8 10.2 9.3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11" r="1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 25 12" width="25" height="12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
          <rect x="22.5" y="4" width="1.5" height="4" rx="0.7" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
