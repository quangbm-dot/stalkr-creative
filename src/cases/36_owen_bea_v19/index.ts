import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("36_owen_bea_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Nate" },
    { hintApp: "calendar", hintTarget: "N." },
    { hintApp: "gmail", hintTarget: "Re: a few questions before I go any further" },
    { hintApp: "whatsapp" },
    { hintApp: "gmail", hintTarget: "the name you asked for" },
    { hintApp: "photos", hintTarget: "PERPETUAL INVENTORY VARIANCE — STORE #2214 / OXYCODONE HCL 30 MG / EXPECTED 1,200 · ON HAND 840" },
    { hintApp: "messages", hintTarget: "Owen 🔪" },
  ],
  introChoices: ["I'll help you, Owen.", "Show me Beatriz's phone."],
  introCta: "Open Beatriz's phone 🔍",
  finalReply: "I spent a month thinking she was in trouble.",
  endHeadline: "The 2 A.M. Drop-Off",
  endSubhead: "Bea's been coming home at 2 a.m. in a stranger's car, and she won't let Owen open the curtains. This morning she went for a run and left her phone on the counter. Owen has until she gets back to figure out what kind of trouble his roommate is in.",
});
