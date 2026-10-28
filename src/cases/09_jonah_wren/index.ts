import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v15 — "Jonah & Wren" (dựa trên story_25_jonah_wren.json, bản đủ 20 câu —
 * true-crime podcast host Wren biến mất giữa mùa, hoá ra chính cô là Lily
 * Marsh, đứa bé bị bắt mất khỏi hội chợ Tolland County năm 1999). Chọn 7/20
 * câu gốc, lộ 1 reveal ở câu 5 (con thỏ nhồi bông trên bàn Wren trùng tên
 * với con thỏ bé Lily cầm theo lúc mất tích — rợn người) và 1 reveal ở câu 7
 * (kết quả DNA: Margaret Marsh — chính là mẹ ruột của Wren). Bỏ các câu cần
 * app engine chưa có (Safari/Parcel/Photoshop/FaceTime) — toàn bộ 7 câu chỉ
 * dùng Notes/Mail/Phone đã có sẵn.
 */

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });
const img = (name: string) => images[`./img/${name}.webp`] ?? "";

// Build ra 2 bản độ dài 5/7 câu (xem __ROUNDS__ ở vite.config.ts) — luôn cắt
// lấy N câu ĐẦU của chuỗi 7 câu đã chọn. Câu 5 ("Clover") là REVEAL đầu nên
// bản 5 câu vẫn kết đúng lúc rợn người, không cụt giữa đường.
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
  { type: "msgs", text: "Three days. Wren hasn't missed a recording in six years." },
  { type: "msgs", text: "Her chair's empty, and her phone is just sitting on our studio desk." },
  { type: "reveal", text: "I'm Jonah. We've made this podcast together for six years.", src: img("jonah_wren_duo"), label: "Jonah & Wren" },
  { type: "msgs", text: "She's investigating a missing-child case, but she won't tell me which one." },
  { type: "msgs", text: "Her family keeps calling me. I'm not great at panic. I'm good at research." },
  { type: "choices", options: ["I'll check her phone 🔍", "Don't jump to conclusions yet ✋"] },
  { type: "msgs", text: "Thank you. I can't stay objective on my best friend's phone. You can." },
  { type: "cta", label: "Open Wren's phone 🔍" },
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
    prompt: "Okay. Rolling. She'd been weird about the new season for weeks. Wouldn't even tell me the case, and I'm the guy who edits out her breathing. Which case was she working on?",
    answer: "Lily Marsh",
    decoys: ["Harlow Creek", "The Ashby Twins", "Dana Whitcomb"],
    hint: "Check her Notes.",
    hintApp: "notes",
    target: "S6 — the case",
    reply: "A missing toddler. That's heavy, even for us. 😔",
  },
  {
    prompt: "A missing toddler. That's heavy, even for us. 😔 Wren always had one source she'd never name on air. Not even to me. Who's been feeding her information on this one?",
    answer: "Ray Dunmore",
    decoys: ["Tess Calloway", "Priya Sethi", "Owen Pryce"],
    hint: "Look through her Mail.",
    hintApp: "gmail",
    reply: "A retired cop. Of course she found a retired cop.",
  },
  {
    prompt: "A retired cop. Of course she found a retired cop. Back to the case — what did Lily have with her the day she vanished?",
    answer: "A stuffed rabbit",
    decoys: ["A pink blanket", "A sippy cup", "A red balloon"],
    hint: "Look for older Mail from her source.",
    hintApp: "gmail",
    reply: "I've eaten that woman's lasagna. Twice. 😳",
  },
  {
    prompt: "A county fair. Funnel cake and a missing kid. Great. Her family's called me eight times since yesterday, and I've run out of ways to say 'she's fine.' Who has she been avoiding lately?",
    answer: "Mom",
    decoys: ["Aunt Deb", "Theo", "Ray"],
    hint: "Look through her Phone recents — count how many times one name keeps showing up.",
    hintApp: "phone",
    reply: "I've eaten that woman's lasagna. Twice. 😳",
  },
  {
    prompt: "I've eaten that woman's lasagna. Twice. 😳 Wren keeps a ratty old bunny on the studio desk, right between the mics. Says she's had it forever and nobody's allowed to touch it. She's never told me its name. What's that bunny called?",
    answer: "Clover",
    decoys: ["Pickles", "Biscuit", "Thumper"],
    hint: "Check her Notes — the studio inventory.",
    hintApp: "notes",
    target: "Studio",
    reply: "Okay, that gave me an actual chill.",
  },
  {
    prompt: "Okay, that gave me an actual chill. No record. Of Wren. Who I've known since college. What did the county records office find for her?",
    answer: "No record found",
    decoys: ["Request received", "Records sealed", "Pending review"],
    hint: "Search her Mail.",
    hintApp: "gmail",
    reply: "No record. Of Wren. Who I've known since college. 😳",
  },
  {
    prompt: "No record. Of Wren. Who I've known since college. 😳 She mailed something off to a lab weeks before any of this. Who did the results match her with?",
    answer: "Margaret Marsh",
    decoys: ["Ellen Brisco", "Nathan Kroll", "Ruth Abernathy"],
    hint: "Look in her Mail — the lab's reply.",
    hintApp: "gmail",
    reply: "Same last name as the little girl. I think I know who Wren really is. 😳",
  },
];

