import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("22_wes_sadie_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "calendar", hintTarget: "Advisor meeting — Horizon" },
    { hintApp: "instagram" },
    { hintApp: "photos" },
    { hintApp: "whatsapp", hintTarget: "Cleo Kovach" },
    { hintApp: "gmail", hintTarget: "Rory Beckett" },
    { hintApp: "instagram" },
    { hintApp: "instagram" },
  ],
  introChoices: ["I'll help you, Wes Tanner.", "Show me Sadie's phone."],
  introCta: "Open Sadie's phone 🔍",
  finalReply: "Wow.",
  endHeadline: "What Are You Hiding, Sadie?",
  endSubhead: "Sadie has quietly reserved the last room in a women-only house in Coronado and means to leave Wes a week after her application is accepted; the girl in the Red Rock Bar photo he is spiralling over is her twin sister Cleo, not her.",
});
