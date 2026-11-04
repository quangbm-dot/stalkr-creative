import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v18 — case hoàn toàn mới "Ruby & Marco": thay hẳn kiểu mở đầu (so với
 * v17's cuốn phim) bằng 1 FILE bìa kraft có ghim giấy, phát sáng — chạm
 * vào mở ra 1 đám card ảnh bằng chứng (hoá đơn, món quà, lời yêu thương)
 * bay xoè ra, kèm thoại hook "anh ta cắm sừng mình, nhưng mình không biết
 * cô ta là ai". KHÔNG rẽ nhánh (khác v17) — xong cảnh là hiện nút đỏ
 * "Check his phone" luôn.
 *
 * QUAN TRỌNG: các card mở đầu CHỈ hé lộ CÓ quà/thư, tuyệt đối không được
 * trùng với bất kỳ đáp án nào của evidenceRounds bên dưới (đúng bài học từ
 * lỗi lộ đáp án ở case Joanne Walt trước đây) — toàn bộ câu hỏi chỉ xoay
 * quanh DANH TÍNH Nora, không hỏi lại "mua gì"/"giá bao nhiêu" (đã thấy
 * trong card rồi).
 */

const ownImages = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });
// Icon app dùng lại nguyên bộ của case07 (icon chung, không gắn nhân vật
// riêng) — không copy file, trỏ glob sang thư mục img của case07, giống
// cách case11 (v17) đã làm.
const sharedIcons = import.meta.glob<string>("../07_abby_ryan_full/img/appicon_*.webp", { eager: true, import: "default" });
const img = (name: string) => ownImages[`./img/${name}.webp`] ?? sharedIcons[`../07_abby_ryan_full/img/${name}.webp`] ?? "";

const TODAY = new Date();
const addDays = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
};
const fmtDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
const fmtMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const fmtLabel = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const LAKE_DATE = addDays(6);

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

// v18: mở đầu = 1 file bìa kraft phát sáng (chạm để mở) -> 1 đám card ảnh
// bằng chứng bay xoè ra kèm thoại hook -> nút đỏ "Check his phone". Không
// có bước lựa chọn nào — chỉ 1 đường duy nhất.
const hire: HireStep[] = [
  { type: "fileOpen", hint: "Tap to open" },
  {
    type: "filmReel",
    variant: "dossier",
    frameMs: 1900,
    frames: [
      { src: img("card_receipt"), caption: "A receipt. A bracelet I never got." },
      { src: img("card_flowers"), caption: "Flowers too. He hasn't bought ME flowers in years." },
      { src: img("card_gift"), caption: "Wrapped and ready — just not for me." },
      { src: img("card_giftwrap"), caption: "Another one. How many gifts has he bought her?" },
      { src: img("card_lovenote"), caption: "A note signed \"yours always, M.\" I don't even know who she is." },
    ],
  },
  { type: "cta", label: "Check his phone 🔍" },
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
    prompt: "Hi, I'm Ruby — his girlfriend. I found a folder on his phone... gifts, a note, and I don't even know who it's for 😔 I bet he saved her under a fake name. What contact name did he save her as in his chatting app?",
    answer: "KILN",
    decoys: ["Unknown", "Work - Dave", "Study Group"],
    hint: "Open Messages and look at the list of chats — one contact name looks off.",
    hintApp: "messages",
    target: "KILN",
    reply: "He always meant to hide this 💔",
  },
  {
    prompt: "So he's been hiding her this whole time. What's her real first name, from what he calls her in that chat?",
    answer: "Nora",
    decoys: ["Mia", "Sara", "Claire"],
    hint: "Open that KILN chat and read what he calls her.",
    hintApp: "messages",
    target: "KILN",
    reply: "Nora. Now she has a name 💔",
  },
  {
    prompt: "Nora. Now she has a name. Where did they actually meet?",
    answer: "Pottery class",
    decoys: ["Yoga class", "Book club", "Spin class"],
    hint: "Scroll all the way up in that chat to their very first message.",
    hintApp: "messages",
    target: "KILN",
    reply: "A pottery class. He won't even get his hands dirty with me 😤",
  },
  {
    prompt: "He's been 'taking a class' for months and never once invited me. What's the name of her studio?",
    answer: "Clayhouse Ceramics",
    decoys: ["Riverside Studio", "The Kiln Room", "Mudworks Co."],
    hint: "Open Mail and look for a studio membership email.",
    hintApp: "gmail",
    reply: "A whole studio, a whole life I didn't know about 😔",
  },
  {
    prompt: "A whole life I didn't know about. He told me money was tight this month and he was 'at a conference.' Where did he actually take her for the weekend?",
    answer: "Riverside Inn",
    decoys: ["Cedar Lodge", "Bayview Hotel", "Maple Inn"],
    hint: "Open RevoBank → Current Account → find the weekend booking.",
    hintApp: "revolut",
    reply: "A weekend away, and he lied straight to my face 😡",
  },
  {
    prompt: "Okay. I need to see it with my own eyes, even if it hurts 🥲 Weeks? Months? How long have they actually been together?",
    answer: "4 months",
    decoys: ["2 months", "6 months", "8 months"],
    hint: "Open Notes → \"Codes\" for the vault PIN, then unlock Photos with it and read the photo.",
    hintApp: "photos",
    steps: [
      { app: "notes", target: "Codes" },
      { app: "photos" },
    ],
    reply: "Four months. Right under my nose 💔",
  },
  {
    prompt: "Four months, right under my nose. Now I have a face to go with it. What's her last name?",
    answer: "Vance",
    decoys: ["Vale", "Voss", "Varga"],
    hint: "Open Maps — his saved pin at the studio also lists her full name.",
    hintApp: "maps",
    target: "Nora ❤️",
    reply: "Thank you for showing me. 💔",
  },
];

