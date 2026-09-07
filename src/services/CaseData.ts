import type { CaseConfig } from "../types/case";

import {
  iconFlurt,
  iconGlimpse,
  iconNestly,
  iconMailly,
  iconPinpoint,
  iconChatta,
  iconPhotos,
  iconNotes,
  iconCalendar,
  iconWeather,
  iconRevoBank,
  iconWallet,
  iconClock,
  iconCompass,
  iconCalculator,
  iconSettings,
  iconMessages,
  iconPhone,
  iconUnknown,
} from "../Assets/Icons/icons";

import matchAshley from "../Assets/UI/match-ashley.jpg";
import matchMegan from "../Assets/UI/match-megan.jpg";
import matchChloe from "../Assets/UI/match-chloe.jpg";
import matchJess from "../Assets/UI/match-jess.jpg";

import wallpaper from "../Assets/UI/wallpaper-blue.jpg";

import ryan from "../Assets/KB1/ryan-new.jpg";
import zoe from "../Assets/KB1/emma-new.jpg";
import coupleHero from "../Assets/KB1/couple-new.jpg";
import emmaAvatar from "../Assets/KB1/informant-1.jpg";
import bnbParis from "../Assets/KB1/bnb_paris.jpg";
import bnbLove from "../Assets/KB1/bnb_love.jpg";
import post1 from "../Assets/KB1/post_1.jpg";
import post2 from "../Assets/KB1/post_2.jpg";
import post3 from "../Assets/KB1/post_3.jpg";
import post4 from "../Assets/KB1/post_4.jpg";
import photo82 from "../Assets/KB1/photo_82-v4.jpg";
import photo149 from "../Assets/KB1/photo_149-v4.jpg";
import photo150 from "../Assets/KB1/photo_150-v4.jpg";
import photo151 from "../Assets/KB1/photo_151-v2.jpg";
import photo152 from "../Assets/KB1/photo_152-v2.jpg";
import photo153 from "../Assets/KB1/photo_153-v2.jpg";
import photo154 from "../Assets/KB1/photo_154-v2.jpg";
import photo158 from "../Assets/KB1/photo_158-v4.jpg";
import photo159 from "../Assets/KB1/photo_159-v2.jpg";
import photo163 from "../Assets/KB1/photo_163-v2.jpg";
import photo168 from "../Assets/KB1/photo_168-v2.jpg";
import secret1 from "../Assets/KB1/secret_1-v2.jpg";
import secret3 from "../Assets/KB1/secret_3-v2.jpg";

/**
 * Demo content — swap for real case content once a scenario is written.
 * All text below is placeholder narrative to exercise the game flow; images
 * live in src/Assets/UI.
 */
