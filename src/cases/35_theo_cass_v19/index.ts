import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("35_theo_cass_v19", data as unknown as PhoneJson, images, {
  questions: [
    { hintApp: "messages", hintTarget: "Mara" },
    { hintApp: "instagram" },
    { hintApp: "photos", hintTarget: "GHOST IN THE GLASS / KEY: D minor / 92 BPM / KAIA VOX" },
    { hintApp: "calendar", hintTarget: "Kaia vocals: Ghost in the Glass" },
    { hintApp: "whatsapp", hintTarget: "Lucia 🌻" },
    { hintApp: "notes", hintTarget: "T." },
    { hintApp: "gmail", hintTarget: "Re: Halcyon offer + term sheet" },
  ],
  introChoices: ["I'll help you, Theo.", "Show me Cass's phone."],
  introCta: "Open Cass's phone 🔍",
  finalReply: "She paid off the van.",
  endHeadline: "The Song She Sold",
  endSubhead: "Cass Delgado, giọng ca chính của Paper Lanterns, để quên điện thoại trong xe van sau buổi diễn. Tay trống Theo Ruiz nghi cô đã bán bài hay nhất của ban cho một ngôi sao pop và sắp bỏ ban. Anh chỉ có ít phút trước khi cô quay lại lấy máy.",
});
