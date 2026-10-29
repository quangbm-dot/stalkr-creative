import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v15 — "Joanne & Walt" (dựa trên story_27_joanne_walt.json, bản đủ 20 câu —
 * Walt, 78 tuổi, trí nhớ giảm, lái xe đi trước khi trời sáng để trả tiền
 * chuộc cho cháu Tyler mà không ai thật sự bắt cóc). Chọn 7/20 câu gốc, bỏ
 * các câu cần app engine chưa có (Journal/Find My/Parcel/Blocked Contacts).
 * Bước ngoặt (câu 5): người bạn tử tế ở nhóm hỗ trợ tang quyến — Lorraine
 * Pike — chính là nguồn lộ tin cho bọn lừa đảo. Câu 7 chốt: con trai bà ta,
 * Dean Ferris, và nơi bà ta đang đưa Walt tới ngay lúc này.
 */

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });
const img = (name: string) => images[`./img/${name}.webp`] ?? "";

// Build ra 2 bản độ dài 5/7 câu (xem __ROUNDS__ ở vite.config.ts) — luôn cắt
// lấy N câu ĐẦU của chuỗi 7 câu đã chọn. Câu 5 ("Lorraine Pike") là bước
// ngoặt nên bản 5 câu vẫn kết đúng lúc twist lộ ra, không cụt giữa đường.
const MAX_ROUNDS = __ROUNDS__;

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

const dock: AppIcon[] = [icon("messages", "Messages"), icon("whatsapp", "WhatsApp"), icon("phone", "Phone"), icon("gmail", "Mail")];
const page1: AppIcon[] = [
  icon("notes", "Notes"),
  icon("calendar", "Calendar"),
  icon("revolut", "Bank"),
  icon("photos", "Photos"),
  icon("maps", "Maps"),
  icon("settings", "Settings"),
  icon("clock", "Clock"),
];
const page2: AppIcon[] = [icon("weather", "Weather"), icon("calculator", "Calculator"), icon("wallet", "Wallet"), icon("compass", "Compass")];

// Intro.tsx (v10) tự chạy tuần tự đúng mảng này (gõ chữ rồi mờ dần sang bước
// kế, dừng ở "choices"/"cta") — không có text-matching ẩn.
const hire: HireStep[] = [
  { type: "msgs", text: "My father didn't answer this morning. His car is gone, and his phone is just sitting on the counter." },
  { type: "reveal", text: "I'm Joanne. He's 78, and his memory has been slipping lately.", src: img("joanne_walt_duo"), label: "Joanne & Walt" },
  { type: "msgs", text: "He wouldn't just wander off. Something scared him enough to take all his savings." },
  { type: "choices", options: ["I'll check his phone 🔍", "Don't jump to conclusions yet ✋"] },
  { type: "msgs", text: "Thank you. I can't read through his private life alone. Please help me find my father." },
  { type: "cta", label: "Open Walt's phone 🔍" },
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
    prompt: "Dad's car is gone and his phone was sitting on the kitchen counter, next to his coffee mug. He never goes anywhere without telling someone. Not since Mom died. Who did he call right before he left?",
    answer: "Tyler",
    decoys: ["Stan Wojcik", "Irene", "Mrs. Baran"],
    hint: "Check his Phone, Recents.",
    hintApp: "phone",
    reply: "Tyler? At that hour? He'd still be asleep in his dorm.",
  },
  {
    prompt: "Tyler's fine, I just spoke to him. 😔 Dad isn't a gullible man. He spent forty years at a lathe checking everything twice. Someone worked hard to get to him. How much money did they ask him for?",
    answer: "$9,000",
    decoys: ["$6,800", "$90", "$200"],
    hint: "Check his Notes.",
    hintApp: "notes",
    target: "TYLER",
    reply: "That's a lot of what Mom left him. 💔",
  },
  {
    prompt: "That's a lot of what Mom left him. 💔 But he'd been happier lately, going out again, making new friends. If he told anyone, it would be them. Where did he meet his new friends?",
    answer: "Riverside Grief Circle",
    decoys: ["VFW Post 1121", "St. Anne's Parish", "Millvale Senior Center"],
    hint: "Look through his Mail.",
    hintApp: "gmail",
    reply: "I know that group. He always came home lighter from it.",
  },
  {
    prompt: "I know that group. He always came home lighter from it. But that caller knew things a stranger shouldn't. What did Dad say they called Tyler?",
    answer: "Bear",
    decoys: ["Champ", "Buddy", "Sport", "Tiger"],
    hint: "Check his Messages — find who he told about the call.",
    hintApp: "messages",
    target: "Lorraine",
    reply: "Only family calls him that. Mom started it when he was three.",
  },
  {
    prompt: "Only family calls him that. Mom started it when he was three. So who did he tell that name to, before any of this ever happened?",
    answer: "Lorraine Pike",
    decoys: ["Carol Hensley", "Stan Wojcik", "Mrs. Baran"],
    hint: "Scroll further up in that same chat.",
    hintApp: "messages",
    target: "Lorraine",
    reply: "She brought him casseroles. I hugged her in his driveway. 😤",
  },
  {
    prompt: "She brought him casseroles. I hugged her in his driveway. 😤 I didn't even know she had family nearby. What's her son's name?",
    answer: "Dean Ferris",
    decoys: ["Greg Novak", "Stan Wojcik", "Father Kozlowski"],
    hint: "Search his Mail — the grief group's picnic thank-you email.",
    hintApp: "gmail",
    reply: "Her own son. She's not just a friend from group anymore.",
  },
  {
    prompt: "Her own son. She's not just a friend from group anymore. She's with Dad right now, I'd bet my life on it. Where exactly is she taking him?",
    answer: "Bayview Motor Inn",
    decoys: ["Lakeside Motor Lodge", "Harborview Inn", "Presque Isle Motel", "Pier Street Inn"],
    hint: "Check Maps — a place shared with him recently.",
    hintApp: "maps",
    target: "Bayview Motor Inn",
    reply: "I'm in the car. I'm going to get my father.",
  },
];

