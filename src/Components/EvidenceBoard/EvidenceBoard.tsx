import { useEffect, useState } from "react";
import evidenceDesk from "../../Assets/UI/evidence-desk.png";
import styles from "./EvidenceBoard.module.scss";

interface EvidenceBoardProps {
  onDone: () => void;
}

type Phase = "tour" | "settled" | "exit";

// v21: bản trước lia máy quay bằng NHIỀU transition nối tiếp nhau (mỗi món
// đồ 1 transition riêng) — mỗi đoạn phải GIẢM TỐC VỀ 0 hẳn rồi đoạn kế mới
// TĂNG TỐC lại từ đầu, tạo cảm giác "giật" (khựng-rồi-giật) ở mỗi điểm nối.
// Giờ gộp hết thành 1 ANIMATION DUY NHẤT (@keyframes cameraTour, xem SCSS)
// — trình duyệt nội suy mượt xuyên suốt cả hành trình, không còn điểm nối
// nào phải dừng hẳn/tăng tốc lại giữa chừng.
const TOUR_DURATION_MS = 4200;
const NARRATION_DELAY_MS = 500; // dừng hẳn ở điện thoại, chờ 1 nhịp rồi mới hiện lời dẫn truyện
const HINT_DELAY_MS = 900; // gõ xong lời dẫn, chờ 1 nhịp rồi mới hiện bàn tay mời chạm điện thoại
const EXIT_DURATION_MS = 230; // chạm điện thoại -> zoom nhanh + sáng dần -> cắt cảnh ĐÚNG lúc trắng xoá, không khựng lại

// Lời dẫn truyện "chạy" từng chữ 1 (kiểu máy đánh chữ) thay vì hiện cả cục —
// từng dòng gõ xong mới gõ dòng kế, giống nhịp gõ chữ đã dùng ở EvidenceChat.
const NARRATION_LINES = [
  "Is that his phone…? He must’ve left it behind.",
  "I have a feeling he’s hiding something from me.",
];
const TYPE_CHAR_MS = 26;
const LINE_PAUSE_MS = 400;
const COUNTDOWN_START = 9; // nút "Check Now (N)" đếm ngược — hết giờ TỰ bấm hộ, không cần người chơi chạm

// Điểm camera dừng hẳn lại ở điện thoại — animation (xem SCSS) kết thúc
// ĐÚNG tại giá trị này nên 2 bên khớp nhau tuyệt đối, không giật khi
// chuyển từ animation CSS sang inline transform lúc "settled".
const PHONE_SHOT = { top: 48, left: 50.5, scale: 1.55 };

// Vùng chạm vào điện thoại trong ảnh thật — điện thoại đã có sẵn TRONG ảnh,
// không vẽ đè gì lên, chỉ cần 1 nút trong suốt đúng chỗ.
const PHONE_SPOT = { top: 48, left: 50.5, w: 32, h: 28 };

const sceneTransform = (top: number, left: number, scale: number) =>
  `scale(${scale}) translate(${50 / scale - left}%, ${50 / scale - top}%)`;

/**
 * v21 (kịch bản #4 — "camera an ninh"): dùng ẢNH THẬT (evidence-desk.png,
 * bạn cung cấp — bàn gỗ với điện thoại + đồ dùng thật quanh). Mô phỏng feed
 * camera giám sát (nhiễu hạt, vignette, timestamp, REC) — camera LIA + zoom
 * nhẹ qua vài món đồ (xem @keyframes cameraTour trong SCSS) rồi mới dừng
 * hẳn, zoom sâu vào điện thoại (không còn khung ngắm xanh/hotspot hiện ra
 * gì cả — chỉ chuyển động máy quay, nên không còn lo chuyện căn lệch).
 * Người kể chuyện (silhouette) nói vài câu, rồi 1 bàn tay hiện lên mời
 * CHẠM vào màn hình điện thoại để zoom nhanh + sáng dần, cắt cảnh vào game.
 */
