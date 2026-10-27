import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v14 — "Abby & Ryan": dựa thẳng trên story_39.json (nhân vật/ảnh thật lấy từ
 * GCS bucket của case đó: abby, ryan, lauren, ảnh bánh "Happy 6 months").
 * Khác v13 (Daniel, 5 nạn nhân khác nhau): đây là 1 CÔ GÁI DUY NHẤT — 6 câu
 * là 1 chuỗi manh mối NỐI TIẾP nhau leo thang theo số tiền Ryan chi cho cô ấy
 * (Hinge → quà → giá quà → Airbnb → nhà hàng → album ảnh khoá). Câu 6 mới lộ
 * mặt + tên + tuổi Lauren (thẻ VictimReveal chỉ bật đúng 1 lần, không lặp lại
 * như v13). Kết thúc vẫn là tờ Ledger (giờ là "Ryan đã chi bao nhiêu cho cô
 * ấy") + teaser cảnh đối chất.
 */

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });
const img = (name: string) => images[`./img/${name}.webp`] ?? "";

// v14: mọi ngày trong case đồng bộ theo ngày THẬT của máy người chơi (không
// hard-code "2026-11-..." nữa) — tính 1 lần lúc module load, luôn là "hôm
// nay" đúng lúc ai đó mở quảng cáo, bất kể build từ lúc nào.
const TODAY = new Date();
const addDays = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
};
const fmtDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
const fmtMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const fmtLabel = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
/** mm+dd ghép lại — dùng làm mã PIN 4 số lấy từ 1 ngày trên Calendar. */
const pin4 = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

const BIRTHDAY_DATE = addDays(5);
const PIN_DATE = addDays(2); // ngày "Don't forget 🎉" — mã PIN của note "This week"
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

const hire: HireStep[] = [
  { type: "msgs", text: "Hey... are you the one who finds out the truth about people? 🥺" },
  { type: "msgs", text: "Ryan and I have been together 4 years. A cat named Pickles, a tiny apartment, Sunday pancakes." },
  { type: "reveal", text: "I thought we were the boring, happy kind.", src: img("abby_ryan_duo"), label: "Abby & Ryan" },
  { type: "msgs", text: "For weeks his phone has lit up past midnight. Every time, he turns it face down." },
  { type: "reveal", text: "He just got back from a work trip to San Diego. One of those nights, he barely texted back.", src: img("hero"), label: "Something's off" },
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
  victim?: string;
  reply: string;
}[] = [
  {
    prompt: "Hi, I'm Abby — his girlfriend. Okay, it's his phone. For weeks it's been lighting up past midnight, and he turns it face down every time 😔 I bet he'd never save them under their real name. What did he save that suspicious contact as in his chatting app?",
    answer: "DELETE LATER",
    decoys: ["Unknown", "Work - Mike", "Gym Buddy"],
    hint: "Open Messages and look at the list of chats — one contact name looks off.",
    hintApp: "messages",
    target: "DELETE LATER",
    reply: "So he always planned to hide it. Four years together, and he keeps a contact he means to erase.",
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
    reply: "Hinge. They matched like any two strangers on an app.",
  },
  {
    prompt: "He's been spending more than usual lately and blaming work. I bet some of that money went on her. If he bought her a gift, what was it?",
    answer: "Earrings",
    decoys: ["Necklace", "Bracelet", "Perfume"],
    hint: "Open Mail and look for a store email about a gift ready for pickup.",
    hintApp: "gmail",
    reply: "14k gold hoop earrings. He hasn't bought ME jewelry since our anniversary 💔",
  },
  {
    prompt: "He hasn't bought me jewelry since our first anniversary. He told me money was tight this month. How much did he pay for the earrings?",
    answer: "$340",
    decoys: ["$230", "$410", "$185"],
    hint: "Open RevoBank → Current Account → find the jewelry store payment.",
    hintApp: "revolut",
    reply: "$340. That's more than he's spent on me all year 😤",
  },
  {
    prompt: "And I believed him. There are photos on this phone I'm not meant to see — I just know it. Who is she, really?",
    answer: "Lauren Reyes, 29",
    decoys: ["Megan Hart, 27", "Sarah Kim, 31", "Chloe Diaz, 26"],
    hint: "Open Notes → \"Codes\" for the vault PIN, then unlock Photos with it.",
    hintApp: "notes",
    steps: [
      { app: "notes", target: "Codes" },
      { app: "photos", target: "cake" },
    ],
    victim: "Lauren Reyes, 29",
    reply: "Six months. Her name is Lauren Reyes. She's 29. 💔",
  },
  {
    prompt: "Her name, her face... and still one more note he never finished deleting. I think it's everything he's spent on her. How much, all together?",
    answer: "$735",
    decoys: ["$570", "$905", "$650"],
    hint: "Check his Calendar for a date he won't forget, then use it as the PIN for the locked note in Notes.",
    hintApp: "calendar",
    steps: [
      { app: "calendar", target: "Don't forget 🎉" },
      { app: "notes", target: "This week" },
    ],
    reply: "$735. That's what he spent on her — in one week.",
  },
];

const VICTIMS = [
  { name: "Lauren Reyes, 29", avatar: img("lauren"), blurAvatar: img("blur_lauren"), line: "Pilates instructor" },
];
const victimOf = (name: string) => VICTIMS.find((v) => v.name === name);

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
  victim: q.victim ? victimOf(q.victim) : undefined,
}));

