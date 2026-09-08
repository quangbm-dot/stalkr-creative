import { demoCase } from "./services/CaseData";
import PhoneFrame from "./Components/PhoneFrame/PhoneFrame";
import LockScene from "./Components/LockScene/LockScene";
import DevBar from "./Components/DevBar/DevBar";

function App() {
  const caseData = demoCase;

  return (
    <>
      <DevBar onSkipEnd={() => {}} />
      <PhoneFrame>
        <LockScene caseData={caseData} />
      </PhoneFrame>
    </>
  );
}

export default App;
