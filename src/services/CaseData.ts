import type { CaseConfig } from "../types/case";

import {
  iconMailly,
  iconRevoBank,
  iconGlimpse,
  iconPhotos,
  iconCalendar,
  iconWeather,
  iconWallet,
  iconNotes,
  iconPinpoint,
  iconClock,
  iconCompass,
  iconCalculator,
  iconSettings,
  iconMessages,
  iconPhone,
  iconChatta,
} from "../Assets/Icons/icons";

import agentAvatar from "../Assets/UI/agent-avatar.webp";
import wallpaper from "../Assets/UI/wallpaper-blue.jpg";

import alex from "../Assets/KB3/alex.webp";
import sophia from "../Assets/KB3/sophia.webp";
import nadia from "../Assets/KB3/nadia.webp";
import hero from "../Assets/KB3/hero.webp";

/**
 * KB3 — "Just got engaged". Sophia suspects her fiancé Alex is still
 * involved with an ex right after proposing. Owner: Alex. Third character:
 * Nadia.
 */
export const demoCase: CaseConfig = {
  caseTitle: "Alex & Sophia",
  tagline: "The phone is in your hands. Every answer is hiding somewhere inside it.",
  heroImage: hero,
  evidenceTotal: 16,
  hintBudget: 4,
  evidenceRounds: [
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "Search his Mailly for clues. Is he emailing someone he shouldn't be?",
      choices: ["A coworker", "nadia.ellis@...", "His brother", "A client"],
      correct: "nadia.ellis@...",
      correctReply: "That email thread with Nadia... found it. Keep digging.",
      wrongReply: ["That's just a work email. Keep looking.", "Not that one. Check again — someone's off."],
      reward: 10,
      hint: "Open Mailly and check who he's really emailing.",
      hintApp: "gmail",
    },
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "RevoBank shows a recent gift purchase. Who was it sent to?",
      choices: ["Sophia", "N. Sterling", "His mom", "A best man gift"],
      correct: "N. Sterling",
      correctReply: "A gift for N. Sterling — not Sophia. That's not nothing.",
      wrongReply: ["Check the transaction list again.", "Still not that one. Look closer."],
      reward: 10,
      hint: "Open RevoBank and check the most recent transaction.",
      hintApp: "revolut",
    },
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "Pinpoint tracks frequent visits. Where does he keep going that isn't work?",
      choices: ["The office", "Riverside Café", "The gym", "His parents' house"],
      correct: "Riverside Café",
      correctReply: "The same café, over and over, with no reason tied to work. I've got what I need.",
      wrongReply: ["That place is nothing unusual. Check again.", "Not quite — look at the visit history again."],
      reward: 10,
      hint: "Open Pinpoint and check his frequent places.",
      hintApp: "maps",
    },
  ],
  client: {
    name: "Agent Iris",
    avatar: agentAvatar,
    hire: [
      { type: "msgs", text: "Hey... I need your help. Alex just proposed, but something feels off." },
      { type: "reveal", src: alex, label: "Alex", text: "This is him — Alex, my fiancé. We got engaged last week." },
      { type: "reveal", src: hero, label: "Alex & Sophia", text: "The proposal was perfect. But ever since, his phone won't stop buzzing at night." },
      { type: "mysteryReveal", label: "Unknown", text: "And there's someone he still won't stop talking to. Who is she?" },
      { type: "choices", options: ["Take the case", "Are you sure?"] },
      { type: "msgs", text: "Good. Here's the case file — his fictional phone, unlocked for the investigation." },
      { type: "cta", label: "Search the phone 🔍" },
    ],
    matches: [
      { name: "Nadia", age: 27, photo: nadia },
      { name: "Sophia", age: 28, photo: sophia },
    ],
    matchThread: {
      name: "Nadia",
      avatar: nadia,
      msgs: [{ me: false, text: "Hey 😊" }],
    },
  },
  hint: "Try opening each app on the phone to find clues.",
  owner: { first: "Alex", full: "Alex Turner", avatar: alex },
  wallpaper,
  home: {
    pages: [
      [
        { app: "gmail", label: "Mailly", icon: iconMailly },
        { app: "revolut", label: "RevoBank", icon: iconRevoBank },
        { app: "instagram", label: "Glimpse", icon: iconGlimpse },
        { app: "photos", label: "Photos", icon: iconPhotos },
        { app: "calendar", label: "Calendar", icon: iconCalendar },
        { app: "weather", label: "Weather", icon: iconWeather },
        { app: "wallet", label: "Wallet", icon: iconWallet },
        { app: "notes", label: "Notes", icon: iconNotes },
      ],
      [
        { app: "maps", label: "Pinpoint", icon: iconPinpoint },
        { app: "clock", label: "Clock", icon: iconClock },
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
      title: "Sophia",
      time: "09:41",
      unread: true,
      msgs: [
        { me: false, text: "Can't wait to start planning the wedding!" },
        { me: true, text: "Me too 💍" },
      ],
    },
    {
      id: "m2",
      title: "Best Man",
      time: "Yesterday",
      unread: false,
      msgs: [{ me: false, text: "Bachelor party planning — you in?" }],
    },
  ],
  whatsapp: [
    {
      id: "w1",
      title: "Mom",
      time: "08:15",
      unread: false,
      msgs: [{ me: false, text: "So excited for the wedding!" }],
    },
  ],
  calls: [
    { name: "Sophia", time: "Yesterday, 8:02 PM", type: "outgoing" },
    { name: "Best Man", time: "Yesterday, 5:15 PM", type: "incoming" },
    { name: "Unknown Number", time: "Monday, 10:52 PM", type: "missed" },
  ],
  weather: { city: "Miami", tempC: 27, hi: 30, lo: 23, condition: "Sunny" },
  revolut: {
    balance: "$6,720.40",
    transactions: [
      { name: "Riverside Café", amount: "-$12.40" },
      { name: "Salary", amount: "+$4,100.00" },
      { name: "Gift Shop — N. Sterling", amount: "-$150.00" },
      { name: "RideGo", amount: "-$22.00" },
      { name: "Tailor & Co.", amount: "-$210.00" },
      { name: "Rent", amount: "-$1,400.00" },
      { name: "Soundwave", amount: "-$10.99" },
      { name: "ATM Withdrawal", amount: "-$80.00" },
    ],
  },
  maps: {
    locations: [
      { name: "Home", subtitle: "Visited daily" },
      { name: "Office", subtitle: "Weekdays" },
      { name: "Riverside Café", subtitle: "Visited 5 times this week" },
    ],
  },
  notes: [
    { title: "Note", body: "Book the venue walkthrough for next week" },
    { title: "Note", body: "Call the florist back" },
  ],
  calendar: [
    { title: "Venue walkthrough", date: "09/15" },
    { title: "Team meeting", date: "09/17" },
  ],
  instagram: {
    username: "alex.turner",
    displayName: "Alex Turner",
    avatar: alex,
    posts: [
      { image: hero, location: "Miami, FL", caption: "She said yes 💍" },
      { image: alex, location: "Downtown" },
    ],
  },
  airbnb: {
    name: "Weekend Getaways",
    img: hero,
    listings: [{ title: "Beachfront Villa", img: hero, rating: "4.9", subtitle: "Entire villa", price: "$260/night" }],
  },
  gmail: [
    { sender: "nadia.ellis@mailly.com", subject: "About last night", preview: "I miss you, don't worry about the engagement..." },
  ],
  photos: [{ src: alex }, { src: sophia }, { src: hero }],
  vaultCode: "0000",
  endCard: {
    headline: "You solved the case",
    subhead: "More mysteries. Hidden clues. Secret messages. Solve them all.",
    ctaLabel: "Continue",
  },
};
