import { useEffect, useRef, useState } from "react";
import type { CaseConfig } from "../../types/case";
import GrainOverlay from "../IntroCinematic/GrainOverlay";
import openLinkApp from "../../services/AdController";
import downloadBtn from "../../Assets/UI/download.webp";
import mapBg from "./img/realisticMap.webp";
import styles from "./IntroMapTracking.module.scss";

// Thẻ ghim bản đồ hình giọt nước (giống kiểu ghim có sẵn trong ảnh nền
// maps-bg.jpg) — dùng cho điểm "lạ" + điểm "nhà" trong popup bản đồ. Icon vẽ
// bằng path/SVG thật thay vì ký tự emoji/unicode (kiểu "？"/"⌫" trước đó hay
// bị webview quảng cáo render lệch tâm hoặc sai hẳn glyph).
function MapPin({ color, icon, ping }: { color: string; icon: "house" | string; ping?: boolean }) {
  return (
    <svg className={styles.pinSvg} viewBox="0 0 32 42" style={{ overflow: "visible" }}>
      {ping && (
        <>
          <circle cx="16" cy="16" r="10" className={styles.pinPingRing} style={{ animationDelay: "0s" }} />
          <circle cx="16" cy="16" r="10" className={styles.pinPingRing} style={{ animationDelay: "0.6s" }} />
        </>
      )}
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z"
        fill={color}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="16" r="9" fill="rgba(255,255,255,0.92)" />
      {icon === "house" ? (
        <path d="M16 9.5l6.5 5.2V23h-4v-5.5h-5V23h-4v-8.3z" fill={color} />
      ) : (
        <text x="16" y="16.5" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="800" fill={color}>
          {icon}
        </text>
      )}
    </svg>
  );
}

// Icon xoá (backspace) vẽ tay bằng SVG — ký tự unicode "⌫" bị 1 số webview
// quảng cáo render sai thành hình tròn gạch chéo, nên dùng icon riêng cho chắc.
function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-6-6 6-6z" />
      <path d="M12 10l4 4M16 10l-4 4" />
    </svg>
  );
}

// Chỉ bôi đỏ đúng phần "highlight" (vài từ) trong đoạn text đang gõ dần ra —
// không bôi cả câu. Khi đang gõ tới đúng đoạn highlight thì nó cũng tô màu
// dần theo, gõ qua khỏi thì phần sau trở lại màu chữ thường.
function renderParaText(text: string, typedLen: number, highlight: string | undefined, tapActive: boolean) {
  const visible = text.slice(0, typedLen);
  const idx = highlight ? text.indexOf(highlight) : -1;
  if (idx === -1) return <>{visible}</>;
  const hlEnd = idx + (highlight as string).length;
  const before = visible.slice(0, Math.min(idx, typedLen));
  const hlVisible = visible.slice(Math.min(idx, typedLen), Math.min(hlEnd, typedLen));
  const after = visible.slice(Math.min(hlEnd, typedLen));
  const hlDone = typedLen >= hlEnd;
  return (
    <>
      {before}
      {hlVisible && (
        <span className={`${styles.paraHighlightWord} ${tapActive ? styles.paraHighlightWordTap : ""}`}>{hlVisible}</span>
      )}
      {tapActive && hlDone && <span className={styles.paraTapHint}>👆</span>}
      {after}
    </>
  );
}

interface Props {
  caseData: CaseConfig;
  onDone: () => void;
}

// Không còn màn "Who is next?" riêng hay khung chat bấm Next — mở màn vào
// thẳng tờ hồ sơ/báo đang "chạy chữ" dần, tới đúng dòng nói về vị trí lạ thì
// bật popup bản đồ (camera từ cận zoom ra xa), xong tự chuyển sang màn khoá.
type Phase = "dossier" | "lock" | "unlock";

