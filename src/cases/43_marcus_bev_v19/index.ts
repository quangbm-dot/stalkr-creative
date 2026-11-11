import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("43_marcus_bev_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Graham ❤" },
    { hintApp: "gmail", hintTarget: "From the other side of the world" },
    { hintApp: "messages", hintTarget: "Graham ❤" },
    { hintApp: "settings", hintTarget: "WhatsApp" },
    { hintApp: "gmail", hintTarget: "Withdrawal notice — Hale Savings ••4471" },
    { hintApp: "calendar", hintTarget: "Atlas – release fee (Graham's trunk)" },
    { hintApp: "notes", hintTarget: "Rent log — garage apt" },
  ],
  introChoices: ["I'll help you, Marcus.", "Show me Beverly's phone."],
  introCta: "Open Beverly's phone 🔍",
  finalReply: "I'm sitting on her porch steps.",
  endHeadline: "Goodnight, My Love",
  endSubhead: "Marcus Hale's mother smiles at her phone every night at ten, and the bills on her counter keep piling up. While she naps, he has her phone and one afternoon to find out who she's saying goodnight to. He also wants to know why that man always seems to know what's happening at her house.",
});
