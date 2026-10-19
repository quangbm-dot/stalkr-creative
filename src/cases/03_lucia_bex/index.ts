import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("03_lucia_bex", data as unknown as PhoneJson, images, {
  questions: [
    {
      hintApp: "phone",
      easyQuestion: "Open Phone and check recent calls — who did Bex call right after she left?",
      easyHint: "Phone app → Recent Calls → last night, 9:47 PM — a 14-minute call right after she left.",
    },
    {
      hintApp: "calendar",
      easyQuestion: "Open Calendar and check that night's events — where does it show them meeting?",
      easyHint: "Calendar → past events → look for an entry just labeled 'C.' — the location is listed there.",
    },
    {
      hintApp: "gmail",
      easyQuestion: "Open Mail and check her sent messages — which wedding vendor did she email behind your back?",
      easyHint: "Mail → Sent folder → open \"Ferrante–Teague, August 16 — please hold the final balance\".",
    },
    {
      hintApp: "revolut",
      easyQuestion: "Open RevoBank and sort her payments — who received her biggest single payment this month?",
      easyHint: "RevoBank → her transaction history → the single largest payment on the list — it's not a normal purchase.",
    },
    { hintApp: "safari" },
  ],
  introChoices: ["I'll help you, Lucia.", "Show me her phone."],
  introCta: "Open Bex's phone 🔍",
  finalReply: "A county clerk three states away? Bex has no reason to call them. What is she looking for?",
  endHeadline: "Find out what Bex is hiding before the wedding",
});
