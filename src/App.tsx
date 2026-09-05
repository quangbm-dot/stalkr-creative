import { useEffect, useState } from "react";
import type { AppKey } from "./types/case";
import { demoCase } from "./services/CaseData";
import PhoneFrame from "./Components/PhoneFrame/PhoneFrame";
import HomeScreen from "./Components/PhoneFrame/HomeScreen";
import Loader from "./Components/Loader/Loader";
import CaseIntro from "./Components/CaseIntro/CaseIntro";
import Intro from "./Components/Intro/Intro";
import TopBar from "./Components/TopBar/TopBar";
import EvidenceChat from "./Components/EvidenceChat/EvidenceChat";
import EndCard from "./Components/EndCard/EndCard";
import DevBar from "./Components/DevBar/DevBar";
import { renderApp } from "./Components/apps/registry";

type Stage = "loader" | "caseIntro" | "intro" | "phone" | "end";

function App() {
  const [stage, setStage] = useState<Stage>("loader");
  const [openApp, setOpenApp] = useState<AppKey | null>(null);
  const [evidenceFound, setEvidenceFound] = useState(1);
  const [homePage, setHomePage] = useState(0);
  // Bắt đầu thu gọn, đợi 0.4s sau khi vào màn phone mới bung popup lên —
  // tránh việc render đồng thời wallpaper + popup + TopBar gây giật lag.
  const [chatExpanded, setChatExpanded] = useState(false);
  const caseData = demoCase;

  useEffect(() => {
    if (stage !== "phone") return;
    const t = setTimeout(() => setChatExpanded(true), 400);
    return () => clearTimeout(t);
  }, [stage]);

  const allIcons = [...caseData.home.pages.flat(), ...caseData.home.dock];
  const openAppLabel = allIcons.find((i) => i.app === openApp)?.label ?? "";
  // Bàn tay gợi ý luôn trỏ vào app cần mở cho câu hỏi hiện tại (evidenceFound
  // là 1-indexed: 1 -> round 0, ...). Hết round thì thôi không gợi ý nữa.
  const currentRound = caseData.evidenceRounds[evidenceFound - 1];
  const hintApp = !chatExpanded ? currentRound?.hintApp : undefined;

  return (
    <>
    <DevBar onSkipEnd={() => setStage("end")} />
    <PhoneFrame>
      {/* tạm thời skip CaseIntro, vào thẳng Intro chat sau khi loading xong */}
      {stage === "loader" && <Loader onDone={() => setStage("intro")} />}

      {stage === "caseIntro" && (
        <CaseIntro
          caseData={caseData}
          evidenceFound={evidenceFound}
          onContinue={() => setStage("intro")}
        />
      )}

      {stage === "intro" && <Intro caseData={caseData} onDone={() => setStage("phone")} />}

      {stage === "phone" && !openApp && (
        <TopBar
          ownerFirst={caseData.owner.first}
          current={evidenceFound}
          total={caseData.evidenceTotal}
        />
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
        renderApp(openApp, openAppLabel, { caseData, onBack: () => setOpenApp(null) })}

      {stage === "phone" && (
        <EvidenceChat
          caseData={caseData}
          onEvidenceFound={() => setEvidenceFound((n) => n + 1)}
          onAllSolved={() => setStage("end")}
          expanded={chatExpanded}
          onExpandedChange={setChatExpanded}
        />
      )}

      {stage === "end" && <EndCard caseData={caseData} />}
    </PhoneFrame>
    </>
  );
}

export default App;
