import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CaseConfig, HireStep } from "../../types/case";
import openLinkApp from "../../services/AdController";
import styles from "./Intro.module.scss";

interface IntroProps {
  caseData: CaseConfig;
  onDone: () => void;
  // v17: báo lên App.tsx khi đang/hết chiếu "cuốn phim" nền tối — để
  // StatusBar giả (giờ/sóng/pin ở PhoneFrame, nằm NGOÀI Intro) đổi màu
  // trắng cho nhìn được, vì nền lúc đó đổi hẳn từ xanh nhạt sang gần đen.
  onCinemaModeChange?: (active: boolean) => void;
}

type LogStep = Extract<HireStep, { type: "msgs" | "tinderReveal" | "appReveal" | "reveal" | "letter" | "choices" }>;

const TYPING_MS = 900;
const GAP_MS = 350;
const CARD_MS = 1800;
// "reveal" = ảnh + 1 đoạn kể chuyện dài hiện cùng lúc — cho thêm thời gian đọc.
const REVEAL_MS = 2600;
// "letter" = cả đoạn thư viết tay, dài hơn 1 bong bóng chat bình thường —
// cho nhiều thời gian đọc hơn cả "reveal".
const LETTER_MS = 3400;
// "filmReel" = mỗi khung ảnh tự cuộn sang khung kế sau chừng này ms — xem
// effect riêng bên dưới (không dùng chung timer với các step khác vì cần
// tự chạy qua NHIỀU khung bên trong 1 step).
const FILMREEL_FRAME_MS = 2000;
// "titleCard" = thẻ tiêu đề mở phim (tên 2 nhân vật + giới thiệu ngắn) —
// đứng yên đủ lâu để đọc hết trước khi tự chuyển sang filmReel.
const TITLECARD_MS = 2600;
// "cinemaCaption" = đổi chữ trên nền cinema đóng băng, ảnh KHÔNG đổi.
const CINEMA_CAPTION_MS = 2400;

/**
 * v4 intro — một đoạn chat ngắn gọn từ số lạ (thay cho bảng ghim nhiều ảnh
 * của v1-v3): mỗi tin nhắn hiện 3 chấm "đang nhập" rồi mới đổi thành text
 * thật, xen giữa đúng 1 ảnh "hành vi" hiện dạng card app thật — tự động
 * chạy hết, không có nút mũi tên/thanh tiến trình. Chỉ dừng lại chờ người
 * chơi bấm khi tới 2 lựa chọn phản hồi ở cuối.
 */
