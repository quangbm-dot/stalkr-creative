import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("48_lena_frank_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Bee" },
    { hintApp: "calendar", hintTarget: "Bee 🌙" },
    { hintApp: "gmail", hintTarget: "Fwd: Your reservation at Lindgren's Supper Club" },
    { hintApp: "whatsapp", hintTarget: "Tommy" },
    { hintApp: "messages" },
    { hintApp: "revolut", hintTarget: "Fresh start" },
    { hintApp: "calendar", hintTarget: "Courthouse 10:30 — bring IDs" },
  ],
  introChoices: ["I'll help you, Lena.", "Show me Frank's phone."],
  introCta: "Open Frank's phone 🔍",
  finalReply: "I'm sitting on my kitchen floor.",
  endHeadline: "The Woman Called Bee",
  endSubhead: "Frank Ostrowski, 62, has started wearing cologne again, texts someone every night after ten and leaves family dinners early. His daughter Lena, an ER nurse who doesn't scare easy, has his phone for one night and wants to know who 'Bee' is before her father gets his heart broken. The truth is one she never thought to look for.",
});
