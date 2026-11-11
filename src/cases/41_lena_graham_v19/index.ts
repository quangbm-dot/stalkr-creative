import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("41_lena_graham_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Ilse (next door)" },
    { hintApp: "calendar", hintTarget: "Drive Ilse — St. Brennan's Hospital" },
    { hintApp: "gmail", hintTarget: "Your request is ready for pickup" },
    { hintApp: "photos", hintTarget: "ROOTLINE · DNA Matches N. B. — Half Sibling — 1,712 cM M. H. — 2nd Cousin — 241 cM K. O. — 3rd Cousin — 88 cM" },
    { hintApp: "whatsapp", hintTarget: "Nadia" },
    { hintApp: "photos" },
    { hintApp: "whatsapp", hintTarget: "Nadia" },
  ],
  introChoices: ["I'll help you, Lena.", "Show me Graham's phone."],
  introCta: "Open Graham's phone 🔍",
  finalReply: "I walked next door in my scrubs and knocked.",
  endHeadline: "The House He Had to Have",
  endSubhead: "For a month, Graham's phone has lit up after midnight with messages from the widow next door. Money is missing, a union meeting never happened, and the house he swore they found by luck is starting to look like a plan. Lena has his phone for one morning, and the truth is closer than she thinks.",
});
