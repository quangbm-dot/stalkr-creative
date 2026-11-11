import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("50_lainey_cord_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "phone", hintTarget: "Fence Supply" },
    { hintApp: "messages", hintTarget: "Fence Supply" },
    { hintApp: "gmail", hintTarget: "Exclusive Listing Agreement – Halvorsen Orchard (for signature)" },
    { hintApp: "gmail", hintTarget: "Purchase agreement signed — Prairie Gold Farms LLC" },
    { hintApp: "gmail", hintTarget: "Closing confirmed – Halvorsen Orchard" },
    { hintApp: "whatsapp", hintTarget: "Ruben" },
    { hintApp: "messages", hintTarget: "Lainey ❤️" },
  ],
  introChoices: ["I'll help you, Lainey.", "Show me Cord's phone."],
  introCta: "Open Cord's phone 🔍",
  finalReply: "I've read a lot of closing documents.",
  endHeadline: "The Orchard Was Never the Secret",
  endSubhead: "Two months before her wedding, Lainey Moss has her fiancé's phone for one morning. Cord swears the 3 AM nights are orchard business. The orchard is involved, just not the way she was afraid of.",
});
