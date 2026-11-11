import { useState, type MouseEvent } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Photos.module.scss";

interface PhotosProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

export default function Photos({ caseData, onBack, hintTargetId, onFoundClue }: PhotosProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [showVaultPad, setShowVaultPad] = useState(false);
  const [shake, setShake] = useState(false);
  // Ảnh grid chỉ 1/3 bề ngang màn hình, nhiều case cần đọc chữ/chi tiết nhỏ
  // trong ảnh (giấy tờ, biên lai...) — phải mở xem toàn màn hình + bấm vào
  // để phóng to mới đọc được, không thể đọc nổi ở size thumbnail.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center");

  const visiblePhotos = caseData.photos.filter((p) => !p.secret || unlocked);
  const hasLockedSecrets = caseData.photos.some((p) => p.secret) && !unlocked;
  const openPhoto = openIndex !== null ? visiblePhotos[openIndex] : undefined;

  const closeViewer = () => {
    setOpenIndex(null);
    setZoomed(false);
  };
  const step = (dir: 1 | -1) => {
    if (openIndex === null) return;
    const next = openIndex + dir;
    if (next < 0 || next >= visiblePhotos.length) return;
    setOpenIndex(next);
    setZoomed(false);
  };
  const toggleZoom = (e: MouseEvent<HTMLImageElement>) => {
    if (!zoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin(`${x}% ${y}%`);
    }
    setZoomed((z) => !z);
  };

  const pressDigit = (d: string) => {
    const next = (pin + d).slice(0, caseData.vaultCode.length);
    setPin(next);
    if (next.length === caseData.vaultCode.length) {
      if (next === caseData.vaultCode) {
        setUnlocked(true);
        setShowVaultPad(false);
        setPin("");
      } else {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin("");
        }, 400);
      }
    }
  };

  return (
    <AppScreen
      title="Photos"
      onBack={showVaultPad ? () => setShowVaultPad(false) : onBack}
      theme="light"
    >
      <div className={styles.grid}>
        {visiblePhotos.map((p, i) => {
          const isHot = hintTargetId !== undefined && p.caption === hintTargetId;
          return (
            <button
              key={i}
              type="button"
              className={`${styles.photoBtn} ${isHot ? styles.hintThumb : ""}`}
              onClick={() => {
                if (isHot) onFoundClue?.();
                setOpenIndex(i);
              }}
            >
              <img className={styles.photo} src={p.src} alt="" />
              {isHot && <span className={styles.hintHand}>👆</span>}
            </button>
          );
        })}
        {hasLockedSecrets && (
          <button
            type="button"
            className={styles.locked}
            data-hint="photos-vault"
            onClick={() => setShowVaultPad(true)}
          >
            🔒
          </button>
        )}
      </div>

      {showVaultPad && (
        <div className={styles.backdrop} onClick={() => setShowVaultPad(false)}>
          <div className={`${styles.pad} ${shake ? styles.nudge : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dots}>
              {Array.from({ length: caseData.vaultCode.length }).map((_, i) => (
                <span key={i} className={i < pin.length ? styles.dotFilled : styles.dot} />
              ))}
            </div>
            <div className={styles.keys}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((k, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.key}
                  disabled={k === ""}
                  onClick={() => (k === "⌫" ? setPin(pin.slice(0, -1)) : pressDigit(k))}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openPhoto && (
        <div className={styles.viewer}>
          <div className={styles.viewerTop}>
            <button type="button" className={styles.viewerClose} onClick={closeViewer} aria-label="Close">
              ✕
            </button>
            <span className={styles.viewerCount}>
              {openIndex! + 1}/{visiblePhotos.length}
            </span>
          </div>
          <div className={styles.viewerStage}>
            {openIndex! > 0 && (
              <button type="button" className={styles.viewerPrev} onClick={() => step(-1)} aria-label="Previous">
                ‹
              </button>
            )}
            <img
              className={`${styles.viewerImg} ${zoomed ? styles.viewerImgZoomed : ""}`}
              style={zoomed ? { transformOrigin: zoomOrigin } : undefined}
              src={openPhoto.src}
              alt=""
              onClick={toggleZoom}
            />
            {openIndex! < visiblePhotos.length - 1 && (
              <button type="button" className={styles.viewerNext} onClick={() => step(1)} aria-label="Next">
                ›
              </button>
            )}
            {/* Ảnh thường (stock) không tự chứa được chữ/số thật của case —
                caption đè lên đúng chỗ, không ăn theo transform zoom của ảnh
                nên luôn đọc rõ dù đang phóng to hay không. */}
            {openPhoto.caption && <span className={styles.viewerCaption}>{openPhoto.caption}</span>}
          </div>
          <span className={styles.viewerHint}>{zoomed ? "Tap to zoom out" : "Tap photo to zoom in"}</span>
        </div>
      )}
    </AppScreen>
  );
}
