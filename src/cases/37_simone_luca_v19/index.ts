import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("37_simone_luca_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "phone", hintTarget: "Danielle Okafor (Veridan)" },
    { hintApp: "calendar", hintTarget: "MedTech East Summit – Philadelphia" },
    { hintApp: "revolut", hintTarget: "VERIDAN SURGICAL EXP REIMB" },
    { hintApp: "messages", hintTarget: "Danielle Okafor (Veridan)" },
    { hintApp: "whatsapp" },
    { hintApp: "photos" },
    { hintApp: "gmail", hintTarget: "Dunmore Elementary" },
  ],
  introChoices: ["I'll help you, Simone.", "Show me Luca's phone."],
  introCta: "Open Luca's phone 🔍",
  finalReply: "I thought I was the one being cheated on.",
  endHeadline: "The Other Woman Was Never Danielle",
  endSubhead: "Luca is on the road two weeks a month, and a coworker named Danielle texts him at 2 AM. Simone has twenty minutes while he's in the shower to find out who he's really lying to, and she won't like the answer.",
});