export const demoCase: CaseConfig = {
  caseTitle: "Ryan & Emma",
  tagline: "The phone is in your hands. Every answer is hiding somewhere inside it.",
  heroImage: coupleHero,
  evidenceTotal: 16,
  hintBudget: 4,
  evidenceRounds: [
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "Search his Messages for clues. Is he texting someone he shouldn't be?",
      choices: ["Mike", "No Name", "Sarah", "Dad"],
      correct: "No Name",
      correctReply: "That unnamed number... found it. Keep digging.",
      wrongReply: ["That's just an old friend. Keep looking.", "Not that one. Check again — someone's off."],
      reward: 10,
      hint: "Open Messages and check who he's really talking to.",
      hintApp: "messages",
    },
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "He's been active on Flurt. Which girl did he match with?",
      choices: ["Chloe", "Zoe", "Megan", "Jess"],
      correct: "Zoe",
      correctReply: "Zoe, 26... found her. Keep digging.",
      wrongReply: ["Check their ages again in Flurt.", "Still not her. Look at the matches again."],
      reward: 10,
      hint: "Open Flurt and check his matches.",
      hintApp: "tinder",
    },
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "Last thing — is there anything hidden in his photos?",
      choices: ["No, all normal", "Yes, there's a locked album"],
      correct: "Yes, there's a locked album",
      correctReply: "A locked album... he's definitely hiding something. I've got what I need.",
      wrongReply: ["Look more carefully in Photos.", "Nope. Try opening the locked album."],
      reward: 10,
      hint: "Try the Photos app — look for a lock icon.",
      hintApp: "photos",
    },
  ],
  client: {
    name: "Unknown Number",
    avatar: iconUnknown,
    hire: [
      { type: "msgs", text: "hey... this is going to sound strange, but you deserve to know." },
      { type: "msgs", text: "it's 2am and i'm the one he's been texting." },
      {
        type: "appReveal",
        src: zoe,
        name: "Zoe",
        subtitle: "Active 4 minutes ago",
        appLabel: "Flurt",
        appIcon: iconFlurt,
        text: "he's active on Flurt right now, matched with me.",
      },
      { type: "msgs", text: "he told me you two were basically done. i don't think that's true." },
      { type: "choices", options: ["Who is this?", "Prove it."] },
      { type: "msgs", text: "His fictional phone — unlocked. See for yourself." },
      { type: "cta", label: "Search the phone 🔍" },
    ],
    matches: [
      { name: "Ashley", age: 25, photo: matchAshley },
      { name: "Megan", age: 24, photo: matchMegan },
      { name: "Zoe", age: 26, photo: zoe, matched: true },
      { name: "Chloe", age: 27, photo: matchChloe },
      { name: "Jess", age: 23, photo: matchJess },
    ],
    matchThread: {
      name: "Zoe",
      avatar: zoe,
      msgs: [
        { me: false, text: "Hey Ryan 😊 saw you're a consultant, sounds fancy" },
        { me: true, text: "Haha it has its days. You're always traveling huh" },
        { me: false, text: "Just got back from Paris actually" },
        { me: true, text: "Nice, we should catch up sometime" },
        { me: false, text: "Don't let this get out 🤫" },
      ],
    },
  },
  hint: "Try opening each app on the phone to find clues.",
  owner: { first: "Ryan", full: "Ryan Cole", avatar: ryan },
  wallpaper,
  home: {
    pages: [
      [
        { app: "tinder", label: "Flurt", icon: iconFlurt },
        { app: "photos", label: "Photos", icon: iconPhotos },
        { app: "notes", label: "Notes", icon: iconNotes },
        { app: "calendar", label: "Calendar", icon: iconCalendar },
        { app: "weather", label: "Weather", icon: iconWeather },
        { app: "instagram", label: "Glimpse", icon: iconGlimpse },
        { app: "airbnb", label: "Nestly", icon: iconNestly },
        { app: "revolut", label: "RevoBank", icon: iconRevoBank },
        { app: "wallet", label: "Wallet", icon: iconWallet },
      ],
      [
        { app: "gmail", label: "Mailly", icon: iconMailly },
        { app: "clock", label: "Clock", icon: iconClock },
        { app: "maps", label: "Pinpoint", icon: iconPinpoint },
        { app: "compass", label: "Compass", icon: iconCompass },
        { app: "calculator", label: "Calculator", icon: iconCalculator },
        { app: "settings", label: "Settings", icon: iconSettings },
      ],
    ],
    dock: [
      { app: "messages", label: "Messages", icon: iconMessages },
      { app: "phone", label: "Phone", icon: iconPhone },
      { app: "whatsapp", label: "Chatta", icon: iconChatta },
    ],
  },
  messages: [
    {
      id: "m1",
      title: "Emma",
      avatar: emmaAvatar,
      time: "09:41",
      unread: true,
      msgs: [
        { me: false, text: "Don't forget to call me tomorrow" },
        { me: true, text: "Yeah, I won't forget" },
        { me: false, text: "Love you 💛" },
      ],
    },
    {
      id: "m2",
      title: "No Name",
      time: "23:47",
      unread: true,
      msgs: [
        { me: false, text: "Hey, you free tonight?" },
        { me: true, text: "Can't tonight, might be busy" },
        { me: false, text: "Ok, let me know 😉" },
      ],
    },
    {
      id: "m3",
      title: "Mike",
      time: "Yesterday",
      unread: false,
      msgs: [
        { me: false, text: "Game night this Friday?" },
        { me: true, text: "I'm in" },
      ],
    },
    {
      id: "m4",
      title: "Dad",
      time: "Yesterday",
      unread: false,
      msgs: [{ me: false, text: "Call me when you get a chance" }],
    },
    {
      id: "m5",
      title: "Alex (Work)",
      time: "Monday",
      unread: false,
      msgs: [{ me: false, text: "Meeting moved to 3pm" }],
    },
    {
      id: "m6",
      title: "Sarah",
      time: "Sunday",
      unread: false,
      msgs: [{ me: false, text: "Happy birthday!! 🎉" }],
    },
    {
      id: "m7",
      title: "Delivery",
      time: "Sunday",
      unread: false,
      msgs: [{ me: false, text: "Your package has been delivered" }],
    },
  ],
  whatsapp: [
    {
      id: "w1",
      title: "Mom",
      time: "08:15",
      unread: false,
      msgs: [
        { me: false, text: "Are you coming home for dinner?" },
        { me: true, text: "Not tonight, working late" },
      ],
    },
  ],
  calls: [
    { name: "Zoe", time: "Yesterday, 11:42 PM", type: "outgoing" },
    { name: "Mom", time: "Yesterday, 6:03 PM", type: "incoming" },
    { name: "Unknown Number", time: "Monday, 2:17 PM", type: "missed" },
  ],
  weather: { city: "Paris", tempC: 18, hi: 21, lo: 12, condition: "Partly cloudy" },
  revolut: {
    balance: "$4,382.10",
    transactions: [
      { name: "Le Jardin Paris", amount: "-€620.00" },
      { name: "Café de Flore", amount: "-€14.50" },
      { name: "Salary", amount: "+$3,200.00" },
      { name: "RideGo", amount: "-$18.20" },
      { name: "Hôtel Lumière", amount: "-€340.00" },
      { name: "Boulangerie Saint-Paul", amount: "-€6.80" },
      { name: "Soundwave", amount: "-$10.99" },
      { name: "Le Petit Bistro", amount: "-€48.50" },
      { name: "ATM Withdrawal", amount: "-$100.00" },
      { name: "Freelance Payment", amount: "+$450.00" },
      { name: "Metro Pass", amount: "-€22.00" },
      { name: "ShopKart", amount: "-$67.30" },
    ],
  },
  maps: {
    locations: [
      { name: "Home", subtitle: "Visited daily" },
      { name: "Office", subtitle: "Weekdays" },
      { name: "Le Petit Bistro", subtitle: "Visited 3 times this week" },
    ],
  },
  notes: [{ title: "Note", body: "Buy a birthday gift — keep it a secret." }],
  calendar: [
    { title: "Coffee date", date: "09/12" },
    { title: "Team meeting", date: "09/14" },
  ],
  instagram: {
    username: "ryan.cole",
    displayName: "Ryan Cole",
    avatar: ryan,
    posts: [
      { image: post1, location: "Paris, France", caption: "Golden hour ✨" },
      { image: post2, location: "Montmartre, Paris" },
      { image: post3, location: "Le Marais, Paris", caption: "Best week ever" },
      { image: post4, location: "Paris, France" },
    ],
  },
  airbnb: {
    name: "Paris, France",
    img: bnbParis,
    listings: [
      { title: "Le Jardin — Paris", img: bnbParis, rating: "4.9", subtitle: "Entire villa", price: "$210/night" },
      { title: "Cozy Loft — Montmartre", img: bnbLove, rating: "4.8", subtitle: "Entire loft", price: "$165/night" },
    ],
  },
  gmail: [
    { sender: "Nestly", subject: "Booking confirmed", preview: "Your villa has been confirmed for..." },
  ],
  photos: [
    { src: photo82 },
    { src: photo149 },
    { src: photo150 },
    { src: photo151 },
    { src: photo152 },
    { src: photo153 },
    { src: photo154 },
    { src: photo158 },
    { src: photo159 },
    { src: photo163 },
    { src: photo168 },
    { src: secret1, secret: true },
    { src: secret3, secret: true },
  ],
  vaultCode: "0000",
  endCard: {
    headline: "You solved the case",
    subhead: "More mysteries. Hidden clues. Secret messages. Solve them all.",
    ctaLabel: "Continue",
  },
};
