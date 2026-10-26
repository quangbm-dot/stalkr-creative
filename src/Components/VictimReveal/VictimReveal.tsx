import { useEffect, useRef, useState } from "react";
import type { VictimRef } from "../../types/case";
import styles from "./VictimReveal.module.scss";

interface VictimRevealProps {
  victim: VictimRef;
  /** index ô đích trong khay (id `victim-slot-<i>`) */
  slotIndex: number;
  onFlown: () => void;
}

const APPEAR_MS = 320;
const SHAKE_AT = 360; // ổ khoá rung lên (đang bị mở)
const UNLOCK_AT = 640; // 🔒 → 🔓 bật mở
const FLIP_AT = 880; // rồi thẻ mới lật để lộ mặt
const FLIP_MS = 600;
const FLY_AT = FLIP_AT + FLIP_MS + 1100; // giữ mặt rõ nét > 1s rồi mới bay
const FLY_MS = 450;

/**
 * v13: sau mỗi câu đúng — thẻ cô gái (blur + 🔒) hiện ra → ổ khoá rung rồi MỞ (🔓) → thẻ xoay
 * 180° lộ mặt rõ nét kèm tên → thu nhỏ bay vào ô tương ứng của khay thu thập ở TopBar.
 * Toàn bộ xong trong ~3.3s (trước khi game tự sang câu kế sau 3.6s).
 */
export default function VictimReveal({ victim, slotIndex, onFlown }: VictimRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shaking, setShaking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    const root = rootRef.current;
    if (!card || !root) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const anims: Animation[] = [];

    anims.push(
      card.animate(
        [
          { opacity: 0, transform: "translate(0, 28px) scale(0.55)" },
          { opacity: 1, transform: "translate(0, 0) scale(1)" },
        ],
        { duration: APPEAR_MS, easing: "cubic-bezier(0.2, 1.3, 0.4, 1)", fill: "forwards" },
      ),
    );
    timers.push(setTimeout(() => setShaking(true), SHAKE_AT));
    timers.push(setTimeout(() => setUnlocked(true), UNLOCK_AT));
    timers.push(setTimeout(() => setFlipped(true), FLIP_AT));
    timers.push(setTimeout(() => setFlash(true), FLIP_AT + FLIP_MS * 0.5)); // lóe sáng đúng lúc thẻ úp ngang
    timers.push(
      setTimeout(() => {
        const slot = document.getElementById(`victim-slot-${slotIndex}`);
        if (!slot) {
          onFlown();
          return;
        }
        // Overlay nằm trong khung điện thoại đã scale — đổi độ lệch từ px màn hình sang px logic.
        const k = root.getBoundingClientRect().width / root.offsetWidth || 1;
        const c = card.getBoundingClientRect();
        const s = slot.getBoundingClientRect();
        const dx = (s.left + s.width / 2 - (c.left + c.width / 2)) / k;
        const dy = (s.top + s.height / 2 - (c.top + c.height / 2)) / k;
        const sc = s.width / c.width;
        const fly = card.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(${sc})`, opacity: 0.85 },
          ],
          { duration: FLY_MS, easing: "cubic-bezier(0.5, 0, 0.8, 0.4)", fill: "forwards" },
        );
        anims.push(fly);
        fly.onfinish = () => onFlown();
      }, FLY_AT),
    );
    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <div ref={cardRef} className={styles.card}>
        <div className={`${styles.inner} ${flipped ? styles.flipped : ""}`}>
          <div className={`${styles.face} ${styles.front}`}>
            <img src={victim.blurAvatar ?? victim.avatar} alt="" />
            <span
              className={`${styles.lock} ${shaking && !unlocked ? styles.shake : ""} ${unlocked ? styles.opened : ""}`}
            >
              {unlocked ? "🔓" : "🔒"}
            </span>
            {unlocked && <span className={styles.ring} />}
          </div>
          <div className={`${styles.face} ${styles.back}`}>
            <img src={victim.avatar} alt="" />
            <span className={styles.name}>{victim.name}</span>
          </div>
        </div>
        {flash && <span className={styles.flash} />}
      </div>
    </div>
  );
}
