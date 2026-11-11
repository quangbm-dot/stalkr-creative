import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("31_priya_shay_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Marisol" },
    { hintApp: "photos", hintTarget: "The Lantern Room" },
    { hintApp: "instagram" },
    { hintApp: "messages", hintTarget: "Tamsin" },
    { hintApp: "revolut", hintTarget: "TIXHUB *MARROW BAY" },
    { hintApp: "whatsapp", hintTarget: "Marisol" },
    { hintApp: "notes", hintTarget: "keep it straight" },
  ],
  introChoices: ["I'll help you, Priya.", "Show me Shay's phone."],
  introCta: "Open Shay's phone 🔍",
  finalReply: "She's coming up the stairs.",
  endHeadline: "The Friend Who Stayed",
  endSubhead: "Priya's roommate Shay has been her only friend since spring. She was there when Eli cheated and when the studio turned on her, and she brought tea every night. With twenty minutes and Shay's phone, Priya wants to know what that friendship really is.",
});
