import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("34_marisol_dez_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "gmail", hintTarget: "Coffee sometime?" },
    { hintApp: "messages", hintTarget: "Sabine" },
    { hintApp: "messages", hintTarget: "Bettina" },
    { hintApp: "photos", hintTarget: "BETTINA VARGA PERIOD 14 HOURS PAID 31.5" },
    { hintApp: "notes", hintTarget: "Hours — my count" },
    { hintApp: "whatsapp" },
    { hintApp: "calculator" },
  ],
  introChoices: ["I'll help you, Marisol Quintero.", "Show me Desmond's phone."],
  introCta: "Open Desmond's phone 🔍",
  finalReply: "I asked you what Dez was taking from me.",
  endHeadline: "What Is Dez Taking From Her Kitchen?",
  endSubhead: "Marisol's sous chef walked out mid-service and left his phone behind. She thinks he is stealing her crew for a restaurant across the river. Go through Dez's phone and find out what he has really been collecting.",
});
