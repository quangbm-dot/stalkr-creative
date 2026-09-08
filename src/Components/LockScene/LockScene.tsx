import { useEffect, useState } from "react";
import type { CaseConfig } from "../../types/case";
import { iconChat } from "../../Assets/UI/chatIcon";
import styles from "./LockScene.module.scss";

interface LockSceneProps {
  caseData: CaseConfig;
  onDone: () => void;
}

type Phase = "locked" | "notif" | "unlocking" | "chatN" | "sharing" | "sentHoney" | "typing" | "replied";

/**
 * v6 opener: khoá máy nhận tin nhắn ảnh từ 1 số lạ → mở khoá → xem
 * ảnh ngay trong đoạn chat với cô ấy → bấm share định gửi cho "Bro" nhưng
 * tay trượt chọn nhầm người yêu → người yêu nhắn lại nghi ngờ → EndCard.
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

    at(800, () => setPhase("notif"));
    at(2600, () => setPhase("unlocking"));
    at(3200, () => setPhase("chatN"));
    at(5200, () => setPhase("sharing"));
    at(7200, () => setPhase("sentHoney"));
    at(7700, () => setPhase("typing"));
    at(8700, () => setPhase("replied"));
    at(10900, onDone);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseAtLeast = (p: Phase) => {
    const order: Phase[] = ["locked", "notif", "unlocking", "chatN", "sharing", "sentHoney", "typing", "replied"];
    return order.indexOf(phase) >= order.indexOf(p);
  };
  const isLocked = !phaseAtLeast("unlocking");

  return (
    <div className={styles.stage}>
      {isLocked && (
        <div className={styles.lockLayer}>
          <img className={styles.wallpaper} src={caseData.homeWallpaper} alt="" />
          <div className={styles.scrim} />

          <div className={styles.clock}>
            <span className={styles.time}>{time}</span>
            <span className={styles.date}>{date}</span>
          </div>

          {phase === "notif" && (
            <div className={styles.notif}>
              <img className={styles.notifIcon} src={iconChat} alt="" />
              <div className={styles.notifBody}>
                <div className={styles.notifHead}>
                  <span className={styles.notifSender}>{mishap.senderName}</span>
                  <span className={styles.notifTime}>now</span>
                </div>
                <div className={styles.notifText}>sent a photo</div>
              </div>
              <img className={styles.notifThumb} src={mishap.photo} alt="" />
            </div>
          )}
        </div>
      )}

      {phaseAtLeast("unlocking") && (
        <div className={`${styles.chatWrap} ${phase === "unlocking" ? styles.chatWrapIn : ""}`}>
          {!phaseAtLeast("sentHoney") ? (
            <>
              <div className={styles.chatHeader}>
                <span className={styles.chatAvatar}>{mishap.senderName[0]}</span>
                <span className={styles.chatName}>{mishap.senderName}</span>
              </div>
              <div className={styles.chatLog}>
                <div className={`${styles.bubbleThem} ${styles.on} ${styles.bubblePhotoWrap}`}>
                  <img className={styles.bubblePhoto} src={mishap.photo} alt="" />
                  {phaseAtLeast("chatN") && (
                    <span className={`${styles.shareBtn} ${phaseAtLeast("sharing") ? styles.shareBtnHit : ""}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                        <path d="M16 6l-4-4-4 4" />
                        <path d="M12 2v14" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {phase === "sharing" && (
                <div className={styles.shareSheet}>
                  <div className={styles.shareHandle} />
                  <div className={styles.shareTitle}>Share</div>
                  <div className={styles.shareRow}>
                    <div className={`${styles.shareTarget} ${styles.shareTargetNear}`}>
                      <span className={styles.shareCircle}>{mishap.intendedName[0]}</span>
                      <span className={styles.shareName}>{mishap.intendedName}</span>
                    </div>
                    <div className={styles.shareTarget}>
                      <span className={styles.shareCircle}>M</span>
                      <span className={styles.shareName}>Mom</span>
                    </div>
                    <div className={`${styles.shareTarget} ${styles.shareTargetHit}`}>
                      <span className={styles.shareCircle}>❤️</span>
                      <span className={styles.shareName}>{mishap.girlfriendName}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
