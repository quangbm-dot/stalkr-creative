import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("55_russ_lena_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "whatsapp", hintTarget: "Meadowlark" },
    { hintApp: "calendar", hintTarget: "Offsite audit" },
    { hintApp: "revolut", hintTarget: "ATM WITHDRAWAL – GRAND AVE SPENCER" },
    { hintApp: "photos", hintTarget: "For the long way home" },
    { hintApp: "gmail", hintTarget: "Karen Ostlund" },
    { hintApp: "messages", hintTarget: "Gordon" },
    { hintApp: "gmail", hintTarget: "Application approved – 117 S. 9th St, Livingston, MT" },
  ],
  introChoices: ["I'll help you, Russ.", "Show me Lena's phone."],
  introCta: "Open Lena's phone 🔍",
  finalReply: "Thank you.",
  endHeadline: "The Meadowlark Calls at Night",
  endSubhead: "Russ Kettering is sure his wife's late nights at the co-op have something to do with her manager. Her phone tells a different story: a contact saved as 'Meadowlark', a pocket knife with words engraved on it, a job waiting in Montana. The deeper Russ looks, the closer to home it gets.",
});
