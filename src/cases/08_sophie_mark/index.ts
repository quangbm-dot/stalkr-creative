import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v15 — "Sophie & Mark" (dựa trên story_40_case_2.json, bản đủ 15 câu).
 * Khác mọi case khác: KHÔNG phải ngoại tình — Dana trông như tình nhân bí
 * mật (khách sạn, hẹn hò, quà) nhưng hoá ra là EM GÁI CÙNG CHA KHÁC MẸ của
 * Mark (lộ qua xét nghiệm DNA). Chọn 7/15 câu gốc để twist lộ ngay trong 7
 * câu: Dana (tên) → WhatsApp (app) → $219 (khách sạn, đỉnh nghi ngờ) →
 * DNA kit (chi tiết lạ, gài twist) → "em gái cùng cha" (TWIST, qua Notes →
 * WhatsApp mẹ) → Moreno (họ đầy đủ) → Rosemary Bistro (kết ấm — nơi anh
 * định tự kể sự thật). Bỏ các câu cần app engine chưa có (Safari/Spotify/
 * FaceTime/ChatGPT) và các câu không cần để giữ twist gọn trong 7 câu
 * (Pier 39, vé máy bay, Lake Berryessa, Tom, vet tech, old photos).
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

const DANA_MEET_DATE = addDays(-7);
const BISTRO_DATE = addDays(9);

// Build ra 2 bản độ dài 5/7 câu (xem __ROUNDS__ ở vite.config.ts) — luôn cắt
// lấy N câu ĐẦU của chuỗi 7 câu đã chọn. Câu 5 ("em gái cùng cha") là TWIST
// chính nên nằm ở vị trí thứ 5 — bản 5 câu vẫn kết đúng lúc lật twist.
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
  { type: "msgs", text: "I'm Sophie. Six years married, and I have never once looked at Mark's phone." },
  { type: "msgs", text: "This week it buzzed at midnight with a heart, and he turned it over." },
  { type: "reveal", text: "That's us on our first date. He was so nervous he knocked over the water.", src: img("sophie_mark_duo"), label: "Sophie & Mark" },
  { type: "msgs", text: "Mark's an engineer. Steady, quiet, careful with money. Since his dad passed five years ago he keeps things to himself." },
  { type: "msgs", text: "He left his phone home this morning. I'll ask you what I need to know." },
  { type: "choices", options: ["I'll check his phone 🔍", "Don't jump to conclusions yet ✋"] },
  { type: "msgs", text: "Thank you. Please tell me the truth, whatever it is." },
  { type: "cta", label: "Open Mark's phone 🔍" },
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
    prompt: "Hi, I'm Sophie. In six years I've never once looked at Mark's phone. I hate that I'm doing it now. A week ago he disappeared for a whole afternoon, and it wasn't with me. He plans everything, so I bet it's written down somewhere. What's the name of the person he went to meet?",
    answer: "Dana",
    decoys: ["Linda", "Rachel", "Kelly"],
    hint: "Open Calendar and go back about a week — find the afternoon event named after someone.",
    hintApp: "calendar",
    target: "Dana ❤️",
    reply: "I've never heard him say that name 😔",
  },
  {
    prompt: "I've never heard him say that name 😔 His texts pop up on the couch next to me every night, and never from her. Which app do they talk on?",
    answer: "WhatsApp",
    decoys: ["Messages", "Instagram", "Snapchat"],
    hint: "She isn't in Messages. Check his other chat apps for her name.",
    hintApp: "whatsapp",
    reply: "Hearts at midnight. He used to send me those 💔",
  },
  {
    prompt: "Hearts at midnight. He used to send me those. The night after, he came home smelling like hotel soap. If he paid for a room, how much was it?",
    answer: "$219",
    decoys: ["$189", "$249", "$291"],
    hint: "Open RevoBank → Current Account. Look for a hotel charge.",
    hintApp: "revolut",
    reply: "He paid for a room while I was on a double shift 😢",
  },
  {
    prompt: "He paid for a room while I was on a double shift. A few months ago a tiny box came, barely bigger than my hand, and he carried it straight to the garage. What did he order?",
    answer: "DNA kit",
    decoys: ["Smartwatch", "Fishing rod", "Golf clubs"],
    hint: "Open Mail and find the shipping email in the Inbox.",
    hintApp: "gmail",
    reply: "I can't think why he'd need that 😕",
  },
  {
    prompt: "I can't think why he'd need that. None of this makes sense. He never talks about his dad — never. I keep thinking about his chat with his mom. Who is Dana to him, really?",
    answer: "His half-sister",
    decoys: ["His ex-girlfriend", "A coworker", "His cousin"],
    hint: "Open Notes → \"Call Mom\" first. Then open his chat with Mom in WhatsApp and read the newest messages.",
    hintApp: "notes",
    steps: [
      { app: "notes", target: "Call Mom" },
      { app: "whatsapp", target: "Mom" },
    ],
    reply: "Wait. What? 😳",
  },
  {
    prompt: "Wait, what? His dad never said a word, not once in all those years. What's her last name?",
    answer: "Moreno",
    decoys: ["Morales", "Romero", "Medina"],
    hint: "Open Mail and find the other email from the DNA company.",
    hintApp: "gmail",
    reply: "A sister. All this time, a sister 🥹",
  },
  {
    prompt: "A sister. All this time I was counting hotel receipts, and he was learning how to be somebody's big brother. He must be planning to tell me himself. What's the name of the place where he's planning to tell me?",
    answer: "Rosemary Bistro",
    decoys: ["Olive Garden Cafe", "The Copper Pot", "Bella Notte"],
    hint: "Open Calendar and look at what's coming up — a dinner for two.",
    hintApp: "calendar",
    target: "Rosemary Bistro 🙏",
    reply: "Thank you. I think I just got a bigger family 🥹",
  },
];

