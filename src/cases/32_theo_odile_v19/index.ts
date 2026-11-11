import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("32_theo_odile_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "revolut" },
    { hintApp: "phone", hintTarget: "Ruthie" },
    { hintApp: "revolut", hintTarget: "LINDEN COURT LLC" },
    { hintApp: "gmail" },
    { hintApp: "photos", hintTarget: "Ruthie & me — the summer we met, 1979" },
    { hintApp: "airbnb" },
    { hintApp: "phone", hintTarget: "Gerald Pruitt" },
  ],
  introChoices: ["I'll help you, Theo Marchetti.", "Show me Odile's phone."],
  introCta: "Open Odile's phone 🔍",
  finalReply: "I came looking for a thief.",
  endHeadline: "The Librarian's Last Ledger",
  endSubhead: "Theo's grandmother died with her savings gone and a lien on her house. He's an accountant, and he's sure somebody was bleeding her dry. Follow the money through Odile's phone and find out where it really went.",
});
