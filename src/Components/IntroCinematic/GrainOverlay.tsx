import styles from "./GrainOverlay.module.scss";
import grain from "./img/grain.webp";

export default function GrainOverlay({ opacity = 0.16 }: { opacity?: number }) {
  return <div className={styles.grain} style={{ backgroundImage: `url(${grain})`, opacity }} />;
}
