import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Photos.module.scss";

interface PhotosProps {
  caseData: CaseConfig;
  onBack: () => void;
  /** id ảnh chứa manh mối (PhotoEntry.id) — thumbnail đó sáng lên; chạm vào để xem to thì báo tìm thấy. */
  hintTargetId?: string;
  onFoundClue?: () => void;
}

// Vault đã mở thì giữ mở suốt phiên chơi — biến module-level (không phải
// useState) vì component này UNMOUNT mỗi lần rời app rồi quay lại (đổi
// `openApp` ở App.tsx), bắt nhập lại PIN mỗi lần là bug, không phải chủ ý.
let vaultUnlockedThisSession = false;

export default function Photos({ caseData, onBack, hintTargetId, onFoundClue }: PhotosProps) {
  const [unlocked, setUnlockedState] = useState(vaultUnlockedThisSession);
  const setUnlocked = (v: boolean) => {
    vaultUnlockedThisSession = v;
    setUnlockedState(v);
  };
  const [pin, setPin] = useState("");
  const [showVaultPad, setShowVaultPad] = useState(false);
  const [shake, setShake] = useState(false);
  // v13: "grid" = lưới ảnh thường; "hidden" = đang xem bên trong album Hidden.
  const [view, setView] = useState<"grid" | "hidden">("grid");
  // v13: ảnh đang xem to — index trong danh sách đang hiện (regularPhotos hoặc secretPhotos).
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const regularPhotos = caseData.photos.filter((p) => !p.secret);
  const secretPhotos = caseData.photos.filter((p) => p.secret);
  const hasSecrets = secretPhotos.length > 0;
  const active = view === "hidden" ? secretPhotos : regularPhotos;

  const pressDigit = (d: string) => {
    const next = (pin + d).slice(0, caseData.vaultCode.length);
    setPin(next);
    if (next.length === caseData.vaultCode.length) {
      if (next === caseData.vaultCode) {
        setUnlocked(true);
        setShowVaultPad(false);
        setPin("");
        setView("hidden");
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
      title={view === "hidden" ? "Hidden" : "Photos"}
      onBack={showVaultPad ? () => setShowVaultPad(false) : view === "hidden" ? () => setView("grid") : onBack}
      theme="light"
    >
      <div className={styles.grid}>
        {active.map((p, i) => {
          const isHot = hintTargetId !== undefined && p.id === hintTargetId;
          return (
            <button
              key={i}
              type="button"
              className={`${styles.cell} ${isHot ? styles.pointCell : ""}`}
              data-hint={isHot ? "row-clue" : undefined}
              onClick={() => {
                if (isHot) onFoundClue?.();
                setViewIndex(i);
              }}
            >
              <img className={styles.photo} src={p.src} alt="" />
              {isHot && <span className={styles.pointHand}>👆</span>}
            </button>
          );
        })}
      </div>

      {view === "grid" && hasSecrets && (
        <div className={styles.albumsSection}>
          <div className={styles.albumsLabel}>Albums</div>
          <button
            type="button"
            className={styles.albumTile}
            data-hint="photos-vault"
            onClick={() => (unlocked ? setView("hidden") : setShowVaultPad(true))}
          >
            <span className={styles.albumThumbWrap}>
              <img
                className={styles.albumThumb}
                src={secretPhotos[0].src}
                alt=""
                style={{ filter: unlocked ? "none" : "blur(16px)" }}
              />
              <span className={styles.albumLockBadge}>{unlocked ? "🔓" : "🔒"}</span>
            </span>
            <span className={styles.albumName}>Hidden</span>
            <span className={styles.albumCount}>{secretPhotos.length} Photo{secretPhotos.length === 1 ? "" : "s"}</span>
          </button>
        </div>
      )}

      {showVaultPad && (
        <div className={styles.lockScreen}>
          <button type="button" className={styles.lockCancel} onClick={() => setShowVaultPad(false)}>
            Cancel
          </button>
          <div className={styles.lockIcon}>🔒</div>
          <div className={styles.lockTitle}>Enter Passcode</div>
          <div className={`${styles.dots} ${shake ? styles.nudge : ""}`}>
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
      )}
      {viewIndex !== null && active[viewIndex] && (
        <div className={styles.viewer}>
          <div className={styles.viewerTop}>
            <button type="button" className={styles.viewerClose} onClick={() => setViewIndex(null)}>
              ‹ {view === "hidden" ? "Hidden" : "Photos"}
            </button>
          </div>
          <div className={styles.viewerImgWrap}>
            <img className={styles.viewerImg} src={active[viewIndex].src} alt="" />
          </div>
          <div className={styles.info}>
            <div className={styles.infoDate}>{active[viewIndex].date ?? "Recently added"}</div>
            {active[viewIndex].caption && (
              <div className={styles.infoPlace}>
                <span className={styles.infoPin}>📍</span>
                {active[viewIndex].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </AppScreen>
  );
}
