import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("42_dana_celeste_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Julian ❤️" },
    { hintApp: "gmail", hintTarget: "Fwd: Reservation confirmed — Ember & Ash Table" },
    { hintApp: "notes", hintTarget: "Letters" },
    { hintApp: "photos", hintTarget: "YOU BELONG TO ME" },
    { hintApp: "gmail", hintTarget: "Copy of your report #26-118842" },
    { hintApp: "messages", hintTarget: "Julian ❤️" },
    { hintApp: "calendar", hintTarget: "Meeting — Gina Ostrow" },
  ],
  introChoices: ["I'll help you, Dana.", "Show me Celeste's phone."],
  introCta: "Open Celeste's phone 🔍",
  finalReply: "She knew.",
  endHeadline: "The Man Who Kept Her Safe",
  endSubhead: "Celeste has been getting anonymous letters for months, and the boyfriend who moved her in 'for her safety' is three days from getting her half of their studio. Her business partner Dana has her phone for one morning. What she finds is worse than a stalker, and Celeste is braver than Dana knew.",
});
