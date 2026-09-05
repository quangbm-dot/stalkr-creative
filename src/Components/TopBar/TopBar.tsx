import openLinkApp from "../../services/AdController";
import downloadBtn from "../../Assets/UI/download.webp";
import styles from "./TopBar.module.scss";

interface TopBarProps {
  ownerFirst: string;
  current: number;
  total: number;
}

export default function TopBar({ ownerFirst, current, total }: TopBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.subtitle}>Fake phone of {ownerFirst}</span>
      <div className={styles.right}>
        <button type="button" className={styles.download} onClick={openLinkApp}>
          <img src={downloadBtn} alt="Download" />
        </button>
        <span className={styles.progress}>
          Question {current}/{total}
        </span>
      </div>
    </div>
  );
}
