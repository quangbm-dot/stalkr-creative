import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("23_marin_blythe_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "photos" },
    { hintApp: "notes", hintTarget: "Restaurants to try" },
    { hintApp: "notes", hintTarget: "Codes" },
    { hintApp: "gmail" },
    { hintApp: "wallet" },
    { hintApp: "wallet" },
    { hintApp: "messages", hintTarget: "Marin Halloran" },
  ],
  introChoices: ["I'll help you, Marin.", "Show me Blythe's phone."],
  introCta: "Open Blythe's phone 🔍",
  finalReply: "Two days.",
  endHeadline: "Three Women Before “Yes”",
  endSubhead: "Marin is a week away from proposing to Blythe. Then, on Blythe's phone: a subscription never mentioned, new names in her messages, and a night she never came home. Marin would very much like to be wrong.",
});
