import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("26_erin_adam_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "calendar", hintTarget: "Long Valley" },
    { hintApp: "notes", hintTarget: "Important" },
    { hintApp: "messages", hintTarget: "Renee Vasquez" },
    { hintApp: "wallet" },
    { hintApp: "notes", hintTarget: "Codes to remember" },
    { hintApp: "messages", hintTarget: "Khouya" },
    { hintApp: "whatsapp", hintTarget: "Sidi" },
  ],
  introChoices: ["I'll help you, Erin.", "Show me Adam's phone."],
  introCta: "Open Adam's phone 🔍",
  finalReply: "He walked.",
  endHeadline: "While I Was Waiting for Him",
  endSubhead: "Adam Kadiri did not fall. He walked out of the Round Valley camp before dawn, bought one tram ticket down from Long Valley, and is flying out of San Diego at 1:15 PM to Casablanca and to Salma Berrada - because his parents will not let him marry Erin, and he would rather she buried him than heard him say it.",
});
