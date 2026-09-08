import { useEffect, useState } from "react";
import type { CaseConfig } from "../../types/case";
import styles from "./LockScene.module.scss";

interface LockSceneProps {
  caseData: CaseConfig;
  onDone: () => void;
}

type Phase = "locked" | "notif" | "photo" | "sharing" | "sent" | "typing" | "replied";

const SHARE_TARGETS = ["Mom", "Alex", "Work", "❤️"];

/**
 * v6 opener: màn khoá máy nhận tin ảnh nhạy cảm từ 1 số lạ, chủ điện thoại
 * bấm share nhưng tay trượt gửi nhầm đúng đoạn chat người yêu — người yêu
 * nhắn lại nghi ngờ, rồi chuyển sang EndCard (2 lựa chọn trả lời).
 */
export default function LockScene({ caseData, onDone }: LockSceneProps) {
  const [phase, setPhase] = useState<Phase>("locked");
  const { mishap } = caseData;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    at(900, () => setPhase("notif"));
    at(2500, () => setPhase("photo"));
    at(4300, () => setPhase("sharing"));
    at(6100, () => setPhase("sent"));
    at(7000, () => setPhase("typing"));
    at(8000, () => setPhase("replied"));
    at(10200, onDone);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseAtLeast = (p: Phase) => {
    const order: Phase[] = ["locked", "notif", "photo", "sharing", "sent", "typing", "replied"];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  return (
    <div className={styles.stage}>
      <img className={styles.wallpaper} src={caseData.homeWallpaper} alt="" />
      <div className={styles.scrim} />

      {!phaseAtLeast("sharing") && (
        <div className={styles.clock}>
          <span className={styles.time}>{time}</span>
          <span className={styles.date}>{date}</span>
        </div>
      )}

      {phaseAtLeast("notif") && !phaseAtLeast("photo") && (
        <div className={styles.notif}>
          <span className={styles.notifDot} />
          <div className={styles.notifBody}>
            <div className={styles.notifHead}>
              <span className={styles.notifSender}>{mishap.senderName}</span>
              <span className={styles.notifTime}>now</span>
            </div>
            <div className={styles.notifText}>sent a photo</div>
          </div>
        </div>
      )}

      {phaseAtLeast("photo") && !phaseAtLeast("sent") && (
        <div className={`${styles.photoCard} ${phaseAtLeast("sharing") ? styles.photoShrink : ""}`}>
          <img className={styles.photoImg} src={mishap.photo} alt="" />
          <div className={styles.photoLabel}>{mishap.senderName}</div>
        </div>
      )}

      {phase === "sharing" && (
        <div className={styles.shareSheet}>
          <div className={styles.shareHandle} />
          <div className={styles.shareTitle}>Share</div>
          <div className={styles.shareRow}>
            {SHARE_TARGETS.map((t, i) => (
              <div key={t} className={`${styles.shareTarget} ${i === 3 ? styles.shareTargetHit : ""}`}>
                <span className={styles.shareCircle}>{t === "❤️" ? "❤️" : t[0]}</span>
                <span className={styles.shareName}>{t === "❤️" ? mishap.girlfriendName : t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phaseAtLeast("sent") && (
        <div className={styles.chatWrap}>
          <div className={styles.chatHeader}>
            <span className={styles.chatAvatar}>❤️</span>
            <span className={styles.chatName}>{mishap.girlfriendName}</span>
          </div>
          <div className={styles.chatLog}>
            <div className={`${styles.bubbleMe} ${styles.on}`}>
              <img className={styles.bubblePhoto} src={mishap.photo} alt="" />
            </div>
            {phase === "typing" && (
              <div className={`${styles.bubbleThem} ${styles.on}`}>
                <span className={styles.dots}>
                  <i /><i /><i />
                </span>
              </div>
            )}
            {phaseAtLeast("replied") && (
              <div className={`${styles.bubbleThem} ${styles.on}`}>{mishap.replyText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