export default function EvidenceBoard({ onDone }: EvidenceBoardProps) {
  const [phase, setPhase] = useState<Phase>("tour");
  const [showNarration, setShowNarration] = useState(false);
  const [narrLine, setNarrLine] = useState(0);
  const [narrChar, setNarrChar] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const narrationDone = narrLine >= NARRATION_LINES.length;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPhase("settled"), TOUR_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "settled") return;
    const t = setTimeout(() => setShowNarration(true), NARRATION_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Gõ từng chữ 1 của dòng hiện tại; gõ xong dòng thì nghỉ LINE_PAUSE_MS rồi
  // mới sang dòng kế (reset narrChar về 0).
  useEffect(() => {
    if (!showNarration || narrationDone) return;
    const line = NARRATION_LINES[narrLine];
    if (narrChar < line.length) {
      const t = setTimeout(() => setNarrChar((c) => c + 1), TYPE_CHAR_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setNarrLine((l) => l + 1);
      setNarrChar(0);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(t);
  }, [showNarration, narrLine, narrChar, narrationDone]);

  useEffect(() => {
    if (!narrationDone) return;
    const t = setTimeout(() => setCountdown(COUNTDOWN_START), HINT_DELAY_MS);
    return () => clearTimeout(t);
  }, [narrationDone]);

  // Đếm ngược mỗi giây — hết giờ (0) thì TỰ bấm hộ (tapPhone), không bắt
  // người chơi phải chạm mới qua được.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      tapPhone();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(onDone, EXIT_DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const tapPhone = () => {
    if (phase !== "settled") return;
    setPhase("exit");
  };

  // "tour" dùng @keyframes CSS (class .sceneTour) — "settled"/"exit" chuyển
  // sang inline transform + transition thường (giá trị KHỚP ĐÚNG điểm cuối
  // animation nên đổi cơ chế mà không hề giật/nhảy khung hình).
  const sceneStyle =
    phase === "tour"
      ? undefined
      : { transform: sceneTransform(PHONE_SHOT.top, PHONE_SHOT.left, phase === "exit" ? 2.1 : PHONE_SHOT.scale) };

  return (
    <div className={styles.stage}>
      <div
        className={`${styles.scene} ${phase === "tour" ? styles.sceneTour : ""} ${phase === "exit" ? styles.sceneExit : ""}`}
        style={sceneStyle}
      >
        <img className={styles.photo} src={evidenceDesk} alt="" />

        {phase !== "tour" && (
          <button
            type="button"
            className={styles.phoneHotspot}
            style={{
              top: `${PHONE_SPOT.top}%`,
              left: `${PHONE_SPOT.left}%`,
              width: `${PHONE_SPOT.w}%`,
              height: `${PHONE_SPOT.h}%`,
            }}
            onClick={tapPhone}
            aria-label="Open the phone"
          />
        )}
      </div>

      {/* Lớp phủ "ống kính camera" — đứng yên, KHÔNG zoom theo cảnh, để nhiễu
          hạt/vignette/timestamp luôn giữ đúng tỉ lệ như 1 feed giám sát. */}
      <div className={styles.overlay}>
        <div className={styles.vignette} />
        <div className={styles.scanlines} />
        <div className={styles.rec}>
          <span className={styles.recDot} />
          REC
        </div>
        <div className={styles.timestamp}>CAM 04 &middot; {timestamp}</div>
      </div>

      {showNarration && (
        <div className={styles.promptStack}>
          <p className={styles.narrationLine}>
            {NARRATION_LINES.slice(0, narrLine).map((line, i) => (
              <span key={i} className={styles.narrationDone}>
                {line}
                <br />
              </span>
            ))}
            {!narrationDone && NARRATION_LINES[narrLine].slice(0, narrChar)}
          </p>

          {countdown !== null && (
            <button type="button" className={styles.checkNow} onClick={tapPhone}>
              Check Now{countdown > 0 ? ` (${countdown})` : ""}
            </button>
          )}
        </div>
      )}

      {phase === "exit" && <div className={styles.flash} />}
    </div>
  );
}
