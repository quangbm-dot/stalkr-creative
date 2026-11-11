import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("44_ines_theo_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "gmail", hintTarget: "Your pay statement is ready" },
    { hintApp: "messages", hintTarget: "Mari 🌵" },
    { hintApp: "notes", hintTarget: "Nights" },
    { hintApp: "photos" },
    { hintApp: "revolut", hintTarget: "Larkspur Florist" },
    { hintApp: "calendar", hintTarget: "PG · Lumen · late" },
    { hintApp: "revolut", hintTarget: "Northline Electronics" },
  ],
  introChoices: ["I'll help you, Ines.", "Show me Theo's phone."],
  introCta: "Open Theo's phone 🔍",
  finalReply: "It was never him.",
  endHeadline: "The Man at the Night Desk",
  endSubhead: "Someone has been leaving dead roses at Ines's door and sending her shots taken through her window. The night concierge left his phone on the mail counter, and Ines is certain it will prove he's the one. It proves something else.",
});
