import { useState } from "react";
import { demoCase } from "./services/CaseData";
import PhoneFrame from "./Components/PhoneFrame/PhoneFrame";
import LockScene from "./Components/LockScene/LockScene";
import EndCard from "./Components/EndCard/EndCard";
import DevBar from "./Components/DevBar/DevBar";

type Stage = "lock" | "end";

function App() {
  const [stage, setStage] = useState<Stage>("lock");
  const caseData = demoCase;

  return (
    <>
      <DevBar onSkipEnd={() => setStage("end")} />
      <PhoneFrame>
        {/* Giữ LockScene ở lại phía sau khi chuyển sang "end" — EndCard là
            overlay gradient đen đè lên trên, không phải màn riêng che kín. */}
        <LockScene caseData={caseData} onDone={() => setStage("end")} />
        {stage === "end" && <EndCard caseData={caseData} />}
      </PhoneFrame>
    </>
  );
}

export default App;
