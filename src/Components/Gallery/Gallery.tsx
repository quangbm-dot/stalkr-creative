import type { V9Case } from "../../cases/buildCase";
import styles from "./Gallery.module.scss";

interface GalleryProps {
  cases: V9Case[];
}

/**
 * Chỉ dùng khi dev (`npm run dev all`): mỗi case chạy trong 1 iframe khung
 * điện thoại riêng, chơi song song được; bấm tên case để mở toàn màn hình.
 */
export default function Gallery({ cases }: GalleryProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>SMD Playable v9 — {cases.length} cases</h1>
      <div className={styles.grid}>
        {cases.map((c) => (
          <div key={c.id} className={styles.card}>
            <a className={styles.label} href={`?case=${c.id}#dev`} target="_blank" rel="noreferrer">
              {c.id} · {c.label} ↗
            </a>
            <div className={styles.meta}>
              {c.config.evidenceRounds.length} câu hỏi · {c.config.tagline}
            </div>
            <iframe className={styles.frame} src={`?case=${c.id}#dev`} title={c.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
