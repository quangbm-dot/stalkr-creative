import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Chrome.module.scss";

interface ChromeProps {
  onBack: () => void;
}

export default function Chrome({ onBack }: ChromeProps) {
  return (
    <AppScreen title="Browser" onBack={onBack} theme="light" bodyPadding>
      <div className={styles.addressBar}>🔒 google.com</div>
      <div className={styles.empty}>No recent tabs</div>
    </AppScreen>
  );
}
