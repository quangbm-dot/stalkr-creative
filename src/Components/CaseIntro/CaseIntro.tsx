import type { CaseConfig } from "../../types/case";
import styles from "./CaseIntro.module.scss";

interface CaseIntroProps {
  caseData: CaseConfig;
  evidenceFound: number;
  onContinue: () => void;
}

export default function CaseIntro({ caseData, evidenceFound, onContinue }: CaseIntroProps) {
  const { caseTitle, tagline, heroImage, evidenceTotal } = caseData;

  return (
    <div className={styles.wrap}>
      <img className={styles.hero} src={heroImage} alt={caseTitle} />

      {/* Viền sóng mềm cho panel — clip-path bằng đường cong bezier thay vì
          zigzag góc nhọn, trông giống mép giấy xé mềm mại hơn. */}
      <svg width="0" height="0">
        <defs>
          <clipPath id="panelWaveClip" clipPathUnits="objectBoundingBox">
            <path
              d="M0,0.025
                 C0.0125,0.025 0.0375,0 0.05,0
                 C0.0625,0 0.0875,0.025 0.1,0.025
                 C0.1125,0.025 0.1375,0 0.15,0
                 C0.1625,0 0.1875,0.025 0.2,0.025
                 C0.2125,0.025 0.2375,0 0.25,0
                 C0.2625,0 0.2875,0.025 0.3,0.025
                 C0.3125,0.025 0.3375,0 0.35,0
                 C0.3625,0 0.3875,0.025 0.4,0.025
                 C0.4125,0.025 0.4375,0 0.45,0
                 C0.4625,0 0.4875,0.025 0.5,0.025
                 C0.5125,0.025 0.5375,0 0.55,0
                 C0.5625,0 0.5875,0.025 0.6,0.025
                 C0.6125,0.025 0.6375,0 0.65,0
                 C0.6625,0 0.6875,0.025 0.7,0.025
                 C0.7125,0.025 0.7375,0 0.75,0
                 C0.7625,0 0.7875,0.025 0.8,0.025
                 C0.8125,0.025 0.8375,0 0.85,0
                 C0.8625,0 0.8875,0.025 0.9,0.025
                 C0.9125,0.025 0.9375,0 0.95,0
                 C0.9625,0 0.9875,0.025 1,0.025
                 L1,1 L0,1 Z"
            />
          </clipPath>
        </defs>
      </svg>

      <div className={styles.panel}>
        <span className={styles.cloud1} />
        <span className={styles.cloud2} />

        <h1 className={styles.title}>{caseTitle}</h1>
        <p className={styles.tagline}>{tagline}</p>

        <div className={styles.progressRow}>
          <span>Evidence found</span>
          <span>
            {evidenceFound}/{evidenceTotal}
          </span>
        </div>
        <div className={styles.progressDashes}>
          {Array.from({ length: evidenceTotal }).map((_, i) => (
            <span key={i} className={i < evidenceFound ? styles.dashFilled : styles.dash} />
          ))}
        </div>

        <button type="button" className={styles.cta} onClick={onContinue}>
          <span className={styles.ctaIcon}>›</span>
          Continue investigating
        </button>
      </div>
    </div>
  );
}
