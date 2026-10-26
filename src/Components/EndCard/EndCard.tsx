import { useEffect } from "react";
import type { CaseConfig } from "../../types/case";
import openLinkApp, { trackPlayableEvent } from "../../services/AdController";
import styles from "./EndCard.module.scss";

interface EndCardProps {
  caseData: CaseConfig;
}

/**
 * v13: end card đè lên màn ending bên dưới (như teaser sau 5 câu của v12): lớp phủ tối + bottom sheet trượt lên.
 * Nội dung: kiểu "kết thúc màn chơi" của game — CASE SOLVED + 3 sao, cả 5 cô gái (đã được
 * mở khoá, mặt rõ nét) đứng cạnh nhau, rồi 1 thẻ "ending bị khoá" (Daniel mờ + 🔒):
 * họ sẽ làm gì anh ta? Chỉ xem được khi vào game → CTA "See his fate".
 */
export default function EndCard({ caseData }: EndCardProps) {
  useEffect(() => {
    trackPlayableEvent("ENDCARD_SHOWN");
  }, []);

  const { headline, subhead, ctaLabel, victims = [], teaser } = caseData.endCard;

  return (
    <div className={styles.overlay}>
      <div className={styles.sheet}>
      <div className={styles.badge}>
        <span className={styles.badgeText}>CASE SOLVED</span>
        <div className={styles.stars}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={styles.star} style={{ animationDelay: `${0.35 + i * 0.25}s` }}>★</span>
          ))}
        </div>
      </div>

      <h2 className={styles.headline}>{headline}</h2>
      <p className={styles.subhead}>{subhead}</p>

      <div className={styles.women}>
        {victims.map((v, i) => (
          <div key={v.name} className={styles.woman} style={{ animationDelay: `${1.1 + i * 0.18}s` }}>
            <img src={v.avatar} alt="" />
            <span className={styles.name}>{v.name}</span>
          </div>
        ))}
      </div>

      {teaser && (
        <div className={styles.ending}>
          {/* bấm vào ảnh / nút Play → mở store (giống nút CTA) */}
          <button type="button" className={styles.endingImg} onClick={openLinkApp} aria-label="Play">
            <img src={teaser.blurImage} alt="" />
            <span className={styles.endingChip}>{teaser.title}</span>
            <span className={styles.endingPlay}>▶</span>
          </button>
          <span className={styles.endingSub}>{teaser.text}</span>
        </div>
      )}

      <button type="button" className={styles.cta} onClick={openLinkApp}>
        {ctaLabel}
      </button>
      <span className={styles.fictionBadge}>Fictional mystery game</span>
      </div>
    </div>
  );
}
