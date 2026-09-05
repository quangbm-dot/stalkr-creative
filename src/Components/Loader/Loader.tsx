import { useEffect } from "react";
import appIcon from "../../Assets/UI/app-icon.webp";
import styles from "./Loader.module.scss";

interface LoaderProps {
  onDone: () => void;
  durationMs?: number;
}

export default function Loader({ onDone, durationMs = 1000 }: LoaderProps) {
  useEffect(() => {
    const id = setTimeout(onDone, durationMs);
    return () => clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <div className={styles.loader}>
      <img className={styles.icon} src={appIcon} alt="Stalkr" />
      <span className={styles.brand}>Stalkr</span>
      <div className={styles.dots}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
