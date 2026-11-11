import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("19_harper_ellis_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "T", hintMessage: "The technical plans file is up and running. We're making sure for tomorrow. Verify that it corresponds with the meeting location for tomorrow." },
    { hintApp: "maps", hintTarget: "Widett Circle" },
    { hintApp: "wallet", hintTarget: "Kroger Market - ref 98214" },
    {
      hintApp: "wallet",
      hintSteps: [
        { app: "wallet", target: "Kroger Market - ref 98214" },
        { app: "gmail", target: "Order confirmation - transaction reference 98214" },
      ],
    },
    { hintApp: "revolut", hintTarget: "Bay State Mutual" },
    { hintApp: "revolut", hintTarget: "Bay State Mutual" },
    { hintApp: "whatsapp", hintTarget: "Bill Hackett" },
  ],
  introChoices: ["I'll help you, Harper.", "Show me Ellis's phone."],
  introCta: "Open Ellis's phone 🔍",
  finalReply: "He's such a.",
  endHeadline: "I Fell for a Stranger",
  endSubhead: "Ellis Vaughn is really Wade Ostrander, just out of prison for robbery; he built a false identity, moved in with Harper, and has been casing the bank branch where she works.",
});
