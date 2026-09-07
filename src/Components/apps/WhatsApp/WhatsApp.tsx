import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./WhatsApp.module.scss";

interface WhatsAppProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function WhatsApp({ caseData, onBack }: WhatsAppProps) {
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const openThread = caseData.whatsapp.find((t) => t.id === openThreadId);

  if (openThread) {
    return (
      <AppScreen title={openThread.title} onBack={() => setOpenThreadId(null)} theme="light">
        <div className={styles.chatBg}>
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
    <AppScreen title="WhatsApp" onBack={onBack} theme="light">
      <div className={styles.chips}>
        <span className={styles.chipActive}>All</span>
        <span className={styles.chip}>Unread</span>
        <span className={styles.chip}>Groups</span>
      </div>
      <div className={styles.list}>
        {caseData.whatsapp.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.row}
            onClick={() => setOpenThreadId(t.id)}
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
          </button>
        ))}
      </div>
    </AppScreen>
  );
}