const evidenceRounds: CaseConfig["evidenceRounds"] = QUESTIONS.slice(0, MAX_ROUNDS).map((q, i) => ({
  informant: { name: "Jonah", avatar: img("jonah") },
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

const messages: MessageThread[] = [
  {
    id: "m1",
    title: "Theo",
    time: "1 yr ago",
    unread: false,
    msgs: [{ me: false, text: "Can we talk?" }, { me: true, text: "I think we said everything already." }],
  },
  {
    id: "m2",
    title: "Priya Sethi",
    time: "Mon",
    unread: false,
    msgs: [{ me: false, text: "Brightwave wants to renew the ad deal for S6 — can you sign off by Friday?" }],
  },
  {
    id: "m3",
    title: "Tess Calloway",
    time: "Sun",
    unread: false,
    msgs: [{ me: false, text: "Any update on the cold case I sent?? I have more tips if you need them!!" }],
  },
];

const config: CaseConfig = {
  caseTitle: "The Case That Chased Her Back",
  tagline: "Where did she really go?",
  heroImage: img("hero"),
  evidenceTotal: evidenceRounds.length,
  hintBudget: 4,
  evidenceRounds,
  client: {
    name: "Jonah",
    avatar: img("jonah"),
    hire,
    matches: [],
    matchThread: { name: "", avatar: "", msgs: [] },
  },
  hint: "Open the apps on the phone to find clues.",
  owner: { first: "Wren", full: "Wren Hadley", avatar: img("wren") },
  wallpaper: img("wallpaper"),
  home: { pages: [page1, page2], dock },
  messages,
  whatsapp: [],
  calls: [
    { name: "Mom", time: "Today, 8:12 AM", type: "missed" },
    { name: "Mom", time: "Yesterday, 9:40 PM", type: "missed" },
    { name: "Mom", time: "Yesterday, 2:05 PM", type: "missed" },
    { name: "Ray Dunmore", time: "Mon, 4:30 PM", type: "incoming", detail: "1 hr 06 min" },
    { name: "Jonah", time: "Sun, 7:00 PM", type: "outgoing", detail: "38 min" },
    { name: "Mom", time: "Sat, 11:00 AM", type: "missed" },
  ],
  notes: [
    {
      title: "S6 — the case",
      body: "Season 6: the Lily Marsh case. Taken from the Tolland County Fair, summer 1999, age 2. Don't tell Jonah yet — not until I know more.",
    },
    {
      title: "Studio",
      body: "Inventory for the new mic stands.\n\nDon't let anyone touch Clover — the old bunny on the desk. Six years and I still can't explain why I keep her there.",
    },
    { title: "Pitch list", body: "Other S7 ideas: the Harlow Creek disappearance, the Ashby twins, Dana Whitcomb's case." },
  ],
  calendar: [
    { title: "Ep 6 record", date: "8/9", month: "2026-08", dateLabel: "Sun, Aug 9", time: "2:00 PM" },
    { title: "Brightwave ad read", date: "8/5", month: "2026-08", dateLabel: "Wed, Aug 5", time: "11:00 AM" },
  ],
  instagram: { username: "wren.coldporch", displayName: "Wren Hadley", avatar: img("wren"), posts: [] },
  airbnb: { name: "", img: "", listings: [] },
  gmail: [
    {
      sender: "Ray Dunmore",
      subject: "The Marsh file",
      preview: "Case number 99-0412 — everything I still have",
      body: "Wren,\n\nAttached is everything I still have on case 99-0412. I worked this one for a decade before I retired, and it never sat right with me.\n\nDet. Sgt. Ray Dunmore (ret.)",
      time: "3 wks ago",
    },
    {
      sender: "Ray Dunmore",
      subject: "Incident report excerpt",
      preview: "Lily was last seen near the east gate...",
      body: "Wren,\n\nHere's the excerpt you asked for. Lily Marsh, age 2, was last seen near the east gate of the Tolland County Fair, holding a stuffed rabbit. Yellow sundress, pink sneakers.\n\nDet. Sgt. Ray Dunmore (ret.)",
      time: "3 wks ago",
    },
    {
      sender: "Tolland County Records Office",
      subject: "Certificate search result: TCR-26-0402",
      preview: "Result: No record found for Wren Elizabeth Hadley",
      body: "Dear Ms. Hadley,\n\nWe have completed your request. Result: No record found for Wren Elizabeth Hadley in Tolland County birth records.\n\nTolland County Records Office",
      time: "2 wks ago",
    },
    {
      sender: "RootLine Labs",
      subject: "New close relative match",
      preview: "Margaret Marsh — Parent / Child · 3,487 cM",
      body: "Hi Wren,\n\nYou have a new close relative match.\n\nMatch: Margaret Marsh\nPredicted relationship: Parent / Child\nShared DNA: 3,487 cM\n\nLog in to explore your match.\n\nThe RootLine Team",
      time: "1 wk ago",
    },
  ],
  photos: [{ src: img("jonah_wren_duo") }],
  vaultCode: "0000",
  weather: { city: "Hartford", tempC: 26, hi: 29, lo: 18, condition: "Partly Cloudy" },
  revolut: {
    balance: "$3,240.10",
    transactions: [
      { name: "RootLine Labs", amount: "-$119.00", date: "1 wk ago" },
      { name: "Halfmoon Coffee", amount: "-$5.75", date: "Mon" },
      { name: "Payroll · Cold Porch LLC", amount: "+$2,100.00", date: "Fri" },
    ],
  },
  maps: {
    locations: [
      { name: "Cold Porch Studio", subtitle: "41 Pratt Street, Hartford" },
      { name: "Home", subtitle: "114 Park Terrace, Hartford" },
    ],
    sectionLabel: "Saved places",
  },
  endCard: {
    headline: "I think I know who Wren really is.",
    subhead: "A retired detective, a DNA lab, a county with no birth record for her — and a stuffed rabbit that's been sitting between our mics for six years.",
    ctaLabel: "See what happens next",
  },
};

export default { id: "09_jonah_wren", label: config.caseTitle, config };
