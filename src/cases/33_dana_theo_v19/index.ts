import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("33_dana_theo_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Marcus" },
    { hintApp: "whatsapp", hintTarget: "Rylee 💛" },
    { hintApp: "phone", hintTarget: "Dad" },
    { hintApp: "whatsapp", hintTarget: "Rylee 💛" },
    { hintApp: "revolut", hintTarget: "RIDGELINE COACH · ONLINE" },
    { hintApp: "gmail", hintTarget: "Your Ridgeline Coach receipt" },
    { hintApp: "whatsapp", hintTarget: "Rylee 💛" },
  ],
  introChoices: ["I'll help you, Dana.", "Show me Theo's phone."],
  introCta: "Open Theo's phone 🔍",
  finalReply: "Officers were waiting at the depot when the 5:00 bus pulled in.",
  endHeadline: "The Night Bus",
  endSubhead: "Theo, 15, told his mom he was sleeping at a friend's house, but only his backpack turned up, at a skate park, with his phone still inside. For months he has been messaging a girl he met in an online game, and someone has planned his trip down to the minute. Search his phone before his bus gets in tonight.",
});
