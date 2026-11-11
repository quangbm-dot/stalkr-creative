import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("54_nadine_boyd_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Joelle" },
    { hintApp: "phone", hintTarget: "J. Marchetti (office)" },
    { hintApp: "revolut" },
    { hintApp: "calendar", hintTarget: "Northline Equipment — Marshfield (parts)" },
    { hintApp: "gmail", hintTarget: "Following up on tonight's call" },
    { hintApp: "clock" },
    { hintApp: "photos" },
  ],
  introChoices: ["I'll help you, Nadine.", "Show me Boyd's phone."],
  introCta: "Open Boyd's phone 🔍",
  finalReply: "I read it twice.",
  endHeadline: "The Barn on Ness Road",
  endSubhead: "Boyd Lindqvist milks 110 cows in Clark County, Wisconsin, and he doesn't lie well. So why does a woman text him after midnight, and where does he go at one in the morning? His wife Nadine has his phone until he gets back from the sale barn.",
});
