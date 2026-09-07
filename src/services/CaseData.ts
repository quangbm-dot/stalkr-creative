import type { CaseConfig } from "../types/case";

import {
  iconGlimpse,
  iconMailly,
  iconPinpoint,
  iconChatta,
  iconNotes,
  iconCalendar,
  iconWeather,
  iconRevoBank,
  iconWallet,
  iconPhotos,
  iconClock,
  iconCompass,
  iconCalculator,
  iconSettings,
  iconMessages,
  iconPhone,
  iconUnknown,
} from "../Assets/Icons/icons";

import daniel from "../Assets/KB4/daniel.webp";
import sarah from "../Assets/KB4/sarah.webp";
import ivy from "../Assets/KB4/ivy.webp";
import evidenceDanielIvy from "../Assets/KB4/evidence-daniel-ivy.webp";
import hero from "../Assets/KB4/hero.webp";
import danielSmile from "../Assets/KB4/daniel-smile.webp";
import wallpaper from "../Assets/KB4/wallpaper.webp";

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
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "Glimpse has a tagged-location post. Who is he with?",
      choices: ["A coworker", "His sister", "An old college friend", "Ivy"],
      correct: "Ivy",
      correctReply: "Ivy — a name Sarah's never even heard. Keep digging.",
      wrongReply: ["Check the caption again.", "Not quite. Look at the post again."],
      reward: 10,
      hint: "Open Glimpse and check his most recent tagged post.",
      hintApp: "instagram",
    },
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "There's an odd note saved on his phone. What does it say?",
      choices: ["Grocery list", "Work reminder", "Car maintenance", "Meet Ivy at 7 — don't tell Sarah"],
      correct: "Meet Ivy at 7 — don't tell Sarah",
      correctReply: "A meetup, and he's asking to keep it from Sarah. That's everything I need.",
      wrongReply: ["Not that note — try the other one.", "Nope. Look again in Notes."],
      reward: 10,
      hint: "Open Notes and look for anything mentioning Ivy.",
      hintApp: "notes",
    },
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "Pinpoint tracks frequent visits. Where does he keep going?",
      choices: ["The gym", "The office", "Sunrise Café", "His parents' house"],
      correct: "Sunrise Café",
      correctReply: "The same café, over and over — exactly where they meet. Case closed.",
      wrongReply: ["That place is nothing unusual. Check again.", "Not quite — look at the visit history again."],
      reward: 10,
      hint: "Open Pinpoint and check his frequent places.",
      hintApp: "maps",
    },
  ],
  client: {
    name: "Unknown Number",
    avatar: iconUnknown,
    hire: [
      { type: "msgs", text: "hey... this is going to sound strange, but you deserve to know." },
      { type: "msgs", text: "he's been meeting up with an old classmate. more than once." },
      {
        type: "appReveal",
        src: evidenceDanielIvy,
        name: "Ivy",
        subtitle: "Tagged at Sunrise Café",
        appLabel: "Glimpse",
        appIcon: iconGlimpse,
        text: "he posted this — Ivy, from his old class.",
      },
      { type: "msgs", text: "he told you it was nothing. i don't think that's true." },
      { type: "choices", options: ["Who is this?", "Prove it."] },
      { type: "msgs", text: "His fictional phone — unlocked. See for yourself." },
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
    {
      id: "w4",
      title: "Dad",
      time: "Sunday",
      unread: false,
      msgs: [{ me: false, text: "Call me when you get a chance" }],
    },
    {
      id: "w5",
      title: "Neighbor",
      time: "Sunday",
      unread: false,
      msgs: [{ me: false, text: "Thanks for watering the plants!" }],
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
      { name: "Gym", subtitle: "Weekends" },
    ],
  },
  notes: [
    { title: "Note", body: "Fix the leaky faucet" },
    { title: "Note", body: "Pick up dry cleaning Friday" },
    { title: "Note", body: "Meet Ivy at 7 — don't tell Sarah" },
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
      { image: daniel, location: "Downtown" },
      { image: hero, location: "Home", caption: "Lucky to have her" },
      { image: evidenceDanielIvy, location: "Sunrise Café", caption: "Great catching up with Ivy ☕️" },
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
    { sender: "Bank Alerts", subject: "Your statement is ready", preview: "Your monthly account statement is now available..." },
    { sender: "Streaming Service", subject: "New shows added this week", preview: "Check out what's new for you this week..." },
    { sender: "Airline", subject: "Check-in now open", preview: "Your flight check-in is now available online..." },
  ],
  photos: [{ src: daniel }, { src: sarah }, { src: hero }],
  vaultCode: "0000",
  endCard: {
    headline: "You solved the case",
    subhead: "More mysteries. Hidden clues. Secret messages. Solve them all.",
    ctaLabel: "Continue",
  },
};
