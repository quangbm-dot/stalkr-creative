import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Gmail.module.scss";

interface GmailProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

export default function Gmail({ caseData, onBack, hintTargetId, onFoundClue }: GmailProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [folder, setFolder] = useState<"inbox" | "sent" | "trash" | "spam">("inbox");
  const entry = openIndex !== null ? caseData.gmail[openIndex] : null;
  const hasSent = caseData.gmail.some((g) => g.folder === "sent");
  const hasTrash = caseData.gmail.some((g) => g.folder === "trash");
  const hasSpam = caseData.gmail.some((g) => g.folder === "spam");
  const rows = caseData.gmail
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => (g.folder ?? "inbox") === folder);
  // Email cần tìm có thể nằm ở Sent trong khi đang đứng ở Inbox (mặc định
  // mở app) — dòng đó chưa hiện ra để sáng được, phải chỉ tay vào đúng tab
  // chứa nó trước, không thì người chơi không biết phải bấm "Sent".
  const hotEmail =
    hintTargetId !== undefined
      ? caseData.gmail.find((g) => g.sender === hintTargetId || g.subject === hintTargetId)
      : undefined;
  const hotFolder = hotEmail ? hotEmail.folder ?? "inbox" : undefined;

  if (entry) {
    return (
      <AppScreen title={entry.sender} onBack={() => setOpenIndex(null)} theme="light" bodyPadding>
        <h2 className={styles.detailSubject}>{entry.subject}</h2>
        {entry.time && <div className={styles.detailTime}>{entry.time}</div>}
        <p className={styles.detailBody}>{entry.body ?? entry.preview}</p>
      </AppScreen>
    );
  }

  const folderLabel = { inbox: "Inbox", sent: "Sent", trash: "Trash", spam: "Spam" } as const;
  const folders = [
    "inbox",
    ...(hasSent ? (["sent"] as const) : []),
    ...(hasSpam ? (["spam"] as const) : []),
    ...(hasTrash ? (["trash"] as const) : []),
  ] as const;

  return (
    <AppScreen title={folderLabel[folder]} onBack={onBack} theme="light">
      {(hasSent || hasTrash || hasSpam) && (
        <div className={styles.tabs}>
          {folders.map((f) => (
            <button
              key={f}
              type="button"
              className={folder === f ? styles.tabActive : styles.tab}
              onClick={() => setFolder(f)}
            >
              {folderLabel[f]}
              {hotFolder === f && folder !== f && <span className={styles.tabHint}>👆</span>}
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
          {rows.map(({ g, i }) => {
            // So sánh chính object (=== hotEmail, không so lại sender/subject
            // theo từng dòng) — nhiều email cùng người gửi/tiêu đề là chuyện
            // thường (newsletter, thông báo lặp...), so lại field sẽ sáng
            // HẾT các email trùng thay vì đúng 1 email cần tìm.
            const isHot = g === hotEmail;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
                onClick={() => {
                  if (isHot) onFoundClue?.();
                  setOpenIndex(i);
                }}
              >
                <span className={styles.avatar}>{g.sender.replace(/^To: /, "").charAt(0)}</span>
                <span className={styles.text}>
                  <span className={styles.senderRow}>
                    <span className={styles.sender}>{g.sender}</span>
                    {g.time && <span className={styles.time}>{g.time}</span>}
                  </span>
                  <span className={styles.subject}>{g.subject}</span>
                  <span className={styles.preview}>{g.preview}</span>
                </span>
                {isHot && <span className={styles.hintHand}>👆</span>}
              </button>
            );
          })}
        </div>
      )}
    </AppScreen>
  );
}
