import { useLayoutEffect, useState } from "react";
import styles from "./DevBar.module.scss";

interface DevBarProps {
  onSkipEnd: () => void;
  /** v13: giả lập thắng game — chạy đúng luồng thật: tờ giấy thanh toán → end card. */
  onWin?: () => void;
}

/**
 * Thanh QA nhanh — chỉ hiện khi URL có #dev (vd: mở dist/index.html#dev),
 * không ảnh hưởng gì tới bản build thật khi chạy trong mạng quảng cáo.
 */
export default function DevBar({ onSkipEnd, onWin }: DevBarProps) {
  // Hiện khi URL có #dev, hoặc khi chạy bằng dev server (npm run dev) — bản build thật thì không bao giờ hiện.
  const [show] = useState(() => import.meta.env.DEV || /dev/.test(location.hash));

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
      <button type="button" onClick={() => window.dispatchEvent(new Event("smd-dev-solve"))}>
        ⏭ Next quest
      </button>
      {onWin && (
        <button type="button" onClick={onWin}>
          🏆 Win game
        </button>
      )}
      <button type="button" onClick={onSkipEnd}>
        → End card
      </button>
    </div>
  );
}
