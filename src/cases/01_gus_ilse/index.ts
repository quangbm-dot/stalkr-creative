import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("01_gus_ilse", data as unknown as PhoneJson, images, {
  questions: [
    {
      hintApp: "phone",
      easyQuestion: "Open Phone and check her recent calls — who's the very last number she called before the ambulance came?",
      easyHint: "Phone app → Recent Calls → September 15 → the one outgoing call that afternoon, right before Sacred Heart Hospital's call comes in.",
    },
    {
      hintApp: "revolut",
      easyQuestion: "Open RevoBank and look at her transaction history — how much does she send out every single month?",
      easyHint: "RevoBank → her history → the recurring 'LSF TRUST ACCT' standing order — same amount every month.",
    },
    {
      hintApp: "calendar",
      easyQuestion: "Open her Calendar and find the event that repeats once a month around noon — what does she call it?",
      easyHint: "Calendar → the monthly recurring event titled 'Mentor lunch', no location listed.",
    },
    {
      hintApp: "maps",
      easyQuestion: "Open Maps and check her saved places — which restaurant is saved there?",
      easyHint: "Maps → Saved Places → the pin labeled 'Lunch w/ J'.",
    },
    {
      hintApp: "messages",
      hintTarget: "Jonah",
      easyQuestion: "Open Messages and scroll to her oldest chat with Jonah — what is he studying?",
      easyHint: "Messages → open the thread with Jonah → scroll all the way up to the earliest messages.",
    },
  ],
  introChoices: ["I'll help you, Gus.", "Show me her phone."],
  introCta: "Open Ilse's phone 🔍",
  finalReply: "Nursing. She was paying for a stranger's schooling for years... and never said a word to me. Why?",
  endHeadline: "Find out who Ilse really was",
  endSubhead: "Every month, $400 left Ilse's account for a young man her husband never met. Who was he — and what was she carrying?",
});
