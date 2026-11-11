import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("21_talia_reagan_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "whatsapp", hintTarget: "Josie" },
    { hintApp: "instagram" },
    { hintApp: "instagram" },
    { hintApp: "whatsapp", hintTarget: "Mr. Dolan (teacher)" },
    { hintApp: "photos" },
    { hintApp: "gmail" },
    { hintApp: "whatsapp", hintTarget: "Mom" },
  ],
  introChoices: ["I'll help you, Talia Brenner.", "Show me Reagan's phone."],
  introCta: "Open Reagan's phone 🔍",
  finalReply: "I feel sick.",
  endHeadline: "Reagan Wants My Spot",
  endSubhead: "Reagan photographed the confidential locker-code list she was trusted to photocopy, opened Julian's locker and took the print of Julian kissing Owen; she then told Owen that Talia was cheating on him so the lead role would come back to her - while hiding the epilepsy she keeps from the academy.",
});
