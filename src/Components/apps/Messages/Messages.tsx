import { useEffect, useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Messages.module.scss";

interface MessagesProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
  unlockOnList?: boolean;
}

export default function Messages({ caseData, onBack, hintTargetId, onFoundClue, unlockOnList }: MessagesProps) {
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const openThread = caseData.messages.find((t) => t.id === openThreadId);
  const hotId = hintTargetId === undefined ? undefined : caseData.messages.find((t) => t.title === hintTargetId)?.id;
  // Cùng app với câu trước: về danh sách chính là tính đã tìm thấy.
  useEffect(() => {
    if (unlockOnList && !openThreadId) onFoundClue?.();
  }, [unlockOnList, openThreadId, onFoundClue]);

  if (openThread) {
    return (
      <AppScreen title={openThread.title} onBack={() => setOpenThreadId(null)}>
        <div className={styles.thread}>
          {openThread.msgs.map((m, i) => (
            <div key={i} className={m.me ? styles.bubbleMe : styles.bubbleThem}>
              {m.text}
            </div>
          ))}
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Messages" onBack={onBack}>
      <div className={styles.list}>
        {caseData.messages.map((t) => {
          const isHot = t.id === hotId;
          return (
            <button
              key={t.id}
              type="button"
              className={`${styles.convrow} ${isHot ? styles.hintRow : ""}`}
              data-hint={isHot ? "row-clue" : undefined}
              onClick={() => {
                if (isHot) onFoundClue?.();
                setOpenThreadId(t.id);
              }}
            >
              {t.avatar ? (
                <img className={styles.avatarImg} src={t.avatar} alt={t.title} />
              ) : (
                <div className={styles.avatar}>{t.title.charAt(0)}</div>
              )}
              <div className={styles.meta}>
                <div className={styles.top}>
                  <span className={styles.name}>{t.title}</span>
                  <span className={styles.time}>{t.time}</span>
                </div>
                <div className={styles.preview}>{t.msgs[t.msgs.length - 1]?.text}</div>
              </div>
              {t.unread && <span className={styles.dot} />}
              {isHot && <span className={styles.hintHand}>👆</span>}
            </button>
          );
        })}
      </div>
    </AppScreen>
  );
}