const evidenceRounds: CaseConfig["evidenceRounds"] = QUESTIONS.slice(0, MAX_ROUNDS).map((q, i) => ({
  informant: { name: "Sophie", avatar: img("sophie") },
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

const danaThread: MessageThread = {
  id: "w1",
  title: "Dana",
  avatar: img("dana"),
  time: "Yesterday",
  unread: false,
  msgs: [
    { me: false, text: "I still can't believe you called last night. I didn't sleep 😭" },
    { me: true, text: "Same here. Two hours and I still had a hundred things to ask" },
    { me: false, text: "Thank you for today ❤️" },
    { me: true, text: "Anytime. Let's talk again soon." },
    { me: false, text: "Goodnight ❤️" },
  ],
};

const whatsapp: MessageThread[] = [
  danaThread,
  {
    id: "w2",
    title: "Mom",
    time: "Mon",
    unread: false,
    msgs: [
      { me: false, text: "My tomatoes are coming in. Come get some before Ben takes them all" },
      { me: true, text: "Haha, I'll swing by this weekend" },
      { me: false, text: "Have you told Sophie about your sister yet?" },
      { me: true, text: "My half-sister, Mom. I'm still getting used to saying it." },
    ],
  },
  {
    id: "w3",
    title: "Ben",
    time: "Sun",
    unread: false,
    msgs: [
      { me: false, text: "Are you free this weekend? Want to finally clear out Dad's garage" },
      { me: true, text: "I can do Saturday morning. I'll bring the truck bed liner" },
    ],
  },
  {
    id: "w4",
    title: "Greenhaven Golf League",
    time: "Fri",
    unread: false,
    msgs: [{ me: false, text: "Season schedule is posted at the pro shop. First round the 14th, 7:30 shotgun." }],
  },
];

const messages: MessageThread[] = [
  {
    id: "m1",
    title: "Capital Auto Repair",
    time: "Mon",
    unread: false,
    msgs: [{ me: false, text: "Hi Mark, your Tacoma is ready for pickup. Brake pads and rotors, front. $412 with the shop fee." }],
  },
  {
    id: "m2",
    title: "Bright Smile Dental",
    time: "Thu",
    unread: false,
    msgs: [{ me: false, text: "Reminder: your cleaning is scheduled for next Tuesday at 2:00 PM." }],
  },
  {
    id: "m3",
    title: "Sophie's Mom",
    time: "Wed",
    unread: false,
    msgs: [{ me: false, text: "Hi Mark, it's Barbara. Are you two still coming for dinner this month?" }],
  },
];

const config: CaseConfig = {
  caseTitle: "The Other Dana",
  tagline: "Who is she, really?",
  heroImage: img("hero"),
  evidenceTotal: evidenceRounds.length,
  hintBudget: 4,
  evidenceRounds,
  client: {
    name: "Sophie",
    avatar: img("sophie"),
    hire,
    matches: [],
    matchThread: { name: "", avatar: "", msgs: [] },
  },
  hint: "Open the apps on the phone to find clues.",
  owner: { first: "Mark", full: "Mark Bennett", avatar: img("mark") },
  wallpaper: img("wallpaper"),
  home: { pages: [page1, page2], dock },
  messages,
  whatsapp,
  calls: [],
  notes: [
    {
      title: "Call Mom",
      body: "Things to ask Mom:\n- Her knee appointment, PT or a shot?\n- Pick up her pills from Sutter Street Pharmacy\n- Fix her tablet's wifi next time I'm over\n\nStill figuring out how to tell Sophie about Dana.",
    },
    { title: "Hardware list", body: "Furnace filter\nWD-40\nGarage light bulb x2" },
    { title: "Golf league", body: "Dues due by the 10th. Ask Tom about Saturday tee time." },
  ],
  calendar: [
    { title: "Dana ❤️", date: fmtDate(DANA_MEET_DATE), month: fmtMonthKey(DANA_MEET_DATE), dateLabel: fmtLabel(DANA_MEET_DATE), time: "2:00 – 6:00 PM" },
    { title: "Rosemary Bistro 🙏", date: fmtDate(BISTRO_DATE), month: fmtMonthKey(BISTRO_DATE), dateLabel: fmtLabel(BISTRO_DATE), time: "7:00 PM" },
  ],
  instagram: { username: "", displayName: "", avatar: "", posts: [] },
  airbnb: { name: "", img: "", listings: [] },
  gmail: [
    {
      sender: "GeneLink",
      subject: "Your GeneLink DNA kit has shipped",
      preview: "Good news: your DNA kit is on its way",
      body: "Hi Mark,\n\nGood news: your GeneLink DNA kit is on its way.\n\nActivate it online with the barcode on the tube, then mail your sample back in the prepaid envelope. Most results are ready in 4 to 6 weeks.\n\nThe GeneLink Team",
      time: "May",
    },
    {
      sender: "GeneLink",
      subject: "Your results are ready",
      preview: "New match: Dana Moreno",
      body: "Hi Mark,\n\nYour GeneLink results are ready to view.\n\nNew match: Dana Moreno\nShared DNA: see your full report\n\nLog in to your account to explore your match, send a message, and see what you have in common.\n\nThe GeneLink Team",
      time: "Jun",
    },
    {
      sender: "Capital Auto Repair",
      subject: "Your Tacoma is ready for pickup",
      preview: "Brake pads and rotors, front. $412 with the shop fee.",
      time: "Mon",
    },
    {
      sender: "County Roads Dept",
      subject: "Elkhorn Blvd resurfacing schedule",
      preview: "The director moved the start up two weeks.",
      time: "Fri",
    },
  ],
  photos: [{ src: img("sophie_mark_duo") }, { src: img("pier39") }, { src: img("truck_plate") }],
  vaultCode: "0000",
  weather: { city: "Sacramento", tempC: 29, hi: 33, lo: 19, condition: "Sunny" },
  revolut: {
    balance: "$6,180.20",
    transactions: [
      { name: "The Langley Hotel", amount: "-$219.00", date: "Jul 30", note: "San Francisco, CA" },
      { name: "Capital Auto Repair", amount: "-$412.00", date: "Mon", note: "Brake pads & rotors" },
      { name: "Payroll · County Roads Dept", amount: "+$2,840.00", date: "Fri" },
    ],
  },
  maps: {
    locations: [
      { name: "Home", subtitle: "Our house, Sacramento" },
      { name: "Mom's house", subtitle: "Elk Grove" },
    ],
    sectionLabel: "Saved places",
  },
  endCard: {
    headline: "I think I just got a bigger family.",
    subhead: "He was so scared I'd think he was cheating that he hid the one thing that would have made me proud of him.",
    ctaLabel: "See what happens next",
  },
};

export default { id: "08_sophie_mark", label: config.caseTitle, config };
