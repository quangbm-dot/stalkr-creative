import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("46_evelyn_danny_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "phone", hintTarget: "Kyle" },
    { hintApp: "maps" },
    { hintApp: "settings", hintTarget: "BetHarbor" },
    { hintApp: "revolut", hintTarget: "BetHarbor" },
    { hintApp: "gmail" },
    { hintApp: "revolut", hintTarget: "HOLLIS LENDING LLC" },
    { hintApp: "gmail", hintTarget: "Loan HL-20417: Your loan has been funded" },
  ],
  introChoices: ["I'll help you, Evelyn.", "Show me Danny's phone."],
  introCta: "Open Danny's phone 🔍",
  finalReply: "I sat at the kitchen table a long time after you finished, honey.",
  endHeadline: "The Gift That Cost a House",
  endSubhead: "Danny says he sells solar panels, and he gave his grandmother three thousand dollars for her birthday. Then a letter from a lending company Evelyn has never heard of shows up in her mailbox. Danny left his phone on the kitchen counter this morning, and it holds every lie he has told her.",
});
