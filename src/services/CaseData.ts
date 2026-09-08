import type { CaseConfig } from "../types/case";

import homeWallpaper from "../Assets/KB2v2/wallpaper.webp";
import nPhoto from "../Assets/KB2v2/n-photo.webp";

/**
 * v6 KB2 — Peyton's phone. Same wrong-chat mishap as KB1, gender-flipped:
 * an unknown guy sends a gym check-in pic + his address, and it ends up
 * mixed in with the shopping receipt Jordan asked for.
 */
export const demoCase: CaseConfig = {
  homeWallpaper,
  mishap: {
    senderName: "Unknown Number",
    photo: nPhoto,
    homeAddress: "219 Birch Ave, Unit 5",
    girlfriendName: "Jordan 💗",
    billRequestText: "hey can you resend me the receipt for that bag from yesterday? 🧾",
    replyText: "Peyton... what is this?? Explain. 😳",
  },
  endCard: {
    choices: ["Deny everything", "Charm my way out"],
    replyLines: [
      "it's nothing, I swear... he's just some guy from the gym",
      "relax babe, you know my address is wherever you are 😘",
    ],
    headline: "Want to know how it ends?",
    subhead: "So many more secrets left to uncover...",
    ctaLabel: "Continue",
  },
};
