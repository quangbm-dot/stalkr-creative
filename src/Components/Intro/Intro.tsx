import { useEffect, useRef, useState } from "react";
import type { CaseConfig, HireStep } from "../../types/case";
import openLinkApp from "../../services/AdController";
import TrustMeter from "../TrustMeter/TrustMeter";
import styles from "./Intro.module.scss";

interface IntroProps {
  caseData: CaseConfig;
  onDone: () => void;
}

type LogStep = Extract<HireStep, { type: "msgs" | "tinderReveal" | "appReveal" | "reveal" | "choices" }>;

const TYPING_MS = 900;
const GAP_MS = 350;
const CARD_MS = 1800;
// "reveal" = ảnh + 1 đoạn kể chuyện dài hiện cùng lúc — cho thêm thời gian đọc.
const REVEAL_MS = 2600;

/**
 * v4 intro — một đoạn chat ngắn gọn từ số lạ (thay cho bảng ghim nhiều ảnh
 * của v1-v3): mỗi tin nhắn hiện 3 chấm "đang nhập" rồi mới đổi thành text
 * thật, xen giữa đúng 1 ảnh "hành vi" hiện dạng card app thật — tự động
 * chạy hết, không có nút mũi tên/thanh tiến trình. Chỉ dừng lại chờ người
 * chơi bấm khi tới 2 lựa chọn phản hồi ở cuối.
 */
