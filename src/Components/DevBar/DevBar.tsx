import { useState } from "react";
import styles from "./DevBar.module.scss";

interface DevBarProps {
  onSkipEnd: () => void;
}

/**
 * Thanh QA nhanh — chỉ hiện khi URL có #dev (vd: mở dist/index.html#dev),
 * không ảnh hưởng gì tới bản build thật khi chạy trong mạng quảng cáo.
 */
export default function DevBar({ onSkipEnd }: DevBarProps) {
  const [show] = useState(() => /dev/.test(location.hash));
  if (!show) return null;

  return (
    <div className={styles.bar}>
      <button type="button" onClick={() => location.reload()}>
        ↺ Chơi lại
      </button>
      <button type="button" onClick={onSkipEnd}>
        → End card
      </button>
    </div>
  );
}
