import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("04_noor_celeste", data as unknown as PhoneJson, images, {
  questions: [
    {
      hintApp: "messages",
      easyQuestion: "Open Messages — who did she say she lined up to cover your early shift?",
      easyHint: "Messages → open the thread titled \"Ezra\" → she tells him to take the morning off, last minute.",
    },
    {
      hintApp: "gmail",
      easyQuestion: "Open Mail and find the email about a cancelled delivery — which supplier sent it?",
      easyHint: "Mail → inbox → open \"Standing order SO-2208 cancelled\" from Millrace Grain.",
    },
    { hintApp: "safari" },
    {
      hintApp: "calendar",
      easyQuestion: "Open Calendar and find the Whitcomb wedding tasting — what time was it actually scheduled for?",
      easyHint: "Calendar → past events → open \"Tasting — Whitcomb wedding\" — the real booked time is right there.",
    },
    {
      hintApp: "whatsapp",
      easyQuestion: "Open WhatsApp and check her chat with the bakery staff — who's been spreading that rumor?",
      easyHint: "WhatsApp → open the thread titled \"Mari\" → she apologizes to her directly in there.",
    },
  ],
  introChoices: ["I'll help you, Noor.", "Show me her phone."],
  introCta: "Open Celeste's phone 🔍",
  finalReply: "Mari? Celeste let her believe that... and never said a word to me. What else is she hiding?",
  endHeadline: "Find out what Celeste really thinks of Noor",
});
