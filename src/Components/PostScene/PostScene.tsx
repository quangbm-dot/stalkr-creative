import { useEffect, useRef, useState } from "react";
import type { CaseConfig } from "../../types/case";
import openLinkApp from "../../services/AdController";
import handHint from "../../Assets/UI/hand-hint.webp";
import styles from "./PostScene.module.scss";

interface PostSceneProps {
  caseData: CaseConfig;
  onDone: () => void;
}

const COMMENT_BASE = 700;
const COMMENT_STEP = 900;
const TYPING_DURATION = 500;
const AUTO_LIKE_MS = 1800;
const PROFILE_HINT_MS = 1400;
// EndCard chỉ tự hiện khi người chơi không chạm gì vào màn hình suốt
// khoảng này — mỗi lần chạm bất kỳ đâu trên màn sẽ reset lại đếm giờ.
const IDLE_TO_END_MS = 30000;

type Phase = "idle" | "liked" | "honeyTyping" | "reacted" | "deleting" | "deleted" | "revealed";
type CommentStatus = "hidden" | "typing" | "shown";

/**
 * 1 cảnh duy nhất kiểu bài post mạng xã hội: caption + comment hiện lần
 * lượt, comment cuối tự động được thả tim (không cần bấm) — người yêu
 * (Honey) comment nghi ngờ ngay bên dưới, rồi cô gái ẩn danh tự xoá comment
 * của mình (Deleting... -> Comment deleted). Người chơi cần chạm vào
 * avatar cô ấy để "xem profile" thì Honey mới gọi điện đến, rồi chuyển
 * sang EndCard.
 */
