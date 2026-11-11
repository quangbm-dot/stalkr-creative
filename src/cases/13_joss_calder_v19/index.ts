import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("13_joss_calder_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "phone", hintTarget: "Dana Hollis" },
    { hintApp: "gmail", hintTarget: "Dana Hollis" },
    { hintApp: "revolut", hintTarget: "Halloran & Pike" },
    { hintApp: "photos", hintTarget: "ESTATE OF MARGUERITE FINCH" },
    { hintApp: "messages", hintTarget: "Aunt Lou" },
    { hintApp: "whatsapp", hintTarget: "Aunt Lou" },
    { hintApp: "gmail", hintTarget: "Lyle Strand" },
  ],
  introChoices: ["I'll help you, Joss Okafor.", "Show me Calder's phone."],
  introCta: "Open Calder's phone 🔍",
  finalReply: "I had a whole speech ready for when he walked back in.",
  endHeadline: "Who Really Owns 14 Marlow Street?",
  endSubhead: "Joss thinks her housemate Calder has been skimming the rent and selling the house out from under them. His old phone tells a slower, stranger story about a will, a brother nobody knew existed, and a promise made to an old woman. Follow the money from the kitchen drawer to a law office to a van parked by the water.",
});
