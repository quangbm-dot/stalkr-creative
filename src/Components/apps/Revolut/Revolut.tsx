import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Revolut.module.scss";

interface RevolutProps {
  onBack: () => void;
}

const TRANSACTIONS = [
  { name: "Le Jardin Paris", amount: "-€620.00" },
  { name: "Café de Flore", amount: "-€14.50" },
  { name: "Salary", amount: "+$3,200.00" },
  { name: "Uber", amount: "-$18.20" },
  { name: "Hôtel Lumière", amount: "-€340.00" },
  { name: "Boulangerie Saint-Paul", amount: "-€6.80" },
  { name: "Spotify", amount: "-$10.99" },
  { name: "Le Petit Bistro", amount: "-€48.50" },
  { name: "ATM Withdrawal", amount: "-$100.00" },
  { name: "Freelance Payment", amount: "+$450.00" },
  { name: "Metro Pass", amount: "-€22.00" },
  { name: "Amazon", amount: "-$67.30" },
];

export default function Revolut({ onBack }: RevolutProps) {
  return (
    <AppScreen title="RevoBank" onBack={onBack}>
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.balance}>$4,382.10</div>
          <div className={styles.actions}>
            <span className={styles.action}>+</span>
            <span className={styles.action}>↑</span>
            <span className={styles.action}>↓</span>
          </div>
        </div>
        <div className={styles.sheet}>
          {TRANSACTIONS.map((t, i) => (
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
