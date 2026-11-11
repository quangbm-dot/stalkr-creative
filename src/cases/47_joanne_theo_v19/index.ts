import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("47_joanne_theo_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "gmail", hintTarget: "Fall term balance due — action required" },
    { hintApp: "calendar", hintTarget: "DashRoute shift" },
    { hintApp: "revolut", hintTarget: "PLAYVAULT*DEPOSIT" },
    { hintApp: "gmail", hintTarget: "New sign-in to your account" },
    { hintApp: "maps" },
    { hintApp: "messages", hintTarget: "Aunt Nina" },
    { hintApp: "photos", hintTarget: "FULTON PAWN & LOAN 2219 Penn Ave, Pittsburgh PA TICKET No. 40618 Item: 14K gold ring, garnet Loan: $600.00 Pledgor: R. CASTELLANO Redeem within 60 days" },
  ],
  introChoices: ["I'll help you, Joanne.", "Show me Theo's phone."],
  introCta: "Open Theo's phone 🔍",
  finalReply: "I came off a double shift ready to scream at my son.",
  endHeadline: "The Bill Nobody Paid",
  endSubhead: "Joanne transferred every cent of Theo's tuition, yet the school says it was never paid. Her son disappears every night and comes home gray at dawn, and she's sure he's gambling. His phone is on the kitchen table, and the truth on it is not the one she's braced for.",
});
