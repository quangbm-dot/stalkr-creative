import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Revolut.module.scss";

interface RevolutProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

export default function Revolut({ caseData, onBack, hintTargetId, onFoundClue }: RevolutProps) {
  const { balance, transactions } = caseData.revolut;
  // Chỉ lấy INDEX đầu tiên khớp tên — tên merchant lặp lại nhiều lần là
  // chuyện thường (vd đổ xăng Shell nhiều lần), so == riêng từng dòng sẽ
  // sáng HẾT mọi dòng trùng tên thay vì đúng 1 giao dịch cần tìm.
  const hotIdx = hintTargetId !== undefined ? transactions.findIndex((t) => t.name === hintTargetId) : -1;
  return (
    <AppScreen title="RevoBank" onBack={onBack}>
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.balance}>{balance}</div>
          <div className={styles.actions}>
            <span className={styles.action}>+</span>
            <span className={styles.action}>↑</span>
            <span className={styles.action}>↓</span>
          </div>
        </div>
        <div className={styles.sheet}>
          {transactions.map((t, i) => {
            const isHot = i === hotIdx;
            return (
              <div
                key={i}
                className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
                data-hint={isHot ? "row-clue" : undefined}
                onClick={() => isHot && onFoundClue?.()}
              >
                <span className={styles.icon}>{t.name.charAt(0)}</span>
                <span className={styles.nameCol}>
                  <span className={styles.name}>{t.name}</span>
                  {t.date && (
                    <span className={styles.sub}>
                      {t.date}
                      {t.note && ` · ${t.note}`}
                    </span>
                  )}
                </span>
                <span className={t.amount.startsWith("+") ? styles.amountIn : styles.amount}>
                  {t.amount}
                </span>
                {isHot && <span className={styles.hintHand}>👆</span>}
              </div>
            );
          })}
        </div>
      </div>
    </AppScreen>
  );
}
