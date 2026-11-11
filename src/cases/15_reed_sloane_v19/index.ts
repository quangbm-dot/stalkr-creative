import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("15_reed_sloane_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "settings", hintTarget: "Hinge" },
    { hintApp: "gmail", hintTarget: "Welcome to Hinge!" },
    { hintApp: "phone", hintTarget: "N 🖤" },
  ],
  introChoices: ["I'll help you, Reed.", "Show me Sloane's phone."],
  introCta: "Open Sloane's phone 🔍",
  finalReply: "Oh no.",
  endHeadline: "Is Nash the Only One?",
  endSubhead: "Sloane keeps a secret Hinge dating profile while living with Reed, and within days of matching she is meeting Nash in person - and he is not the only one.",
});
