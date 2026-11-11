import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("45_theo_maddie_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Jonah" },
    { hintApp: "whatsapp" },
    { hintApp: "calendar", hintTarget: "Jonah ❤️" },
    { hintApp: "calendar", hintTarget: "Cake tasting w/ Theo & Dani" },
    { hintApp: "messages", hintTarget: "Danica" },
    { hintApp: "instagram" },
    { hintApp: "phone" },
  ],
  introChoices: ["I'll help you, Theo.", "Show me Maddie's phone."],
  introCta: "Open Maddie's phone 🔍",
  finalReply: "There was never a guy.",
  endHeadline: "The Boyfriend Who Never Picks Up",
  endSubhead: "Maddie keeps skipping Theo's wedding plans to be with Jonah, a firefighter nobody has met. Theo has her phone for one night and wants to know who this guy is. The answer is someone he knows very well.",
});
