import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("53_bram_wren_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Desmond" },
    { hintApp: "calendar", hintTarget: "Confidential review — D. Hale" },
    { hintApp: "gmail", hintTarget: "Elise Varga" },
    { hintApp: "revolut", hintTarget: "Ridge Fuel & Feed" },
    { hintApp: "photos" },
    { hintApp: "calendar", hintTarget: "Bram at his mom's (Columbus)" },
    { hintApp: "photos" },
  ],
  introChoices: ["I'll help you, Bram.", "Show me Wren's phone."],
  introCta: "Open Wren's phone 🔍",
  finalReply: "I kept staring at the wrong man.",
  endHeadline: "The Harvest Weekends",
  endSubhead: "Bram Okafor has spent weeks watching his wife answer texts after midnight and come home late from meetings with her company's CFO. He's sure he knows who it is. He has one day with her phone, and the truth is waiting out on his father's farm.",
});