const PARA_PAUSE_MS = 900;
const LOCATION_AUTO_MS = 3200;
const MAP_POPUP_HOLD_MS = 3600;
const TAG_POPUP_HOLD_MS = 3400;
const FINAL_HOLD_MS = 2600;
const PIN_HOLD_MS = 900;
const PIN_WRONG_RESET_MS = 500;
const UNLOCK_MS = 700;

// Toạ độ % của chấm "lạ" trong khung bản đồ popup (viewBox 0-100) — camera
// zoom/pull-back lấy tâm đúng điểm này. HOME_POS (ghim nhà, điểm mốc để biết
// "đang ở đâu so với nhà") đặt gần đó, vẫn lọt trong khung sau khi zoom.
const DEST_POS = { top: 46, left: 64 };
const HOME_POS = { top: 64, left: 46 };

// Không hỏi tên người chơi trong bản cinematic — "{{name}}, " trong data gốc bỏ gọn.
const withName = (text: string) => {
  const stripped = text.replace(/\{\{name\}\},?\s*/g, "");
  return stripped !== text ? stripped.charAt(0).toUpperCase() + stripped.slice(1) : stripped;
};

// Giờ trên màn khoá lấy đúng giờ thật của máy người chơi (giờ địa phương, tự
// động theo múi giờ của họ) thay vì mốc "9:41" giả như trước — tự định dạng
// tay kiểu 12h KHÔNG kèm AM/PM (giống "9:41" gốc) thay vì dùng
// toLocaleTimeString, vì tuỳ locale máy sẽ tự thêm "AM"/"PM" vào chữ.
const formatNow = () => {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default function IntroMapTracking({ caseData, onDone }: Props) {
  const hire = caseData.client.hire;
  const pleaStep1 = hire.find((s) => s.type === "msgs" && s.text.includes("asleep"));
  const place = caseData.maps.locations.find((l) => l.name.includes("Pace")) ?? caseData.maps.locations[0];

  // Lộ dần từng câu thật về mối quan hệ (onboarding slide 2) rồi tới lời cầu
  // xin của Casey — mỗi câu là 1 đoạn trên tờ hồ sơ, chữ "chạy" tự động, dồn
  // tích lại chứ không thay đổi ô như bản ribbon trước.
  const coupleFacts = (caseData.coupleIntro?.text ?? "").split(/(?<=[.!?])\s+/).filter(Boolean);
  const paragraphs = [
    ...coupleFacts,
    pleaStep1?.type === "msgs" ? withName(pleaStep1.text) : "He's asleep. I have his phone, but not for long.",
    "He told me he'd be stuck at the office all night.",
    "But his phone's been pinging from somewhere else for the last hour.",
    "There's a receipt in his coat — a tag from a boutique. That number... he reuses it everywhere.",
    "Help me find out where he really is.",
    "Please — help me unlock his phone. The code's on that tag.",
  ];
  // Vị trí đoạn nhắc tới việc điện thoại đang ping chỗ khác — đúng lúc này
  // dừng lại, chờ chạm vào mới bật popup bản đồ.
  const pingParaIdx = coupleFacts.length + 2;
  // Vị trí đoạn nhắc tới cái tag quần áo — gõ xong tự bật popup thẻ tag lộ
  // mã số (chính là mật khẩu điện thoại).
  const tagParaIdx = coupleFacts.length + 3;
  // Chỉ bôi đỏ VÀI TỪ chính trong đoạn, không cả câu — đỡ nặng mắt.
  const HIGHLIGHTS: Record<number, string> = {
    [pingParaIdx]: "somewhere else",
    [tagParaIdx]: "a tag",
  };

  const [phase, setPhase] = useState<Phase>("dossier");
  const [lockTime, setLockTime] = useState(formatNow);
  const [paraIdx, setParaIdx] = useState(0);
  const [typedLen, setTypedLen] = useState(0);
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const [tagPopupOpen, setTagPopupOpen] = useState(false);
  // Nhập mật khẩu (PIN) — khớp đúng caseData.vaultCode (mã in trên tag quần áo).
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);
  const [solved, setSolved] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const pinLen = caseData.vaultCode.length;

  const currentPara = paragraphs[paraIdx];
  const isLastPara = paraIdx === paragraphs.length - 1;

  useEffect(() => {
    setTypedLen(0);
  }, [paraIdx]);

  // Chữ trên tờ hồ sơ tự gõ dần ra, không cần bấm gì cả.
  useEffect(() => {
    if (phase !== "dossier" || mapPopupOpen || tagPopupOpen) return;
    if (typedLen >= currentPara.length) return;
    const t = setTimeout(() => setTypedLen((n) => n + 1), 20);
    return () => clearTimeout(t);
  }, [phase, mapPopupOpen, tagPopupOpen, typedLen, currentPara]);

  // Gõ xong 1 đoạn: tự sang đoạn kế, hoặc (đoạn cuối) tự chuyển qua màn khoá.
  // TRỪ 2 đoạn đặc biệt: đoạn "pinging" dừng lại chờ chạm vào mới bật popup
  // bản đồ; đoạn "receipt/tag" tự bật popup thẻ tag sau khi gõ xong.
  useEffect(() => {
    if (phase !== "dossier" || mapPopupOpen || tagPopupOpen) return;
    if (typedLen < currentPara.length) return;
    if (paraIdx === pingParaIdx) return;
    if (paraIdx === tagParaIdx) {
      const t = setTimeout(() => setTagPopupOpen(true), PARA_PAUSE_MS);
      return () => clearTimeout(t);
    }
    if (!isLastPara) {
      const t = setTimeout(() => setParaIdx((i) => i + 1), PARA_PAUSE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("lock"), FINAL_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, mapPopupOpen, tagPopupOpen, typedLen, currentPara, paraIdx, pingParaIdx, tagParaIdx, isLastPara]);

  const locationTappable = phase === "dossier" && !mapPopupOpen && !tagPopupOpen && paraIdx === pingParaIdx && typedLen >= currentPara.length;

  // Chạm vào từ bôi đỏ thì mở popup ngay — không chạm thì tự bật sau 1 lúc,
  // khỏi bị kẹt chờ mãi nếu người chơi không để ý.
  useEffect(() => {
    if (!locationTappable) return;
    const t = setTimeout(() => setMapPopupOpen(true), LOCATION_AUTO_MS);
    return () => clearTimeout(t);
  }, [locationTappable]);

  // Popup bật lên (tự động hay do chạm) thì giữ đủ lâu rồi mới đóng + sang
  // đoạn kế.
  useEffect(() => {
    if (!mapPopupOpen || paraIdx !== pingParaIdx) return;
    const t = setTimeout(() => {
      setMapPopupOpen(false);
      setParaIdx((i) => i + 1);
    }, MAP_POPUP_HOLD_MS);
    return () => clearTimeout(t);
  }, [mapPopupOpen, paraIdx, pingParaIdx]);

  useEffect(() => {
    if (!tagPopupOpen || paraIdx !== tagParaIdx) return;
    const t = setTimeout(() => {
      setTagPopupOpen(false);
      setParaIdx((i) => i + 1);
    }, TAG_POPUP_HOLD_MS);
    return () => clearTimeout(t);
  }, [tagPopupOpen, paraIdx, tagParaIdx]);

  // Đóng thủ công (nút ✕ / chạm ra ngoài) PHẢI đẩy paraIdx qua luôn, giống
  // hệt lúc tự đóng — nếu không, đoạn hội thoại vẫn đang "đứng" ở đúng đoạn
  // đó nên hiệu ứng tự mở lại kích hoạt lại ngay, làm tag/map hiện lại liên
  // tục mỗi khi bấm tắt.
  const closeMapPopup = () => {
    setMapPopupOpen(false);
    setParaIdx((i) => (i === pingParaIdx ? i + 1 : i));
  };
  const closeTagPopup = () => {
    setTagPopupOpen(false);
    setParaIdx((i) => (i === tagParaIdx ? i + 1 : i));
  };

  // Luôn cuộn xuống dòng mới nhất khi chữ chạy tới.
  useEffect(() => {
    const el = paperRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [paraIdx, typedLen]);

  // Giờ trên màn khoá tự cập nhật theo giờ thật của máy.
  useEffect(() => {
    const t = setInterval(() => setLockTime(formatNow()), 15000);
    return () => clearInterval(t);
  }, []);

  // Nhập đủ số chữ số: khớp mã thật thì giữ 1 nhịp rồi mở khoá, sai thì rung
  // rồi xoá để nhập lại (không phạt gì thêm).
  useEffect(() => {
    if (phase !== "lock" || entered.length < pinLen) return;
    if (entered === caseData.vaultCode) {
      setSolved(true);
      return;
    }
    setShake(true);
    const t = setTimeout(() => {
      setShake(false);
      setEntered("");
    }, PIN_WRONG_RESET_MS);
    return () => clearTimeout(t);
  }, [phase, entered, pinLen, caseData.vaultCode]);

  useEffect(() => {
    if (phase !== "lock" || !solved) return;
    const t = setTimeout(() => setPhase("unlock"), PIN_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, solved]);

  useEffect(() => {
    if (phase !== "unlock") return;
    const t = setTimeout(onDone, UNLOCK_MS);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  const onDigit = (d: string) => {
    if (solved || entered.length >= pinLen) return;
    setEntered((prev) => prev + d);
  };

  const onBackspace = () => {
    if (solved) return;
    setEntered((prev) => prev.slice(0, -1));
  };

  const showLock = phase === "lock" || phase === "unlock";
  const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  // Chữ cái nhỏ dưới mỗi số, đúng kiểu bàn phím số iPhone thật.
  const KEY_LETTERS: Record<string, string> = {
    "2": "ABC",
    "3": "DEF",
    "4": "GHI",
    "5": "JKL",
    "6": "MNO",
    "7": "PQRS",
    "8": "TUV",
    "9": "WXYZ",
  };

  return (
    <div className={styles.stage}>
      <div className={`${styles.backdrop} ${showLock ? styles.backdropDim : ""}`} />

      {phase !== "unlock" && (
        <button type="button" className={styles.introDownload} onClick={openLinkApp}>
          <img src={downloadBtn} alt="Download" />
        </button>
      )}

      {phase === "dossier" && (
        <>
          {/* Vài tờ giấy rơi lướt qua phía sau, góc quăn — chỉ trang trí, tạo
              cảm giác "cả chồng hồ sơ đang rơi xuống" như ảnh tham khảo. */}
          <div className={styles.driftSheetA} />
          <div className={styles.driftSheetB} />

          <div className={styles.dossierWrap}>
            <div className={styles.paper}>
              <span className={styles.stamp}>CONFIDENTIAL</span>
              <div className={styles.paperHeader}>
                {caseData.coupleIntro && <img className={styles.clipPhoto} src={caseData.coupleIntro.image} alt="" />}
                <div className={styles.headerText}>
                  <span className={styles.eyebrow}>CASE FILE · {caseData.owner.full}</span>
                  <span className={styles.headline}>A Secret He's Been Keeping</span>
                </div>
              </div>
              <div className={styles.rule} />
              <div ref={paperRef} className={styles.paperScroll}>
                {paragraphs.slice(0, paraIdx).map((p, i) => (
                  <p key={i} className={styles.paraDone}>
                    {renderParaText(p, p.length, HIGHLIGHTS[i], false)}
                  </p>
                ))}
                <p
                  className={`${styles.paraActive} ${locationTappable ? styles.paraLocationTap : ""}`}
                  onClick={locationTappable ? () => setMapPopupOpen(true) : undefined}
                >
                  {renderParaText(currentPara, typedLen, HIGHLIGHTS[paraIdx], locationTappable)}
                  {typedLen < currentPara.length && <span className={styles.typeCursor} />}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {mapPopupOpen && (
        <div className={styles.mapPopupOverlay} onClick={closeMapPopup}>
          <div className={styles.mapPopupCard} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.popupClose} onClick={closeMapPopup} aria-label="Close">
              ✕
            </button>
            <span className={styles.mapPopupLabel}>⚠️ LOCATION PING DETECTED</span>
            <div className={styles.mapPopupFrame}>
              <div className={styles.mapPopupZoom} style={{ "--px": `${DEST_POS.left}%`, "--py": `${DEST_POS.top}%` } as React.CSSProperties}>
                <img className={styles.mapBgImg} src={mapBg} alt="" />
                <div className={styles.mapShade} />
                <div className={styles.mapPin} style={{ top: `${HOME_POS.top}%`, left: `${HOME_POS.left}%` }}>
                  <div className={styles.pinGraphic}>
                    <MapPin color="#0a84ff" icon="house" />
                  </div>
                </div>
                <div className={styles.mapPin} style={{ top: `${DEST_POS.top}%`, left: `${DEST_POS.left}%` }}>
                  <div className={styles.pinGraphic}>
                    <MapPin color="#ff3b30" icon="?" ping />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.mapPopupInfo}>
              <span>🕐 Logged 9:42 PM</span>
              {place && <span>📍 {place.subtitle ?? "Unknown address"}</span>}
            </div>
          </div>
        </div>
      )}

      {tagPopupOpen && (
        <div className={styles.mapPopupOverlay} onClick={closeTagPopup}>
          <div className={styles.tagCard} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.popupClose} onClick={closeTagPopup} aria-label="Close">
              ✕
            </button>
            <span className={styles.tagHole} />
            <span className={styles.tagStore}>NOIR &amp; CO. BOUTIQUE</span>
            <span className={styles.tagItem}>Item: Wool Coat · Qty 1</span>
            <div className={styles.tagBarcode} />
            <span className={styles.tagCodeLabel}>SECURITY TAG CODE</span>
            <span className={styles.tagCode}>{caseData.vaultCode}</span>
          </div>
        </div>
      )}

      {showLock && (
        <div className={`${styles.lockScreen} ${phase === "unlock" ? styles.lockScreenUnlock : ""}`}>
          <img className={styles.lockWallpaper} src={caseData.wallpaper} alt="" />
          <div className={styles.lockDim} />
          <span className={styles.lockTime}>{lockTime}</span>
          <span className={styles.lockLine}>
            {solved ? "Code verified ✓" : shake ? "Wrong code — try again" : `Enter Passcode: ${caseData.vaultCode}`}
          </span>

          <div className={`${styles.pinDots} ${shake ? styles.pinDotsShake : ""}`}>
            {Array.from({ length: pinLen }).map((_, i) => (
              <span
                key={i}
                className={`${styles.pinDot} ${i < entered.length ? styles.pinDotFilled : ""} ${solved ? styles.pinDotSolved : ""}`}
              />
            ))}
          </div>

          <div className={styles.keypad}>
            {keypad.map((k, i) =>
              k === "" ? (
                <span key={i} className={styles.keypadSpacer} />
              ) : k === "⌫" ? (
                <button key={i} type="button" className={styles.keypadBackspace} onClick={onBackspace} aria-label="Backspace">
                  <BackspaceIcon />
                </button>
              ) : (
                <button key={i} type="button" className={styles.keypadBtn} onClick={() => onDigit(k)}>
                  <span className={styles.keypadDigit}>{k}</span>
                  {KEY_LETTERS[k] && <span className={styles.keypadLetters}>{KEY_LETTERS[k]}</span>}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <GrainOverlay opacity={0.1} />
    </div>
  );
}
