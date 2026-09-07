import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Airbnb.module.scss";

interface AirbnbProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Airbnb({ caseData, onBack }: AirbnbProps) {
  const { name, listings } = caseData.airbnb;

  return (
    <AppScreen title="Airbnb" onBack={onBack} theme="light">
      <div className={styles.search}>🔍 {name}</div>
      <div className={styles.feed}>
        {listings.map((l, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.imageWrap}>
              <img className={styles.image} src={l.img} alt={l.title} />
              <span className={styles.heart}>♡</span>
            </div>
            <div className={styles.row}>
              <span className={styles.title}>{l.title}</span>
              {l.rating && <span className={styles.rating}>★ {l.rating}</span>}
            </div>
            {l.subtitle && <div className={styles.subtitle}>{l.subtitle}</div>}
            {l.price && <div className={styles.price}>{l.price}</div>}
          </div>
        ))}
      </div>
    </AppScreen>
  );
}
