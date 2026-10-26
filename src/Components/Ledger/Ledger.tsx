import { useEffect } from "react";
import type { CaseConfig } from "../../types/case";
import styles from "./Ledger.module.scss";

interface LedgerProps {
  caseData: CaseConfig;
  onDone: () => void;
  /** true khi end card đã đè lên: tờ giấy dịch lên phía trên, nút Continue ẩn. */
  settled?: boolean;
}

const ROW_BASE = 1050; // sau khi tờ giấy đã trượt lên tới nơi
const ROW_STEP = 330;
const AUTO_MS = 2600; // tự sang end card sau khi đọc xong (bấm Continue để qua sớm)

/**
 * v13: sau khi tìm đủ các cô gái → tờ giấy thanh toán được ĐẨY TỪ DƯỚI LÊN vào giữa màn hình,
 * một vệt sáng quét qua; sau đó từng dòng tiền Daniel lấy của mỗi cô hiện lần lượt, dòng của
 * Chloe (tiền đang chờ chuyển tối nay) được khoanh đỏ nổi bật. Xong tự chuyển sang end card.
 */
export default function Ledger({ caseData, onDone, settled = false }: LedgerProps) {
  const l = caseData.ledger;
  const rows = l?.rows ?? [];
  const doneAt = ROW_BASE + ROW_STEP * rows.length + 700;

  useEffect(() => {
    const t = setTimeout(onDone, doneAt + AUTO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!l) return null;
  const rowDelay = (i: number) => `${ROW_BASE + i * ROW_STEP}ms`;

  return (
    <div className={`${styles.stage} ${settled ? styles.settled : ""}`}>
      {/* quầng sáng phía sau tờ giấy, bùng lên đúng lúc giấy tới nơi */}
      <div className={styles.glow} />

      <div className={styles.paper}>
        <div className={styles.head}>
          <span className={styles.heading}>🧾 {l.heading}</span>
          <span className={styles.sub}>{l.subheading}</span>
        </div>

        <div className={styles.rows}>
          {l.rows.map((r, i) => (
            <div
              key={r.name}
              className={`${styles.row} ${r.highlight ? styles.hot : ""}`}
              style={{ animationDelay: rowDelay(i) }}
            >
              <div className={styles.thumb}>
                {r.itemImage ? <img src={r.itemImage} alt="" /> : <span className={styles.thumbEmoji}>{r.itemEmoji}</span>}
                <img className={styles.avatar} src={r.avatar} alt="" />
              </div>
              <div className={styles.who}>
                <span className={styles.name}>{r.item}</span>
                <span className={styles.who2}>for {r.name}</span>
                <span className={styles.note}>{r.note}</span>
              </div>
              <span className={styles.amount}>{r.amount}</span>
              {r.highlight && (
                <>
                  <span className={styles.circle} style={{ animationDelay: `${ROW_BASE + i * ROW_STEP + 250}ms` }} />
                  <span className={styles.tag} style={{ animationDelay: `${ROW_BASE + i * ROW_STEP + 500}ms` }}>
                    {l.highlightTag}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={styles.total} style={{ animationDelay: rowDelay(rows.length) }}>
          <span>{l.totalLabel}</span>
          <b>{l.total}</b>
        </div>

        {/* vệt sáng quét chéo ngay sau khi duỗi */}
        <div className={styles.shineClip}>
          <div className={styles.shine} />
        </div>
      </div>

      {!settled && (
        <button type="button" className={styles.cta} style={{ animationDelay: `${doneAt}ms` }} onClick={onDone}>
          {l.cta}
        </button>
      )}
    </div>
  );
}
