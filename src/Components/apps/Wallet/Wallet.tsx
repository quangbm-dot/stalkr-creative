import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Wallet.module.scss";

interface WalletProps {
  caseData: CaseConfig;
  onBack: () => void;
  hintTargetId?: string;
  onFoundClue?: () => void;
}

export default function Wallet({ caseData, onBack, hintTargetId, onFoundClue }: WalletProps) {
  const { bank, last4, balance, transactions } =
    caseData.wallet ?? { bank: "City Bank", last4: "4821", balance: "$2,140", transactions: [] };
  const hotIdx = hintTargetId !== undefined ? transactions.findIndex((t) => t.name === hintTargetId) : -1;
  return (
    <AppScreen title="Wallet" onBack={onBack} bodyPadding>
      <div className={styles.stack}>
        <div className={styles.cardBack} />
        <div className={styles.card}>
          <div className={styles.bank}>{bank}</div>
          <div className={styles.chip} />
          <div className={styles.number}>•••• •••• •••• {last4}</div>
          <div className={styles.bottomRow}>
            <span>{caseData.owner.first}</span>
            <span className={styles.balance}>{balance}</span>
          </div>
        </div>
      </div>
      {transactions.length > 0 && (
        <div className={styles.list}>
          {transactions.map((t, i) => {
            const isHot = i === hotIdx;
            return (
              <button
                key={i}
                type="button"
                className={`${styles.row} ${isHot ? styles.hintRow : ""}`}
                onClick={() => isHot && onFoundClue?.()}
              >
                <span className={styles.icon}>{t.name.charAt(0)}</span>
                <span className={styles.meta}>
                  <span className={styles.name}>{t.name}</span>
                  {t.date && <span className={styles.date}>{t.date}</span>}
                </span>
                <span className={t.amount.startsWith("+") ? styles.amountIn : styles.amount}>
                  {t.amount}
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
