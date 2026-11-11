import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("49_margot_teddy_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "whatsapp", hintTarget: "Wei" },
    { hintApp: "gmail", hintTarget: "Leave of absence approved — Staff ID GL-0114" },
    { hintApp: "notes", hintTarget: "GL" },
    { hintApp: "gmail", hintTarget: "Letter of Intent — Lindqvist interest" },
    { hintApp: "calendar", hintTarget: "Sign purchase agreement — Coastline (Healdsburg office)" },
    { hintApp: "whatsapp", hintTarget: "Noodle" },
    { hintApp: "notes", hintTarget: "Sonoma stuff" },
  ],
  introChoices: ["I'll help you, Margot.", "Show me Teddy's phone."],
  introCta: "Open Teddy's phone 🔍",
  finalReply: "I walked out to the barrels with his phone in my hand.",
  endHeadline: "The Brother Who Came Home",
  endSubhead: "Nine years after leaving for Macau, Teddy Lindqvist is back on the family vineyard in Sonoma, thinner, quieter, and in a hurry to sell his share. His sister Margot has his phone for one morning. She has a list of small things that don't add up, and she can't afford to be wrong about any of them.",
});
