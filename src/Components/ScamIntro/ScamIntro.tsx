import { useEffect } from "react";
import type { CaseConfig } from "../../types/case";
import NotifStack from "./NotifStack";

interface ScamIntroProps {
  caseData: CaseConfig;
  onDone: () => void;
}

/**
 * v13 intro: chỉ còn 1 màn duy nhất (NotifStack) — điện thoại khoá, lịch sử
 * 5 giao dịch lạ 1 tuần qua đổ xuống, rồi nút "Expose Daniel" ngay trên màn
 * đó luôn (không còn màn ảnh Daniel/chat riêng phía sau nữa). Câu hỏi #1 tự
 * giới thiệu Chloe luôn trong prompt của nó (xem case data).
 */
export default function ScamIntro({ caseData, onDone }: ScamIntroProps) {
  const hasNotifs = (caseData.ledger?.rows ?? []).some((r) => !r.highlight);

  // Case không có ledger (không dùng cơ chế romance-scam) thì chẳng còn gì để
  // hiện ở đây nữa — bỏ qua thẳng.
  useEffect(() => {
    if (!hasNotifs) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNotifs]);

  if (!hasNotifs) return null;
  return <NotifStack caseData={caseData} onDone={onDone} />;
}
