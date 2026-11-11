import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("24_junie_hollis_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "phone", hintTarget: "Adele Ruskin" },
    { hintApp: "instagram" },
    { hintApp: "calendar", hintTarget: "Meeting A." },
    { hintApp: "revolut", hintTarget: "Ruskin Literary" },
    { hintApp: "revolut", hintTarget: "Ruskin Literary" },
    { hintApp: "gmail", hintTarget: "Harlow & Vine Press" },
    { hintApp: "notes", hintTarget: "End of term averages" },
  ],
  introChoices: ["I'll help you, Junie.", "Show me Hollis's phone."],
  introCta: "Open Hollis's phone 🔍",
  finalReply: "Oh.",
  endHeadline: "Fourteen Months of Secrets",
  endSubhead: "Hollis has spent fourteen months secretly writing a novel about Junie; Adele Ruskin is the literary agent behind it, Harlow & Vine has bought the book, and the publication date he chose is the couple's anniversary.",
});
