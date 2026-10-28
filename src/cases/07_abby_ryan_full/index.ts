import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v15 — "Abby & Ryan" (dựa trên story_39_case_1.json, bản đủ 15 câu), dựng
 * trên NỀN v10 (Intro.tsx — đoạn chat tự chạy từ mảng `hire`, không phải
 * NotifStack đen của v13/14 hay CinematicSurveillance của v11). v10 không
 * có Ledger/Trust/VictimReveal/note khoá PIN/coupleIntro/targetPeople —
 * mọi nội dung bên dưới đã lược bớt cho khớp CaseConfig của v10 (xem
 * src/types/case.ts).
 */

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });
const img = (name: string) => images[`./img/${name}.webp`] ?? "";

const TODAY = new Date();
const addDays = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
};
const fmtDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
const fmtMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const fmtLabel = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const AUSTIN_DATE = addDays(9);

function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const icon = (app: AppKey, label: string): AppIcon => ({ app, label, icon: img(`appicon_${app === "revolut" ? "revolut" : app}`) });

const dock: AppIcon[] = [icon("phone", "Phone"), icon("messages", "Messages"), icon("gmail", "Mail"), icon("photos", "Photos")];
const page1: AppIcon[] = [
  icon("notes", "Notes"),
  icon("airbnb", "Airbnb"),
  icon("revolut", "Bank"),
  icon("maps", "Maps"),
  icon("calendar", "Calendar"),
  icon("instagram", "Instagram"),
  icon("whatsapp", "WhatsApp"),
  icon("settings", "Settings"),
  icon("clock", "Clock"),
];
const page2: AppIcon[] = [icon("weather", "Weather"), icon("calculator", "Calculator"), icon("wallet", "Wallet"), icon("compass", "Compass")];

// Intro.tsx (v10) tự chạy tuần tự đúng mảng này (gõ chữ rồi mờ dần sang bước
// kế, dừng ở "choices"/"cta") — không có text-matching ẩn như CinematicSurveillance.
const hire: HireStep[] = [
  { type: "msgs", text: "Hey... are you the one who finds out the truth about people? 🥺" },
  { type: "msgs", text: "Ryan and I have been together 4 years. A cat named Pickles, a tiny apartment, Sunday pancakes." },
  { type: "reveal", text: "I thought we were the boring, happy kind.", src: img("abby_ryan_duo"), label: "Abby & Ryan" },
  { type: "msgs", text: "For weeks his phone has lit up past midnight. Every time, he turns it face down." },
  { type: "msgs", text: "He left his phone with me this morning. I can't make myself look." },
  { type: "choices", options: ["I'll check his phone 🔍", "Don't jump to conclusions yet ✋"] },
  { type: "cta", label: "Open Ryan's phone 🔍" },
];

