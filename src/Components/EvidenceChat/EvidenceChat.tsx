import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseConfig } from "../../types/case";
import Confetti from "../Confetti/Confetti";
import openLinkApp, { trackPlayableEvent } from "../../services/AdController";
import endLogo from "../../Assets/UI/icon-end-card.webp";
import styles from "./EvidenceChat.module.scss";

interface EvidenceChatProps {
  caseData: CaseConfig;
  onEvidenceFound: () => void;
  onAllSolved: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Người chơi CHỦ ĐỘNG đóng hẳn popup (nút X hoặc chạm ra ngoài) — khác với
   * "keep snooping" (cũng thu gọn popup nhưng để họ tiếp tục dò app đang mở
   * tìm manh mối): đóng hẳn thì phải về lại màn hình chính của điện thoại,
   * không kẹt trong mini app đang mở. */
  onDismiss: () => void;
  /** Đã mở đúng app chứa manh mối của câu hiện tại ít nhất 1 lần chưa — false
   * thì 4 lựa chọn hiện khoá (🔒), không bấm được, phải đi "snooping" trước. */
  unlocked: boolean;
  /** QA review (#dev) Back/Skip chỉ đổi roundIndex CỦA POPUP — state "đi tìm
   * manh mối" (hintApp/hintTarget đang sáng, bàn tay trỏ) nằm ở App.tsx, gắn
   * với evidenceFound thật, không tự theo. Không đồng bộ thì nhảy câu lúc
   * review làm bàn tay/vòng sáng trỏ nhầm app/dòng của câu TRƯỚC còn kẹt lại
   * (lỗi "bàn tay chìm" sau nền — xem App.tsx). Gọi callback này mỗi lần
   * Back/Skip để App reset lại đúng câu đang xem. */
  onDevJump?: (roundIndex: number) => void;
}

const NEXT_DELAY_MS = 2500;
const TEASER_AFTER_ROUND = 8;
// v20: không còn ô nhập thật — bấm 1 trong 4 đáp án gợi ý, chữ "chạy" dần
// ra ngay trong bong bóng "mình" (giống đang gõ), rồi mới biết đúng/sai —
// mô phỏng 1 đoạn chat thật đang diễn ra, xem Phase bên dưới.
// idle          : chưa chọn gì — hiện 4 chip, bấm để chọn.
// typingMe      : vừa bấm — bong bóng "mình" đang chạy chữ dần ra.
// sending       : chữ đã chạy xong, đứng 1 nhịp ngắn trước khi biết kết quả.
// correctTyping : đúng — bong bóng informant "đang nhập" (3 chấm).
// correctDone   : đúng — lời đáp thật đã hiện, round coi như xong.
// wrongShown    : sai — bong bóng "mình" chuyển gạch ngang/hồng + ✗.
// wrongReplying : sai — 1 câu nhắc (wrongReply) hiện ra, sắp quay lại idle.
type Phase =
  | "idle"
  | "typingMeDots"
  | "typingMe"
  | "sending"
  | "correctTyping"
  | "correctDone"
  | "wrongShown"
  | "wrongReplying";
const SEND_GAP_MS = 350;
const TYPING_THEM_MS = 900;
const WRONG_HOLD_MS = 1000;
const WRONG_REPLY_MS = 1400;
// Tốc độ chữ "chạy" dần ra trong bong bóng "mình" khi bấm chọn 1 đáp án — ms/ký tự.
const CHIP_TYPE_MS = 55;
// v20: trước khi chữ chạy ra, bong bóng "mình" hiện 3 chấm "..." 1 nhịp
// ngắn trước đã (giống hệt kiểu "đang nhập" của informant), rồi mới gõ chữ.
const TYPING_ME_DOTS_MS = 500;
// v20: câu hỏi giờ cũng "nhắn" vào khung chat như 1 tin nhắn thật — informant
// gõ 1 nhịp rồi câu hỏi mới hiện ra, thay vì nằm sẵn tĩnh trong thẻ trắng.
// round.prompt có thể gồm NHIỀU dòng (ngăn bởi "\n" trong data gốc, vd dòng
// dẫn truyện rồi mới tới câu hỏi thật) — mỗi dòng "nhắn" thành 1 bong bóng
// riêng, lần lượt, cho dễ đọc thay vì nhồi hết vào 1 bong bóng dài.
// v20: thời gian "..." của 1 dòng giờ tỉ lệ theo ĐỘ DÀI dòng đó (dòng dài
// gõ lâu hơn dòng ngắn, giống người thật gõ nhiều chữ hơn thì lâu hơn) —
// trước đây cố định 700ms/dòng bất kể dài ngắn, nên 1 dòng dài tận dụng
// đúng 700ms đó xong hiện ra nhanh y hệt dòng ngắn, có cảm giác "chữ nhiều
// mà hiện nhanh hơn chữ ít" (ngược trực giác). Base + theo ký tự, chặn trần
// để dòng quá dài cũng không bắt chờ quá lâu.
const QUESTION_TYPING_BASE_MS = 400;
const QUESTION_TYPING_PER_CHAR_MS = 12;
const QUESTION_TYPING_MAX_MS = 1500;
function questionTypingDuration(line: string): number {
  return Math.min(QUESTION_TYPING_MAX_MS, QUESTION_TYPING_BASE_MS + line.length * QUESTION_TYPING_PER_CHAR_MS);
}
// v20: 1 số case viết round.prompt thành 1 khối dài liền (không có "\n" tách
// dòng thủ công, vd câu Q1 của nhiều case) — khi đó promptLines chỉ có ĐÚNG
// 1 "dòng" rất dài, hiện "..." xong là cả khối chữ dài bật ra 1 lúc, mất hẳn
// cảm giác "đang gõ từ từ". Tự động chẻ nhỏ mọi dòng quá dài theo CÂU (dấu
// chấm/hỏi/than) thành nhiều bong bóng liên tiếp — không cần sửa lại data
// từng case, áp dụng chung cho mọi round kể cả Q1.
const LONG_LINE_SPLIT_LEN = 70;
function splitLongLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (line.length <= LONG_LINE_SPLIT_LEN) {
      out.push(line);
      continue;
    }
    const sentences = line.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) ?? [line];
    let buf = "";
    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      if (buf && buf.length + s.length + 1 > LONG_LINE_SPLIT_LEN) {
        out.push(buf);
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf) out.push(buf);
  }
  return out;
}

