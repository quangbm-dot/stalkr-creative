import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("29_rachel_errol_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "+1 401 555 0180" },
    { hintApp: "photos" },
    { hintApp: "calendar", hintTarget: "Handover" },
    { hintApp: "notes", hintTarget: "If something happens" },
    { hintApp: "messages", hintTarget: "Mom" },
    { hintApp: "revolut", hintTarget: "Ashgrove Holdings" },
    { hintApp: "photos" },
  ],
  introChoices: ["I'll help you, Rachel.", "Show me Errol's phone."],
  introCta: "Open Errol's phone 🔍",
  finalReply: "Oh God.",
  endHeadline: "Errol Did It for Mom",
  endSubhead: "Errol Kingsley signed an $8,500 promissory note with Ashgrove Holdings to pay for his mother's emergency surgery, and has been working the debt off at night at ProvPort on Allens Ave. He did not come home this morning; his sister Rachel has his old phone.",
});
