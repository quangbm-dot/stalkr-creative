import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("16_whitney_callie_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "calendar" },
    { hintApp: "calendar", hintTarget: "Trey" },
    { hintApp: "gmail", hintTarget: "About today's session" },
    { hintApp: "calendar", hintTarget: "Cole" },
    { hintApp: "messages", hintTarget: "Cole", hintMessage: "have you seen the suite i booked" },
    { hintApp: "messages", hintTarget: "Cole", hintMessage: "skyline view 👀" },
    { hintApp: "messages", hintTarget: "Cole", hintMessage: "can i call you?" },
  ],
  introChoices: ["I'll help you, Whitney.", "Show me Callie's phone."],
  introCta: "Open Callie's phone 🔍",
  finalReply: "I'm calling the police right now — Marietta, and his real name, Gavin Trask.",
  endHeadline: "The Date She Never Returned From",
  endSubhead: "Callie boarded an Amtrak Keystone train out of Philadelphia on the afternoon she vanished, and the man waiting for her up the line in Lancaster had been using a false name on a dating app.",
});
