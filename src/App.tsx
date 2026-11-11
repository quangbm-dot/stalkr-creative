import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AppKey } from "./types/case";
import type { CaseConfig } from "./types/case";
import PhoneFrame from "./Components/PhoneFrame/PhoneFrame";
import HomeScreen from "./Components/PhoneFrame/HomeScreen";
import CaseIntro from "./Components/CaseIntro/CaseIntro";
import Intro from "./Components/Intro/Intro";
import TopBar from "./Components/TopBar/TopBar";
import EvidenceChat from "./Components/EvidenceChat/EvidenceChat";
import EndCard from "./Components/EndCard/EndCard";
import DevBar from "./Components/DevBar/DevBar";
import { renderApp } from "./Components/apps/registry";
import { trackPlayableEvent } from "./services/AdController";

type Stage = "caseIntro" | "intro" | "phone" | "end";

const HAND_DELAY_MS = 2000; // chỉ vào icon app / nút / thanh chat
const HAND_DELAY_IN_APP_MS = 3500; // chỉ vào dòng lộ đáp án bên trong mini app (lâu hơn để người chơi tự tìm)

function App({ caseData }: { caseData: CaseConfig }) {
  // Bỏ qua màn loading — bản gốc (V8) vào thẳng Intro, không có màn chờ.
  const [stage, setStage] = useState<Stage>("intro");
  const [openApp, setOpenApp] = useState<AppKey | null>(null);
  // Đáp án bị khoá (🔒) cho tới khi người chơi CHẠM đúng dòng/thẻ chứa manh
  // mối bên trong hintApp của câu hiện tại (hoặc mở app, nếu câu đó không có
  // dòng cụ thể — xem hintTargetId) — đúng cơ chế "hot"/row-clue của bản
  // gốc, không phải chỉ mở app là đủ. Reset mỗi khi sang câu mới.
  const [clueFound, setClueFound] = useState(false);
  // Đã chạm đúng dòng lộ đáp án trong mini app (khác với clueFound: đáp án có thể
  // đã mở khoá chỉ vì người chơi đang đứng trong app).
  const [rowFound, setRowFound] = useState(false);
  // Bước hiện tại của câu có nhiều mini app (xem hintSteps trong types/case.ts).
  const [stepIdx, setStepIdx] = useState(0);
  const [evidenceFound, setEvidenceFound] = useState(1);
  useEffect(() => {
    setClueFound(false);
    setRowFound(false);
    setStepIdx(0);
  }, [evidenceFound]);
  const [homePage, setHomePage] = useState(0);
  // v17: Intro đang chiếu "cuốn phim" nền tối (xem Intro.tsx) — lúc đó
  // StatusBar (giờ/sóng/pin vẽ giả ở PhoneFrame) phải đổi sang trắng mới
  // nhìn được, thay vì đen như mặc định intro nền xanh nhạt.
  const [introCinema, setIntroCinema] = useState(false);
  // Bắt đầu thu gọn, đợi 0.4s sau khi vào màn phone mới bung popup lên —
  // tránh việc render đồng thời wallpaper + popup + TopBar gây giật lag.
  const [chatExpanded, setChatExpanded] = useState(false);

  useEffect(() => {
    if (stage !== "phone") return;
    const t = setTimeout(() => setChatExpanded(true), 400);
    return () => clearTimeout(t);
  }, [stage]);

  // Không có màn loading riêng — báo AppLovin ngay khi vào thẳng màn chơi
  // chính (sau intro), chỉ báo 1 lần.
  const displayedFired = useRef(false);
  useEffect(() => {
    if (stage === "phone" && !displayedFired.current) {
      displayedFired.current = true;
      trackPlayableEvent("DISPLAYED");
    }
  }, [stage]);

  const allIcons = [...caseData.home.pages.flat(), ...caseData.home.dock];
  const openAppLabel = allIcons.find((i) => i.app === openApp)?.label ?? "";
  // Bàn tay gợi ý luôn trỏ vào app cần mở cho câu hỏi hiện tại (evidenceFound
  // là 1-indexed: 1 -> round 0, ...). Hết round thì thôi không gợi ý nữa.
  const currentRound = caseData.evidenceRounds[evidenceFound - 1];
  // Vòng sáng + bàn tay ở icon app chỉ có khi còn phải đi tìm manh mối; đã mở
  // khoá rồi thì bàn tay chuyển sang thanh câu hỏi (xem activeHand) — để vòng sáng
  // và bàn tay luôn trỏ cùng một chỗ.
  const steps = currentRound
    ? currentRound.hintSteps ?? [{ app: currentRound.hintApp, target: currentRound.hintTargetId, message: currentRound.hintMessageId }]
    : [];
  const lastStep = stepIdx >= steps.length - 1;
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const hintApp = !chatExpanded && !(currentRound && clueFound) ? step?.app : undefined;
  // App đang mở có đúng là app của BƯỚC hiện tại không — chỉ khi đó mới truyền
  // hintTargetId/onFoundClue xuống app con (tự gắn glow+bàn tay vào đúng dòng
  // chứa manh mối, và tự báo lại khi tìm thấy).
  const isActiveHintApp = !!step && openApp === step.app;
  // Bước cuối, app KHÔNG xác định được dòng cụ thể (step.target rỗng — vd
  // Photos, hoặc Phone/Gmail những câu không tìm ra tên khớp): đứng trong
  // đúng app là mở khoá luôn, tránh kẹt vì không biết phải chạm đúng chỗ
  // nào. App CÓ step.target thì KHÔNG tự mở khoá ở đây nữa — phải đợi
  // người chơi chạm đúng dòng sáng (xem onFoundClue ở renderApp bên dưới),
  // nếu không thì mở khoá tức thì ngay khi vừa mở app, trước cả khi vòng
  // sáng/bàn tay kịp hiện (có độ trễ ~3.5s) — làm tính năng glow/tay chỉ
  // đúng dòng vô dụng vì không ai còn cơ hội thấy nó.
  const stepHasTarget = !!step?.target;
  useEffect(() => {
    if (isActiveHintApp && lastStep && !stepHasTarget) setClueFound(true);
  }, [isActiveHintApp, lastStep, stepHasTarget, evidenceFound]);
  // Bước chưa cuối: rời app của bước (về home) dù có chạm dòng sáng hay không thì
  // bước kế tiếp (app tiếp theo + dòng cần tìm) bắt đầu sáng.
  const prevOpen = useRef<AppKey | null>(null);
  useEffect(() => {
    if (step && !lastStep && prevOpen.current === step.app && openApp !== step.app) {
      setStepIdx((i) => i + 1);
      setRowFound(false);
    }
    prevOpen.current = openApp;
  }, [openApp, step, lastStep]);

  // CHỈ MỘT bàn tay gợi ý tại 1 thời điểm — chọn theo việc người chơi cần làm
  // kế tiếp, các bàn tay còn lại bị CSS ẩn (xem index.css, [data-hand]):
  //  "hand"  = chưa tìm ra manh mối: icon app (ở home) hoặc dòng chứa manh mối (trong app)
  //  "snoop" = popup đang mở mà đáp án còn khoá: nút "keep snooping"
  //  "bar"   = đã có manh mối, popup đang thu gọn: bấm thanh chat để trả lời
  //  "back"  = đang đứng trong 1 mini app nhưng không có gì để tìm ở đây nữa
  //            (sai app, hoặc đúng app nhưng đã mở khoá rồi mà app đó không tự
  //            highlight được dòng cụ thể, vd Phone) — trỏ vào nút back để thoát ra
  const unlocked = !currentRound || clueFound;
  let activeHand: "hand" | "snoop" | "bar" | "back" | "none" = "none";
  if (stage === "phone" && currentRound) {
    if (chatExpanded) activeHand = unlocked ? "none" : "snoop";
    // Kiểm tra unlocked TRƯỚC isActiveHintApp: 1 số app (vd Phone) không gọi
    // onFoundClue nên rowFound không bao giờ true, dù clueFound đã lên true
    // sẵn lúc vừa mở app (xem effect "lastStep" bên dưới) — không được kẹt ở
    // "hand" vô thời hạn trong trường hợp đó.
    else if (unlocked) activeHand = "bar";
    else if (isActiveHintApp && !rowFound) activeHand = "hand"; // đang trong đúng app nhưng chưa chạm dòng lộ đáp án
    else if (openApp) activeHand = "back"; // đang ở sai app, không có gì để tìm
    else activeHand = "hand"; // ở home, chưa mở app nào
  }
  // Bàn tay chỉ hiện (mờ dần) sau một khoảng người chơi chưa tìm ra; đổi bước
  // thì đếm lại từ đầu.
  const [handVisible, setHandVisible] = useState(false);
  // useLayoutEffect (không phải useEffect): phải reset handVisible TRƯỚC khi
  // trình duyệt kịp vẽ khung hình kế tiếp — nếu không, lúc vừa mở app mới
  // (openApp đổi), React vẫn còn vẽ 1 khung hình với handVisible CŨ (true,
  // còn sót từ app/bước trước) lên bàn tay của app MỚI trước khi state kịp
  // reset ở lần render sau, tạo cảm giác bàn tay "chỉ sẵn đáp án" rồi mới mờ
  // đi — đúng ngược với chủ đích (phải im lặng một lúc cho người chơi tự tìm
  // đã, mới hiện gợi ý).
  useLayoutEffect(() => {
    setHandVisible(false);
    if (activeHand === "none") return;
    const delay = openApp && (activeHand === "hand" || activeHand === "back") ? HAND_DELAY_IN_APP_MS : HAND_DELAY_MS;
    // Đã hiện thì giữ nguyên dù người chơi cuộn/chạm chỗ khác; chỉ mất khi bước
    // thay đổi (bấm vào đúng chỗ được chỉ, mở/đóng app, sang câu mới).
    const t = setTimeout(() => setHandVisible(true), delay);
    return () => clearTimeout(t);
  }, [activeHand, openApp, evidenceFound]);

  return (
    <>
    <DevBar onSkipEnd={() => setStage("end")} onSkipIntro={() => setStage("phone")} />
    <div
      style={{ display: "contents" }}
      data-hand={activeHand}
      data-hand-visible={handVisible}
      // Thanh câu hỏi thu gọn (.belowBar) nằm ĐÈ (position:absolute;bottom:0)
      // lên đúng 90px cuối màn hình trong .screen, không có "phần dưới
      // riêng" nào cả — nội dung app cuộn xuống hết (đọc email/tin nhắn dài)
      // bị nó che mất đoạn cuối. Đánh dấu ở đây để CSS global (index.css)
      // chừa padding-bottom cho nội dung mọi app khi thanh này đang hiện.
      data-bar-active={stage === "phone" && !chatExpanded}
    >
    <PhoneFrame
      showBelowBar={stage === "phone" && !chatExpanded}
      statusBarDark={stage !== "intro" || introCinema}
      aboveBar={
        stage === "phone" ? (
          <TopBar
            ownerFirst={caseData.owner.first}
            current={evidenceFound}
            total={caseData.evidenceTotal}
          />
        ) : undefined
      }
    >
      {stage === "caseIntro" && (
        <CaseIntro
          caseData={caseData}
          evidenceFound={evidenceFound}
          onContinue={() => setStage("intro")}
        />
      )}

      {stage === "intro" && (
        <Intro caseData={caseData} onDone={() => setStage("phone")} onCinemaModeChange={setIntroCinema} />
      )}

      {stage === "phone" && !openApp && (
        <HomeScreen
          caseData={caseData}
          onOpenApp={setOpenApp}
          hintApp={hintApp}
          activePage={homePage}
          onActivePageChange={setHomePage}
        />
      )}

      {stage === "phone" &&
        openApp &&
        renderApp(openApp, openAppLabel, {
          caseData,
          onBack: () => setOpenApp(null),
          hintTargetId: isActiveHintApp ? step?.target : undefined,
          hintMessageId: isActiveHintApp ? step?.message : undefined,
          onFoundClue: isActiveHintApp ? () => { if (lastStep) setClueFound(true); setRowFound(true); } : undefined,
        })}

      {stage === "phone" && (
        <EvidenceChat
          caseData={caseData}
          onEvidenceFound={() => setEvidenceFound((n) => n + 1)}
          onAllSolved={() => setStage("end")}
          expanded={chatExpanded}
          onExpandedChange={setChatExpanded}
          onDismiss={() => {
            setChatExpanded(false);
            setOpenApp(null);
          }}
          unlocked={unlocked}
          onDevJump={(roundIndex) => {
            setEvidenceFound(roundIndex + 1);
            setOpenApp(null);
          }}
        />
      )}

      {stage === "end" && <EndCard caseData={caseData} />}
    </PhoneFrame>
    </div>
    </>
  );
}

export default App;
