import { useState } from "react";
import { demoCase } from "./services/CaseData";
import PhoneFrame from "./Components/PhoneFrame/PhoneFrame";
import Loader from "./Components/Loader/Loader";
import LockScene from "./Components/LockScene/LockScene";
import EndCard from "./Components/EndCard/EndCard";
import DevBar from "./Components/DevBar/DevBar";

type Stage = "loader" | "lock" | "end";

function App() {
  const [stage, setStage] = useState<Stage>("loader");
  const caseData = demoCase;

  return (
    <>
      <DevBar onSkipEnd={() => setStage("end")} />
      <PhoneFrame>
        {stage === "loader" && <Loader onDone={() => setStage("lock")} />}
        {/* Giữ LockScene ở lại phía sau khi chuyển sang "end" — EndCard là
            overlay gradient đen đè lên trên, không phải màn riêng che kín. */}
        {(stage === "lock" || stage === "end") && (
          <LockScene caseData={caseData} onDone={() => setStage("end")} />
        )}
        {stage === "end" && <EndCard caseData={caseData} />}
      </PhoneFrame>
    </>
  );
}

export default App;
