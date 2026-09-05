import AppScreen from "../../PhoneFrame/AppScreen";
import mapBg from "../../../Assets/UI/maps-bg.jpg";
import styles from "./Maps.module.scss";

interface MapsProps {
  onBack: () => void;
}

export default function Maps({ onBack }: MapsProps) {
  return (
    <AppScreen title="Maps" onBack={onBack} theme="light">
      <img className={styles.map} src={mapBg} alt="" />
    </AppScreen>
  );
}
