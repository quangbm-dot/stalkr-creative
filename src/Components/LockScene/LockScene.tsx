import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CaseConfig } from "../../types/case";
import openLinkApp from "../../services/AdController";
import iconChat from "../../Assets/UI/messages-icon.webp";
import fillerRyan from "../../Assets/UI/avatar-ryan.jpg";
import fillerMia from "../../Assets/UI/avatar-mia-grace.jpg";
import fillerChloe from "../../Assets/UI/avatar-chloe-wxx.jpg";
import fillerUnknown from "../../Assets/UI/avatar-unknown-94.jpg";
import fillerHome from "../../Assets/UI/home.jpg";
import fillerPost from "../../Assets/UI/post.jpg";
import capScreenPhoto from "../../Assets/UI/cap-screen.webp";
import billPhoto from "../../Assets/UI/bill.webp";
import styles from "./LockScene.module.scss";

interface LockSceneProps {
  caseData: CaseConfig;
}

type Phase =
  | "locked"
  | "notif"
  | "unlocking"
  | "inbox"
  | "chatN"
  | "honeyBanner"
  | "honeyTapped"
  | "chatHoney"
  | "gallery"
  | "choices";

const FILLER_THREADS = [
  { name: "Mom", preview: "Call me when you land ❤️", time: "1h" },
  { name: "Work Group", preview: "Meeting moved to 2pm", time: "2h" },
  { name: "Bro", preview: "Bro we still on for tonight?", time: "3h" },
];

/** Câu bóng gió cô lạ nhắn ngay sau khi gửi ảnh check-in. */
const N_HISTORY = [{ me: false, text: "today was amazing 😏" }];

/** Tin nhắn cũ trong đoạn chat với người yêu — trước khi bị gửi nhầm ảnh. */
const HONEY_HISTORY = [
  { me: true, text: "morning babe" },
  { me: false, text: "morning! coffee later?" },
  { me: true, text: "for sure ❤️" },
];

/** Icon hài hước cho 2 nút đáp án cuối game. */
const CHOICE_EMOJIS = ["😅", "😏"];

/** Ảnh "linh tinh" có sẵn trong máy — dùng làm nền cho bộ chọn ảnh. */
const FILLER_PHOTOS = [fillerRyan, fillerMia, fillerChloe, fillerUnknown, fillerHome, fillerPost, fillerMia];

/** 9 ô trong bộ chọn ảnh — ảnh chụp màn hình mới chụp nằm đầu album (ảnh mới
 *  nhất), sát ngay cạnh ảnh hoá đơn nên rất dễ quẹt chọn nhầm cả 2. */
const GALLERY_ITEMS: { kind: "bill" | "screenshot" | "filler"; img?: string }[] = [
  { kind: "screenshot" },
  { kind: "bill" },
  { kind: "filler", img: FILLER_PHOTOS[0] },
  { kind: "filler", img: FILLER_PHOTOS[1] },
  { kind: "filler", img: FILLER_PHOTOS[2] },
  { kind: "filler", img: FILLER_PHOTOS[3] },
  { kind: "filler", img: FILLER_PHOTOS[4] },
  { kind: "filler", img: FILLER_PHOTOS[5] },
  { kind: "filler", img: FILLER_PHOTOS[6] },
];

function BillMock({ variant }: { variant: "grid" | "bubble" }) {
  return (
    <img
      className={`${styles.screenshotPhoto} ${variant === "bubble" ? styles.mockBubble : styles.mockGrid}`}
      src={billPhoto}
      alt=""
    />
  );
}

function ScreenshotMock({ variant }: { variant: "grid" | "bubble" }) {
  return (
    <img
      className={`${styles.screenshotPhoto} ${variant === "bubble" ? styles.mockBubble : styles.mockGrid}`}
      src={capScreenPhoto}
      alt=""
    />
  );
}

/** Tự cuộn khung chat xuống tin mới nhất mỗi khi có tin/ảnh mới hiện ra —
 *  video autoplay nên người xem không tự cuộn tay được. */
function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [dep]);
  return ref;
}

/** 1 dòng chat hiện "đang nhập" trước rồi mới hiện chữ, thay vì bung hết 1 lúc. */
function TypingLine({
  step,
  dotsAt,
  textAt,
  me,
  children,
}: {
  step: number;
  dotsAt: number;
  textAt: number;
  me: boolean;
  children: ReactNode;
}) {
  const showAt = me ? textAt : dotsAt;
  if (step < showAt) return null;
  const showText = me || step >= textAt;
  return (
    <div className={`${me ? styles.bubbleMe : styles.bubbleThem} ${styles.on} ${styles.bubbleText}`}>
      {showText ? (
        children
      ) : (
        <span className={styles.dots}>
          <i /><i /><i />
        </span>
      )}
    </div>
  );
}

