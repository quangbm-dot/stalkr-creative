import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import StatusBar from "./StatusBar";
import { hasAdSdkBridge } from "../../services/AdController";
import styles from "./PhoneFrame.module.scss";

interface PhoneFrameProps {
  children: ReactNode;
  /** Có đang THỰC SỰ hiện thanh câu hỏi thu gọn hay không (popup đang đóng).
   * Khi popup mở ra thì false — không cần hiện thanh nữa vì chỗ đó đã có
   * mép trên của popup che rồi, hiện thêm sẽ thành khoảng hở thừa. */
  showBelowBar?: boolean;
  /** Màu status bar giả khi KHÔNG có aboveBar riêng — true (mặc định) =
   * trắng cho nền tối, false = đen cho nền sáng (vd Intro nền xanh nhạt). */
  statusBarDark?: boolean;
  /** StatusBar giả + thông tin case (TopBar) — hiện trong 1 dải nền đen
   * riêng phía TRÊN nội dung khi có (chỉ màn phone, xem App.tsx). undefined
   * thì màn đó tự vẽ StatusBar bên trong .screen như cũ (Intro/CaseIntro/
   * EndCard). Dải này và .belowBar giờ là CON của .frame (cùng box được
   * scale), không phải sibling riêng của .outer nữa — xem comment .frame
   * bên dưới để biết lý do. */
  aboveBar?: ReactNode;
}

// Canvas thiết kế cố định (iPhone 14/15 logical size) — mọi component bên
// trong dùng px cố định như thiết kế, không cần biết gì về viewport thật
// hay safe-area nữa. .outer đã trừ sẵn safe-area + khoảng chừa nút mạng
// quảng cáo bằng CSS, ta chỉ đo phần còn lại rồi scale canvas vừa khít vào.
const STAGE_W = 393;
const STAGE_H = 852;

export default function PhoneFrame({
  children,
  showBelowBar = false,
  statusBarDark = true,
  aboveBar,
}: PhoneFrameProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Khoảng chừa đáy cho nút Skip/Close do mạng quảng cáo thật tự vẽ đè lên —
  // chỉ cần khi THẬT SỰ chạy trong 1 SDK quảng cáo. Mở file trực tiếp bằng
  // tab trình duyệt thường (không SDK, không iframe) thì không có nút đó để
  // tránh, chừa ra chỉ phí diện tích, làm khung co nhỏ hơn mức cần thiết.
  const [adCtaPad] = useState(() => (hasAdSdkBridge() ? "80px" : "0px"));

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const fit = () => {
      setScale(Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={styles.outer} style={{ "--ad-cta-pad": adCtaPad } as React.CSSProperties}>
      <div className={styles.stage} ref={outerRef}>
        <div className={styles.frame} style={{ transform: `scale(${scale})` }}>
          <div className={styles.screen}>
            {/* Vẽ tĩnh "9:41" + sóng/wifi/pin đầy — nhiều mạng quảng cáo
                không tự hiện status bar thật trong webview, nên fake luôn
                làm 1 phần UI, xuyên suốt mọi màn (Loader/Intro/Phone/End).
                Khi đã có aboveBar riêng (màn phone) thì không vẽ lại ở đây
                nữa, tránh hiện 2 lần. */}
            {!aboveBar && <StatusBar dark={statusBarDark} />}
            {children}
            {/* aboveBar/belowBar nằm NGAY TRONG .screen (cùng 1 box được
                .frame scale) thay vì là sibling riêng của .outer — nhờ vậy
                scale khung điện thoại chỉ phụ thuộc đúng 1 công thức
                (min(w/393,h/852)) ở MỌI màn, không bao giờ lệch giữa
                Intro/Home/trong-app nữa (bug trước: 2 phần tử này từng nằm
                ngoài .frame với bề ngang set tay theo scale*393px, còn
                .outer từng phải cộng thêm padding riêng cho chúng mỗi khi
                có mặt — 2 cơ chế đó cộng lại dễ lệch mỗi lần đổi màn). Toạ
                độ ở đây là px LOGIC cố định (như mọi thứ khác trong canvas
                393x852), tự ăn theo transform:scale() của .frame, không
                cần tính tay nữa. */}
            {aboveBar && <div className={styles.aboveBar}>{aboveBar}</div>}
            <div
              className={`${styles.belowBar} ${showBelowBar ? styles.belowBarActive : ""}`}
              id="phone-below-bar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
