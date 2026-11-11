import { useLayoutEffect, useState } from "react";
import caseIds from "virtual:v9-case-ids";
import styles from "./DevBar.module.scss";

interface DevBarProps {
  onSkipEnd: () => void;
  onSkipIntro: () => void;
}

/**
 * Thanh QA nhanh — chỉ hiện khi URL có #dev (vd: mở dist/index.html#dev),
 * không ảnh hưởng gì tới bản build thật khi chạy trong mạng quảng cáo.
 */
export default function DevBar({ onSkipEnd, onSkipIntro }: DevBarProps) {
  // Tự hiện trên dev server (import.meta.env.DEV); bản build thật vẫn chỉ hiện khi có #dev.
  const [show] = useState(() => import.meta.env.DEV || /dev/.test(location.hash));

  // Chuyển case khác — danh sách ID này luôn đầy đủ (virtual:v9-case-ids
  // không phụ thuộc case nào đang thực sự được load), build 1 case riêng
  // thì mảng chỉ có đúng 1 phần tử, nút tự ẩn. Đi bằng ?case=<id>, mỗi lần
  // chuyển là 1 navigation thật nên chỉ case đó được load (xem vite.config.ts).
  const currentId = new URLSearchParams(location.search).get("case") ?? caseIds[0];
  const currentIdx = caseIds.indexOf(currentId);
  const goToCase = (idx: number) => {
    const id = caseIds[(idx + caseIds.length) % caseIds.length];
    location.href = `?case=${id}#dev`;
  };

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
      <button type="button" onClick={onSkipIntro}>
        ⏭ Skip intro
      </button>
      <button type="button" onClick={onSkipEnd}>
        → End card
      </button>
      {caseIds.length > 1 && (
        <>
          <button type="button" onClick={() => goToCase(currentIdx - 1)}>
            ◀ Case trước
          </button>
          <span className={styles.caseLabel}>
            {currentIdx + 1}/{caseIds.length} · {currentId}
          </span>
          <button type="button" onClick={() => goToCase(currentIdx + 1)}>
            Case sau ▶
          </button>
        </>
      )}
    </div>
  );
}