/**
 * v6 opener: khoá máy nhận tin ảnh từ 1 số lạ → mở khoá → xem đoạn chat với
 * cô ấy, cô ấy gửi kèm số điện thoại dặn chụp màn hình lại rồi tự xoá tin →
 * người yêu nhắn nhờ gửi lại hoá đơn hôm qua → mở đoạn chat, bấm nút đính
 * kèm ảnh, chọn nhầm cả ảnh chụp màn hình nằm sát cạnh hoá đơn trong album
 * → gửi nhầm cho người yêu → tới màn 2 lựa chọn trả lời (EndCard) lồng ngay
 * trong khung chat.
 */
export default function LockScene({ caseData }: LockSceneProps) {
  const [phase, setPhase] = useState<Phase>("locked");
  const [nStep, setNStep] = useState(0);
  const [honeyIntroStep, setHoneyIntroStep] = useState(0);
  const [galleryStep, setGalleryStep] = useState(0);
  const [honeyStep, setHoneyStep] = useState(0);
  const { mishap } = caseData;
  const nChatRef = useAutoScroll(nStep);
  const honeyChatRef = useAutoScroll(`${honeyIntroStep}-${galleryStep}-${honeyStep}`);
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    at(800, () => setPhase("notif"));
    at(2600, () => setPhase("unlocking"));
    at(3200, () => setPhase("inbox"));
    at(4700, () => setPhase("chatN"));
    at(21700, () => setPhase("honeyBanner"));
    at(23700, () => setPhase("honeyTapped"));
    at(24300, () => setPhase("chatHoney"));
    at(30100, () => setPhase("gallery"));
    at(37700, () => setPhase("choices"));

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đoạn chat với N: ảnh check-in hiện trước, rồi cô ấy nhắn kèm số điện
  // thoại, được thả tim, Kai chụp màn hình lại, cô ấy xoá tin, xong Kai mới
  // nhắn lại.
  useEffect(() => {
    if (phase !== "chatN") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    at(1300, () => setNStep(1)); // ảnh check-in hiện trước tiên
    at(2600, () => setNStep(2)); // dots trước câu bóng gió
    at(3800, () => setNStep(3)); // câu bóng gió
    at(5000, () => setNStep(4)); // dots trước số đt
    at(6200, () => setNStep(5)); // số đt
    at(7600, () => setNStep(6)); // dots trước lời dặn
    at(8800, () => setNStep(7)); // lời dặn
    at(10000, () => setNStep(8)); // thả tim lời dặn
    at(11500, () => setNStep(9)); // Kai chụp màn hình
    at(13300, () => setNStep(10)); // ảnh + số bị xoá
    at(14300, () => setNStep(11)); // Kai đang nhập
    at(15300, () => setNStep(12)); // Kai gửi
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Đoạn chat với người yêu: từng tin nhắn cũ hiện lần lượt (có "đang nhập"
  // trước tin của cô ấy), rồi mới tới tin nhờ gửi lại hoá đơn.
  useEffect(() => {
    if (phase !== "chatHoney") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    at(500, () => setHoneyIntroStep(1));
    at(1200, () => setHoneyIntroStep(2));
    at(2200, () => setHoneyIntroStep(3));
    at(2900, () => setHoneyIntroStep(4));
    at(3600, () => setHoneyIntroStep(5));
    at(4600, () => setHoneyIntroStep(6));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Bộ chọn ảnh mở ra từ đoạn chat với người yêu: ảnh chụp màn hình (mới
  // nhất) đã tự tích sẵn ngay khi mở, xong mới chọn tiếp đúng ảnh hoá đơn
  // rồi bấm Gửi.
  useEffect(() => {
    if (phase !== "gallery") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    at(1000, () => setGalleryStep(1));
    at(2000, () => setGalleryStep(2));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Sau khi 2 ảnh gửi nhầm đã nằm trong đoạn chat: đợi 1 lúc người yêu mới
  // phát hiện (thả icon ngạc nhiên), rồi "đang nhập" — ngay trong lúc đó
  // Kai mới xoá ảnh đi, nhưng cô ấy đã kịp thấy nên câu nghi ngờ vẫn tới.
  useEffect(() => {
    if (galleryStep !== 2) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    at(1800, () => setHoneyStep(1));
    at(2800, () => setHoneyStep(2));
    at(3800, () => setHoneyStep(3));
    at(5000, () => setHoneyStep(4));
    return () => timers.forEach(clearTimeout);
  }, [galleryStep]);

  const order: Phase[] = [
    "locked",
    "notif",
    "unlocking",
    "inbox",
    "chatN",
    "honeyBanner",
    "honeyTapped",
    "chatHoney",
    "gallery",
    "choices",
  ];
  const phaseAtLeast = (p: Phase) => order.indexOf(phase) >= order.indexOf(p);
  const isLocked = !phaseAtLeast("unlocking");
  const showingChatN = phase === "chatN" || phase === "honeyBanner" || phase === "honeyTapped";
  const showingInbox = phase === "unlocking" || phase === "inbox";
  const showingHoney = phaseAtLeast("chatHoney");
  const showingGallery = phase === "gallery" && galleryStep < 2;

  return (
    <div className={styles.stage}>
      {isLocked && (
        <div className={styles.lockLayer}>
          <img className={styles.wallpaper} src={caseData.homeWallpaper} alt="" />
          <div className={styles.scrim} />

          <div className={styles.clock}>
            <span className={styles.time}>{time}</span>
            <span className={styles.date}>{date}</span>
          </div>

          {phase === "notif" && (
            <div className={styles.notif}>
              <img className={styles.notifIcon} src={iconChat} alt="" />
              <div className={styles.notifBody}>
                <div className={styles.notifHead}>
                  <span className={styles.notifSender}>{mishap.senderName}</span>
                  <span className={styles.notifTime}>now</span>
                </div>
                <div className={styles.notifText}>sent a photo</div>
              </div>
              <img className={styles.notifThumb} src={mishap.photo} alt="" />
            </div>
          )}
        </div>
      )}

      {phaseAtLeast("unlocking") && (
        <div className={`${styles.chatWrap} ${phase === "unlocking" ? styles.chatWrapIn : ""}`}>
          {showingInbox && (
            <>
              <div className={styles.inboxHeader}>Messages</div>
              <div className={styles.inboxList}>
                <div className={`${styles.inboxRow} ${styles.inboxRowUnread}`}>
                  <span className={`${styles.inboxAvatar} ${styles.avatarN}`}>{mishap.senderName[0]}</span>
                  <div className={styles.inboxBody}>
                    <div className={styles.inboxHead}>
                      <span className={styles.inboxName}>{mishap.senderName}</span>
                      <span className={styles.inboxTime}>now</span>
                    </div>
                    <div className={styles.inboxPreviewRow}>
                      <span className={styles.inboxPreview}>sent a photo</span>
                      <img className={styles.inboxThumb} src={mishap.photo} alt="" />
                    </div>
                  </div>
                  <span className={styles.inboxDot} />
                </div>
                {FILLER_THREADS.map((t) => (
                  <div key={t.name} className={styles.inboxRow}>
                    <span className={styles.inboxAvatar}>{t.name[0]}</span>
                    <div className={styles.inboxBody}>
                      <div className={styles.inboxHead}>
                        <span className={styles.inboxName}>{t.name}</span>
                        <span className={styles.inboxTime}>{t.time}</span>
                      </div>
                      <div className={styles.inboxPreview}>{t.preview}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {showingChatN && (
            <>
              <div className={styles.chatHeader}>
                <span className={`${styles.chatAvatar} ${styles.avatarN}`}>{mishap.senderName[0]}</span>
                <span className={styles.chatName}>{mishap.senderName}</span>
              </div>
              <div className={styles.chatLog} ref={nChatRef}>
                {nStep >= 1 && (
                  <div className={`${styles.bubbleThem} ${styles.on} ${styles.bubblePhotoOnly}`}>
                    {nStep >= 10 ? (
                      <div className={styles.deletedPhoto}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                        <span>Photo deleted</span>
                      </div>
                    ) : (
                      <img className={styles.bubblePhoto} src={mishap.photo} alt="" />
                    )}
                  </div>
                )}
                <TypingLine step={nStep} dotsAt={2} textAt={3} me={false}>{N_HISTORY[0].text}</TypingLine>
                {nStep >= 4 && (
                  <div className={`${styles.bubbleThem} ${styles.on} ${styles.bubbleText}`}>
                    {nStep >= 5 ? (
                      nStep >= 10 ? (
                        <span className={styles.deletedText}>This message was deleted</span>
                      ) : (
                        `${mishap.phoneNumber} 😉`
                      )
                    ) : (
                      <span className={styles.dots}>
                        <i /><i /><i />
                      </span>
                    )}
                  </div>
                )}
                {nStep >= 6 && (
                  <div className={`${styles.bubbleThem} ${styles.on} ${styles.bubbleText} ${styles.bubbleWithReaction}`}>
                    {nStep >= 7 ? (
                      <>
                        I'm gonna delete this + the pic soon 👀 save it!
                        {nStep >= 8 && <span className={styles.msgLikeBadge}>❤️</span>}
                      </>
                    ) : (
                      <span className={styles.dots}>
                        <i /><i /><i />
                      </span>
                    )}
                  </div>
                )}
                {nStep >= 12 && (
                  <div className={`${styles.bubbleMe} ${styles.on} ${styles.bubbleText}`}>😍😍</div>
                )}
              </div>

              {nStep === 9 && <div className={styles.screenshotFlash} />}
              {nStep === 9 && (
                <div className={styles.screenshotThumb}>
                  <ScreenshotMock variant="grid" />
                </div>
              )}

              <div className={styles.composer}>
                <div className={styles.composerInput}>
                  {nStep === 11 ? "😍😍" : <span className={styles.composerPlaceholder}>Message...</span>}
                </div>
                <span className={styles.composerSend}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l18-8-8 18-2-8-8-2z" /></svg>
                </span>
              </div>
            </>
          )}

          {showingHoney && (
            <div className={styles.honeyScreen}>
              <div className={styles.chatHeader}>
                <span className={styles.chatAvatar}>❤️</span>
                <span className={styles.chatName}>{mishap.girlfriendName}</span>
              </div>
              <div className={styles.chatLog} ref={honeyChatRef}>
                <TypingLine step={honeyIntroStep} dotsAt={1} textAt={1} me>{HONEY_HISTORY[0].text}</TypingLine>
                <TypingLine step={honeyIntroStep} dotsAt={2} textAt={3} me={false}>{HONEY_HISTORY[1].text}</TypingLine>
                <TypingLine step={honeyIntroStep} dotsAt={4} textAt={4} me>{HONEY_HISTORY[2].text}</TypingLine>
                <TypingLine step={honeyIntroStep} dotsAt={5} textAt={6} me={false}>{mishap.billRequestText}</TypingLine>
                {honeyIntroStep >= 6 && galleryStep >= 2 && (
                  honeyStep >= 3 ? (
                    <div className={`${styles.bubbleMe} ${styles.on} ${styles.bubblePhotoOnly}`}>
                      <div className={styles.deletedPhoto}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                        <span>Photo deleted</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`${styles.bubbleMe} ${styles.on} ${styles.bubblePhotoOnly} ${styles.bubbleTwoUp} ${styles.bubbleWithReaction}`}>
                      <BillMock variant="bubble" />
                      <ScreenshotMock variant="bubble" />
                      {honeyStep >= 1 && <span className={styles.reactionBadge}>😮</span>}
                    </div>
                  )
                )}
                {honeyStep >= 2 && (
                  <div className={`${styles.bubbleThem} ${styles.on} ${styles.bubbleText}`}>
                    {honeyStep >= 4 ? (
                      mishap.replyText
                    ) : (
                      <span className={styles.dots}>
                        <i /><i /><i />
                      </span>
                    )}
                  </div>
                )}
              </div>

              {phase === "choices" && (
                <div className={styles.quickReplies}>
                  {caseData.endCard.choices.map((choice, i) => (
                    <button key={choice} type="button" className={styles.quickReply} onClick={openLinkApp}>
                      <span className={styles.quickReplyEmoji}>{CHOICE_EMOJIS[i]}</span>
                      {choice}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.composer}>
                <span className={`${styles.composerAttach} ${showingGallery ? styles.composerAttachHit : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </span>
                <div className={styles.composerInput}>
                  <span className={styles.composerPlaceholder}>Message...</span>
                </div>
                <span className={styles.composerSend}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l18-8-8 18-2-8-8-2z" /></svg>
                </span>
              </div>

              {showingGallery && (
                <div className={styles.gallerySheet}>
                  <div className={styles.galleryHeader}>
                    <span className={styles.galleryCancel}>Cancel</span>
                    <span className={styles.galleryTitle}>Photos</span>
                    <span className={`${styles.gallerySend} ${galleryStep >= 2 ? styles.gallerySendHit : ""}`}>Send</span>
                  </div>
                  <div className={styles.galleryGrid}>
                    {GALLERY_ITEMS.map((item, i) => {
                      const hit = item.kind === "screenshot" || (item.kind === "bill" && galleryStep >= 1);
                      return (
                        <div key={i} className={`${styles.galleryItem} ${hit ? styles.galleryItemHit : ""}`}>
                          {item.kind === "bill" && <BillMock variant="grid" />}
                          {item.kind === "screenshot" && <ScreenshotMock variant="grid" />}
                          {item.kind === "filler" && <img className={styles.galleryFillerImg} src={item.img} alt="" />}
                          {hit && <span className={styles.galleryCheck}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {(phase === "honeyBanner" || phase === "honeyTapped") && (
            <div className={`${styles.notif} ${styles.notifTop} ${phase === "honeyTapped" ? styles.notifTapped : ""}`}>
              <span className={styles.notifHeartIcon}>❤️</span>
              <div className={styles.notifBody}>
                <div className={styles.notifHead}>
                  <span className={styles.notifSender}>{mishap.girlfriendName}</span>
                  <span className={styles.notifTime}>now</span>
                </div>
                <div className={styles.notifText}>{mishap.billRequestText}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
