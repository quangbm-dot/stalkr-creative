import type { CaseConfig } from "../types/case";

import postImage from "../Assets/KB4v2/post.webp";
import homeWallpaper from "../Assets/KB4v2/wallpaper.webp";

/**
 * v2 KB4 — "Beach Day". Brielle posts a beach photo with a friend; an
 * anonymous comment implies something happened after the photo was taken.
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
    author: { username: "brielle.knox", timeAgo: "2h", avatar: homeWallpaper },
    image: postImage,
    likesText: "3,140 likes",
    captionLines: ["Beach day with my favorite person 🌊", "Best friends forever"],
    comments: [
      {
        username: "sophie.tran",
        text: "you two are so cute omg",
        time: "40m",
        colorFrom: "#f97316",
        colorTo: "#1b1e26",
      },
      {
        username: "mara_lee",
        text: "best friends fr 😂😂",
        time: "15m",
        colorFrom: "#0ea5e9",
        colorTo: "#1b1e26",
      },
      {
        username: "unknown_ray",
        text: "'best friends' huh? saw what happened after this pic 👀",
        time: "Just now",
        colorFrom: "#ec4899",
        colorTo: "#1b1e26",
        tappable: true,
      },
    ],
    reactionComment: {
      username: "Chase 💗",
      text: "What happened after the pic, Brielle?",
      time: "Just now",
      colorFrom: "#ff6fa5",
      colorTo: "#ff2d78",
      heartBadge: true,
    },
    midPrompt: "Someone saw something.",
  },
  endCard: {
    question: "If you were Brielle, how would you explain it?",
    choices: ["Play it off", "Tell the truth"],
  },
};
