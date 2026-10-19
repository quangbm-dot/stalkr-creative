import { useLayoutEffect, useState } from "react";
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

  // Báo PhoneFrame chừa chỗ cho thanh này (xem PhoneFrame.module.scss) —
  // không thì 2 nút đè lên thanh câu hỏi ở đáy màn hình. Chạy trước khi
  // PhoneFrame đo kích thước (layout effect, DevBar render trước).
  useLayoutEffect(() => {
    if (!show) return;
    document.documentElement.setAttribute("data-devbar", "");
    window.dispatchEvent(new Event("resize"));
    return () => document.documentElement.removeAttribute("data-devbar");
  }, [show]);

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
