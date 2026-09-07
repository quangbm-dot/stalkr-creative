import type { CaseConfig } from "../types/case";

import {
  iconGlimpse,
  iconNotes,
  iconPinpoint,
  iconPhotos,
  iconCalendar,
  iconWeather,
  iconWallet,
  iconRevoBank,
  iconMailly,
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

import daniel from "../Assets/KB4/daniel.webp";
import sarah from "../Assets/KB4/sarah.webp";
import ivy from "../Assets/KB4/ivy.webp";
import evidenceDanielIvy from "../Assets/KB4/evidence-daniel-ivy.webp";
import hero from "../Assets/KB4/hero.webp";
import danielSmile from "../Assets/KB4/daniel-smile.webp";
import danielHide from "../Assets/KB4/daniel-hide.webp";

/**
 * KB4 — "Old classmate". Sarah suspects her husband Daniel of reconnecting
 * with an old classmate. Owner: Daniel. Third character: Ivy.
 */
export const demoCase: CaseConfig = {
  caseTitle: "Daniel & Sarah",
  tagline: "The phone is in your hands. Every answer is hiding somewhere inside it.",
  heroImage: hero,
  evidenceTotal: 16,
  hintBudget: 4,
  evidenceRounds: [
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "Glimpse has a tagged-location post. Who is he with?",
      choices: ["A coworker", "Ivy", "His sister", "An old college friend"],
      correct: "Ivy",
      correctReply: "Ivy — a name Sarah's never even heard. Keep digging.",
      wrongReply: ["Check the caption again.", "Not quite. Look at the post again."],
      reward: 10,
      hint: "Open Glimpse and check his most recent tagged post.",
      hintApp: "instagram",
    },
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "There's an odd note saved on his phone. What does it say?",
      choices: ["Grocery list", "Meet Ivy at 7 — don't tell Sarah", "Work reminder", "Car maintenance"],
      correct: "Meet Ivy at 7 — don't tell Sarah",
      correctReply: "A meetup, and he's asking to keep it from Sarah. That's everything I need.",
      wrongReply: ["Not that note — try the other one.", "Nope. Look again in Notes."],
      reward: 10,
      hint: "Open Notes and look for anything mentioning Ivy.",
      hintApp: "notes",
    },
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "Pinpoint tracks frequent visits. Where does he keep going?",
      choices: ["The gym", "Sunrise Café", "The office", "His parents' house"],
      correct: "Sunrise Café",
      correctReply: "The same café, over and over — exactly where they meet. Case closed.",
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
      { type: "msgs", text: "Hey. I need you to check something for me — quietly." },
      { type: "reveal", src: danielSmile, label: "Too pleased", text: "My husband Daniel, grinning at his phone like a teenager. He says it's nothing." },
      { type: "reveal", src: danielHide, label: "Flipped away", text: "Then he flips it face-down the second I walk in. An old classmate's name keeps coming up." },
      { type: "choices", options: ["Take the case", "Are you sure?"] },
      { type: "msgs", text: "Good. Here's the case file — his fictional phone, unlocked for the investigation." },
      { type: "cta", label: "Search the phone 🔍" },
    ],
    matches: [
      { name: "Ivy", age: 30, photo: ivy },
      { name: "Sarah", age: 31, photo: sarah },
    ],
    matchThread: {
      name: "Ivy",
      avatar: ivy,
      msgs: [{ me: false, text: "So good seeing you again!" }],
    },
  },
  hint: "Try opening each app on the phone to find clues.",
  owner: { first: "Daniel", full: "Daniel Reyes", avatar: daniel },
  wallpaper,
  home: {
    pages: [
      [
        { app: "instagram", label: "Glimpse", icon: iconGlimpse },
        { app: "notes", label: "Notes", icon: iconNotes },
        { app: "photos", label: "Photos", icon: iconPhotos },
        { app: "calendar", label: "Calendar", icon: iconCalendar },
        { app: "weather", label: "Weather", icon: iconWeather },
        { app: "wallet", label: "Wallet", icon: iconWallet },
        { app: "revolut", label: "RevoBank", icon: iconRevoBank },
        { app: "gmail", label: "Mailly", icon: iconMailly },
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
      title: "Sarah",
      time: "09:41",
      unread: true,
      msgs: [
        { me: false, text: "Don't forget dinner with my parents tonight" },
        { me: true, text: "Wouldn't miss it" },
      ],
    },
    {
      id: "m2",
      title: "Work",
      time: "Yesterday",
      unread: false,
      msgs: [{ me: false, text: "Meeting moved to 2pm" }],
    },
  ],
  whatsapp: [
    {
      id: "w1",
      title: "Sarah's Mom",
      time: "08:15",
      unread: false,
      msgs: [{ me: false, text: "See you both tonight!" }],
    },
    {
      id: "w2",
      title: "Work Group",
      time: "Yesterday",
      unread: false,
      msgs: [{ me: false, text: "Don't forget the report is due Friday" }],
    },
    {
      id: "w3",
      title: "Mike",
      time: "Monday",
      unread: false,
      msgs: [{ me: false, text: "Game night this week?" }],
    },
  ],
  calls: [
    { name: "Sarah", time: "Yesterday, 6:30 PM", type: "incoming" },
    { name: "Work", time: "Yesterday, 2:00 PM", type: "outgoing" },
    { name: "Unknown Number", time: "Monday, 9:15 PM", type: "missed" },
  ],
  weather: { city: "Austin", tempC: 24, hi: 28, lo: 19, condition: "Clear" },
  revolut: {
    balance: "$3,905.75",
    transactions: [
      { name: "Sunrise Café", amount: "-$9.75" },
      { name: "Salary", amount: "+$3,400.00" },
      { name: "Hardware Store", amount: "-$45.00" },
      { name: "RideGo", amount: "-$16.50" },
      { name: "Mortgage", amount: "-$1,200.00" },
      { name: "Soundwave", amount: "-$10.99" },
      { name: "ATM Withdrawal", amount: "-$100.00" },
      { name: "Freelance Payment", amount: "+$300.00" },
    ],
  },
  maps: {
    locations: [
      { name: "Home", subtitle: "Visited daily" },
      { name: "Office", subtitle: "Weekdays" },
      { name: "Sunrise Café", subtitle: "Visited 4 times this week" },
    ],
  },
  notes: [
    { title: "Note", body: "Meet Ivy at 7 — don't tell Sarah" },
    { title: "Note", body: "Fix the leaky faucet" },
    { title: "Note", body: "Pick up dry cleaning Friday" },
    { title: "Note", body: "Sarah's birthday gift ideas" },
  ],
  calendar: [
    { title: "Dinner with Sarah's parents", date: "09/12" },
    { title: "Team meeting", date: "09/14" },
  ],
  instagram: {
    username: "daniel.reyes",
    displayName: "Daniel Reyes",
    avatar: daniel,
    posts: [
      { image: evidenceDanielIvy, location: "Sunrise Café", caption: "Great catching up with Ivy ☕️" },
      { image: daniel, location: "Downtown" },
      { image: hero, location: "Home", caption: "Lucky to have her" },
      { image: danielSmile, location: "Home", caption: "Good news today" },
    ],
  },
  airbnb: {
    name: "Weekend Getaways",
    img: hero,
    listings: [{ title: "Hill Country Cabin", img: hero, rating: "4.7", subtitle: "Entire cabin", price: "$150/night" }],
  },
  gmail: [
    { sender: "City Utilities", subject: "Your bill is ready", preview: "Your monthly statement is now available..." },
    { sender: "Hardware Store", subject: "Your order confirmation", preview: "Thanks for your order! Here's your receipt..." },
    { sender: "Gym Membership", subject: "Class schedule update", preview: "Here's the updated schedule for next month..." },
  ],
  photos: [{ src: daniel }, { src: sarah }, { src: hero }],
  vaultCode: "0000",
  endCard: {
    headline: "You solved the case",
    subhead: "More mysteries. Hidden clues. Secret messages. Solve them all.",
    ctaLabel: "Continue",
  },
};
