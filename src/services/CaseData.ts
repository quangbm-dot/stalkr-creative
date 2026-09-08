import type { CaseConfig } from "../types/case";

import homeWallpaper from "../Assets/KB3v2/wallpaper.webp";
import nPhoto from "../Assets/KB3v2/n-photo.webp";

/**
 * v6 KB3 — Tyler's phone. Same wrong-chat mishap as KB1: an unknown girl
 * sends a gym check-in pic + her address, and it gets mixed in with the
 * receipt Kayla asked for.
 */
export const demoCase: CaseConfig = {
  homeWallpaper,
  mishap: {
    senderName: "Unknown Number",
    photo: nPhoto,
    homeAddress: "77 Maple Ct, Unit 12",
    girlfriendName: "Kayla 💗",
    billRequestText: "hey can you resend me yesterday's receipt? 🧾",
    replyText: "Tyler... what is this?? Explain. 😳",
  },
  endCard: {
    choices: ["Deny everything", "Charm my way out"],
    replyLines: [
      "it's nothing, I swear... she's just a friend from class",
      "come on babe, you know my address is wherever you are 😘",
    ],
    headline: "Want to know how it ends?",
    subhead: "So many more secrets left to uncover...",
    ctaLabel: "Continue",
  },
};
