import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("51_hallie_jesse_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Home Place" },
    { hintApp: "weather" },
    { hintApp: "revolut", hintTarget: "Ingersoll Rooms" },
    { hintApp: "calendar", hintTarget: "Wright County Fair" },
    { hintApp: "photos" },
    { hintApp: "whatsapp", hintTarget: "M" },
    { hintApp: "calendar", hintTarget: "Ames seminar" },
  ],
  introChoices: ["I'll help you, Hallie.", "Show me Jesse's phone."],
  introCta: "Open Jesse's phone 🔍",
  finalReply: "I kept thinking I was the one being lied to.",
  endHeadline: "The Farm Up North",
  endSubhead: "Every week Jesse drives two hours north to help his widowed dad on the farm, and every week Hallie stays behind. This morning he left his phone on her nightstand. She has until noon to find out what is waiting for him up there.",
});
