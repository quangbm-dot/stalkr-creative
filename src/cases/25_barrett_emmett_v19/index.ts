import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("25_barrett_emmett_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "photos" },
    { hintApp: "calendar" },
    { hintApp: "notes", hintTarget: "The Sable Room" },
    { hintApp: "gmail", hintTarget: "Re: Run in the morning?" },
    { hintApp: "messages", hintTarget: "Mom" },
    { hintApp: "notes", hintTarget: "Codes" },
    { hintApp: "photos" },
  ],
  introChoices: ["I'll help you, Barrett.", "Show me Emmett's phone."],
  introCta: "Open Emmett's phone 🔍",
  finalReply: "God.",
  endHeadline: "He Never Really Saw Me",
  endSubhead: "Emmett Larkin has been following Nell Ardoin without her knowing - a tracker in her bag, a night spent watching her from the back of a nightclub, faked photos of the two of them behind a locked album - because she looks like Delia, the ex who left him.",
});
