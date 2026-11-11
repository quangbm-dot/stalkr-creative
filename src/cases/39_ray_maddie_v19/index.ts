import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("39_ray_maddie_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Theo (next door)" },
    { hintApp: "calendar", hintTarget: "Catering prep – Theo's" },
    { hintApp: "revolut", hintTarget: "Lakeshore Home Loans" },
    { hintApp: "photos", hintTarget: "LAKESHORE HOME LOANS Account Status: NOTICE OF DEFAULT Loan No. 7730-4416 TOTAL AMOUNT PAST DUE: $6,840.00 3 monthly payments of $2,280.00" },
    { hintApp: "phone", hintTarget: "Denise Fowler" },
    { hintApp: "messages", hintTarget: "Jess 🌻" },
    { hintApp: "messages", hintTarget: "Mom" },
  ],
  introChoices: ["I'll help you, Ray.", "Show me Maddie's phone."],
  introCta: "Open Maddie's phone 🔍",
  finalReply: "I sat on the back steps for a while after you showed me that.",
  endHeadline: "The Lights On Next Door",
  endSubhead: "Ray Dunleavy's daughter is at the neighbor's house until midnight most nights, and lately his wife's car has been parked there too. Maddie left her phone on the kitchen counter. What's on it is not what Ray is afraid of, and it is harder to hear.",
});
