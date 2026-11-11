import { useState } from "react";
import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Phone.module.scss";

interface PhoneProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

const TYPE_ICON: Record<string, string> = {
  incoming: "↙",
  outgoing: "↗",
  missed: "↙",
};

export default function Phone({ caseData, onBack, hintTargetId, onFoundClue }: PhoneProps) {
  const [tab, setTab] = useState<"recents" | "contacts">("recents");
  const [openContact, setOpenContact] = useState<number | null>(null);
  const contacts = caseData.contacts ?? [];
  const hasContacts = contacts.length > 0;

  // Recents chỉ có tên/giờ gọi, không hiện SĐT — vài câu cần đọc nguyên SĐT
  // của 1 liên hệ lưu dưới biệt danh (vd "N 🖤") thì phải tìm trong Contacts.
  // Chỉ lấy INDEX đầu tiên khớp tên (findIndex), không so == trên từng dòng
  // — 1 người có thể gọi nhiều lần (nhiều dòng trùng tên trong Recents),
  // so == riêng từng dòng sẽ sáng HẾT TẤT CẢ thay vì đúng 1 cuộc gọi cần tìm.
  const hotContactIdx = hintTargetId !== undefined ? contacts.findIndex((c) => c.name === hintTargetId) : -1;
  const hotCallIdx = hintTargetId !== undefined ? caseData.calls.findIndex((c) => c.name === hintTargetId) : -1;
  const hotTab = hotContactIdx >= 0 ? "contacts" : hotCallIdx >= 0 ? "recents" : undefined;

  const contact = openContact !== null ? contacts[openContact] : null;
  if (contact) {
    return (
      <AppScreen title="Contact" onBack={() => setOpenContact(null)} theme="light">
        <div className={styles.detail}>
          <div className={styles.detailAvatar}>{contact.name.charAt(0)}</div>
          <div className={styles.detailName}>{contact.name}</div>
          <div className={styles.detailNumber}>{contact.phoneNumber}</div>
        </div>
      </AppScreen>
    );
  }

  return (
    <AppScreen title={tab === "contacts" ? "Contacts" : "Recents"} onBack={onBack} theme="light">
      {hasContacts && (
        <div className={styles.tabs}>
          {(["recents", "contacts"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? styles.tabActive : styles.tab}
              onClick={() => setTab(t)}
            >
              {t === "recents" ? "Recents" : "Contacts"}
              {hotTab === t && tab !== t && <span className={styles.tabHint}>👆</span>}
            </button>
          ))}
        </div>
      )}

      {tab === "contacts" ? (
        <div className={styles.list}>
          {contacts.map((c, i) => {
            const isHot = i === hotContactIdx;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
                onClick={() => {
                  if (isHot) onFoundClue?.();
                  setOpenContact(i);
                }}
              >
                <span className={styles.icon}>{c.name.charAt(0)}</span>
                <span className={styles.meta}>
                  <span className={styles.name}>{c.name}</span>
                </span>
                {isHot && <span className={styles.hintHand}>👆</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.list}>
          {caseData.calls.map((c, i) => {
            const isHot = i === hotCallIdx;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
                onClick={() => isHot && onFoundClue?.()}
              >
                <span className={c.type === "missed" ? styles.iconMissed : styles.icon}>
                  {TYPE_ICON[c.type]}
                </span>
                <span className={styles.meta}>
                  <span className={c.type === "missed" ? styles.nameMissed : styles.name}>{c.name}</span>
                  <span className={styles.time}>
                    {c.time}
                    {c.detail && ` · ${c.detail}`}
                  </span>
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
