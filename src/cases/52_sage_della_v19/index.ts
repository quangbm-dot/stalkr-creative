import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("52_sage_della_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "calendar", hintTarget: "Away" },
    { hintApp: "messages", hintTarget: "Rhonda" },
    { hintApp: "gmail" },
    { hintApp: "revolut", hintTarget: "THE KESTREL HOTEL OMAHA NE" },
    { hintApp: "photos", hintTarget: "THE KESTREL HOTEL · IN-ROOM DINING · ROOM 412 · 2 × FARMHOUSE BREAKFAST $38.00 · 2 × COFFEE $9.00" },
    { hintApp: "messages", hintTarget: "Gil" },
    { hintApp: "gmail", hintTarget: "Bluestem Growers Co-op" },
  ],
  introChoices: ["I'll help you, Sage.", "Show me Della's phone."],
  introCta: "Open Della's phone 🔍",
  finalReply: "I came home thinking I'd find a diagnosis.",
  endHeadline: "The Doctor in Omaha",
  endSubhead: "Sage came home to the lavender farm for the summer and found her mother disappearing to Omaha every other week. She's convinced Mom is sick and hiding it. She has Della's phone for one morning, and what she's about to find isn't in any medical chart.",
});