export default function Intro({ caseData, onDone, onCinemaModeChange }: IntroProps) {
  const steps = caseData.client.hire;
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(steps[0]?.type === "msgs");
  // v10: lưu lại lựa chọn đã bấm theo index bước — để hiện lại thành bong
  // bóng xanh của người chơi trong log, giống bản gốc (bấm xong vẫn thấy
  // mình đã chọn gì, không biến mất).
  const [chosenOption, setChosenOption] = useState<Record<number, string>>({});
  // v17: khung đang chiếu trong step "filmReel" hiện tại (reset về 0 mỗi khi
  // sang step khác — xem effect riêng bên dưới).
  const [filmFrame, setFilmFrame] = useState(0);
  // v17: frames của "filmReel" GẦN NHẤT — giữ nguyên (không set lại null)
  // khi sang "choices"/"cta" ngay sau đó, để màn cuốn phim không bị cắt đột
  // ngột về khung chat sáng — 2 nút lựa chọn/cta hiện ĐÈ lên khung cuối của
  // cuốn phim luôn. Chỉ clear khi gặp step khác (msgs/reveal/letter/...).
  const [cinemaFrames, setCinemaFrames] = useState<{ src: string; caption: string }[] | null>(null);
  // v17: "letter" = ảnh thumbnail nhỏ + chữ to gõ kiểu máy đánh chữ (cảnh
  // đọc thư); undefined = mặc định ảnh to/caption nhỏ (cuốn phim mở đầu).
  const [cinemaVariant, setCinemaVariant] = useState<"letter" | undefined>(undefined);
  // v17: nền tối đang bật hay không — true cho CẢ "titleCard" (không có
  // frames ảnh, chỉ có chữ) lẫn "filmReel"/choices-cta kế thừa theo sau.
  // Tách riêng khỏi cinemaFrames vì titleCard không có mảng frames nào.
  const [cinemaOn, setCinemaOn] = useState(false);
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
    // "filmReel" tự chạy qua nhiều khung bằng effect riêng bên dưới, không
    // dùng chung 1 timer với các step còn lại.
    if (!step || step.type === "choices" || step.type === "cta" || step.type === "filmReel") {
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
      const delay =
        step.type === "reveal" ? REVEAL_MS :
        step.type === "letter" ? LETTER_MS :
        step.type === "titleCard" ? TITLECARD_MS :
        step.type === "cinemaCaption" ? CINEMA_CAPTION_MS :
        CARD_MS;
      timers.push(
        setTimeout(() => {
          // enterPhoneAfter (cinemaCaption cũng có field này) — vào thẳng
          // điện thoại, không cần bước "cta" nào nữa.
          if (step.type === "cinemaCaption" && step.enterPhoneAfter) onDone();
          else setRevealed((r) => r + 1);
        }, delay),
      );
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // v17: "filmReel" — tự cuộn qua từng khung trong `frames`, 1 khung mỗi
  // step.frameMs (hoặc FILMREEL_FRAME_MS nếu không đặt riêng), rồi mới sang
  // step kế tiếp (giống các step có hẹn giờ khác, chỉ khác là có NHIỀU
  // "khung phụ" bên trong 1 step).
  useEffect(() => {
    const step = steps[revealed];
    if (!step || step.type !== "filmReel") return;
    setFilmFrame(0);
    const perFrame = step.frameMs ?? FILMREEL_FRAME_MS;
    const timers: ReturnType<typeof setTimeout>[] = [];
    step.frames.forEach((_, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setFilmFrame(i), i * perFrame));
    });
    timers.push(
      setTimeout(() => {
        // enterPhoneAfter: hết khung cuối là vào thẳng điện thoại (gọi
        // onDone), không cần bước "cta" (nút đỏ) nào ở giữa nữa.
        if (step.enterPhoneAfter) onDone();
        else setRevealed((r) => r + 1);
      }, step.frames.length * perFrame),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // v17: cập nhật "màn nền cuốn phim" — titleCard/filmReel bật cinemaOn;
  // filmReel còn ghi nhận frames của nó (titleCard thì không, chỉ có chữ);
  // sang choices/cta thì GIỮ NGUYÊN cả 2 (kế thừa màn cinema đang chiếu
  // dở); sang bất kỳ step nào khác (msgs/reveal/letter/...) thì clear hết,
  // quay lại khung chat sáng bình thường.
  // DÙNG useLayoutEffect (không phải useEffect) — chạy ĐỒNG BỘ ngay sau
  // render, TRƯỚC KHI trình duyệt vẽ lên màn hình. Với useEffect thường,
  // có 1 khung hình render ra TRƯỚC khi effect này kịp chạy — lúc đó
  // `revealed` đã trỏ sang step mới nhưng cinemaFrames/cinemaOn vẫn còn
  // giá trị CŨ, rơi vào đúng lúc cả "titleCard" lẫn "cinemaFrames" đều sai
  // => tạm hiện nhầm .chatWrap sáng (nền trắng/xanh nhạt của .stage) trong
  // đúng 1 khung hình rồi mới nhảy lại đúng — chính là hiện tượng "giật
  // trắng". useLayoutEffect chặn việc vẽ cho tới khi effect chạy xong, nên
  // khung hình sai đó không bao giờ được vẽ ra nữa.
  useLayoutEffect(() => {
    const step = steps[revealed];
    if (!step) return;
    if (step.type === "titleCard") {
      setCinemaOn(true);
      setCinemaFrames(null);
      setCinemaVariant(undefined);
    } else if (step.type === "filmReel") {
      setCinemaOn(true);
      setCinemaFrames(step.frames);
      setCinemaVariant(step.variant);
    } else if (step.type !== "choices" && step.type !== "cta" && step.type !== "cinemaCaption") {
      setCinemaOn(false);
      setCinemaFrames(null);
      setCinemaVariant(undefined);
    }
    // "choices"/"cta"/"cinemaCaption": GIỮ NGUYÊN cinemaFrames/cinemaOn/
    // cinemaVariant — cinemaCaption chỉ đổi CHỮ hiện ra, ảnh/track đứng yên
    // tuyệt đối, không re-render lại <img> nào (xem phần render bên dưới).
  }, [revealed, steps]);

  useEffect(() => {
    onCinemaModeChange?.(cinemaOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cinemaOn]);

  // "filmReel" KHÔNG nằm trong dòng chat — nó chiếm toàn màn hình riêng (xem
  // render bên dưới), nên không đi qua log cuộn này, và cũng không để lại gì
  // trong log sau khi chạy xong (khác "reveal"/"letter" vẫn ghim lại).
  const logEntries = steps
    .map((s, idx) => ({ s, idx }))
    .slice(0, revealed + 1)
    .filter(
      (e): e is { s: LogStep; idx: number } =>
        e.s.type === "msgs" ||
        e.s.type === "tinderReveal" ||
        e.s.type === "appReveal" ||
        e.s.type === "reveal" ||
        e.s.type === "letter" ||
        // Lựa chọn đã bấm rồi (không phải bước hiện tại) — hiện lại thành
        // bong bóng xanh thay vì biến mất khỏi log.
        (e.s.type === "choices" && e.idx < revealed),
    );

  // v17: khung đang "đóng băng" để làm nền cho choices/cta ngay sau 1
  // filmReel — bằng khung cuối cùng của nó (0 nếu đang thật sự chạy, dùng
  // filmFrame như bình thường).
  const cinemaFrameIdx = current?.type === "filmReel" ? filmFrame : (cinemaFrames?.length ?? 1) - 1;

  // JSX nút lựa chọn/cta dùng chung cho cả 2 chỗ (trong khung chat sáng
  // bình thường, HOẶC đè lên nền cuốn phim tối — xem bên dưới).
  const choiceButtons = (
    <>
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
          {current.options.map((opt) => {
            const label = typeof opt === "string" ? opt : opt.label;
            const goto = typeof opt === "string" ? undefined : opt.goto;
            return (
              <button
                key={label}
                type="button"
                className={styles.choice}
                onClick={() => {
                  setChosenOption((m) => ({ ...m, [revealed]: label }));
                  // Có "goto" thì nhảy tới bước có id trùng (rẽ nhánh thật);
                  // không thì giữ hành vi cũ — sang bước kế tiếp.
                  const targetIdx = goto ? steps.findIndex((st) => st.id === goto) : -1;
                  setRevealed(targetIdx >= 0 ? targetIdx : revealed + 1);
                }}
              >
                {label}
              </button>
            );
          })}
          {/* Bàn tay gợi ý nằm ngoài nút (sibling cuối, z-index cao) — để
              trong nút thì bị nút thứ 2 đè lên vì nó tràn ra ngoài khung
              nút đầu. */}
          <span className={styles.choiceHint}>👆</span>
        </div>
      )}
    </>
  );

  return (
    <div className={styles.stage}>
      <div className={styles.top}>
        {/* v17: ẩn hẳn doodle + icon mắt (màu xanh thiết kế cho nền xanh
            nhạt) lúc đang cinema — trên nền tối gần đen 2 icon xanh dương
            nổi bật lên gây chói mắt, không hợp cảnh. Nút Download vẫn giữ
            nguyên (luôn cần hiện, màu đỏ-hồng sẵn đã tương phản tốt). */}
        {!cinemaOn && (
          <svg className={styles.doodle} viewBox="0 0 150 60" fill="none">
            <path
              d="M10 30c8-18 32-18 40 0s32 18 40 0M95 20h45"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
        <div className={styles.topRight}>
          <button type="button" className={styles.download} onClick={openLinkApp}>
            ⬇ Download
          </button>
          {!cinemaOn && (
            <svg className={styles.eyeIcon} viewBox="0 0 40 24" fill="none">
              <path
                d="M2 12c4-8 12-10 18-10s14 2 18 10c-4 8-12 10-18 10S6 20 2 12z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="20" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </div>
      </div>

      {/* v17: "titleCard" — thẻ tiêu đề mở phim (tên 2 nhân vật + giới
          thiệu ngắn), hiện trước "filmReel", cùng nền tối/sprocket cho
          đồng bộ. Tự chuyển sang filmReel sau TITLECARD_MS, không cần
          người chơi bấm gì. */}
      {current?.type === "titleCard" ? (
        // key cố định riêng cho nhánh titleCard — ép React UNMOUNT hẳn
        // (không tái dùng DOM node) khi chuyển sang nhánh filmReel bên
        // dưới, để animation fade-in của .reelMain chắc chắn chạy lại mỗi
        // lần (trước đó React có thể tái dùng cùng 1 node div nên animation
        // không replay, gây cảm giác giật/cắt cảnh).
        <div key="cinema-titlecard" className={styles.reelStage}>
          <div className={styles.reelSprocket} />
          <div className={styles.titleCardMain}>
            <h2 className={`${styles.titleCardTitle} ${styles.on}`}>{current.title}</h2>
            {current.subtitle && (
              <p className={`${styles.titleCardSubtitle} ${styles.on}`}>{current.subtitle}</p>
            )}
          </div>
          <div className={styles.reelSprocket} />
        </div>
      ) : /* v17: "filmReel" chiếm TOÀN màn hình, thay hẳn cho khung chat lúc
          đang chạy — nền tối kiểu rạp phim, dải phim có lỗ sprocket 2 bên,
          khung ảnh trôi ngang liên tục, phụ đề đồng bộ theo khung đang ở
          giữa. Nền này GIỮ NGUYÊN (đóng băng ở khung cuối) suốt choices/cta
          ngay sau đó — xem cinemaFrames — 2 nút hiện đè lên luôn, không cắt
          đột ngột về khung chat sáng. */
      cinemaFrames ? (
        <div key="cinema-filmreel" className={styles.reelStage}>
          {/* Cả khối sprocket+track+sprocket+caption được GOM lại và canh
              giữa theo chiều dọc trong phần còn lại phía trên nút — track
              có chiều cao CỐ ĐỊNH (không còn flex:1 chiếm hết màn hình) nên
              cả khối thu nhỏ, nổi giữa màn thay vì đẩy caption sát đáy. */}
          <div className={styles.reelMain}>
            {cinemaVariant === "letter" ? (
              /* v17: cảnh "đọc thư" — CHỈ 1 ảnh duy nhất (tay viết thư),
                 đứng yên suốt cảnh, không đổi theo khung nữa. Chữ thì
                 CỘNG DỒN xuống dưới — câu cũ không biến mất khi câu mới
                 hiện, đọc như cả lá thư đang dần lộ ra. Dòng MỚI nhất mới
                 có hiệu ứng fade in (nhờ key={i} ổn định — React không
                 remount lại các dòng cũ nên animation "opacity 0→1 1 lần
                 lúc mount" của chúng không chạy lại). */
              <>
                <div className={styles.reelSprocket} />
                <div className={styles.letterReelBody}>
                  <div className={styles.letterReelThumbWrap}>
                    <img className={styles.letterReelThumb} src={cinemaFrames[0]?.src} alt="" />
                  </div>
                  <div className={styles.letterReelTextStack}>
                    {cinemaFrames.slice(0, cinemaFrameIdx + 1).map((f, i) => (
                      <p key={i} className={styles.letterReelText}>
                        {f.caption}
                      </p>
                    ))}
                  </div>
                </div>
                <div className={styles.reelSprocket} />
              </>
            ) : (
              <>
                <div className={styles.reelSprocket} />
                <div className={styles.reelTrack}>
                  <div
                    className={styles.reelTrackInner}
                    style={{ transform: `translateX(calc(-${cinemaFrameIdx} * (82% + 12px) + 9%))` }}
                  >
                    {cinemaFrames.map((f, i) => (
                      <div key={i} className={`${styles.reelFrame} ${i === cinemaFrameIdx ? styles.reelFrameOn : ""}`}>
                        <img className={styles.reelImg} src={f.src} alt="" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.reelSprocket} />
                <div className={styles.reelCaptionWrap}>
                  {/* v17: "cinemaCaption" chỉ đổi CHỮ ở đây — track/ảnh phía
                      trên không hề đụng tới (vẫn đúng cinemaFrames/
                      cinemaFrameIdx cũ), nên ảnh đứng yên tuyệt đối, không
                      giật/nháy khi chuyển từ choices sang bước phản ứng. */}
                  <p
                    key={current?.type === "cinemaCaption" ? "cinemaCaption" : cinemaFrameIdx}
                    className={`${styles.reelCaption} ${styles.on}`}
                  >
                    {current?.type === "cinemaCaption" ? current.text : cinemaFrames[cinemaFrameIdx]?.caption}
                  </p>
                  {cinemaFrames.length > 1 && (
                    <div className={styles.filmDots}>
                      {cinemaFrames.map((_, i) => (
                        <span key={i} className={i === cinemaFrameIdx ? styles.filmDotOn : styles.filmDot} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {/* v17: khoang CỐ ĐỊNH chiều cao ở đáy, LUÔN chiếm chỗ (kể cả lúc
              rỗng khi đang filmReel) — để .reelMain phía trên không bị đổi
              kích thước/giật hình mỗi khi 2 nút xuất hiện; nút chỉ fade +
              trượt lên trong khoang có sẵn, không đẩy layout. */}
          <div className={styles.reelButtonSlot}>{choiceButtons}</div>
        </div>
      ) : (
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

            if (s.type === "letter") {
              return (
                <div key={idx} className={`${styles.letterCard} ${styles.on}`}>
                  <span className={styles.letterQuote}>“</span>
                  <p className={styles.letterText}>{s.text}</p>
                  {s.signature && <span className={styles.letterSignature}>{s.signature}</span>}
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
      )}

      {/* cinemaOn (titleCard/filmReel/choices-cta kế thừa) đã tự render
          choiceButtons BÊN TRONG .reelStage ở trên rồi (đè lên nền cuốn
          phim) — ở đây chỉ còn case "không cinema" (các case khác 07-10,
          hoặc intro bình thường). */}
      {!cinemaOn && choiceButtons}

      {/* Thanh nhập tin nhắn trang trí, luôn hiện ở đáy giống bản gốc — chat
          tự chạy, không thật sự gõ được, nhưng giữ đúng cảm giác đang nhắn
          tin với Casey suốt màn intro. Ẩn lúc đang chiếu "cuốn phim" full
          màn hình (không hợp cảnh). */}
      {!cinemaOn && (
        <div className={styles.fakeInputRow}>
          <div className={styles.fakeInput}>Message</div>
          <div className={styles.fakeSend}>↑</div>
        </div>
      )}
    </div>
  );
}
