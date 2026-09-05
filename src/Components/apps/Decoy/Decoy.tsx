import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Decoy.module.scss";

interface DecoyProps {
  title: string;
  onBack: () => void;
}

export default function Decoy({ title, onBack }: DecoyProps) {
  return (
    <AppScreen title={title} onBack={onBack}>
      <div className={styles.placeholder}>Coming soon</div>
    </AppScreen>
  );
}