// v20: nghỉ 1 nhịp ngắn SAU khi 1 dòng vừa hiện xong, TRƯỚC khi dòng kế bắt
// đầu gõ — trước đây 2 việc này xảy ra chung 1 tick (dòng vừa hiện xong +
// dấu "..." dòng sau bật lên ngay lập tức), nhìn dồn dập/máy móc. Nghỉ 1
// chút cho mắt kịp đọc dòng vừa xong rồi mới thấy dòng kế bắt đầu "gõ".
const QUESTION_GAP_MS = 280;
// v20: 4 đáp án gợi ý hiện LẦN LƯỢT từng cái một (không bật hết 1 lúc cả
// khối) — mỗi đáp án cách nhau nhịp này.
const CHIP_REVEAL_STAGGER_MS = 160;

/**
 * v10: clone y hệt popup câu hỏi của V8 — 1 "thẻ câu hỏi" tĩnh (không phải
 * khung chat cuộn dần như v4/v9): header căn giữa (nút thu gọn, "Question
 * x/y", avatar+icon mắt, tên), rồi tới card trắng (Question x/y + 💡, câu
 * hỏi, 4 lựa chọn khoá), rồi nút "keep snooping his phone" để đóng lại.
 */
export default function EvidenceChat({
  caseData,
  onEvidenceFound,
  onAllSolved,
  expanded,
  onExpandedChange,
  onDismiss,
  unlocked,
  onDevJump,
}: EvidenceChatProps) {
  // Thanh QA nhanh để lướt xem nội dung mọi câu hỏi không cần tìm đúng manh
  // mối trong phone — chỉ hiện khi URL có #dev (cùng điều kiện với DevBar).
  const [devReview] = useState(() => /dev/.test(location.hash));
  const [roundIndex, setRoundIndex] = useState(0);
  // Không giới hạn tổng số gợi ý, nhưng mỗi câu chỉ dùng 1 lần (chống spam).
  const [hintUsedThisRound, setHintUsedThisRound] = useState(false);
  const [showHint, setShowHint] = useState(false);
  // v20: xem định nghĩa Phase ở trên — bước hiện tại của mô phỏng chat.
  const [phase, setPhase] = useState<Phase>("idle");
  // Nội dung bong bóng "mình" đang hiện — null khi idle, "" rồi chạy dần
  // ra chữ thật khi phase=typingMe (xem pickChip).
  const [sentText, setSentText] = useState<string | null>(null);
  // Mỗi câu chọn sai hiện 1 dòng wrongReply khác nhau (hết mảng thì lặp dòng
  // cuối) — đếm riêng theo câu, reset khi sang round mới.
  const [wrongAttempts, setWrongAttempts] = useState(0);
  // v20: các đáp án ĐÃ bị chọn sai trong round này — đáp án đó ẩn dần đi
  // khỏi khối gợi ý (không bao giờ hiện lại ở round này), còn lại vẫn chọn
  // tiếp được. Reset khi sang round mới.
  const [triedWrong, setTriedWrong] = useState<Set<string>>(new Set());
  // v20: số dòng của round.prompt ĐÃ "nhắn" xong (0 = đang gõ dòng đầu, chưa
  // hiện dòng nào) — xem effect bên dưới. questionShown = đã nhắn hết toàn
  // bộ câu hỏi (kể cả dòng dẫn truyện lẫn câu hỏi thật), lúc đó mới cho dùng
  // hint/chip/ô nhập.
  const [lineIndex, setLineIndex] = useState(0);
  // v20: true = đang ở nhịp nghỉ NGẮN giữa 2 dòng (dòng lineIndex-1 vừa
  // hiện xong, dòng lineIndex CHƯA bắt đầu gõ "..." vội) — xem effect dưới
  // + QUESTION_GAP_MS ở trên.
  const [lineGap, setLineGap] = useState(false);
  // v20: số đáp án gợi ý ĐÃ hiện ra (0..round.choices.length) — tăng dần
  // từng cái 1 sau khi câu hỏi hiện xong, xem effect bên dưới.
  const [chipsRevealed, setChipsRevealed] = useState(0);
  // v20: lịch sử các câu ĐÃ trả lời đúng trong case này — hiện lại tĩnh phía
  // trên, cuộn lên trên khi câu mới xuất hiện, giống 1 đoạn chat thật tích
  // luỹ dần thay vì xoá sạch mỗi khi sang round (điều người chơi vừa yêu
  // cầu). Đẩy vào đây đúng lúc goNext() thật sự chuyển sang round sau, để
  // không hiện trùng với đoạn trao đổi "sống" (sentText) đang đứng lại đọc.
  const [history, setHistory] = useState<
    { prompt: string; picked: string; correctReply: string; roundNum: number }[]
  >([]);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Timer chờ "..." trước khi bắt đầu gõ chữ thật (xem TYPING_ME_DOTS_MS).
  const dotsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // true ngay sau khi trả lời đúng + chuyển sang câu mới (hoặc mới vào case) —
  // người chơi CHƯA bắt đầu đi tìm manh mối của câu này, nên lần đóng popup
  // ĐẦU TIÊN ở trạng thái này phải về home (đứng lại app của câu cũ không còn
  // ý nghĩa gì nữa). Dùng 1 lần rồi tắt — các lần đóng popup SAU đó trong khi
  // đang dở tìm manh mối của CHÍNH câu này thì giữ nguyên màn hình như cũ.
  const [justAdvanced, setJustAdvanced] = useState(true);
  // Sau khi trả lời đúng câu 1 — teaser EndCard che kín toàn màn hình, có
  // nút mũi tên nhỏ ở trên để thu gọn lại, tiếp tục chơi câu 2/3.
  const [showEndTeaser, setShowEndTeaser] = useState(false);
  // Thanh câu hỏi thu gọn không còn nằm trong màn hình điện thoại nữa — nó
  // portal ra div #phone-below-bar mà PhoneFrame dựng sẵn bên dưới khung
  // điện thoại (khối riêng, nền đen). Node đó chưa có ở lần render đầu nên
  // phải đợi mount xong mới lấy được, rồi mới có gì để portal vào.
  const [belowBarNode, setBelowBarNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setBelowBarNode(document.getElementById("phone-below-bar"));
  }, []);

  // Báo cho AppLovin biết người chơi bắt đầu phần hỏi-đáp manh mối (ngay khi
  // thẻ câu hỏi đầu tiên hiện ra, cùng lúc màn "phone" mount).
  useEffect(() => {
    trackPlayableEvent("CHALLENGE_STARTED");
  }, []);

  const rounds = caseData.evidenceRounds;
  const round = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;
  // Đúng và đã/đang hiện lời đáp thật — tương đương correctPick trước đây.
  const answeredCorrectly = phase === "correctTyping" || phase === "correctDone";
  // v20: tách round.prompt thành nhiều dòng (data gốc ngăn cách bằng "\n") —
  // mỗi dòng "nhắn" thành 1 bong bóng riêng (xem lineIndex ở trên).
  const promptLines = round ? splitLongLines(round.prompt.split("\n").filter((l) => l.trim())) : [];
  const questionShown = lineIndex >= promptLines.length && promptLines.length > 0;

  // v20: CHỈ khung chat (.log) cuộn — header/ô nhập/nút snoop đứng yên cố
  // định phía trên/dưới nó (xem .sheet/.log trong scss: sheet giờ
  // overflow:hidden, log mới là vùng overflow-y:auto thật sự). Trước đây cả
  // .sheet cuộn chung 1 khối nên header/thanh dưới bị trôi lên xuống theo —
  // đó là nguyên nhân chính gây cảm giác "giật" khi có câu mới/trả lời mới.
  const logRef = useRef<HTMLDivElement>(null);
  // v20: "sending"/"wrongShown" KHÔNG thêm bong bóng mới nào — chỉ đổi màu
  // bong bóng "mình" đã có sẵn (trung tính → chờ biết kết quả). Trước đây
  // cuộn lại mỗi lần phase đổi (kể cả 2 phase này), dồn quá nhiều lần cuộn
  // "smooth" trong khoảng thời gian ngắn (vd "sending" chỉ dài 350ms) khiến
  // animation cuộn trước chưa xong đã bị 1 animation cuộn khác đè lên —
  // nhìn giật dù mỗi lần cuộn riêng lẻ đều mượt. Gộp 2 phase này lại thành
  // cùng 1 "điểm cuộn" với phase liền trước để bớt số lần cuộn thật sự.
  const scrollKey = phase === "sending" || phase === "wrongShown" ? null : phase;
  useEffect(() => {
    // v20: nguồn gốc giật thật sự hoá ra là lỗi flexbox ở .choices (đã fix
    // bằng flex-shrink:0 — xem comment ở đó), KHÔNG phải do bản thân cuộn
    // "smooth". Giờ chiều cao mỗi lần luôn tính đúng ngay từ đầu nên cuộn
    // mượt (nhẹ nhàng, có easing) là an toàn, không còn cộng dồn/chồng lấp
    // như trước. Đợi 1 khung hình (rAF) trước khi đọc scrollHeight — effect
    // chạy ngay sau commit nhưng layout của nội dung VỪA thêm (vd khối 4
    // đáp án, hoặc khối vừa co lại sau khi 1 đáp án sai bị ẩn) đôi khi chưa
    // kịp "chốt" xong trong cùng tick.
    if (!expanded) return;
    const raf = requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(raf);
  }, [expanded, roundIndex, scrollKey, lineIndex, lineGap, chipsRevealed, history.length]);

  // v20: TRƯỚC đây việc "dọn dẹp" khi sang round mới (showHint/phase/
  // sentText/lineIndex/...) nằm trong 1 useEffect phụ thuộc [roundIndex] —
  // effect chỉ chạy SAU KHI commit, nghĩa là có ĐÚNG 1 khung hình/tick mà
  // roundIndex đã là số MỚI (header "Question x/y" đã đổi) nhưng
  // phase/sentText vẫn còn là của round CŨ (bong bóng/badge câu trước vẫn
  // hiện) — đúng hiện tượng "lưng chừng" gây giật khi câu mới xuất hiện mà
  // video quay lại bắt được. Gộp hết vào 1 hàm, gọi ĐỒNG BỘ ngay tại chỗ
  // đổi roundIndex (goNext/devPrev/devSkip) — React 18 tự batch mọi setState
  // gọi cùng lúc (kể cả trong setTimeout) thành đúng 1 lần render, nên
  // roundIndex mới và mọi state dọn dẹp luôn xuất hiện CÙNG 1 khung hình.
  const resetForRound = () => {
    setShowHint(false);
    setHintUsedThisRound(false);
    setPhase("idle");
    setSentText(null);
    setWrongAttempts(0);
    setTriedWrong(new Set());
    setShowConfetti(false);
    setLineIndex(0);
    setLineGap(false);
    setChipsRevealed(0);
    if (typeTimer.current) clearInterval(typeTimer.current);
    if (dotsTimer.current) clearTimeout(dotsTimer.current);
  };

  // v20: SAU KHI câu hỏi hiện xong (questionShown), hiện lần lượt từng đáp
  // án gợi ý 1 — không bật nguyên khối 4 cái cùng lúc (nhìn đột ngột/giật so
  // với nhịp gõ-từ-từ của câu hỏi ngay phía trên).
  useEffect(() => {
    if (!expanded || !questionShown || !round) return;
    if (chipsRevealed >= round.choices.length) return;
    const t = setTimeout(() => setChipsRevealed((n) => n + 1), CHIP_REVEAL_STAGGER_MS);
    return () => clearTimeout(t);
  }, [expanded, questionShown, chipsRevealed, roundIndex]);

  // v20: lần lượt "nhắn" từng dòng của round.prompt vào khung chat — mỗi
  // dòng gõ "..." xong (thời gian tỉ lệ độ dài dòng, xem questionTypingDuration)
  // mới HIỆN dòng đó, rồi nghỉ 1 nhịp (QUESTION_GAP_MS, xem lineGap) trước
  // khi dòng kế bắt đầu gõ "..." — tránh cảnh dòng vừa hiện xong là dòng sau
  // gõ ngay lập tức trong cùng 1 tick, nhìn dồn dập. CHỈ chạy khi popup đang
  // mở (expanded) — trước đây không có điều kiện này nên Q1 thường gõ ngầm
  // xong trước khi người chơi kịp mở popup ra xem, nhìn như hiện tức thì
  // không có hiệu ứng gõ; còn Q2 trở đi thì luôn thấy vì popup đã mở sẵn
  // lúc round đổi.
  useEffect(() => {
    if (!expanded || !round) return;
    if (lineIndex >= promptLines.length) return;
    if (lineGap) {
      const t = setTimeout(() => setLineGap(false), QUESTION_GAP_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIndex((n) => n + 1);
      setLineGap(true);
    }, questionTypingDuration(promptLines[lineIndex]));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, roundIndex, lineIndex, lineGap]);

  // Sau khi trả lời đúng: đoạn chat dẫn truyện ở lại ~5s rồi tự sang câu sau.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mốc % câu đã trả lời đúng đã báo cho AppLovin rồi — mỗi mốc chỉ báo 1 lần
  // (case 3 câu có thể nhảy qua nhiều mốc cùng lúc ở 1 câu).
  const milestonesFired = useRef<Set<25 | 50 | 75>>(new Set());
  const goNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (round && sentText) {
      setHistory((h) => [
        ...h,
        { prompt: round.prompt, picked: sentText, correctReply: round.correctReply, roundNum: roundIndex + 1 },
      ]);
    }
    if (isLastRound) onAllSolved();
    else {
      resetForRound();
      setRoundIndex((r) => r + 1);
      setJustAdvanced(true);
    }
  };
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // v20: chuỗi các Phase sau khi gửi 1 đáp án — xem định nghĩa Phase ở trên.
  // "Next"/tự chuyển câu chỉ bấm được SAU khi lời đáp đúng hiện đủ
  // (correctDone), nên advanceTimer đặt trong nhánh đó, không đặt ngay lúc
  // gửi nữa.
  useEffect(() => {
    if (phase === "correctTyping") {
      const t = setTimeout(() => {
        setPhase("correctDone");
        advanceTimer.current = setTimeout(goNext, NEXT_DELAY_MS);
      }, TYPING_THEM_MS);
      return () => clearTimeout(t);
    }
    if (phase === "wrongShown") {
      const t = setTimeout(() => setPhase("wrongReplying"), WRONG_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === "wrongReplying") {
      const t = setTimeout(() => {
        // v20: đáp án vừa sai (sentText lúc này) được thêm vào triedWrong
        // NGAY lúc dọn sentText — chip của nó chuyển thẳng từ "đỏ" sang "ẩn
        // dần" trong cùng 1 nhịp, không có khoảng chớp màu thường ở giữa.
        if (sentText) setTriedWrong((s) => new Set(s).add(sentText));
        setPhase("idle");
        setSentText(null);
      }, WRONG_REPLY_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex]);

  // Đánh giá đáp án đã chạy chữ xong — giữ nguyên hệt logic so khớp/điểm/
  // milestone/confetti/teaser của bản cũ, chỉ dời phần HIỂN THỊ lời đáp ra
  // sau 1 nhịp "đang nhập" thay vì đổi ngay lập tức.
  const evaluate = (choice: string) => {
    if (!round) return;
    if (choice === round.correct) {
      onEvidenceFound();

      const pct = ((roundIndex + 1) / caseData.evidenceTotal) * 100;
      for (const m of [25, 50, 75] as const) {
        if (pct >= m && !milestonesFired.current.has(m)) {
          milestonesFired.current.add(m);
          trackPlayableEvent(`CHALLENGE_PASS_${m}`);
        }
      }
      if (isLastRound) trackPlayableEvent("CHALLENGE_SOLVED");

      // v20: rút ngắn 3000ms → 1800ms — tổng thời gian round đứng lại đọc
      // trước khi tự chuyển câu (correctTyping 900ms + correctDone chờ
      // NEXT_DELAY_MS) vẫn thừa dư để confetti tắt hẳn TRƯỚC khi câu mới
      // hiện, dù vậy vẫn reset cứng ở effect roundIndex phía trên cho chắc.
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);

      // v20: Teaser EndCard hiện sau khi xong câu thứ 8 — CHỈ khi case còn
      // câu để chơi tiếp sau đó. Trước đây case NGẮN HƠN 8 câu thì teaser
      // rơi đúng vào câu CUỐI CÙNG (Math.min(8, rounds.length)-1 = round
      // cuối), xong câu cuối là EndCard thật (App.tsx, qua onAllSolved)
      // cũng hiện gần như ngay sau đó — 2 màn "kết thúc" chồng lên nhau,
      // nhìn như lỗi hiện 2 EndCard. Giờ bỏ hẳn teaser nếu nó trùng câu
      // cuối, chỉ còn đúng 1 EndCard thật.
      if (!isLastRound && roundIndex === TEASER_AFTER_ROUND - 1) {
        setTimeout(() => setShowEndTeaser(true), 700);
      }

      setPhase("correctTyping");
    } else {
      setWrongAttempts((n) => n + 1);
      setPhase("wrongShown");
    }
  };

  // Bấm 1 trong 4 chip: không còn ô nhập thật nữa — bong bóng "mình" hiện
  // "..." (đang nhập) 1 nhịp trước (phase=typingMeDots), RỒI chữ mới chạy
  // dần ra (phase=typingMe), gõ xong đứng 1 nhịp ngắn (phase=sending) rồi
  // mới biết đúng/sai. Luôn bấm được bất kể unlocked hay chưa, y hệt hành
  // vi bản cũ (unlocked chỉ đổi bàn tay gợi ý).
  const pickChip = (choice: string) => {
    if (!round || phase !== "idle") return;
    setShowHint(false);
    if (dotsTimer.current) clearTimeout(dotsTimer.current);
    if (typeTimer.current) clearInterval(typeTimer.current);
    setPhase("typingMeDots");
    setSentText(null);

    dotsTimer.current = setTimeout(() => {
      dotsTimer.current = null;
      setPhase("typingMe");
      setSentText("");
      let i = 0;
      typeTimer.current = setInterval(() => {
        i += 1;
        setSentText(choice.slice(0, i));
        if (i >= choice.length) {
          if (typeTimer.current) clearInterval(typeTimer.current);
          typeTimer.current = null;
          setPhase("sending");
          setTimeout(() => evaluate(choice), SEND_GAP_MS);
        }
      }, CHIP_TYPE_MS);
    }, TYPING_ME_DOTS_MS);
  };

  useEffect(() => () => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    if (dotsTimer.current) clearTimeout(dotsTimer.current);
  }, []);

  const useHint = () => {
    if (hintUsedThisRound) return;
    setHintUsedThisRound(true);
    setShowHint(true);
  };

  // QA review (#dev): lướt qua mọi câu hỏi/đáp án trong case mà không cần
  // thật sự tìm đúng manh mối trong phone — không đụng tới điểm/milestone/
  // confetti/teaser của luồng chơi thật.
  const devPrev = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    resetForRound();
    setRoundIndex((r) => {
      const next = Math.max(0, r - 1);
      onDevJump?.(next);
      return next;
    });
  };
  const devSkip = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    if (isLastRound) onAllSolved();
    else {
      resetForRound();
      setRoundIndex((r) => {
        const next = r + 1;
        onDevJump?.(next);
        return next;
      });
    }
  };

  // Đóng popup (nút X, chạm ra ngoài, hoặc "keep snooping"): về home khi
  // đang ở 1 trong 2 trạng thái "chưa thật sự bắt đầu tìm câu này" —
  // correctPick (vừa đúng, sắp tự chuyển câu) hoặc justAdvanced (câu mới vừa
  // hiện, màn hình hiện tại là tàn dư của app câu TRƯỚC, không còn liên quan).
  // Ngược lại (đang dở tìm manh mối thật của câu hiện tại) thì chỉ thu gọn
  // popup, giữ nguyên màn hình đang ở — đúng yêu cầu "đâu đang làm ở đó".
  const handleDismiss = () => {
    if (answeredCorrectly || justAdvanced) {
      setJustAdvanced(false);
      onDismiss();
    } else {
      onExpandedChange(false);
    }
  };

  if (!expanded) {
    if (!belowBarNode) return null;
    return createPortal(
      <button type="button" className={styles.bar} onClick={() => onExpandedChange(true)}>
        {round && <img className={styles.barAvatar} src={round.informant.avatar} alt="" />}
        <span className={styles.barText}>
          {round ? round.prompt : "Tap to continue"}
        </span>
        <span className={styles.barBadgeWrap}>
          <span className={styles.barBadge}>
            Q{roundIndex + 1}/{caseData.evidenceTotal}
          </span>
          {/* Đã tìm thấy manh mối (unlocked) nhưng chưa quay lại trả lời —
              "peek" của bản gốc: trỏ vào đúng thanh thu gọn này để nhắc mở
              lại thẻ câu hỏi. Neo vào badge (không phải cả thanh .bar) để
              luôn bám đúng 1 điểm, không lệch theo padding/layout của bar. */}
          {unlocked && !answeredCorrectly && <span className={styles.barHint}>👆</span>}
        </span>
      </button>,
      belowBarNode,
    );
  }

  return (
    <>
      <div className={styles.backdrop} onClick={handleDismiss} />
      <div className={styles.sheet}>
        {/* v20: header dạng hàng ngang kiểu khung chat thật (back + avatar +
            tên/subtitle + coin/tim trang trí), thay cho header xếp dọc căn
            giữa kiểu thẻ tĩnh trước đây. Icon mắt (nhận diện "đang theo dõi"
            của game) giữ lại nhưng thu nhỏ thành badge đè góc avatar. */}
        <div className={styles.chatHeader}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={handleDismiss}
            aria-label="Collapse"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {round && (
            <div className={styles.headerAvatarWrap}>
              <img className={styles.headerAvatar} src={round.informant.avatar} alt={round.informant.name} />
              <span className={styles.headerEyeBadge}>
                <svg viewBox="0 0 40 24" width="13" height="8" fill="none">
                  <path
                    d="M2 12c4-8 12-10 18-10s14 2 18 10c-4 8-12 10-18 10S6 20 2 12z"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  />
                  <circle cx="20" cy="12" r="4" stroke="currentColor" strokeWidth="2.4" />
                </svg>
              </span>
            </div>
          )}

          <div className={styles.headerText}>
            {round && <span className={styles.headerName}>{round.informant.name}</span>}
            <span className={styles.headerSubtitle}>
              Question {roundIndex + 1}/{caseData.evidenceTotal}
            </span>
          </div>
        </div>

        {/* v20: tạm ẩn thanh QA Back/Skip (nút vàng) để review UI thật cho
            sạch, không bị che/rối mắt — devReview/devPrev/devSkip vẫn giữ
            nguyên, chỉ bỏ render, cần lại cho QA thì bật dòng dưới lên. */}
        {false && devReview && (
          <div className={styles.devReviewBar}>
            <button type="button" onClick={devPrev} disabled={roundIndex === 0}>
              ⏮ Back
            </button>
            <span>
              {roundIndex + 1}/{rounds.length}
            </span>
            <button type="button" onClick={devSkip}>
              {isLastRound ? "Finish ⏭" : "Skip ⏭"}
            </button>
          </div>
        )}

        {/* v20: 1 khung chat liên tục duy nhất — câu hỏi "nhắn" vào như tin
            nhắn thật (3 chấm rồi mới hiện chữ), kèm vài phương án trả lời
            mẫu hiện ngay dưới câu hỏi (như gợi ý trả lời nhanh), rồi tới
            đoạn trao đổi khi gửi — tất cả cùng 1 dòng chảy, không còn tách
            riêng ra 1 "thẻ câu hỏi" tĩnh như trước. */}
        {round && (
          <div className={styles.log} ref={logRef}>
            {/* v20: lịch sử các câu ĐÃ qua — tĩnh, không tương tác, cuộn lên
                trên như 1 đoạn chat thật thay vì biến mất mỗi khi sang câu.
                Tách prompt thành nhiều bong bóng y hệt câu đang sống (trước
                đây nhồi nguyên cục h.prompt vào 1 bong bóng, các dòng dính
                chùm vào nhau không tách được). */}
            {history.map((h, i) => {
              const lines = h.prompt.split("\n").filter((l) => l.trim());
              return (
                <div key={i} className={styles.replyChat}>
                  {/* v20: .noEntrance — lịch sử KHÔNG tự fade/trượt lúc mount
                      nữa. Đáp án đúng này vừa là đoạn chat "sống" (sentText)
                      hiện đủ xong rồi mới bị đẩy vào history ngay lúc round
                      đổi — nếu để animate lại, đúng y hệt nội dung vừa đọc
                      xong lại "bật" lên lần nữa trong cùng 1 khắc, nhìn giật.
                      Archive thì hiện thẳng, không hiệu ứng, mới KHÔNG giật. */}
                  {lines.map((line, li) =>
                    li === lines.length - 1 ? (
                      <div key={li} className={styles.questionBubbleWrap}>
                        <span className={styles.qMark}>
                          Q{h.roundNum}/{caseData.evidenceTotal}
                        </span>
                        <div className={`${styles.replyThem} ${styles.questionBubble} ${styles.noEntrance}`}>
                          {line}
                        </div>
                      </div>
                    ) : (
                      <div key={li} className={`${styles.replyThem} ${styles.noEntrance}`}>
                        {line}
                      </div>
                    ),
                  )}
                  <div className={`${styles.replyMe} ${styles.replyCorrect} ${styles.noEntrance}`}>{h.picked}</div>
                  <div className={`${styles.replyThem} ${styles.noEntrance}`}>{h.correctReply}</div>
                </div>
              );
            })}

            {/* v20: mỗi dòng của round.prompt "nhắn" thành 1 bong bóng riêng,
                lần lượt từng dòng (xem lineIndex/promptLines ở trên) — dòng
                CUỐI (câu hỏi thật) mới có badge "Qx/y" + viền + nút 💡, các
                dòng dẫn truyện trước đó chỉ là bong bóng thường. */}
            {promptLines.map((line, i) => {
              const isQuestionLine = i === promptLines.length - 1;
              if (i > lineIndex) return null;
              // v20: lineGap — đang ở nhịp nghỉ NGẮN sau khi dòng (lineIndex-1)
              // vừa hiện xong, dòng này (lineIndex) CHƯA bắt đầu gõ — chưa
              // hiện gì cả cho tới khi lineGap tắt (coi như i > lineIndex).
              if (i === lineIndex && lineGap) return null;
              if (i === lineIndex) {
                // v20: key đổi theo trạng thái (typing vs shown) để React
                // mount lại hẳn 1 node MỚI khi chuyển từ "đang nhập" sang
                // chữ thật — giữ key={i} cũ thì React chỉ update lại đúng
                // node cũ (cùng vị trí/loại thẻ), animation entrance không
                // replay được vì className/props chỉ đổi tại chỗ, không
                // phải 1 lần mount mới → đó là nguồn gốc cảm giác "giật".
                return (
                  <div key={`${i}-typing`} className={styles.bubbleRow}>
                    <div className={`${styles.replyThem} ${styles.typingBubble}`}>
                      <span className={styles.dots}>
                        <i /><i /><i />
                      </span>
                    </div>
                  </div>
                );
              }
              if (!isQuestionLine) {
                return (
                  <div key={`${i}-shown`} className={styles.bubbleRow}>
                    <div className={styles.replyThem}>{line}</div>
                  </div>
                );
              }
              return (
                <div key={`${i}-shown`} className={styles.bubbleRow}>
                  {/* v20: câu hỏi ĐANG cần trả lời — badge "Qx/y" đè góc
                      (giống đúng kiểu ảnh tham khảo) + viền xanh, tách biệt
                      hẳn với bong bóng thường. */}
                  <div className={styles.questionBubbleWrap}>
                    <span className={styles.qMark}>
                      Q{roundIndex + 1}/{caseData.evidenceTotal}
                    </span>
                    <div className={`${styles.replyThem} ${styles.questionBubble}`}>{line}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.hintBtnInline}
                    onClick={useHint}
                    disabled={hintUsedThisRound}
                    aria-label="Gợi ý"
                  >
                    💡
                  </button>
                </div>
              );
            })}

            {/* v20: gợi ý giờ là 1 tin nhắn trong khung chat luôn (nền vàng
                cam + badge 💡 đè góc), không còn tách ra 1 card riêng. */}
            {questionShown && showHint && !answeredCorrectly && (
              <div className={styles.bubbleRow}>
                <div className={styles.hintBubbleWrap}>
                  <span className={styles.hintMark}>💡</span>
                  <div className={styles.hintBubble}>{round.hint}</div>
                </div>
              </div>
            )}

            {/* v20: 4 đáp án mẫu gộp chung 1 khối nhẹ, đánh số 1-4, đứng sát
                ngay trên ô nhập. Hiện LẦN LƯỢT từng đáp án 1 (chipsRevealed,
                xem effect ở trên) thay vì bật nguyên khối cùng lúc — tránh
                cảm giác đột ngột ngay sau khi câu hỏi vừa gõ-từ-từ xong.
                Bấm 1 dòng = "gõ hộ" vào ô nhập rồi tự gửi; gõ tay + Enter/nút
                gửi cũng nộp y hệt, luôn bấm/gõ được (unlocked chỉ đổi bàn tay
                gợi ý ở dưới, y hệt bản cũ).
                Cả khối chỉ ẩn hẳn khi ĐÃ ĐÚNG (round xong, sang câu mới).
                Chọn SAI thì khối vẫn đứng nguyên — chỉ riêng đáp án vừa bấm
                chuyển đỏ (trùng lúc bong bóng dưới cũng đỏ), giữ đỏ hết
                WRONG_HOLD_MS+WRONG_REPLY_MS rồi ẩn dần (thu nhỏ mượt, không
                unmount đột ngột) đúng MỖI đáp án đó — các đáp án còn lại vẫn
                đứng yên, chọn tiếp được ngay, không phải chờ cả khối ẩn/hiện
                lại như trước. */}
            {questionShown && !answeredCorrectly && (
              <div className={styles.choices}>
                {round.choices.slice(0, chipsRevealed).map((c, i) => {
                  const isWrongFlash = (phase === "wrongShown" || phase === "wrongReplying") && sentText === c;
                  const isFaded = triedWrong.has(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.chip} ${isWrongFlash ? styles.chipWrongFlash : ""} ${
                        isFaded ? styles.chipFaded : ""
                      }`}
                      disabled={phase !== "idle" || isFaded}
                      onClick={() => pickChip(c)}
                    >
                      <span className={styles.chipNum}>{i + 1}</span>
                      {c}
                    </button>
                  );
                })}
              </div>
            )}

            {/* v20: bấm chọn 1 đáp án — bong bóng "mình" hiện "..." (đang
                nhập) 1 nhịp trước (giống hệt kiểu "đang nhập" của informant),
                RỒI chữ mới chạy dần ra, thay vì hiện chữ ngay. */}
            {phase === "typingMeDots" && (
              <div className={styles.replyChat}>
                <div className={`${styles.replyMe} ${styles.typingBubble}`}>
                  <span className={styles.dots}>
                    <i /><i /><i />
                  </span>
                </div>
              </div>
            )}

            {/* v20: đoạn chat của lần gửi gần nhất — bong bóng "mình" ngay khi
                gửi (màu trung tính), rồi đổi màu theo kết quả: đúng = xanh
                lá; sai = hồng nhạt (không gạch ngang) — rồi tới phản hồi:
                đúng = "đang nhập" → lời đáp thật; sai = 1 dòng wrongReply
                (đổi dần theo wrongAttempts, hết mảng lặp dòng cuối), sau đó
                tự dọn để chọn lại — y hệt behavior cũ (sai bao nhiêu lần
                cũng được, không khoá). Không còn ô nhập thật — chữ "chạy"
                dần ra ngay trong bong bóng "mình" lúc phase=typingMe (xem
                pickChip), nên check sentText !== null (chuỗi rỗng lúc vừa
                bắt đầu gõ vẫn phải hiện bong bóng, không chờ có ký tự). */}
            {sentText !== null && (
              <div className={styles.replyChat}>
                <div
                  className={`${styles.replyMe} ${
                    answeredCorrectly
                      ? styles.replyCorrect
                      : phase === "wrongShown" || phase === "wrongReplying"
                        ? styles.replyWrong
                        : ""
                  }`}
                >
                  {sentText}
                </div>
                {phase === "correctTyping" && (
                  <div className={`${styles.replyThem} ${styles.typingBubble}`}>
                    <span className={styles.dots}>
                      <i /><i /><i />
                    </span>
                  </div>
                )}
                {phase === "correctDone" && <div className={styles.replyThem}>{round.correctReply}</div>}
                {phase === "wrongReplying" && (
                  <div className={styles.replyThem}>
                    {round.wrongReply[Math.min(wrongAttempts - 1, round.wrongReply.length - 1)]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* v20: bỏ hẳn nút Next — trả lời đúng xong tự "nhắn" lời đáp, đứng
            lại đọc NEXT_DELAY_MS rồi tự chuyển câu sau, không cần bấm gì
            (giống 1 đoạn chat tự chạy, không giật cục vì phải bấm).
            Nút "keep snooping" LUÔN hiện cố định dưới khung chat — không còn
            ẩn/hiện theo answeredCorrectly như trước (lúc đó cả nút lẫn ô nhập
            biến mất cùng lúc làm layout giật xuống). Chỉ chat/đáp án bên
            trên mới đổi theo state, phần khung UI (header, nút này) đứng yên.
            Về chức năng nó vẫn chỉ là handleDismiss — thu gọn/đóng popup. */}
        {round && (
          <div className={styles.snoopWrap}>
            <button type="button" className={styles.snoopBtn} onClick={handleDismiss}>
              🔍 keep snooping his phone
            </button>
            {/* Chưa tìm ra manh mối VÀ chưa trả lời đúng — bàn tay trỏ vào
                đây gợi ý đi tìm trước (không bắt buộc, chỉ là gợi ý). */}
            {!unlocked && !answeredCorrectly && <span className={styles.snoopHint}>👆</span>}
          </div>
        )}
      </div>

      {showConfetti && <Confetti />}

      {showEndTeaser && (
        <div className={styles.fullTeaser}>
          <button
            type="button"
            className={styles.fullTeaserCollapse}
            onClick={() => setShowEndTeaser(false)}
            aria-label="Collapse"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <img className={styles.fullTeaserLogo} src={endLogo} alt="Stalkr" />
          <h2 className={styles.fullTeaserHeadline}>{caseData.endCard.headline}</h2>
          <p className={styles.fullTeaserSubhead}>{caseData.endCard.subhead}</p>
          <span className={styles.fullTeaserBadge}>Fictional mystery game</span>
          <button type="button" className={styles.fullTeaserCta} onClick={openLinkApp}>
            {caseData.endCard.ctaLabel}
          </button>
        </div>
      )}
    </>
  );
}
