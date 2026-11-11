import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("14_nora_ivo_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "calendar", hintTarget: "Meeting with Rue" },
    { hintApp: "whatsapp", hintTarget: "Rue" },
    { hintApp: "whatsapp", hintTarget: "Rue" },
    { hintApp: "gmail", hintTarget: "Bisous Bisous Infinity" },
    { hintApp: "revolut", hintTarget: "Bisous Bisous Infinity" },
    { hintApp: "gmail", hintTarget: "Bisous Bisous Infinity" },
    { hintApp: "gmail", hintTarget: "Custom engraving request" },
  ],
  introChoices: ["I'll help you, Nora.", "Show me Ivo's phone."],
  introCta: "Open Ivo's phone 🔍",
  finalReply: "Wow, thanks! Rue's the jeweler, not a mistress — Ivo's planning to propose to me at The Bellamy Room.",
  endHeadline: "Who Is Rue?",
  endSubhead: "For a month Ivo has gone quiet mid-sentence, taken his calls out on the stairs, and left a hole in a conversation Nora was never meant to read. She has one morning with his phone.",
});
