import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("18_tessa_dylan_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Adrienne Swim Club" },
    { hintApp: "maps", hintTarget: "Current location" },
    { hintApp: "maps", hintTarget: "quietwater7@gmail.com" },
    { hintApp: "gmail", hintTarget: "Adrienne Vance" },
    { hintApp: "phone", hintTarget: "Adrienne Swim Club" },
  ],
  introChoices: ["I'll help you, Tessa.", "Show me Dylan's phone."],
  introCta: "Open Dylan's phone 🔍",
  finalReply: "We're officially done.",
  endHeadline: "Dylan’s Expensive Secret",
  endSubhead: "Dylan keeps telling Tessa the club has a sponsorship deal coming, but the money leaving their joint account is paying for a two-person weekend cabin on Lake Geneva with Adrienne Vance.",
});
