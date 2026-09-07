import type { CaseConfig } from "../types/case";

import {
  iconGlimpse,
  iconNotes,
  iconCalendar,
  iconWeather,
  iconRevoBank,
  iconWallet,
  iconMailly,
  iconPhotos,
  iconClock,
  iconPinpoint,
  iconCompass,
  iconCalculator,
  iconSettings,
  iconMessages,
  iconPhone,
  iconChatta,
} from "../Assets/Icons/icons";

import agentAvatar from "../Assets/UI/agent-avatar.webp";
import wallpaper from "../Assets/UI/wallpaper-blue.jpg";
import matchAshley from "../Assets/UI/match-ashley.jpg";
import matchMegan from "../Assets/UI/match-megan.jpg";
import matchChloe from "../Assets/UI/match-chloe.jpg";

import kevin from "../Assets/KB2/kevin.webp";
import mia from "../Assets/KB2/mia.webp";
import noah from "../Assets/KB2/noah.webp";
import evidenceMiaNoah from "../Assets/KB2/evidence-mia-noah.webp";
import hero from "../Assets/KB2/hero.webp";

/**
 * KB2 — "Long distance". Kevin (away for work) suspects his girlfriend Mia
 * is secretly seeing someone else. Owner: Mia. Third character: Noah.
 */
