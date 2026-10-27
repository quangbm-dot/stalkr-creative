import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import mapBg from "../../../Assets/UI/maps-bg.jpg";
import styles from "./Maps.module.scss";

interface MapsProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

export default function Maps({ caseData, onBack, hintTargetId, onFoundClue }: MapsProps) {
  const hotIdx = hintTargetId === undefined ? -1 : caseData.maps.locations.findIndex((l) => l.name === hintTargetId);
  // v13: điểm có ảnh gắn kèm — chạm dòng mới xem to (không hiện sẵn ngoài danh sách, tránh lộ mặt trước khi tìm ra).
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);
  const viewing = viewingIdx !== null ? caseData.maps.locations[viewingIdx] : null;

  if (viewing) {
    return (
      <AppScreen title={viewing.name} onBack={() => setViewingIdx(null)} theme="light" bodyPadding>
        <div className={styles.photoWrap}>
          <img className={styles.photo} src={viewing.photo} alt="" />
          <span className={styles.pinBadge}>📍</span>
        </div>
        <div className={styles.photoCaption}>
          <span className={styles.name}>{viewing.name}</span>
          {viewing.subtitle && <span className={styles.subtitle}>{viewing.subtitle}</span>}
          {viewing.coords && <span className={styles.coords}>{viewing.coords}</span>}
          {viewing.personLine && <span className={styles.personLine}>{viewing.personLine}</span>}
          {viewing.photoCaption && <span className={styles.photoNote}>{viewing.photoCaption}</span>}
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Maps" onBack={onBack} theme="light">
      <img className={styles.map} src={mapBg} alt="" />
      <div className={styles.sectionLabel}>{caseData.maps.sectionLabel ?? "Frequent places"}</div>
      <div className={styles.list}>
        {caseData.maps.locations.map((loc, i) => {
          const isHot = i === hotIdx;
          return (
          <div
            key={i}
            className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
            data-hint={isHot ? "row-clue" : undefined}
            onClick={() => {
              if (isHot) onFoundClue?.();
              if (loc.photo) setViewingIdx(i);
            }}
          >
            <span className={styles.pin}>📍</span>
            <span className={styles.text}>
              <span className={styles.name}>{loc.name}</span>
              {loc.subtitle && <span className={styles.subtitle}>{loc.subtitle}</span>}
            </span>
            {loc.photo && (
              <span className={styles.thumbWrap}>
                <img className={styles.thumb} src={loc.photo} alt="" />
                <span className={styles.thumbPin}>📍</span>
              </span>
            )}
            {isHot && <span className={styles.hintHand}>👆</span>}
          </div>
          );
        })}
      </div>
    </AppScreen>
  );
}
