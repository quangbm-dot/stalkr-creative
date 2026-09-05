import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Compass.module.scss";

interface CompassProps {
  onBack: () => void;
}

export default function Compass({ onBack }: CompassProps) {
  return (
    <AppScreen title="Compass" onBack={onBack} bodyPadding>
      <div className={styles.wrap}>
        <div className={styles.dial}>
          <span className={styles.n}>N</span>
          <span className={styles.needle} />
        </div>
        <div className={styles.reading}>27°</div>
        <div className={styles.coords}>48.8566° N, 2.3522° E</div>
        <div className={styles.city}>Paris, France</div>
      </div>
    </AppScreen>
  );
}
