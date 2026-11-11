import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("30_callum_lorraine_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Hal ❤" },
    { hintApp: "maps" },
    { hintApp: "revolut" },
    { hintApp: "messages" },
    { hintApp: "maps" },
    { hintApp: "gmail", hintTarget: "Bloodwork came back fine" },
    { hintApp: "photos", hintTarget: "NEST-4 STUDY — PARTICIPANT INFORMATION AND CONSENT FORM — Lakehead Memory & Cognition Center — Page 1 of 14" },
  ],
  introChoices: ["I'll help you, Callum.", "Show me Lorraine's phone."],
  introCta: "Open Lorraine's phone 🔍",
  finalReply: "I came in here ready to call the police on a man with a heart next to his name.",
  endHeadline: "Mom's Book Club Is Two Hours North",
  endSubhead: "Lorraine Pryce says she drives to book club every week. Her son Callum thinks a man named Hal is draining a widow's savings. He has her phone for one afternoon, and what he finds is far worse than a scam, and far more loving.",
});
