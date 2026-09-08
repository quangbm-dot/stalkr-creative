import type { CaseConfig } from "../types/case";

import homeWallpaper from "../Assets/UI/home.jpg";
import nPhoto from "../Assets/UI/n-photo.webp";
import ownPhoto from "../Assets/UI/post.jpg";
import billPhoto from "../Assets/UI/bill-man.webp";
import fillerCoffee from "../Assets/UI/filler-coffee.webp";
import fillerSneakers from "../Assets/UI/filler-sneakers.webp";
import fillerFood from "../Assets/UI/filler-food.webp";
import fillerSunset from "../Assets/UI/filler-sunset.webp";
import fillerDog from "../Assets/UI/filler-dog.webp";

/**
 * Demo content — swap for real case content once a scenario is written.
 * All text below is placeholder narrative to exercise the game flow; images
 * live in src/Assets/UI.
 */
export const demoCase: CaseConfig = {
  homeWallpaper,
  mishap: {
    senderName: "Unknown Number",
    photo: nPhoto,
    homeAddress: "482 Fig St, Apt 3B",
    girlfriendName: "Honey 💗",
    billRequestText: "hey can you resend me the receipt for that shirt from yesterday? 🧾",
    billPhoto,
    replyText: "Kai... what is this?? Explain. 😳",
  },
  galleryFillers: [homeWallpaper, ownPhoto, fillerCoffee, fillerSneakers, fillerFood, fillerSunset, fillerDog],
  endCard: {
    choices: ["Deny everything", "Charm my way out"],
    replyLines: [
      "it's nothing, I swear... just an old friend messing around",
      "come on babe, you know my address is wherever you are 😘",
    ],
    headline: "Want to know how it ends?",
    subhead: "So many more secrets left to uncover...",
    ctaLabel: "Continue",
  },
};
