import type { CaseConfig } from "../types/case";

import postImage from "../Assets/KB3v2/post.webp";
import homeWallpaper from "../Assets/KB3v2/wallpaper.webp";

/**
 * v2 KB3 — "New Wheels". Tyler flexes his new car; an anonymous comment
 * implies he gave someone else a ride the night before.
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
    author: { username: "tyler.bowers", timeAgo: "45m" },
    image: postImage,
    likesText: "2,905 likes",
    captionLines: ["New whip, who dis 😎", "Finally upgraded"],
    comments: [
      {
        username: "mason.reid",
        text: "bro's about to be UNBEARABLE now 💀",
        time: "20m",
        colorFrom: "#f97316",
        colorTo: "#1b1e26",
      },
      {
        username: "ava.simmons",
        text: "ok flex duly noted",
        time: "8m",
        colorFrom: "#0ea5e9",
        colorTo: "#1b1e26",
      },
      {
        username: "unknown_lex",
        text: "thanks for the ride last night 😘 same time tomorrow?",
        time: "Just now",
        colorFrom: "#ec4899",
        colorTo: "#1b1e26",
        tappable: true,
      },
    ],
    reactionComment: {
      username: "Kayla 💗",
      text: "Ride? You said you were home studying.",
      time: "Just now",
      colorFrom: "#ff6fa5",
      colorTo: "#ff2d78",
      heartBadge: true,
    },
    midPrompt: "She's not buying it.",
  },
  endCard: {
    question: "If you were Tyler, how would you play this off?",
    choices: ["Deny everything", "Charm my way out"],
  },
};