export default function Intro({ caseData, onDone }: IntroProps) {
  const steps = caseData.client.hire;
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(steps[0]?.type === "msgs");
  // v10: lưu lại lựa chọn đã bấm theo index bước — để hiện lại thành bong
  // bóng xanh của người chơi trong log, giống bản gốc (bấm xong vẫn thấy
  // mình đã chọn gì, không biến mất).
  const [chosenOption, setChosenOption] = useState<Record<number, string>>({});
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const current = steps[revealed];
  // Không hỏi tên người chơi (bỏ bước nameInput) — "{{name}}, " trong data
  // gốc được bỏ gọn luôn, không thay bằng tên giả.
  const withName = (text: string) => {
    const stripped = text.replace(/\{\{name\}\},?\s*/g, "");
    return stripped !== text ? stripped.charAt(0).toUpperCase() + stripped.slice(1) : stripped;
  };

  useEffect(() => {
    // Cuộn mượt thay vì nhảy cứng — nhảy cứng là nguyên nhân chính gây cảm
    // giác "giật" mỗi khi có bong bóng/ảnh mới hiện ra, nhất là lúc ảnh
    // reveal còn to khiến khoảng cuộn dài hơn bình thường.
    logEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [revealed, typing]);

  useEffect(() => {
    const step = steps[revealed];
    if (!step || step.type === "choices" || step.type === "cta") {
      setTyping(false);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (step.type === "msgs") {
      setTyping(true);
      timers.push(
        setTimeout(() => {
          setTyping(false);
          timers.push(setTimeout(() => setRevealed((r) => r + 1), GAP_MS));
        }, TYPING_MS),
      );
    } else {
      setTyping(false);
      timers.push(setTimeout(() => setRevealed((r) => r + 1), step.type === "reveal" ? REVEAL_MS : CARD_MS));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  const logEntries = steps
    .map((s, idx) => ({ s, idx }))
    .slice(0, revealed + 1)
    .filter(
      (e): e is { s: LogStep; idx: number } =>
        e.s.type === "msgs" ||
        e.s.type === "tinderReveal" ||
        e.s.type === "appReveal" ||
        e.s.type === "reveal" ||
        // Lựa chọn đã bấm rồi (không phải bước hiện tại) — hiện lại thành
        // bong bóng xanh thay vì biến mất khỏi log.
        (e.s.type === "choices" && e.idx < revealed),
    );

  return (
    <div className={styles.stage}>
      <div className={styles.top}>
        <svg className={styles.doodle} viewBox="0 0 150 60" fill="none">
          <path
            d="M10 30c8-18 32-18 40 0s32 18 40 0M95 20h45"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <div className={styles.topRight}>
          <button type="button" className={styles.download} onClick={openLinkApp}>
            ⬇ Download
          </button>
          <svg className={styles.eyeIcon} viewBox="0 0 40 24" fill="none">
            <path
              d="M2 12c4-8 12-10 18-10s14 2 18 10c-4 8-12 10-18 10S6 20 2 12z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="20" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {caseData.trust && (
        <div className={styles.trustBox}>
          <TrustMeter
            value={100}
            label={caseData.trust.label}
            avatar={caseData.client.avatar}
            reaction={caseData.trust.clientReactions[0]?.text ?? ""}
          />
        </div>
      )}

      <div className={styles.chatWrap}>
        <div className={styles.log}>
          {/* Header (avatar + tên) cuộn cùng nội dung chat, không đứng yên
              cố định phía trên nữa. */}
          <div className={styles.header}>
            <img className={styles.headerAvatar} src={caseData.client.avatar} alt="" />
            <span className={styles.headerName}>{caseData.client.name}</span>
          </div>

          {logEntries.map(({ s, idx }) => {
            const isCurrent = idx === revealed;

            if (s.type === "reveal") {
              return (
                <div key={idx} className={styles.revealGroup}>
                  <img className={`${styles.flatPhoto} ${styles.on}`} src={s.src} alt={s.label ?? ""} />
                  <div className={`${styles.bubble} ${styles.on}`}>{s.text}</div>
                </div>
              );
            }

            // Lựa chọn đã bấm — hiện lại thành bong bóng xanh của người chơi.
            if (s.type === "choices") {
              const picked = chosenOption[idx];
              if (!picked) return null;
              return (
                <div key={idx} className={`${styles.bubble} ${styles.bubbleMe} ${styles.on}`}>
                  {picked}
                </div>
              );
            }

            if (s.type === "tinderReveal" || s.type === "appReveal") {
              const appLabel = s.type === "tinderReveal" ? "Tinder" : s.appLabel;
              return (
                <div key={idx} className={`${styles.appCard} ${styles.on}`}>
                  <img className={styles.appCardPhoto} src={s.src} alt="" />
                  <div className={styles.appCardBlur} />
                  <span className={styles.appCardMark}>?</span>
                  {s.type === "appReveal" && (
                    <div className={styles.appCardBadge}>
                      <img src={s.appIcon} alt="" />
                      <span>{appLabel}</span>
                    </div>
                  )}
                  <div className={styles.appCardScrim} />
                  <div className={styles.appCardInfo}>
                    <span className={styles.appCardName}>Unknown</span>
                    <span className={styles.appCardSub}>
                      <span className={styles.appCardDot} />
                      {s.subtitle}
                    </span>
                  </div>
                </div>
              );
            }

            if (isCurrent && typing) {
              return (
                <div key={idx} className={`${styles.bubble} ${styles.on} ${styles.typingBubble}`}>
                  <span className={styles.dots}>
                    <i /><i /><i />
                  </span>
                </div>
              );
            }
            // v10: tin nhắn có kèm ảnh (vd ảnh "đây là anh ấy") — ảnh phẳng
            // bo góc, không viền/scrim, giống hệt bản gốc.
            return (
              <div key={idx} className={styles.revealGroup}>
                {s.image && <img className={`${styles.flatPhoto} ${styles.on}`} src={s.image} alt="" />}
                {s.text && <div className={`${styles.bubble} ${styles.on}`}>{withName(s.text)}</div>}
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>

      {current?.type === "cta" && (
        <div className={styles.choicesWrap}>
          <button type="button" className={`${styles.choice} ${styles.ctaChoice}`} onClick={onDone}>
            {current.label}
          </button>
          <span className={styles.choiceHint}>👆</span>
        </div>
      )}

      {current?.type === "choices" && (
        <div className={styles.choicesWrap}>
          {current.options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={styles.choice}
              onClick={() => {
                setChosenOption((m) => ({ ...m, [revealed]: opt }));
                setRevealed((r) => r + 1);
              }}
            >
              {opt}
            </button>
          ))}
          {/* Bàn tay gợi ý nằm ngoài nút (sibling cuối, z-index cao) — để
              trong nút thì bị nút thứ 2 đè lên vì nó tràn ra ngoài khung
              nút đầu. */}
          <span className={styles.choiceHint}>👆</span>
        </div>
      )}

      {/* Thanh nhập tin nhắn trang trí, luôn hiện ở đáy giống bản gốc — chat
          tự chạy, không thật sự gõ được, nhưng giữ đúng cảm giác đang nhắn
          tin với Casey suốt màn intro. */}
      <div className={styles.fakeInputRow}>
        <div className={styles.fakeInput}>Message</div>
        <div className={styles.fakeSend}>↑</div>
      </div>
    </div>
  );
}