export const demoCase: CaseConfig = {
  caseTitle: "Kevin & Mia",
  tagline: "The phone is in your hands. Every answer is hiding somewhere inside it.",
  heroImage: hero,
  evidenceTotal: 16,
  hintBudget: 4,
  evidenceRounds: [
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "Search her Chatta for clues. Is she texting someone she shouldn't be?",
      choices: ["Mom", "N.", "Her boss", "Her sister"],
      correct: "N.",
      correctReply: "A contact saved as just 'N.'... found it. Keep digging.",
      wrongReply: ["That's just a normal contact. Keep looking.", "Not that one. Check again — someone's off."],
      reward: 10,
      hint: "Open Chatta and check who she's really talking to at night.",
      hintApp: "whatsapp",
    },
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "Glimpse has a private post. Who is she getting coffee with?",
      choices: ["A coworker", "Noah", "Her cousin", "A college friend"],
      correct: "Noah",
      correctReply: "Noah... same initial as 'N.' in Chatta. Sit tight — one more piece.",
      wrongReply: ["Check the caption again.", "Still not him. Look at the post again."],
      reward: 10,
      hint: "Open Glimpse and check her most recent post.",
      hintApp: "instagram",
    },
    {
      informant: { name: "Agent Iris", avatar: agentAvatar },
      prompt: "There's an odd note saved on her phone. What does it say?",
      choices: ["Grocery list", "Meet Noah at 8 — don't tell Kevin", "Work reminder", "Doctor's appointment"],
      correct: "Meet Noah at 8 — don't tell Kevin",
      correctReply: "A meetup, and she's asking to keep it from you. That's everything I need.",
      wrongReply: ["Not that note — try the other one.", "Nope. Look again in Notes."],
      reward: 10,
      hint: "Open Notes and look for anything mentioning Noah.",
      hintApp: "notes",
    },
  ],
  client: {
    name: "Agent Iris",
    avatar: agentAvatar,
    hire: [
      { type: "msgs", text: "Hey... I need your help. My girlfriend Mia's been acting distant ever since I left for this work trip." },
      { type: "reveal", src: mia, label: "Mia", text: "This is her — Mia. My girlfriend of three years." },
      { type: "reveal", src: hero, label: "Kevin & Mia", text: "We've been inseparable since college — until this trip put an ocean between us." },
      { type: "mysteryReveal", label: "Unknown", text: "Lately she goes quiet every night around the same time. Like she's hiding something. Or someone." },
      { type: "choices", options: ["Take the case", "Are you sure?"] },
      { type: "msgs", text: "Good. Here's the case file — her fictional phone, unlocked for the investigation." },
      { type: "cta", label: "Search the phone 🔍" },
    ],
    matches: [
      { name: "Ashley", age: 25, photo: matchAshley },
      { name: "Megan", age: 24, photo: matchMegan },
      { name: "Chloe", age: 27, photo: matchChloe },
    ],
    matchThread: {
      name: "Chloe",
      avatar: matchChloe,
      msgs: [{ me: false, text: "Hey! Great match 😊" }],
    },
  },
  hint: "Try opening each app on the phone to find clues.",
  owner: { first: "Mia", full: "Mia Bennett", avatar: mia },
  wallpaper,
  home: {
    pages: [
      [
        { app: "instagram", label: "Glimpse", icon: iconGlimpse },
        { app: "notes", label: "Notes", icon: iconNotes },
        { app: "photos", label: "Photos", icon: iconPhotos },
        { app: "calendar", label: "Calendar", icon: iconCalendar },
        { app: "weather", label: "Weather", icon: iconWeather },
        { app: "revolut", label: "RevoBank", icon: iconRevoBank },
        { app: "wallet", label: "Wallet", icon: iconWallet },
        { app: "gmail", label: "Mailly", icon: iconMailly },
      ],
      [
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
      title: "Mom",
      time: "09:41",
      unread: false,
      msgs: [
        { me: false, text: "Call me when you land" },
        { me: true, text: "Will do, love you" },
      ],
    },
    {
      id: "m2",
      title: "Work",
      time: "Yesterday",
      unread: false,
      msgs: [{ me: false, text: "Standup moved to 10am tomorrow" }],
    },
  ],
  whatsapp: [
    {
      id: "w1",
      title: "N.",
      time: "23:47",
      unread: true,
      msgs: [
        { me: false, text: "I miss you so much. When can we see each other again?" },
        { me: true, text: "Soon, I promise. Just be patient a little longer." },
        { me: false, text: "I can't stop thinking about you 😘" },
      ],
    },
    {
      id: "w2",
      title: "Mom",
      time: "08:15",
      unread: false,
      msgs: [{ me: false, text: "Dinner on Sunday?" }],
    },
  ],
  calls: [
    { name: "Kevin", time: "Yesterday, 7:12 PM", type: "outgoing" },
    { name: "Mom", time: "Yesterday, 6:03 PM", type: "incoming" },
    { name: "Unknown Number", time: "Monday, 11:40 PM", type: "missed" },
  ],
  weather: { city: "Chicago", tempC: 15, hi: 18, lo: 9, condition: "Cloudy" },
  revolut: {
    balance: "$2,140.55",
    transactions: [
      { name: "Grocery Mart", amount: "-$64.20" },
      { name: "Salary", amount: "+$2,600.00" },
      { name: "The Daily Grind Café", amount: "-$8.50" },
      { name: "RideGo", amount: "-$14.00" },
      { name: "Rent", amount: "-$950.00" },
      { name: "Gift Shop Downtown", amount: "-$32.00" },
      { name: "Soundwave", amount: "-$10.99" },
      { name: "ATM Withdrawal", amount: "-$60.00" },
    ],
  },
  maps: {
    locations: [
      { name: "Home", subtitle: "Visited daily" },
      { name: "Office", subtitle: "Weekdays" },
      { name: "The Daily Grind Café", subtitle: "Visited 4 times this week" },
    ],
  },
  notes: [
    { title: "Note", body: "Meet Noah at 8 — don't tell Kevin" },
    { title: "Note", body: "Pick up dry cleaning" },
  ],
  calendar: [
    { title: "Yoga class", date: "09/12" },
    { title: "Team meeting", date: "09/14" },
  ],
  instagram: {
    username: "mia.bennett",
    displayName: "Mia Bennett",
    avatar: mia,
    posts: [
      { image: evidenceMiaNoah, location: "The Daily Grind", caption: "Coffee with Noah ☕️" },
      { image: mia, location: "Downtown" },
      { image: hero, location: "Home", caption: "Missing this one" },
    ],
  },
  airbnb: {
    name: "Weekend Getaways",
    img: hero,
    listings: [{ title: "Lakeside Cabin", img: hero, rating: "4.8", subtitle: "Entire cabin", price: "$140/night" }],
  },
  gmail: [
    { sender: "HR Department", subject: "Travel itinerary confirmed", preview: "Your business trip itinerary has been confirmed for..." },
  ],
  photos: [{ src: mia }, { src: kevin }, { src: hero }, { src: noah }],
  vaultCode: "0000",
  endCard: {
    headline: "You solved the case",
    subhead: "More mysteries. Hidden clues. Secret messages. Solve them all.",
    ctaLabel: "Continue",
  },
};