const evidenceRounds: CaseConfig["evidenceRounds"] = QUESTIONS.slice(0, MAX_ROUNDS).map((q, i) => ({
  informant: { name: "Joanne", avatar: img("joanne") },
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

const lorraineThread: MessageThread = {
  id: "t1",
  title: "Lorraine",
  time: "2 days ago",
  unread: false,
  msgs: [
    { me: true, text: "We've called him Bear since he was three. His grandmother started it." },
    { me: false, text: "That's the sweetest thing I've heard all week. 💕" },
    { me: true, text: "He called him Bear. How would a stranger know that?" },
    { me: false, text: "Oh honey, young people put everything online." },
  ],
};

const messages: MessageThread[] = [
  lorraineThread,
  {
    id: "t2",
    title: "Jo ❤️",
    time: "Yesterday",
    unread: false,
    msgs: [
      { me: false, text: "Dad, call me back when you get this." },
      { me: true, text: "Sorry Jo. Was napping." },
    ],
  },
  {
    id: "t3",
    title: "Stan Wojcik",
    time: "Mon",
    unread: false,
    msgs: [{ me: false, text: "Fish fry Friday, same as always?" }],
  },
];

const config: CaseConfig = {
  caseTitle: "The Ransom for a Grandson Nobody Took",
  tagline: "Who really called him?",
  heroImage: img("hero"),
  evidenceTotal: evidenceRounds.length,
  hintBudget: 4,
  evidenceRounds,
  client: {
    name: "Joanne",
    avatar: img("joanne"),
    hire,
    matches: [],
    matchThread: { name: "", avatar: "", msgs: [] },
  },
  hint: "Open the apps on the phone to find clues.",
  owner: { first: "Walt", full: "Walt Kowalczyk", avatar: img("walt") },
  wallpaper: img("wallpaper"),
  home: { pages: [page1, page2], dock },
  messages,
  whatsapp: [],
  calls: [
    { name: "Tyler", time: "Today, 5:52 AM", type: "outgoing", detail: "Not answered" },
    { name: "Lorraine", time: "Today, 5:20 AM", type: "incoming", detail: "4 min" },
    { name: "Stan Wojcik", time: "Mon, 6:00 PM", type: "incoming", detail: "12 min" },
    { name: "Jo ❤️", time: "Sun, 2:20 PM", type: "missed" },
  ],
  notes: [
    {
      title: "TYLER",
      body: "New number: (786) 555-0147 — ANSWER IT\n$9,000 — cash\nDon't tell Jo, she'll call the police and they'll hurt him",
    },
    { title: "Roof estimate", body: "Henderson Roofing — $6,800, gutters extra" },
    { title: "Groceries", body: "Kielbasa, eggs, the good coffee" },
  ],
  calendar: [
    { title: "Grief support group", date: "8/6", month: "2026-08", dateLabel: "Thu, Aug 6", time: "10:00 AM" },
    { title: "Corner Rx pickup", date: "8/6", month: "2026-08", dateLabel: "Thu, Aug 6", time: "2:00 PM" },
  ],
  instagram: { username: "", displayName: "", avatar: "", posts: [] },
  airbnb: { name: "", img: "", listings: [] },
  gmail: [
    {
      sender: "PNC Bank",
      subject: "Your e-statement is ready",
      preview: "View your October statement online",
      body: "Your October e-statement is now available. Log in to view your balance and recent activity.",
      time: "2 wks ago",
    },
    {
      sender: "Carol Hensley",
      subject: "Welcome to the Riverside Grief Circle",
      preview: "We're so glad you're joining us Thursdays at 10 AM",
      body: "Dear Walt,\n\nWelcome to the Riverside Grief Circle. We meet every Thursday at 10 AM at the community room. Looking forward to seeing you there.\n\nWarmly,\nCarol Hensley",
      time: "4 mos ago",
    },
    {
      sender: "Giant Eagle Rewards",
      subject: "You've earned 50 fuelperks!",
      preview: "Redeem before they expire at month's end",
      body: "Great news — you've earned 50 fuelperks on your last grocery trip. Redeem them at the pump before they expire.",
      time: "5 days ago",
    },
    {
      sender: "VFW Post 1121",
      subject: "Monthly newsletter",
      preview: "Bingo night moved to the 15th",
      body: "This month's newsletter: bingo night moves to the 15th, and the fish fry schedule is attached.",
      time: "3 wks ago",
    },
    {
      sender: "Henderson Roofing",
      subject: "Following up on your estimate",
      preview: "Let us know if you'd like to schedule the gutter work",
      body: "Hi Walt, just following up on the $6,800 estimate we sent over. Let us know if you'd like to get on the schedule for the gutter work.",
      time: "1 wk ago",
    },
    {
      sender: "AARP",
      subject: "Your member benefits this month",
      preview: "Save on hearing aids and travel this October",
      body: "As an AARP member, you have access to discounts on hearing aids, travel, and more this month.",
      time: "1 mo ago",
    },
    {
      sender: "Carol Hensley",
      subject: "Picnic thank-yous",
      preview: "A big thank-you to Lorraine Pike and her son, Dean Ferris...",
      body: "Dear members,\n\nWhat a wonderful picnic! A big thank-you to Lorraine Pike and her son, Dean Ferris, who drove down from Erie with the folding tables.\n\nSee you all Thursday,\nCarol Hensley",
      time: "6 wks ago",
    },
    {
      sender: "St. Anne's Parish",
      subject: "Bulletin — October 26",
      preview: "Mass times and the fall festival schedule",
      body: "This week's bulletin: Mass times, confession hours, and the schedule for the fall festival.",
      time: "3 days ago",
    },
  ],
  photos: [{ src: img("joanne_walt_duo") }],
  vaultCode: "0000",
  weather: { city: "Pittsburgh", tempC: 22, hi: 25, lo: 15, condition: "Cloudy" },
  revolut: {
    balance: "$1,840.00",
    transactions: [
      { name: "Cash withdrawal — Teller", amount: "-$4,500.00", date: "6 days ago" },
      { name: "Cash withdrawal — Teller", amount: "-$4,500.00", date: "5 days ago" },
      { name: "Cash withdrawal — Teller", amount: "-$15,000.00", date: "2 days ago" },
      { name: "Corner Rx", amount: "-$42.00", date: "Mon" },
      { name: "Social Security", amount: "+$1,920.00", date: "Fri" },
    ],
  },
  maps: {
    locations: [
      { name: "Bayview Motor Inn", subtitle: "Erie, PA · shared by Lorraine" },
      { name: "Home", subtitle: "Walt's row house, Pittsburgh" },
      { name: "Community center", subtitle: "Grief support meetings, Thursdays" },
    ],
    sectionLabel: "Saved places",
  },
  endCard: {
    headline: "I'm going to get my father.",
    subhead: "Nobody took his grandson. A kind friend from grief group fed a scammer every detail — and her own son was waiting to collect.",
    ctaLabel: "See what happens next",
  },
};

export default { id: "10_joanne_walt", label: config.caseTitle, config };