const QUESTIONS: {
  prompt: string;
  answer: string;
  decoys: string[];
  hint: string;
  hintApp: AppKey;
  target?: string;
  steps?: { app: AppKey; target?: string }[];
  reply: string;
}[] = [
  {
    prompt: "Sorry, I know this is a lot to drop on you. I just want to make sure this is actually his phone. You know his first name is Ryan — what's his last name?",
    answer: "Callahan",
    decoys: ["Collins", "Carter", "Calloway"],
    hint: "Tap Settings (the grey gear icon). His full name is at the very top of the screen.",
    hintApp: "settings",
    reply: "Okay. It really is his phone 😳",
  },
  {
    prompt: "Okay, it's his phone. For weeks it's been lighting up past midnight, and he turns it face down every time 😔 I bet he'd never save them under their real name. What did he save that suspicious contact as in his chatting app?",
    answer: "DELETE LATER",
    decoys: ["Unknown", "Work - Mike", "Gym Buddy"],
    hint: "Open Messages and look at the list of chats — one contact name looks off.",
    hintApp: "messages",
    target: "DELETE LATER",
    reply: "He always planned to hide this 💔",
  },
  {
    prompt: "So he always planned to hide it. Four years together, and he keeps a contact he means to erase. What real name does he call this person in their chat?",
    answer: "Lauren",
    decoys: ["Megan", "Hannah", "Rachel"],
    hint: "Open that DELETE LATER chat and read what he calls her.",
    hintApp: "messages",
    target: "DELETE LATER",
    reply: "A woman. Of course it's a woman 💔",
  },
  {
    prompt: "A woman. Of course it's a woman 💔 We met at a friend's barbecue — I never imagined him swiping on strangers. Which dating app did they match on?",
    answer: "Hinge",
    decoys: ["Tinder", "Bumble", "Facebook Dating"],
    hint: "Scroll all the way up in that chat to their very first message.",
    hintApp: "messages",
    target: "DELETE LATER",
    reply: "Swiping on strangers... really? 😡",
  },
  {
    prompt: "He's been spending more than usual lately and blaming work. I bet some of that money went on her. If he bought her a gift, what was it?",
    answer: "Earrings",
    decoys: ["Necklace", "Bracelet", "Perfume"],
    hint: "Open Mail and look for a store email about a gift ready for pickup.",
    hintApp: "gmail",
    reply: "Jewelry for her, nothing for me 💍😤",
  },
  {
    prompt: "He hasn't bought me jewelry since our first anniversary. He told me money was tight this month. How much did he pay for the earrings?",
    answer: "$340",
    decoys: ["$240", "$430", "$310"],
    hint: "Open RevoBank → Current Account → find the jewelry store payment.",
    hintApp: "revolut",
    reply: "More than he's spent on me all year 😤",
  },
  {
    prompt: "That's more than he's spent on me all year. One of those nights in San Diego he barely texted me back. I bet he skipped his work Airbnb and booked somewhere just for that night. Which place did he book for just that one night?",
    answer: "Seaside Cottage",
    decoys: ["Ocean Breeze Loft", "Harbor View Suite", "Pacific Bungalow"],
    hint: "Open Airbnb → his work stay covers the whole trip — find the extra one-night booking.",
    hintApp: "airbnb",
    target: "Seaside Cottage",
    reply: "He booked a whole extra night 🏖️",
  },
  {
    prompt: "So he really did sneak off for a night. A whole night with her — he must have taken her out somewhere first. Which restaurant did they eat at that night?",
    answer: "Harbor & Pine",
    decoys: ["Seaside Grill", "The Pearl", "Juniper Kitchen"],
    hint: "Open Mail and look for a reservation confirmation.",
    hintApp: "gmail",
    reply: "Candlelight. A table for two 😢",
  },
  {
    prompt: "Candlelight and a table for two. I can see it now 😤 I keep wondering if she's a stranger down there or someone close to home. What street does she live on?",
    answer: "Cedar Street",
    decoys: ["Maple Avenue", "Oak Street", "Elm Drive"],
    hint: "Open Maps and look at his saved places.",
    hintApp: "maps",
    target: "Lauren ❤️",
    reply: "She lives right here in town 😳",
  },
  {
    prompt: "She lives right here in town. I could have walked past her. That night I texted him goodnight like nothing was wrong. What did he text me he was doing that night?",
    answer: "Team dinner",
    decoys: ["Client meeting", "Gym", "Working late"],
    hint: "Open his chat with Abby ❤️ (that's me) and read what he said that night.",
    hintApp: "messages",
    target: "Abby ❤️",
    reply: "He lied to my face that night 😭",
  },
  {
    prompt: "And I believed him. There are photos on this phone I'm not meant to see — I just know it. What's the code for his hidden photos?",
    answer: "481207",
    decoys: ["482017", "418702", "740812"],
    hint: "Check Notes for a list of codes.",
    hintApp: "notes",
    target: "Codes",
    reply: "He's hiding photos from me 🔒",
  },
  {
    prompt: "Okay. I need to see it with my own eyes, even if it hurts 🥲 Weeks? Months? A whole year? I can't even guess. How long have they been together?",
    answer: "6 months",
    decoys: ["3 months", "1 year", "9 months"],
    hint: "Open Notes → \"Codes\" for the vault PIN, then unlock Photos with it and read the cake.",
    hintApp: "photos",
    steps: [
      { app: "notes", target: "Codes" },
      { app: "photos" },
    ],
    reply: "Six months. Half a year of lying 💔",
  },
  {
    prompt: "Half a year of lying to my face 💔 Now I have a face to go with the name. What's her last name?",
    answer: "Reyes",
    decoys: ["Ramirez", "Rivers", "Romero"],
    hint: "Open Maps again — that same saved pin near Cedar Street also lists her full name.",
    hintApp: "maps",
    target: "Lauren ❤️",
    reply: "Now I have a face to go with the name 😔",
  },
  {
    prompt: "I'll remember that name. He has another \"conference\" coming up soon, and I bet she's going too. Which city is he taking her to next?",
    answer: "Austin",
    decoys: ["Denver", "Nashville", "Chicago"],
    hint: "Open Calendar and look at what's coming up.",
    hintApp: "calendar",
    target: "Conference – Austin · L ❤️",
    reply: "Another trip. Another lie waiting to happen ✈️",
  },
  {
    prompt: "He promised to take me there someday. His family's been tiptoeing around me lately. Someone knows, and I bet they've pushed him to come clean. When is he planning to tell me about her?",
    answer: "After her birthday",
    decoys: ["After the holidays", "Next month", "Never"],
    hint: "Read his chat with Jake, his brother.",
    hintApp: "messages",
    target: "Jake (brother)",
    reply: "Thank you for showing me. 💔",
  },
];

