import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("38_theo_lorna_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Rafe" },
    { hintApp: "messages", hintTarget: "Theo 💙" },
    { hintApp: "messages", hintTarget: "Warren" },
    { hintApp: "messages", hintTarget: "Rafe" },
    { hintApp: "calendar", hintTarget: "D. Okonkwo — phone intake" },
    { hintApp: "messages", hintTarget: "Warren" },
    { hintApp: "instagram" },
  ],
  introChoices: ["I'll help you, Theo.", "Show me Lorna's phone."],
  introCta: "Open Lorna's phone 🔍",
  finalReply: "I was so sure.",
  endHeadline: "The Other Side of the Hotel Door",
  endSubhead: "Theo is nineteen, home for the summer, and sure his mother is cheating on his father. He has her phone for one afternoon to prove it. Every clue points to a man named Rafe, until the truth turns out to be someone else's.",
});
