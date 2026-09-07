import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import mapBg from "../../../Assets/UI/maps-bg.jpg";
import styles from "./Maps.module.scss";

interface MapsProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Maps({ caseData, onBack }: MapsProps) {
  return (
    <AppScreen title="Maps" onBack={onBack} theme="light">
      <img className={styles.map} src={mapBg} alt="" />
      <div className={styles.sectionLabel}>Frequent places</div>
      <div className={styles.list}>
        {caseData.maps.locations.map((loc, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.pin}>📍</span>
            <span className={styles.text}>
              <span className={styles.name}>{loc.name}</span>
              {loc.subtitle && <span className={styles.subtitle}>{loc.subtitle}</span>}
            </span>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