const evidenceRounds: CaseConfig["evidenceRounds"] = QUESTIONS.slice(0, MAX_ROUNDS).map((q, i) => ({
  informant: { name: "Ruby", avatar: img("ruby") },
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

const kilnThread: MessageThread = {
  id: "t1",
  title: "KILN",
  time: "Yesterday",
  unread: false,
  msgs: [
    { me: false, text: "Still can't believe you remembered my first class was a disaster 😂" },
    { me: true, text: "You literally threw a bowl across the room, Nora" },
    { me: false, text: "I was NOT ready for the wheel that day 😭" },
    { me: true, text: "Did it arrive okay? 📦" },
    { me: false, text: "Yes — I love it, thank you 🥹 you spoil me" },
    { me: true, text: "Anything for you. Same time Thursday?" },
    { me: true, text: "Night, Nora ❤️" },
    { me: false, text: "Miss you already ❤️" },
  ],
};

const messages: MessageThread[] = [
  kilnThread,
  {
    id: "t2",
    title: "Ruby ❤️",
    time: "Fri",
    unread: false,
    msgs: [
      { me: false, text: "Dinner's getting cold, Marco" },
      { me: true, text: "Running late at the gym, heading to bed soon 😴" },
      { me: false, text: "Night, Marco ❤️" },
    ],
  },
  {
    id: "t3",
    title: "Dev (brother)",
    time: "Mon",
    unread: false,
    msgs: [
      { me: false, text: "You telling Ruby yet?" },
      { me: true, text: "Not yet. I don't even know how." },
    ],
  },
  {
    id: "t4",
    title: "Clayhouse Ceramics",
    time: "Sun",
    unread: false,
    msgs: [{ me: false, text: "Your monthly membership renews July 1. Your card on file will be charged $45." }],
  },
  {
    id: "t5",
    title: "Mom",
    time: "Sat",
    unread: false,
    msgs: [{ me: false, text: "Did you fix the sink yet?? 🙄" }],
  },
];

const config: CaseConfig = {
  caseTitle: "Yours Always",
  tagline: "Who is she, really?",
  heroImage: img("ruby_marco_duo"),
  evidenceTotal: evidenceRounds.length,
  hintBudget: 4,
  evidenceRounds,
  client: {
    name: "Ruby",
    avatar: img("ruby"),
    hire,
    matches: [],
    matchThread: { name: "", avatar: "", msgs: [] },
  },
  hint: "Open the apps on the phone to find clues.",
  owner: { first: "Marco", full: "Marco Delacruz", avatar: img("marco") },
  wallpaper: img("marco_checkin"),
  home: { pages: [page1, page2], dock },
  messages,
  whatsapp: [],
  calls: [],
  notes: [
    { title: "Codes", body: "Photos: 260914\nWiFi: marcohome22" },
    { title: "Grocery", body: "Milk, eggs, clay dust mask" },
    { title: "Work", body: "Denver conference Thu–Fri. Expense the per diem." },
  ],
  calendar: [
    { title: "Weekend — Riverside Inn", date: fmtDate(LAKE_DATE), month: fmtMonthKey(LAKE_DATE), dateLabel: fmtLabel(LAKE_DATE), time: "All day" },
  ],
  instagram: { username: "marco.delacruz", displayName: "Marco Delacruz", avatar: img("marco"), posts: [] },
  airbnb: { name: "Marco Delacruz", img: img("marco_checkin"), listings: [] },
  gmail: [
    {
      sender: "Clayhouse Ceramics",
      subject: "Your studio membership is active",
      preview: "Thanks for joining Clayhouse Ceramics!",
      body: "Hi Marco,\n\nThanks for joining Clayhouse Ceramics! Your membership is now active.\n\nStudio: Clayhouse Ceramics\nAccess: Tue/Thu evenings, open studio weekends\n\nSee you at the wheel,\nClayhouse Ceramics",
      time: "Tue",
    },
    {
      sender: "Riverside Inn",
      subject: "Your reservation is confirmed",
      preview: "Room for 2 · Sat–Sun · Lake view",
      body: "Hi Marco,\n\nYour reservation is confirmed at Riverside Inn.\n\nRoom: Lake view, queen\nGuests: 2\nName on reservation: Delacruz\n\nSee you soon,\nRiverside Inn",
      time: "Fri",
    },
    {
      sender: "Brightline HR",
      subject: "Conference reimbursement",
      preview: "Your per diem for the Denver conference is processed.",
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
    { src: img("ruby_marco_duo") },
    { src: img("marco_checkin") },
    { src: img("pottery_reveal"), secret: true },
  ],
  vaultCode: "260914",
  weather: { city: "Denver", tempC: 21, hi: 24, lo: 12, condition: "Clear" },
  revolut: {
    balance: "$6,180.20",
    transactions: [
      { name: "Riverside Inn", amount: "-$310.00", date: "Fri", note: "Weekend booking" },
      { name: "Clayhouse Ceramics", amount: "-$45.00", date: "Tue", note: "Studio membership" },
      { name: "Kestrel Jewelers", amount: "-$130.00", date: "Tue", note: "Jewelry store" },
      { name: "Ironworks Gym", amount: "-$39.99", date: "Sun", note: "Membership renewal" },
      { name: "Capitol Auto Care", amount: "-$89.40", date: "Mon", note: "Brake pads" },
      { name: "Payroll · Brightline", amount: "+$2,980.00", date: "Fri" },
    ],
  },
  maps: {
    locations: [
      { name: "Nora ❤️", subtitle: "Nora Vance" },
      { name: "Clayhouse Ceramics", subtitle: "Studio · visited often" },
      { name: "Riverside Inn", subtitle: "Lake view · 1 night" },
    ],
    sectionLabel: "Saved places",
  },
  endCard: {
    headline: "I'm done staying quiet.",
    subhead: "Four months, a weekend at the lake, and a name he never meant me to find. I'm sitting him down tonight.",
    ctaLabel: "See what happens next",
  },
};

export default { id: "12_ruby_marco_v18", label: config.caseTitle, config };
