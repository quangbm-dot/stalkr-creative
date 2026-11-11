import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("20_diane_roland_v19", data as unknown as PhoneJson, images, {
  questions: [
    {
      hintApp: "calendar",
      hintSteps: [
        { app: "calendar", target: "Dinner out — vacation week" },
        { app: "phone", target: "Tessa" },
      ],
    },
    { hintApp: "whatsapp", hintTarget: "Curtis Vance", hintMessage: "She proposed the three of us meet up after work" },
    { hintApp: "calendar", hintTarget: "Dinner Canlis" },
    { hintApp: "messages", hintTarget: "Tessa", hintMessage: "Thanks for this wonderful gift. The number is A347529 right?" },
    { hintApp: "wallet", hintTarget: "ref A347529" },
    { hintApp: "calendar", hintTarget: "Return flight" },
    { hintApp: "maps", hintTarget: "The Crawford Hotel" },
  ],
  introChoices: ["I'll help you, Diane.", "Show me Roland's phone."],
  introCta: "Open Roland's phone 🔍",
  finalReply: "I'm at a loss for words.",
  endHeadline: "Who Is Tessa, Roland?",
  endSubhead: "Roland has a twenty-year-old daughter, Tessa Alderman, hidden from Diane her whole life; he is meeting her again and planning to take her to Denver.",
});
