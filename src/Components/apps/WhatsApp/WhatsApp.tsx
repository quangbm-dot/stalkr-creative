import { useEffect, useRef, useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./WhatsApp.module.scss";

interface WhatsAppProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  hintMessageId?: string;
  onFoundClue?: () => void;
  unlockOnList?: boolean;
}

export default function WhatsApp({ caseData, onBack, hintTargetId, hintMessageId, onFoundClue, unlockOnList }: WhatsAppProps) {
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const openThread = caseData.whatsapp.find((t) => t.id === openThreadId);
  const hotId = hintTargetId === undefined ? undefined : caseData.whatsapp.find((t) => t.title === hintTargetId)?.id;
  // Cùng app với câu trước: về danh sách chính là tính đã tìm thấy.
  useEffect(() => {
    if (unlockOnList && !openThreadId) onFoundClue?.();
  }, [unlockOnList, openThreadId, onFoundClue]);

  const hotMsgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (openThread) hotMsgRef.current?.scrollIntoView({ block: "center" });
  }, [openThread]);

  const hotMsgIdx = hintMessageId
    ? (openThread?.msgs.findIndex((m) => m.text.toLowerCase().includes(hintMessageId.toLowerCase())) ?? -1)
    : -1;

  if (openThread) {
    return (
      <AppScreen title={openThread.title} onBack={() => setOpenThreadId(null)} theme="light">
        <div className={styles.chatBg}>
          {openThread.msgs.map((m, i) => {
            const isHotMsg = i === hotMsgIdx;
            return (
              <div
                key={i}
                ref={isHotMsg ? hotMsgRef : undefined}
                className={`${m.me ? styles.bubbleMe : styles.bubbleThem} ${isHotMsg ? styles.bubbleHot : ""}`}
              >
                {m.text}
              </div>
            );
          })}
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="WhatsApp" onBack={onBack} theme="light">
      <div className={styles.chips}>
        <span className={styles.chipActive}>All</span>
        <span className={styles.chip}>Unread</span>
        <span className={styles.chip}>Groups</span>
      </div>
      <div className={styles.list}>
        {caseData.whatsapp.map((t) => {
          const isHot = t.id === hotId;
          return (
          <button
            key={t.id}
            type="button"
            className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
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
            {isHot && <span className={styles.hintHand}>👆</span>}
          </button>
          );
        })}
      </div>
    </AppScreen>
  );
}
