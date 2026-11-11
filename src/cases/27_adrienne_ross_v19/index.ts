import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("27_adrienne_ross_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Kendra 🌙" },
    { hintApp: "phone", hintTarget: "Kendra 🌙" },
    { hintApp: "messages", hintTarget: "Kendra 🌙" },
    { hintApp: "messages", hintTarget: "Kendra 🌙" },
    { hintApp: "calendar", hintTarget: "Client meeting" },
    { hintApp: "calendar", hintTarget: "Client meeting" },
    { hintApp: "gmail" },
  ],
  introChoices: ["I'll help you, Adrienne.", "Show me Ross's phone."],
  introCta: "Open Ross's phone 🔍",
  finalReply: "Okay.",
  endHeadline: "He Had a Date to Leave Me",
  endSubhead: "Ross Bidwell has been seeing Kendra Vaughn for four months. Adrienne has his phone for one morning, and it is the money that gives him away: a hotel room he paid for and a bracelet he had engraved.",
});
