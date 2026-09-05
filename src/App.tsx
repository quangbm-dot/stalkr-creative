import { useState } from "react";
import { demoCase } from "./services/CaseData";
import PhoneFrame from "./Components/PhoneFrame/PhoneFrame";
import Loader from "./Components/Loader/Loader";
import HomeNotif from "./Components/HomeNotif/HomeNotif";
import PostScene from "./Components/PostScene/PostScene";
import EndCard from "./Components/EndCard/EndCard";
import DevBar from "./Components/DevBar/DevBar";

type Stage = "loader" | "home" | "post" | "end";

function App() {
  const [stage, setStage] = useState<Stage>("loader");
  const caseData = demoCase;

  return (
    <>
      <DevBar onSkipEnd={() => setStage("end")} />
      <PhoneFrame>
        {stage === "loader" && <Loader onDone={() => setStage("home")} />}
        {stage === "home" && <HomeNotif caseData={caseData} onDone={() => setStage("post")} />}
        {/* Giữ PostScene ở lại phía sau khi chuyển sang "end" — EndCard giờ là
            overlay gradient đen đè lên trên (giống .fullTeaser ở V1), không
            phải màn hình riêng che kín hoàn toàn. */}
        {(stage === "post" || stage === "end") && (
          <PostScene caseData={caseData} onDone={() => setStage("end")} />
        )}
        {stage === "end" && <EndCard caseData={caseData} />}
      </PhoneFrame>
    </>
  );
}

export default App;
