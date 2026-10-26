import type { VictimRef } from "../../types/case";
import styles from "./VictimTray.module.scss";

interface VictimTrayProps {
  slots: number;
  collected: VictimRef[];
}

/**
 * v13: khay thu thập — mỗi cô gái đã "cứu" được bay vào 1 ô (mặt rõ nét), các ô còn
 * lại là chỗ trống; bên cạnh là bộ đếm x/5. Id `victim-slot-<i>` là đích bay của VictimReveal.
 */
export default function VictimTray({ slots, collected }: VictimTrayProps) {
  return (
    <div className={styles.tray}>
      <div className={styles.slots}>
        {Array.from({ length: slots }).map((_, i) => {
          const v = collected[i];
          return (
            <span key={i} id={`victim-slot-${i}`} className={`${styles.slot} ${v ? styles.filled : ""}`}>
              {v ? <img src={v.avatar} alt="" /> : <b>?</b>}
            </span>
          );
        })}
      </div>
      <span key={collected.length} className={styles.count}>
        {collected.length}/{slots}
      </span>
    </div>
  );
}
