import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("17_paige_grant_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "gmail", hintTarget: "🔥 You have a new match with Paige!" },
    { hintApp: "gmail", hintTarget: "New login detected on your Tinder account" },
    {
      hintApp: "gmail",
      hintSteps: [
        { app: "gmail", target: "Confirmation of your Tinder Gold subscription" },
        { app: "revolut", target: "Match Group" },
      ],
    },
    { hintApp: "revolut", hintTarget: "Bumble" },
    { hintApp: "photos", hintTarget: "I can get rid of Tinder for you." },
    { hintApp: "gmail", hintTarget: "Tinder" },
    { hintApp: "revolut", hintTarget: "Maryland Unemployment" },
  ],
  introChoices: ["I'll help you, Paige.", "Show me Grant's phone."],
  introCta: "Open Grant's phone 🔍",
  finalReply: "Whoa.",
  endHeadline: "How Many Girls, Grant?",
  endSubhead: "Grant swears the dating apps are off his phone, but he is out of work, still paying for two of them, and running Kelsey, Whitney and Tessa alongside Paige.",
});
