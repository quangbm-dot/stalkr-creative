import type { CaseConfig } from "../types/case";

import iconInstagram from "../Assets/Icons/real/instagram.webp";
import iconGmail from "../Assets/Icons/real/gmail.webp";
import iconMaps from "../Assets/Icons/real/googlemaps.webp";
import iconWhatsapp from "../Assets/Icons/real/whatsapp.webp";
import iconNotes from "../Assets/Icons/real/notes.webp";
import iconPhotos from "../Assets/Icons/real/photos.webp";
import iconCalendar from "../Assets/Icons/real/calendar.webp";
import iconWeather from "../Assets/Icons/real/weather.webp";
import iconWallet from "../Assets/Icons/real/wallet.webp";
import iconRevoBank from "../Assets/Icons/real/revobank.webp";
import iconClock from "../Assets/Icons/real/alarm.webp";
import iconCompass from "../Assets/Icons/real/compass.webp";
import iconCalculator from "../Assets/Icons/real/calculator.webp";
import iconSettings from "../Assets/Icons/real/settings.webp";
import iconMessages from "../Assets/Icons/real/messages.webp";
import iconPhone from "../Assets/Icons/real/phone.webp";
import { iconUnknown } from "../Assets/Icons/icons";

import alex from "../Assets/KB3/alex.webp";
import sophia from "../Assets/KB3/sophia.webp";
import nadia from "../Assets/KB3/nadia.webp";
import hero from "../Assets/KB3/hero.webp";
import alexNight from "../Assets/KB3/alex-night.webp";
import wallpaper from "../Assets/KB3/wallpaper.webp";

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
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "Search his Gmail for clues. Is he emailing someone he shouldn't be?",
      choices: ["A coworker", "His brother", "A client", "nadia.ellis@..."],
      correct: "nadia.ellis@...",
      correctReply: "That email thread with Nadia... found it. Keep digging.",
      wrongReply: ["That's just a work email. Keep looking.", "Not that one. Check again — someone's off."],
      reward: 10,
      hint: "Open Gmail and check who he's really emailing.",
      hintApp: "gmail",
    },
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "RevoBank shows a recent gift purchase. Who was it sent to?",
      choices: ["N. Sterling", "Sophia", "His mom", "A best man gift"],
      correct: "N. Sterling",
      correctReply: "A gift for N. Sterling — not Sophia. That's not nothing.",
      wrongReply: ["Check the transaction list again.", "Still not that one. Look closer."],
      reward: 10,
      hint: "Open RevoBank and check the most recent transaction.",
      hintApp: "revolut",
    },
    {
      informant: { name: "Unknown", avatar: iconUnknown },
      prompt: "Maps tracks frequent visits. Where does he keep going that isn't work?",
      choices: ["The office", "The gym", "Riverside Café", "His parents' house"],
      correct: "Riverside Café",
      correctReply: "The same café, over and over, with no reason tied to work. I've got what I need.",
      wrongReply: ["That place is nothing unusual. Check again.", "Not quite — look at the visit history again."],
      reward: 10,
      hint: "Open Maps and check his frequent places.",
      hintApp: "maps",
    },
  ],
  client: {
    name: "Unknown Number",
    avatar: iconUnknown,
    hire: [
      { type: "msgs", text: "hey... this is going to sound strange, but you deserve to know." },
      { type: "msgs", text: "congrats on the engagement. he's still texting her though." },
      {
        type: "appReveal",
        src: nadia,
        name: "Nadia",
        subtitle: "Followed 2 days ago",
        appLabel: "Instagram",
        appIcon: iconInstagram,
        text: "he's been liking her posts all week. this is her.",
      },
      { type: "msgs", text: "he told you it was over between them. i don't think that's true." },
      { type: "choices", options: ["Who is this?", "Prove it."] },
      { type: "msgs", text: "His fictional phone — unlocked. See for yourself." },
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
        { app: "gmail", label: "Gmail", icon: iconGmail },
        { app: "revolut", label: "RevoBank", icon: iconRevoBank },
        { app: "instagram", label: "Instagram", icon: iconInstagram },
        { app: "photos", label: "Photos", icon: iconPhotos },
        { app: "calendar", label: "Calendar", icon: iconCalendar },
        { app: "weather", label: "Weather", icon: iconWeather },
        { app: "wallet", label: "Wallet", icon: iconWallet },
        { app: "notes", label: "Notes", icon: iconNotes },
      ],
      [
        { app: "maps", label: "Maps", icon: iconMaps },
        { app: "clock", label: "Clock", icon: iconClock },
        { app: "compass", label: "Compass", icon: iconCompass },
        { app: "calculator", label: "Calculator", icon: iconCalculator },
        { app: "settings", label: "Settings", icon: iconSettings },
      ],
    ],
    dock: [
      { app: "messages", label: "Messages", icon: iconMessages },
      { app: "phone", label: "Phone", icon: iconPhone },
      { app: "whatsapp", label: "WhatsApp", icon: iconWhatsapp },
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
    {
      id: "w2",
      title: "Best Man",
      time: "Yesterday",
      unread: false,
      msgs: [{ me: false, text: "Bachelor party ideas — thoughts?" }],
    },
    {
      id: "w3",
      title: "Gym Buddy",
      time: "Monday",
      unread: false,
      msgs: [{ me: false, text: "Same time tomorrow?" }],
    },
    {
      id: "w4",
      title: "Dad",
      time: "Monday",
      unread: false,
      msgs: [{ me: false, text: "Proud of you, son" }],
    },
    {
      id: "w5",
      title: "Work Group",
      time: "Sunday",
      unread: false,
      msgs: [{ me: false, text: "Reminder: standup at 9am" }],
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
      { name: "RideGo", amount: "-$22.00" },
      { name: "Tailor & Co.", amount: "-$210.00" },
      { name: "Rent", amount: "-$1,400.00" },
      { name: "Gift Shop — N. Sterling", amount: "-$150.00" },
      { name: "Soundwave", amount: "-$10.99" },
      { name: "ATM Withdrawal", amount: "-$80.00" },
    ],
  },
  maps: {
    locations: [
      { name: "Home", subtitle: "Visited daily" },
      { name: "Office", subtitle: "Weekdays" },
      { name: "Riverside Café", subtitle: "Visited 5 times this week" },
      { name: "Gym", subtitle: "Weekends" },
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
      { image: alexNight, location: "Home", caption: "Late night work" },
    ],
  },
  airbnb: {
    name: "Weekend Getaways",
    img: hero,
    listings: [{ title: "Beachfront Villa", img: hero, rating: "4.9", subtitle: "Entire villa", price: "$260/night" }],
  },
  gmail: [
    { sender: "Wedding Venue", subject: "Your booking confirmation", preview: "Thank you for booking with us! Your date is confirmed for..." },
    { sender: "Airline", subject: "Check-in now open", preview: "Your flight check-in is now available online..." },
    { sender: "Bank Alerts", subject: "Your statement is ready", preview: "Your monthly account statement is now available..." },
    { sender: "Gym Membership", subject: "Renewal reminder", preview: "Your membership will renew automatically on..." },
    { sender: "Online Store", subject: "Your order has shipped", preview: "Good news! Your recent order is on its way..." },
    { sender: "nadia.ellis@mailly.com", subject: "About last night", preview: "I miss you, don't worry about the engagement..." },
    { sender: "Streaming Service", subject: "New shows added this week", preview: "Check out what's new for you this week..." },
    { sender: "Credit Card", subject: "Your payment was received", preview: "Thank you, your recent payment has been processed..." },
  ],
  photos: [{ src: alex }, { src: sophia }, { src: hero }],
  vaultCode: "0000",
  endCard: {
    headline: "You solved the case",
    subhead: "More mysteries. Hidden clues. Secret messages. Solve them all.",
    ctaLabel: "Continue",
  },
};
