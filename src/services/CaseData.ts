import type { CaseConfig } from "../types/case";

import postImage from "../Assets/UI/post.jpg";
import homeWallpaper from "../Assets/UI/home.jpg";
import avatarRyan from "../Assets/UI/avatar-ryan.jpg";
import avatarMia from "../Assets/UI/avatar-mia-grace.jpg";
import avatarChloe from "../Assets/UI/avatar-chloe-wxx.jpg";
import avatarUnknown from "../Assets/UI/avatar-unknown-94.jpg";

/**
 * Demo content — swap for real case content once a scenario is written.
 * All text below is placeholder narrative to exercise the game flow; images
 * live in src/Assets/UI.
 */
export const demoCase: CaseConfig = {
  homeWallpaper,
  notifBadgeCount: 4,
  notif: {
    appName: "Instagram",
    preview: "5 people liked your photo and 1 new comment",
    newLikes: 5,
  },
  post: {
    appName: "Instagram",
    author: { username: "kai.reeves", timeAgo: "3h", avatar: avatarRyan },
    image: postImage,
    likesText: "2,318 likes",
    captionLines: ["Arm day.", "No days off 💪"],
    comments: [
      {
        username: "mia_grace",
        text: "okay but who said you could look like this 😍",
        time: "2m",
        colorFrom: "#f97316",
        colorTo: "#1b1e26",
        avatar: avatarMia,
      },
      {
        username: "chloe.wxx",
        text: "the mirror selfie game is unfair fr",
        time: "Just now",
        colorFrom: "#0ea5e9",
        colorTo: "#1b1e26",
        avatar: avatarChloe,
      },
      {
        username: "iykyk_22",
        text: "9pm Friday, usual spot, babe 😉",
        time: "Just now",
        colorFrom: "#ec4899",
        colorTo: "#1b1e26",
        avatar: avatarUnknown,
        tappable: true,
      },
    ],
    reactionComment: {
      username: "Honey 💗",
      text: "9pm? Where? Are you seeing someone else?",
      time: "Just now",
      colorFrom: "#ff6fa5",
      colorTo: "#ff2d78",
      heartBadge: true,
    },
    midPrompt: "She's hiding something.",
  },
  endCard: {
    question: "If you were Kai, how would you explain this?",
    choices: ["Deny everything", "Charm my way out"],
  },
};
