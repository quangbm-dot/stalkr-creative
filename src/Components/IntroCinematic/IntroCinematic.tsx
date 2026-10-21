import type { CaseConfig } from "../../types/case";
import CinematicSurveillance from "./CinematicSurveillance";

interface Props {
  caseData: CaseConfig;
  onDone: () => void;
}

export default function IntroCinematic({ caseData, onDone }: Props) {
  return <CinematicSurveillance caseData={caseData} onDone={onDone} />;
}
