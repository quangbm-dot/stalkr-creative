import type { CaseConfig } from "../types/case";

import postImage from "../Assets/KB2v2/post.webp";
import homeWallpaper from "../Assets/KB2v2/wallpaper.webp";

/**
 * v2 KB2 — "Retail Therapy". Peyton flexes a shopping haul; an anonymous
 * comment implies someone else's card is paying for it.
 */
export const demoCase: CaseConfig = {
  homeWallpaper,
  notifBadgeCount: 3,
  notif: {
    appName: "Instagram",
    preview: "3 people liked your photo and 1 new comment",
    newLikes: 3,
  },
  post: {
    appName: "Instagram",
    author: { username: "peyton.marsh", timeAgo: "1h", avatar: homeWallpaper },
    image: postImage,
    likesText: "1,742 likes",
    captionLines: ["Shopping day 🛍️", "Needed this after the week I had"],
    comments: [
      {
        username: "maddie.cole",
        text: "the Chanel bag though 😍 living for it",
        time: "12m",
        colorFrom: "#f97316",
        colorTo: "#1b1e26",
      },
      {
        username: "tessa_b",
        text: "ok but since when do you shop like THIS",
        time: "5m",
        colorFrom: "#0ea5e9",
        colorTo: "#1b1e26",
      },
      {
        username: "unknown_87",
        text: "tell your 'friend' thanks for the card again lol 💳",
        time: "Just now",
        colorFrom: "#ec4899",
        colorTo: "#1b1e26",
        tappable: true,
      },
    ],
    reactionComment: {
      username: "Jordan 💗",
      text: "Card? Whose card, Peyton?",
      time: "Just now",
      colorFrom: "#ff6fa5",
      colorTo: "#ff2d78",
      heartBadge: true,
    },
    midPrompt: "He's putting it together.",
  },
  endCard: {
    question: "If you were Peyton, how would you explain the bags?",
    choices: ["Play dumb", "Come clean"],
  },
};