const evidenceRounds: CaseConfig["evidenceRounds"] = QUESTIONS.map((q, i) => ({
  informant: { name: "Abby", avatar: img("abby") },
  prompt: q.prompt,
  choices: seededShuffle([q.answer, ...q.decoys], i + 3),
  correct: q.answer,
  correctReply: q.reply,
  wrongReply: ["Not that. Look again.", `Still no — hint: ${q.hint}`],
  reward: 10,
  hint: q.hint,
  hintApp: q.hintApp,
  hintTargetId: q.target,
  hintSteps: q.steps,
}));

const deleteLaterThread: MessageThread = {
  id: "t1",
  title: "DELETE LATER",
  time: "Yesterday",
  unread: false,
  msgs: [
    { me: false, text: "So glad we matched 😅 Never thought Hinge would actually work" },
    { me: true, text: "Well I'm glad you did. So what do you do when you're not on apps?" },
    { me: false, text: "I teach pilates. So basically I yell \"squeeze\" at people for a living 😂" },
    { me: true, text: "Did it arrive okay? 📦" },
    { me: false, text: "Thank you for the gift 🥹 You spoil me ❤️" },
    { me: true, text: "Anything for you. Counting down to Friday." },
    { me: true, text: "Night, Lauren ❤️" },
    { me: false, text: "Miss you already ❤️" },
  ],
};

const messages: MessageThread[] = [
  deleteLaterThread,
  {
    id: "t2",
    title: "Abby ❤️",
    time: "Fri",
    unread: false,
    msgs: [
      { me: false, text: "Pancakes are getting cold, Callahan" },
      { me: true, text: "Team dinner ran late, heading to bed 😴" },
      { me: false, text: "Night, Ryan ❤️" },
    ],
  },
  {
    id: "t3",
    title: "Jake (brother)",
    time: "Mon",
    unread: false,
    msgs: [
      { me: false, text: "When are you telling Abby?" },
      { me: true, text: "After her birthday. I'm not ruining that." },
    ],
  },
  {
    id: "t4",
    title: "Ironworks Gym",
    time: "Sun",
    unread: false,
    msgs: [{ me: false, text: "Your membership renews July 1. Your card on file will be charged $39.99." }],
  },
  {
    id: "t5",
    title: "Mom",
    time: "Sat",
    unread: false,
    msgs: [{ me: false, text: "Did you see the game last night?? Refs robbed us" }],
  },
];

