import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Gmail.module.scss";

interface GmailProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Gmail({ caseData, onBack }: GmailProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const entry = openIndex !== null ? caseData.gmail[openIndex] : null;
  const hasSent = caseData.gmail.some((g) => g.folder === "sent");
  const rows = caseData.gmail
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => (g.folder ?? "inbox") === folder);

  if (entry) {
    return (
      <AppScreen title={entry.sender} onBack={() => setOpenIndex(null)} theme="light" bodyPadding>
        <h2 className={styles.detailSubject}>{entry.subject}</h2>
        {entry.time && <div className={styles.detailTime}>{entry.time}</div>}
        <p className={styles.detailBody}>{entry.body ?? entry.preview}</p>
        {entry.attachment && <img className={styles.attachment} src={entry.attachment} alt="" />}
      </AppScreen>
    );
  }

  return (
    <AppScreen title={folder === "sent" ? "Sent" : "Inbox"} onBack={onBack} theme="light">
      {hasSent && (
        <div className={styles.tabs}>
          {(["inbox", "sent"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={folder === f ? styles.tabActive : styles.tab}
              onClick={() => setFolder(f)}
            >
              {f === "inbox" ? "Inbox" : "Sent"}
            </button>
          ))}
        </div>
      )}
      {rows.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <span className={styles.emptyText}>No mail</span>
        </div>
      ) : (
        <div className={styles.list}>
          {rows.map(({ g, i }) => (
            <button key={i} type="button" className={styles.row} onClick={() => setOpenIndex(i)}>
              <span className={styles.avatar}>{g.sender.replace(/^To: /, "").charAt(0)}</span>
              <span className={styles.text}>
                <span className={styles.senderRow}>
                  <span className={styles.sender}>{g.sender}</span>
                  {g.time && <span className={styles.time}>{g.time}</span>}
                </span>
                <span className={styles.subject}>{g.subject}</span>
                <span className={styles.preview}>{g.preview}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </AppScreen>
  );
}
