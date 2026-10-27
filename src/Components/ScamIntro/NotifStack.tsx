import { useEffect, useRef } from "react";
import type { CaseConfig } from "../../types/case";
import openLinkApp from "../../services/AdController";
import styles from "./NotifStack.module.scss";

interface NotifStackProps {
  caseData: CaseConfig;
  onDone: () => void;
}

const START_MS = 150;
// Noti thật khi bung 1 lượt — cả xấp tuột xuống gần như cùng lúc, lệch nhau
// rất ít (không phải từng cái rơi xuống rồi DỪNG chờ cái sau, nhìn đơ).
const GAPS_MS = [70, 90, 60, 80];
const TEXT_AFTER_MS = 300; // sau khi noti cuối rơi xong mới hiện câu hỏi
const CTA_AFTER_MS = 500; // câu hỏi vừa hiện lên thì nút cũng hiện theo luôn
const RISE_MS = 300; // thời lượng animation hiện nút
const AUTO_START_MS = 4000; // tính từ lúc nút hiện ra: không bấm thì sau 4s vẫn tự vào màn chơi

function buildDelays(count: number): number[] {
  const out = [START_MS];
  for (let i = 1; i < count; i++) out.push(out[i - 1] + GAPS_MS[(i - 1) % GAPS_MS.length]);
  return out;
}

function redactFirstName(name: string) {
  const first = name.split(" ")[0];
  return first[0] + "•".repeat(Math.max(first.length - 1, 3));
}

function dayOf(note: string) {
  return note.split("·")[0]?.trim() ?? "";
}

function formatClock() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * v13 intro — màn DUY NHẤT trước khi vào máy: điện thoại Daniel còn khoá,
 * hiện thẳng luôn lịch sử 1 tuần qua: 5 noti thanh toán (1/cô, lấy đúng số
 * tiền + món đồ trong `ledger.rows`) đổ xuống gần như cùng lúc — avatar mờ
 * sẵn + tên bị che, chỉ hiện số tiền bị trừ. Câu hỏi chốt nhấp nháy, nút
 * "Expose Daniel" hiện theo ngay sau — không còn màn ảnh Daniel/chat riêng,
 * câu hỏi #1 tự giới thiệu Chloe luôn (xem prompt trong case data).
 */
export default function NotifStack({ caseData, onDone }: NotifStackProps) {
  const victims = caseData.endCard.victims ?? [];
  const rows = (caseData.ledger?.rows ?? []).filter((r) => !r.highlight);
  const bankIcon = caseData.home.pages.flat().find((i) => i.app === "revolut")?.icon;
  const delays = buildDelays(rows.length);
  const lastAt = delays[delays.length - 1] ?? START_MS;
  const textAt = lastAt + TEXT_AFTER_MS;
  const ctaDelay = textAt + CTA_AFTER_MS;
  const ctaShownAt = ctaDelay + RISE_MS;

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), ctaShownAt + AUTO_START_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.lock}>
      <div className={styles.wallpaper} style={{ backgroundImage: `url(${caseData.wallpaper})` }} />

      <div className={styles.top}>
        <button type="button" className={styles.download} onClick={openLinkApp}>
          ⬇ Download
        </button>
      </div>

      <div className={styles.clock}>{formatClock()}</div>
      <div className={styles.date}>Locked — new activity</div>

      <div className={styles.stack}>
        {rows.map((r, i) => {
          const blurAvatar = victims.find((v) => r.name.startsWith(v.name))?.blurAvatar ?? r.avatar;
          return (
            <div key={r.name} className={styles.banner} style={{ animationDelay: `${delays[i]}ms` }}>
              <div className={styles.avatarWrap}>
                <img className={styles.avatar} src={blurAvatar} alt="" />
                {bankIcon && <img className={styles.badge} src={bankIcon} alt="" />}
              </div>
              <div className={styles.body}>
                <div className={styles.row1}>
                  <span className={styles.sender}>Sent to {redactFirstName(r.name)}</span>
                  <span className={styles.time}>{dayOf(r.note)}</span>
                </div>
                <div className={styles.preview}>
                  <span className={styles.amount}>-{r.amount}</span> · {r.item}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.hook} style={{ animationDelay: `${textAt}ms` }}>
        {(caseData.scamIntro?.hookText ?? "Daniel sent money to 5 people.\nWho are they?").split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </div>

      {caseData.scamIntro && (
        <div className={styles.ctaWrap} style={{ animationDelay: `${ctaDelay}ms` }}>
          <button type="button" className={styles.cta} onClick={onDone}>
            {caseData.scamIntro.cta}
          </button>
          <span className={styles.hand}>👆</span>
        </div>
      )}
    </div>
  );
}
