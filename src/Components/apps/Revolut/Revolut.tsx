import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Revolut.module.scss";

interface RevolutProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Revolut({ caseData, onBack }: RevolutProps) {
  const { balance, transactions } = caseData.revolut;
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
          {transactions.map((t, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.icon}>{t.name.charAt(0)}</span>
              <span className={styles.name}>{t.name}</span>
              <span className={t.amount.startsWith("+") ? styles.amountIn : styles.amount}>
                {t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}