// "DELETE LATER" — contact Ryan never renamed. Avatar/tên thật giấu kín (v13
// convention): Messages app không lộ mặt cô ấy, chỉ lộ nội dung chat.
const deleteLaterThread: MessageThread = {
  id: "t1",
  title: "DELETE LATER",
  time: "Yesterday",
  unread: false,
  msgs: [
    { me: false, text: "So glad we matched 😅 Never thought Hinge would actually work" },
    { me: true, text: "Well I'm glad you did. So what do you do when you're not on apps?" },
    { me: false, text: "I teach pilates. So basically I yell \"squeeze\" at people for a living 😂" },
    { me: true, text: "Did the earrings arrive okay?" },
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
      { me: false, text: "His family's been weird lately 👀 you good?" },
      { me: true, text: "I'll tell her. Just... after her birthday. I'm not ruining that." },
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
    {
      title: "This week",
      body: "Earrings — $340\nSeaside Cottage · 1 night — $230\nDinner for two — $165\n\nTotal: $735",
      lock: pin4(PIN_DATE),
      lockHint: "A date he won't forget",
    },
    { title: "Grocery", body: "Coffee, eggs, Pickles' food" },
    { title: "Conference — Austin", body: "Flight + hotel booked. Don't mention to Abby yet." },
  ],
  calendar: [
    { title: "Abby's birthday", date: fmtDate(BIRTHDAY_DATE), month: fmtMonthKey(BIRTHDAY_DATE), dateLabel: fmtLabel(BIRTHDAY_DATE), time: "All day" },
    { title: "Don't forget 🎉", date: fmtDate(PIN_DATE), month: fmtMonthKey(PIN_DATE), dateLabel: fmtLabel(PIN_DATE), time: "All day" },
    { title: "Conference — Austin", date: fmtDate(AUSTIN_DATE), month: fmtMonthKey(AUSTIN_DATE), dateLabel: fmtLabel(AUSTIN_DATE), time: "All day" },
  ],
  instagram: { username: "ryan.callahan", displayName: "Ryan Callahan", avatar: img("ryan"), posts: [] },
  airbnb: {
    name: "Ryan Callahan",
    img: img("wallpaper"),
    listings: [
      { title: "Gaslamp Studio near the convention center", img: img("gaslamp_studio"), subtitle: "San Diego · 3 nights · work trip", price: "$540 total", rating: "4.8" },
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
    { src: img("abby_ryan_duo"), date: "2 weeks ago" },
    { src: img("team_photo"), date: "San Diego · last week", caption: "Brightline team photo, coworkers only" },
    { id: "cake", src: img("cake_reveal"), secret: true, date: "Aug 1", caption: "Lauren Reyes — Happy 6 months 🎂" },
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
      { name: "Ironworks Gym", subtitle: "Sacramento · visited often" },
      { name: "Harbor & Pine", subtitle: "San Diego" },
    ],
    sectionLabel: "Recent places",
  },
  // v14: không set `now` nữa — Calendar.tsx tự dùng `new Date()` (ngày thật
  // của máy người chơi) khi field này vắng mặt, khớp đúng yêu cầu "mọi ngày
  // trong case đồng bộ ngày thực tế".
  scamIntro: {
    headline: "He's been distant for weeks, and tonight a message landed that wasn't meant for me.",
    sub: "",
    bubble: "Team dinner ran late, heading to bed 😴",
    cta: "Expose Ryan 🔍",
    hookText: "He's spending on someone new.\nWho is she?",
  },
  trust: {
    label: "Trust in Ryan",
    clientReactions: [
      { min: 100, text: "Something feels off... 🤔" },
      { min: 86, text: "He always planned to hide this 💔" },
      { min: 71, text: "A woman. Of course it's a woman 💔" },
      { min: 57, text: "He spent more on her than on me 😤" },
      { min: 43, text: "I never imagined him swiping on strangers 😭" },
      { min: 29, text: "I need to see her face. I need to know 🥲" },
      { min: 14, text: "Six months. Her name is Lauren Reyes. 💔" },
      { min: 0, text: "Thank you for showing me. 💔" },
    ],
  },
  ledger: {
    heading: "WHAT HE SPENT",
    subheading: "All in one week",
    rows: [
      { name: "Lauren Reyes, 29", avatar: img("lauren"), item: "Gold hoop earrings", itemEmoji: "💎", amount: "$340", note: "Tue · Kestrel Jewelers" },
      { name: "Lauren Reyes, 29", avatar: img("lauren"), item: "Seaside Cottage · 1 night", itemEmoji: "🏖️", amount: "$230", note: "Fri · Airbnb" },
      { name: "Lauren Reyes, 29", avatar: img("lauren"), item: "Dinner for two", itemEmoji: "🍽️", amount: "$165", note: "Fri · Harbor & Pine" },
    ],
    totalLabel: "TOTAL",
    total: "$735",
    highlightTag: "",
    cta: "Continue",
  },
  endCard: {
    headline: "I'm in shock…",
    subhead: "Four years together, and he found someone new in six months.",
    ctaLabel: "See what happens next",
    teaser: {
      blurImage: img("ending_argue"),
      title: "THE ENDING",
      text: "Tonight, she's confronting him. Do you want to see how it ends?",
    },
    victims: VICTIMS,
  },
};

export default { id: "06_abby_ryan", label: config.caseTitle, config };
