import { buildCase, type PhoneJson } from "../buildCase";
import data from "./phone.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildCase("02_joss_calder", data as unknown as PhoneJson, images, {
  questions: [
    {
      hintApp: "phone",
      easyQuestion: "Open Phone and check recent calls — who called Calder yesterday morning?",
      easyHint: "Phone app → Recent Calls → \"Dana Hollis\", yesterday 8:42 AM — the only morning call.",
    },
    {
      hintApp: "gmail",
      easyQuestion: "Open Mail and find an email from Dana Hollis — what's her job title in the signature?",
      easyHint: "Mail → open \"Following up on our call\" from Dana Hollis → her title is in the signature at the bottom.",
    },
    { hintApp: "splitpay" },
    {
      hintApp: "revolut",
      easyQuestion: "Open RevoBank and check Calder's outgoing transfers — who does he forward the rent to every month?",
      easyHint: "RevoBank → his history → the recurring -$2,250.00 transfer every month marked \"Ref 24-0611\" — check who it's paid to.",
    },
    { hintApp: "safari" },
  ],
  introChoices: ["I'll help you, Joss.", "Show me his phone."],
  introCta: "Open Calder's phone 🔍",
  finalReply: "Halloran & Pike? That's no landlord I've ever heard of. Where is our rent really going?",
  endHeadline: "Find out who really owns 14 Marlow Street",
});
