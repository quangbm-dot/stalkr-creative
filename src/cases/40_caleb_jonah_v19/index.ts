import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("40_caleb_jonah_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Lenny" },
    { hintApp: "maps" },
    { hintApp: "whatsapp", hintTarget: "Lena" },
    { hintApp: "instagram" },
    { hintApp: "messages", hintTarget: "Maddie" },
    { hintApp: "notes", hintTarget: "☕☕" },
    { hintApp: "notes" },
  ],
  introChoices: ["I'll help you, Caleb.", "Show me Jonah's phone."],
  introCta: "Open Jonah's phone 🔍",
  finalReply: "I put his phone back on the couch exactly how he left it.",
  endHeadline: "Ten Years and One Secret",
  endSubhead: "Jonah has been sneaking out for three months, and last night his car wasn't home at all. Caleb, his best friend since freshman year, has Jonah's phone for one morning and a terrible feeling about where Jonah has been sleeping. Every clue points at Caleb's girlfriend, until it doesn't.",
});
