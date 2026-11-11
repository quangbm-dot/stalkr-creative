import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("28_sutton_corinne_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "phone", hintTarget: "Dominic" },
    { hintApp: "gmail", hintTarget: "Re: Sutton's Bank Transfer" },
    { hintApp: "revolut", hintTarget: "Sutton Landry" },
    { hintApp: "whatsapp", hintTarget: "Dominic" },
    { hintApp: "whatsapp", hintTarget: "Dominic" },
    { hintApp: "phone", hintTarget: "Corinne" },
    { hintApp: "gmail" },
  ],
  introChoices: ["I'll help you, Sutton Landry.", "Show me Corinne's phone."],
  introCta: "Open Corinne's phone 🔍",
  finalReply: "Thank you.",
  endHeadline: "I Wish I Never Asked",
  endSubhead: "Corinne Vance and Dominic Reyes run the Piedmont Canopy Fund, a Charlotte reforestation charity that exists only as a website. Corinne met Sutton Landry at a networking event eight months ago, took $15,000 out of him for the Fund, and is booked to leave for San Jose while Dominic flies the other way.",
});