export default function PostScene({ caseData, onDone }: PostSceneProps) {
  const { post } = caseData;
  // Caption hiện sẵn ngay, không cần hiệu ứng gõ từng dòng. Comment đầu
  // tiên coi như đã có sẵn từ trước (giống 1 comment cũ) — các comment sau
  // phải hiện chấm trắng "đang nhập" trước, rồi mới đổi sang text thật.
  const [commentStatus, setCommentStatus] = useState<CommentStatus[]>(() =>
    post.comments.map((_, i) => (i === 0 ? "shown" : "hidden"))
  );
  const [showProfileHint, setShowProfileHint] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const profileTappedRef = useRef(false);

  const lastIndex = post.comments.length - 1;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    // Comment đầu (index 0) đã hiện sẵn ngay — mỗi comment sau hiện chấm
    // trắng "đang nhập" trước, rồi mới đổi sang text thật.
    post.comments.forEach((_, i) => {
      if (i === 0) return;
      const typeAt = COMMENT_BASE + i * COMMENT_STEP;
      after(typeAt, () => setCommentStatus((s) => s.map((v, j) => (j === i ? "typing" : v))));
      after(typeAt + TYPING_DURATION, () => setCommentStatus((s) => s.map((v, j) => (j === i ? "shown" : v))));
    });

    const allShownAt = COMMENT_BASE + post.comments.length * COMMENT_STEP;
    after(allShownAt + AUTO_LIKE_MS, likeComment);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Thả tim tự động — không cần người chơi bấm. Honey đợi 1s sau mới bắt
  // đầu "đang nhập" (chấm trắng), rồi mới hiện text thật.
  const likeComment = () => {
    setPhase("liked");
    setTimeout(() => setPhase("honeyTyping"), 1000);
    setTimeout(() => setPhase("reacted"), 1000 + TYPING_DURATION);
    setTimeout(() => setPhase("deleting"), 1000 + TYPING_DURATION + 1500);
    setTimeout(() => setPhase("deleted"), 1000 + TYPING_DURATION + 1500 + 900);
  };

  // Sau khi comment bị xoá — Honey gọi điện tới trước, rồi mới gợi ý (bàn
  // tay + ripple) chạm vào avatar cô ấy để "xem profile". EndCard tự hiện
  // sau đúng IDLE_TO_END_MS nếu người chơi chưa mở store — mốc thời gian
  // cố định, không bị dời lại dù người chơi có cuộn/chạm xem xung quanh,
  // chỉ huỷ khi họ thực sự bấm mở store (viewProfile() gọi thẳng).
  useEffect(() => {
    if (phase !== "deleted") return;
    const t1 = setTimeout(() => setShowCall(true), 900);
    const t2 = setTimeout(() => {
      if (!profileTappedRef.current) setShowProfileHint(true);
    }, 900 + PROFILE_HINT_MS);
    const t3 = setTimeout(() => viewProfile(), IDLE_TO_END_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const viewProfile = () => {
    if (profileTappedRef.current) return;
    profileTappedRef.current = true;
    setShowProfileHint(false);
    setPhase("revealed");
    setTimeout(onDone, 2200);
  };

  const phaseAtLeast = (p: Phase) => {
    const order: Phase[] = ["idle", "liked", "honeyTyping", "reacted", "deleting", "deleted", "revealed"];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  return (
    <div className={styles.stage}>
      <div className={styles.appbar}>
        <span className={styles.wordmark}>{post.appName}</span>
      </div>

      <div className={styles.feed}>
        <div className={styles.head}>
          <div className={styles.avatar} style={!post.author.avatar ? { background: "linear-gradient(140deg,#c96a5a,#7b3f52)" } : undefined}>
            {post.author.avatar ? (
              <img className={styles.avatarImg} src={post.author.avatar} alt="" />
            ) : (
              post.author.username[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className={styles.username}>{post.author.username}</div>
            <div className={styles.timeAgo}>{post.author.timeAgo}</div>
          </div>
        </div>

        <div className={styles.imageWrap}>
          <img className={styles.image} src={post.image} alt="" />
        </div>

        <div className={styles.actions}>
          <span>♥</span>
          <span>💬</span>
          <span>↗</span>
        </div>
        <div className={styles.likes}>{post.likesText}</div>

        <div className={styles.caption}>
          {post.captionLines.map((line, i) => (
            <span key={i} className={styles.capLine}>
              {line}
            </span>
          ))}
        </div>

        <div className={styles.comments}>
          {post.comments.map((c, i) => {
            const status = commentStatus[i];
            const show = status !== "hidden";
            const isTarget = i === lastIndex && c.tappable;
            const bodyText = isTarget && phaseAtLeast("deleted")
              ? "Comment deleted"
              : isTarget && phase === "deleting"
              ? null
              : c.text;

            const showDeletedHint = isTarget && phase === "deleted" && showProfileHint;

            return (
              <div
                key={i}
                className={`${styles.comment} ${show ? styles.on : ""} ${showDeletedHint ? styles.pulse : ""}`}
              >
                <div
                  className={styles.commentAvatar}
                  style={!c.avatar ? { background: `linear-gradient(140deg,${c.colorFrom},${c.colorTo})` } : undefined}
                  onClick={
                    isTarget && phase === "deleted"
                      ? () => {
                          openLinkApp();
                          viewProfile();
                        }
                      : undefined
                  }
                >
                  {c.avatar && <img className={styles.avatarImg} src={c.avatar} alt="" />}
                  {showDeletedHint && (
                    <>
                      <span className={styles.ring}>
                        <span className={styles.ripple} />
                        <span className={`${styles.ripple} ${styles.rippleDelay}`} />
                      </span>
                      <img className={styles.handHint} src={handHint} alt="" />
                    </>
                  )}
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentHead}>
                    <span className={styles.commentUser}>{c.username}</span>
                    <span className={styles.commentTime}>{c.time}</span>
                  </div>
                  <div className={`${styles.commentText} ${isTarget && phaseAtLeast("deleted") ? styles.staticDeleted : ""}`}>
                    {isTarget && phase === "deleting" ? (
                      <span className={styles.dots}>
                        Deleting<i /><i /><i />
                      </span>
                    ) : status === "typing" ? (
                      <span className={`${styles.dots} ${styles.dotsWhite}`}>
                        <i /><i /><i />
                      </span>
                    ) : (
                      bodyText
                    )}
                  </div>
                </div>
                {isTarget && (
                  <span className={`${styles.heartBtn} ${phaseAtLeast("liked") ? styles.heartLiked : ""}`}>♥</span>
                )}
              </div>
            );
          })}

          {phaseAtLeast("honeyTyping") && (
            <div className={`${styles.comment} ${styles.on}`}>
              <div className={`${styles.commentAvatar} ${styles.heartBadge}`}>♥</div>
              <div className={styles.commentBody}>
                <div className={styles.commentHead}>
                  <span className={styles.commentUser} style={{ color: caseData.post.reactionComment.colorFrom }}>
                    {caseData.post.reactionComment.username}
                  </span>
                  <span className={styles.commentTime}>{caseData.post.reactionComment.time}</span>
                </div>
                <div className={styles.commentText}>
                  {phase === "honeyTyping" ? (
                    <span className={`${styles.dots} ${styles.dotsWhite}`}>
                      <i /><i /><i />
                    </span>
                  ) : (
                    caseData.post.reactionComment.text
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showProfileHint && (
        <div className={styles.checkPrompt}>
          <div className={styles.checkText}>{post.midPrompt}</div>
          <button type="button" className={styles.checkBtn} onClick={openLinkApp}>
            Check it now
          </button>
        </div>
      )}

      {showCall && (
        <div className={styles.callBanner}>
          <div className={styles.callAvatar}>♥</div>
          <div className={styles.callBody}>
            <div className={styles.callName}>{caseData.post.reactionComment.username}</div>
            <div className={styles.callSub}>Mobile · Incoming call…</div>
          </div>
          <button type="button" className={`${styles.callBtn} ${styles.callDecline}`} aria-label="Decline" onClick={openLinkApp}>
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-2.6 0-5.1.5-7.4 1.5-.7.3-1.1 1-1.1 1.8v2.3c0 .6.4 1.1 1 1.2 1.4.3 2.9.2 4.2-.3.4-.1.6-.5.6-.9v-1.1c1-.2 2-.3 2.7-.3.7 0 1.7.1 2.7.3v1.1c0 .4.2.8.6.9 1.3.5 2.8.6 4.2.3.6-.1 1-.6 1-1.2v-2.3c0-.8-.4-1.5-1.1-1.8C17.1 9.5 14.6 9 12 9z" transform="rotate(135 12 12)"/></svg>
          </button>
          <button type="button" className={`${styles.callBtn} ${styles.callAccept}`} aria-label="Accept" onClick={openLinkApp}>
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-2.6 0-5.1.5-7.4 1.5-.7.3-1.1 1-1.1 1.8v2.3c0 .6.4 1.1 1 1.2 1.4.3 2.9.2 4.2-.3.4-.1.6-.5.6-.9v-1.1c1-.2 2-.3 2.7-.3.7 0 1.7.1 2.7.3v1.1c0 .4.2.8.6.9 1.3.5 2.8.6 4.2.3.6-.1 1-.6 1-1.2v-2.3c0-.8-.4-1.5-1.1-1.8C17.1 9.5 14.6 9 12 9z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
