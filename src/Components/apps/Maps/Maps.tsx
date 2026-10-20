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
            onClick={() => isHot && onFoundClue?.()}
          >
            <span className={styles.pin}>📍</span>
            <span className={styles.text}>
              <span className={styles.name}>{loc.name}</span>
              {loc.subtitle && <span className={styles.subtitle}>{loc.subtitle}</span>}
            </span>
            {isHot && <span className={styles.hintHand}>👆</span>}
          </div>
          );
        })}
      </div>
    </AppScreen>
  );
}
