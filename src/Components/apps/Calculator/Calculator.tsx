import { useState } from "react";
import AppScreen from "../../PhoneFrame/AppScreen";
import styles from "./Calculator.module.scss";

interface CalculatorProps {
  onBack: () => void;
}

const DIGIT_KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];
const OP_KEYS = ["÷", "×", "−", "+"];

// Làm tròn nhẹ + bỏ số 0 thừa sau dấu phẩy — tránh hiện lỗi dấu phẩy động
// kiểu "0.1 + 0.2 = 0.30000000000000004".
function formatResult(n: number) {
  if (!Number.isFinite(n)) return "Error";
  const rounded = Math.round(n * 1e10) / 1e10;
  return rounded.toString();
}

function compute(a: number, b: number, op: string) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

// Máy tính hoạt động thật (trước chỉ là hình trang trí — bấm số chỉ nối
// chuỗi hiển thị, bấm "=" luôn reset về 0, không hề tính toán gì).
export default function Calculator({ onBack }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const pressDigit = (d: string) => {
    setDisplay((cur) => {
      if (resetNext || cur === "0") {
        setResetNext(false);
        return d;
      }
      return cur.length >= 12 ? cur : cur + d;
    });
  };

  const pressDot = () => {
    setDisplay((cur) => {
      if (resetNext) {
        setResetNext(false);
        return "0.";
      }
      return cur.includes(".") ? cur : cur + ".";
    });
  };

  const pressOperator = (op: string) => {
    const current = parseFloat(display);
    if (pendingOp && !resetNext) {
      const result = compute(prevValue ?? 0, current, pendingOp);
      setPrevValue(result);
      setDisplay(formatResult(result));
    } else {
      setPrevValue(current);
    }
    setPendingOp(op);
    setResetNext(true);
  };

  const pressEquals = () => {
    if (pendingOp === null) return;
    const current = parseFloat(display);
    setDisplay(formatResult(compute(prevValue ?? 0, current, pendingOp)));
    setPrevValue(null);
    setPendingOp(null);
    setResetNext(true);
  };

  const pressClear = () => {
    setDisplay("0");
    setPrevValue(null);
    setPendingOp(null);
    setResetNext(false);
  };

  const pressSign = () => setDisplay((cur) => (cur.startsWith("-") ? cur.slice(1) : cur === "0" ? cur : "-" + cur));

  const pressPercent = () => setDisplay((cur) => formatResult(parseFloat(cur) / 100));

  const onKey = (key: string) => {
    if (key === "C") return pressClear();
    if (key === "±") return pressSign();
    if (key === "%") return pressPercent();
    if (key === ".") return pressDot();
    if (OP_KEYS.includes(key)) return pressOperator(key);
    return pressDigit(key);
  };

  return (
    <AppScreen title="Calculator" onBack={onBack} bodyPadding>
      <div className={styles.display}>{display}</div>
      <div className={styles.keys}>
        <button type="button" className={styles.key} onClick={() => onKey("C")}>
          C
        </button>
        <button type="button" className={styles.key} onClick={() => onKey("±")}>
          ±
        </button>
        <button type="button" className={styles.key} onClick={() => onKey("%")}>
          %
        </button>
        <button
          type="button"
          className={`${styles.key} ${pendingOp === "÷" ? styles.keyActive : ""}`}
          onClick={() => onKey("÷")}
        >
          ÷
        </button>
        {DIGIT_KEYS.slice(0, 3).map((k) => (
          <button key={k} type="button" className={styles.key} onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.key} ${pendingOp === "×" ? styles.keyActive : ""}`}
          onClick={() => onKey("×")}
        >
          ×
        </button>
        {DIGIT_KEYS.slice(3, 6).map((k) => (
          <button key={k} type="button" className={styles.key} onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.key} ${pendingOp === "−" ? styles.keyActive : ""}`}
          onClick={() => onKey("−")}
        >
          −
        </button>
        {DIGIT_KEYS.slice(6, 9).map((k) => (
          <button key={k} type="button" className={styles.key} onClick={() => onKey(k)}>
            {k}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.key} ${pendingOp === "+" ? styles.keyActive : ""}`}
          onClick={() => onKey("+")}
        >
          +
        </button>
        <button type="button" className={styles.key} onClick={() => onKey("0")}>
          0
        </button>
        <button type="button" className={styles.key} onClick={() => onKey(".")}>
          .
        </button>
        <button type="button" className={`${styles.key} ${styles.equals}`} onClick={pressEquals}>
          =
        </button>
      </div>
    </AppScreen>
  );
}