const config: CaseConfig = {
  caseTitle: "Delete Later",
  tagline: "Who is she, really?",
  heroImage: img("hero"),
  evidenceTotal: evidenceRounds.length,
  hintBudget: 4,
  evidenceRounds,
  client: {
    name: "Abby",
    avatar: img("abby"),
    hire,
    matches: [],
    matchThread: { name: "", avatar: "", msgs: [] },
  },
  hint: "Open the apps on the phone to find clues.",
  owner: { first: "Ryan", full: "Ryan Callahan", avatar: img("ryan") },
  wallpaper: img("ryan_checkin"),
  home: { pages: [page1, page2], dock },
  messages,
  whatsapp: [],
  calls: [],
  notes: [
    { title: "Codes", body: "Photos: 481207\nWiFi: ryanhome2021" },
    { title: "Grocery", body: "Coffee, eggs, Pickles' food" },
    { title: "Conference — Austin", body: "Flight + hotel booked. Don't mention to Abby yet." },
  ],
  calendar: [
    { title: "Conference – Austin · L ❤️", date: fmtDate(AUSTIN_DATE), month: fmtMonthKey(AUSTIN_DATE), dateLabel: fmtLabel(AUSTIN_DATE), time: "All day" },
  ],
  instagram: { username: "ryan.callahan", displayName: "Ryan Callahan", avatar: img("ryan"), posts: [] },
  airbnb: {
    name: "Ryan Callahan",
    img: img("wallpaper"),
    listings: [
      { title: "Gaslamp studio near the convention center - San Diego", img: img("gaslamp_studio"), subtitle: "San Diego · 3 nights · work trip", price: "$540 total", rating: "4.8" },
      { title: "Seaside Cottage", img: img("seaside_cottage"), subtitle: "San Diego · 1 night, inside the same trip", price: "$230/night", rating: "4.9" },
    ],
  },
  gmail: [
    {
      sender: "Kestrel Jewelers",
      subject: "Your gift is ready for pickup",
      preview: "Good news: your order is gift-wrapped and ready",
      body: "Hi Ryan,\n\nGood news: your order is gift-wrapped and ready for pickup at our K Street store.\n\nItem: 14k gold hoop earrings\nGift wrap: Yes, with a card\n\nThank you for shopping with us,\nKestrel Jewelers",
      time: "Tue",
    },
    {
      sender: "Harbor & Pine",
      subject: "Your table is confirmed",
      preview: "Party size: table for 2 · Fri 7:30 PM",
      body: "Hi Ryan,\n\nYour table is confirmed at Harbor & Pine.\n\nParty size: table for 2\nTime: 7:30 PM\nName on reservation: Callahan\n\nSee you soon,\nThe Harbor & Pine team",
      time: "Fri",
    },
    {
      sender: "Brightline HR",
      subject: "Per diem reminder",
      preview: "Per diem for travel days is $65. Keep receipts.",
      time: "Mon",
    },
    {
      sender: "Capitol Auto Care",
      subject: "Your vehicle is ready",
      preview: "Total $89.40. Rear brake pads at 30%.",
      time: "Mon",
    },
  ],
  photos: [
    { src: img("abby_ryan_duo") },
    { src: img("team_photo") },
    { src: img("cake_reveal"), secret: true },
  ],
  vaultCode: "481207",
  weather: { city: "Sacramento", tempC: 24, hi: 27, lo: 16, condition: "Clear" },
  revolut: {
    balance: "$8,420.50",
    transactions: [
      { name: "Kestrel Jewelers", amount: "-$340.00", date: "Tue", note: "Jewelry store" },
      { name: "Seaside Cottage", amount: "-$230.00", date: "Fri", note: "Airbnb · 1 night" },
      { name: "Harbor & Pine", amount: "-$165.00", date: "Fri", note: "Dinner for 2" },
      { name: "Ironworks Gym", amount: "-$39.99", date: "Sun", note: "Membership renewal" },
      { name: "Capitol Auto Care", amount: "-$89.40", date: "Mon", note: "Brake pads" },
      { name: "Payroll · Brightline", amount: "+$3,120.00", date: "Fri" },
    ],
  },
  maps: {
    locations: [
      { name: "Lauren ❤️", subtitle: "Lauren Reyes · 214 Cedar Street, Sacramento" },
      { name: "Ironworks Gym", subtitle: "Sacramento · visited often" },
      { name: "Harbor & Pine", subtitle: "San Diego" },
    ],
    sectionLabel: "Saved places",
  },
  endCard: {
    headline: "I'm not going to wait.",
    subhead: "Six months, a cottage by the sea, and a contact he meant to delete. I'm sitting him down tonight.",
    ctaLabel: "See what happens next",
  },
};

export default { id: "07_abby_ryan_full", label: config.caseTitle, config };
