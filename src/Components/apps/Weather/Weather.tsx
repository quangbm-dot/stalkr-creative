import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Weather.module.scss";

interface WeatherProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Weather({ caseData, onBack }: WeatherProps) {
  const { city, tempC, hi, lo, condition } = caseData.weather;

  return (
    <AppScreen title="Weather" onBack={onBack} bodyPadding>
      <div className={styles.card}>
        <div className={styles.city}>{city}</div>
        <div className={styles.condition}>{condition}</div>
        <div className={styles.temp}>{tempC}°</div>
        <div className={styles.range}>
          H:{hi}° L:{lo}°
        </div>
      </div>
    </AppScreen>
  );
}
