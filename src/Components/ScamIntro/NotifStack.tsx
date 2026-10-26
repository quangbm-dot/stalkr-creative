import { useEffect, useRef } from "react";
import type { CaseConfig } from "../../types/case";
import styles from "./NotifStack.module.scss";

interface NotifStackProps {
  caseData: CaseConfig;
  onDone: () => void;
}

const START_MS = 500;
const STEP_MS = 850;
const HOLD_AFTER_MS = 1600;
const TIMES = ["now", "1m ago", "2m ago", "3m ago", "4m ago"];

function redactName(name: string) {
  return name[0] + "•".repeat(Math.max(name.length - 1, 3));
}

function formatClock() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * v13 intro — màn 1: người chơi vừa cầm điện thoại Daniel lên, màn hình còn
 * khoá — 5 banner noti tin nhắn (1 cho mỗi cô gái) đổ xuống nối tiếp, avatar
 * mờ sẵn + tên bị che + 1 câu preview (không lộ đáp án). Bấm vào đâu cũng bỏ
 * qua được luôn, không bắt buộc chờ hết.
 */
export default function NotifStack({ caseData, onDone }: NotifStackProps) {
  const victims = caseData.endCard.victims ?? [];
  const msgIcon = caseData.home.dock.find((i) => i.app === "messages")?.icon;

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const lastAt = START_MS + STEP_MS * Math.max(victims.length - 1, 0);
    const t = setTimeout(() => onDoneRef.current(), lastAt + HOLD_AFTER_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.lock} onClick={() => onDoneRef.current()}>
      <div className={styles.wallpaper} style={{ backgroundImage: `url(${caseData.wallpaper})` }} />
      <div className={styles.clock}>{formatClock()}</div>
      <div className={styles.date}>Locked — new messages</div>

      <div className={styles.stack}>
        {victims.map((v, i) => (
          <div key={v.name} className={styles.banner} style={{ animationDelay: `${START_MS + i * STEP_MS}ms` }}>
            <div className={styles.avatarWrap}>
              <img className={styles.avatar} src={v.blurAvatar ?? v.avatar} alt="" />
              {msgIcon && <img className={styles.badge} src={msgIcon} alt="" />}
            </div>
            <div className={styles.body}>
              <div className={styles.row1}>
                <span className={styles.sender}>{redactName(v.name)}</span>
                <span className={styles.time}>{TIMES[i % TIMES.length]}</span>
              </div>
              <div className={styles.preview}>{v.notifPreview ?? v.line}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
