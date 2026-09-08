import type { CaseConfig } from "../types/case";

import homeWallpaper from "../Assets/KB4v2/wallpaper.webp";
import nPhoto from "../Assets/KB4v2/n-photo.webp";
import ownPhoto from "../Assets/KB4v2/post.webp";
import billPhoto from "../Assets/UI/bill-woman.webp";
import fillerCoffee from "../Assets/UI/filler-coffee.webp";
import fillerSneakers from "../Assets/UI/filler-sneakers.webp";
import fillerFood from "../Assets/UI/filler-food.webp";
import fillerSunset from "../Assets/UI/filler-sunset.webp";
import fillerDog from "../Assets/UI/filler-dog.webp";

/**
 * v6 KB4 — Brielle's phone. Same wrong-chat mishap as KB1: an unknown guy
 * sends a gym check-in pic + his address, and it gets mixed in with the
 * receipt Chase asked for.
 */
export const demoCase: CaseConfig = {
  homeWallpaper,
  mishap: {
    senderName: "Unknown Number",
    photo: nPhoto,
    homeAddress: "340 Cedar Ln, Apt 2",
    girlfriendName: "Chase 💗",
    billRequestText: "hey can you resend me yesterday's receipt? 🧾",
    billPhoto,
    replyText: "Brielle... what is this?? Explain. 😳",
  },
  galleryFillers: [homeWallpaper, ownPhoto, fillerCoffee, fillerSneakers, fillerFood, fillerSunset, fillerDog],
  endCard: {
    choices: ["Deny everything", "Charm my way out"],
    replyLines: [
      "it's nothing, I swear... he's just some guy from the gym",
      "come on babe, you know my address is wherever you are 😘",
    ],
    headline: "Want to know how it ends?",
    subhead: "So many more secrets left to uncover...",
    ctaLabel: "Continue",
  },
};
