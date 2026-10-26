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

export default function Photos({ caseData, onBack, hintTargetId, onFoundClue }: PhotosProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [showVaultPad, setShowVaultPad] = useState(false);
  const [shake, setShake] = useState(false);
  // v13: ảnh đang xem to (index trong caseData.photos)
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const hasLockedSecrets = caseData.photos.some((p) => p.secret) && !unlocked;

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
        {caseData.photos.map((p, i) => {
          if (p.secret && !unlocked) return null;
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
      {viewIndex !== null && (
        <div className={styles.viewer}>
          <div className={styles.viewerTop}>
            <button type="button" className={styles.viewerClose} onClick={() => setViewIndex(null)}>
              ‹ Photos
            </button>
          </div>
          <div className={styles.viewerImgWrap}>
            <img className={styles.viewerImg} src={caseData.photos[viewIndex].src} alt="" />
          </div>
          <div className={styles.info}>
            <div className={styles.infoDate}>{caseData.photos[viewIndex].date ?? "Recently added"}</div>
            {caseData.photos[viewIndex].caption && (
              <div className={styles.infoPlace}>
                <span className={styles.infoPin}>📍</span>
                {caseData.photos[viewIndex].caption}
              </div>
            )}
          </div>
        </div>
      )}
    </AppScreen>
  );
}
