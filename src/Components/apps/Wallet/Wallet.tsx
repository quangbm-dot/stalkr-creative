import type { CaseConfig } from "../../../types/case";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Wallet.module.scss";

interface WalletProps {
  caseData: CaseConfig;
  onBack: () => void;
}

export default function Wallet({ caseData, onBack }: WalletProps) {
  return (
    <AppScreen title="Wallet" onBack={onBack} bodyPadding>
      <div className={styles.stack}>
        <div className={styles.cardBack} />
        <div className={styles.card}>
          <div className={styles.bank}>City Bank</div>
          <div className={styles.chip} />
          <div className={styles.number}>•••• •••• •••• 4821</div>
          <div className={styles.bottomRow}>
            <span>{caseData.owner.first}</span>
            <span className={styles.balance}>$2,140</span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
