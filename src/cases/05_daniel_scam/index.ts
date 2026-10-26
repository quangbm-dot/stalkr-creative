import type { AppIcon, AppKey, CaseConfig, HireStep, MessageThread } from "../../types/case";

/**
 * v13 — "Romance scam": Chloe is about to wire $5,000 to "Dr. Daniel Hayes",
 * a soldier-doctor she met online. The player snoops his phone to prove he
 * is a fraud. Wrong-ness of Daniel = the trust meter (TopBar) falling to 0%.
 * Ending: Chloe is only 1 of 5 victims (see EndCard `victims`).
 */

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });
const img = (name: string) => images[`./img/${name}.webp`] ?? "";

/** Trộn cố định theo seed — đáp án đúng không luôn nằm 1 chỗ, nhưng mỗi lần chơi cùng 1 thứ tự. */
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

const MAX_ROUNDS = __ROUNDS__;

const icon = (app: AppKey, label: string): AppIcon => ({ app, label, icon: img(`appicon_${app === "revolut" ? "revolut" : app}`) });

const dock: AppIcon[] = [icon("phone", "Phone"), icon("messages", "Messages"), icon("gmail", "Mail"), icon("instagram", "Instagram")];
// Trang 1: các app có liên quan tới câu hỏi + vài app phụ; trang 2 (kéo sang): 3 app KHÔNG liên quan câu hỏi nào.
const page1: AppIcon[] = [
  icon("photos", "Photos"),
  icon("notes", "Notes"),
  icon("maps", "Maps"),
  icon("revolut", "Bank"),
  icon("calendar", "Calendar"),
  icon("settings", "Settings"),
  icon("clock", "Clock"),
  icon("compass", "Compass"),
  icon("whatsapp", "WhatsApp"),
];
const page2: AppIcon[] = [icon("weather", "Weather"), icon("calculator", "Calculator"), icon("wallet", "Wallet")];

const hire: HireStep[] = [
  { type: "msgs", text: "Hey 🥹 you find out the truth about people, right?" },
  { type: "msgs", text: "I've been dating Daniel for 6 months. We met online." },
  { type: "reveal", text: "He's an army doctor deployed overseas. We've never met in person.", src: img("daniel"), label: "Dr. Daniel Hayes" },
  { type: "msgs", text: "Tonight he asked me for $5,000 — a customs fee for my birthday gift 🎁" },
  { type: "msgs", text: "I'm about to send it. But something feels off…" },
  { type: "msgs", text: "Can you check his phone before I press send? 🙏" },
  { type: "choices", options: ["On it. Send me his phone 🔍", "Don't send anything yet ✋"] },
  { type: "cta", label: "Open Daniel's phone 🔍" },
];

const QUESTIONS: {
  prompt: string;
  answer: string;
  decoys: string[];
  hint: string;
  hintApp: AppKey;
  target?: string;
  /** Câu cần đi qua nhiều app (vd Calendar lấy mã PIN → Notes mở ghi chú khoá). */
  steps?: { app: AppKey; target?: string }[];
  /** cô gái hiện ra + bay vào khay sau khi trả lời đúng */
  victim: string;
  reply: string;
}[] = [
  {
    prompt: "Daniel tracks every woman. Where is Sophie right now?",
    answer: "St. Mary's Hospital",
    decoys: ["Her apartment", "A shopping mall", "The airport"],
    hint: "Open Maps — he pinned her live location.",
    hintApp: "maps",
    target: "Sophie 🌹 — live location",
    victim: "Sophie",
    reply: "He's tracking a nurse's night shift… 😨",
  },
  {
    prompt: "A photo in his gallery shows where Jenny lives. What's her address?",
    answer: "214 Elm Street",
    decoys: ["88 Oak Avenue", "19 Maple Court", "402 Pine Road"],
    hint: "Open Photos and tap the house picture to see its address.",
    hintApp: "photos",
    target: "jenny-house",
    victim: "Jenny",
    reply: "He even knows her address?! 😳",
  },
  {
    prompt: "Another woman, Elena, texted him. Where is she right now?",
    answer: "Riverside Art Gallery",
    decoys: ["A yoga studio", "Her office", "The airport"],
    hint: "Open Messages and read Elena's last text to him.",
    hintApp: "messages",
    target: "Elena 🎨",
    victim: "Elena",
    reply: "A fifth woman?! He's juggling all of them… 😱",
  },
  {
    prompt: "Rachel's note is locked. Where is she picking up her son?",
    answer: "Maple Street Elementary",
    decoys: ["Her office", "A supermarket", "Her mother's place"],
    hint: "Her birthday is the PIN — check Calendar, then open the locked note.",
    hintApp: "calendar",
    steps: [
      { app: "calendar", target: "Rachel's birthday 🎂" },
      { app: "notes", target: "Rachel 💕" },
    ],
    victim: "Rachel",
    reply: "Her son's school… he even knows that 😭",
  },
  {
    prompt: "Anna is flying somewhere. Where will she land?",
    answer: "London Heathrow",
    decoys: ["Paris Orly", "Chicago O'Hare", "Dubai"],
    hint: "Open Mail and check her flight confirmation.",
    hintApp: "gmail",
    victim: "Anna",
    reply: "She's flying to meet him?! He'll ruin her too 😡",
  },
];

const VICTIMS = [
  { name: "Sophie", avatar: img("sophie"), blurAvatar: img("blur_sophie"), line: "Night-shift nurse", notifPreview: "Can't wait to see you after my shift 💙" },
  { name: "Jenny", avatar: img("jenny"), blurAvatar: img("blur_jenny"), line: "College student", notifPreview: "You always know how to make me smile 😍" },
  { name: "Elena", avatar: img("elena"), blurAvatar: img("blur_elena"), line: "Art curator", notifPreview: "Thinking about you all day 🎨" },
  { name: "Rachel", avatar: img("rachel"), blurAvatar: img("blur_rachel"), line: "Single mom", notifPreview: "Can't stop smiling since this morning 🥹" },
  { name: "Anna", avatar: img("anna"), blurAvatar: img("blur_anna"), line: "Executive", notifPreview: "Counting down the days until we're together ✈️" },
];

const victimOf = (name: string) => VICTIMS.find((v) => v.name === name);

const evidenceRounds: CaseConfig["evidenceRounds"] = QUESTIONS.slice(0, MAX_ROUNDS).map((q, i) => ({
  informant: { name: "Chloe", avatar: img("chloe") },
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
  victim: victimOf(q.victim),
}));

// Mọi thread đều là Daniel (me:true) gửi cùng 1 kịch bản cho 5 cô gái — số tiền khác nhau.
// Chloe: người duy nhất bị Daniel xin tiền ("customs fee") — tiền đó được dùng mua quà cho các cô còn lại.
const chloeThreadMsgs: MessageThread["msgs"] = [
  { me: true, text: "Good morning babe ❤️ miss you so much" },
  { me: false, text: "Miss you too!! When are you home?" },
  { me: true, text: "Soon. Thank you for helping me last week, you're my angel 🙏" },
  { me: true, text: "But the gift I sent you is stuck at customs 😞 They want a $5,000 fee." },
  { me: true, text: "Please don't tell anyone, the army doesn't allow personal packages 🤫" },
];

// 4 cô còn lại: Daniel tán tỉnh + tặng quà (mua bằng tiền của Chloe), không xin tiền ai cả.
const flirtThread = (id: string, title: string, time: string, msgs: MessageThread["msgs"]): MessageThread => ({
  id,
  title,
  time,
  unread: false,
  msgs,
});

const chloeThread: MessageThread = { id: "t1", title: "Chloe 💍", time: "9:41 PM", unread: false, msgs: chloeThreadMsgs };
chloeThread.msgs.push({ me: false, text: "I'm at First National Bank right now 🏦 Sending the $5,000 in a minute…" });

const messages: MessageThread[] = [
  {
    id: "t6",
    title: "Mama 🙏",
    time: "Sun",
    unread: false,
    msgs: [
      { me: false, text: "Daniel, when are you coming home? Your sister is asking." },
      { me: true, text: "Soon Mama. Business is good, I will send money this week." },
      { me: false, text: "God bless you my son. Eat well." },
    ],
  },
  chloeThread,
  {
    id: "t7",
    title: "GTBank Alert",
    time: "Tue",
    unread: true,
    msgs: [
      { me: false, text: "Credit Alert: USD 4,800.00 received from CHLOE T. Ref: WU-CT-8841. Avail Bal: USD 12,340.00" },
      { me: false, text: "Credit Alert: USD 6,500.00 received from CHLOE T. Ref: WU-CT-7712." },
    ],
  },
  flirtThread("t3", "Jenny ✨", "Yesterday", [
    { me: true, text: "Did the roses reach your door, sweetheart? 🌹" },
    { me: false, text: "Daniel!! They're gorgeous, my roommates are jealous 😍" },
    { me: true, text: "Anything for my favorite girl. Library tonight?" },
  ]),
  flirtThread("t12", "Elena 🎨", "Today", [
    { me: true, text: "Counting the days until Lisbon, Elena. Flights are booked ✈️" },
    { me: false, text: "I can't wait!! I'm at the Riverside Art Gallery right now, thinking of you 🎨" },
  ]),
  {
    id: "t9",
    title: "DHL Express",
    time: "Wed",
    unread: false,
    msgs: [{ me: false, text: "Your parcel is out for delivery. Track: DHL-4410-NG" }],
  },
  {
    id: "t10",
    title: "Uncle Tunde",
    time: "Sat",
    unread: false,
    msgs: [
      { me: false, text: "Are you coming to the wedding on Saturday?" },
      { me: true, text: "I will try. Work is heavy." },
    ],
  },
  {
    id: "t11",
    title: "MTN Nigeria",
    time: "Fri",
    unread: false,
    msgs: [{ me: false, text: "You have used 90% of your data bundle. Dial *131# to renew." }],
  },
  flirtThread("t2", "Sophie 🌹", "Yesterday", [
    { me: true, text: "Check your email, darling — I sent you 8 gift cards for your shift breaks 😘" },
    { me: false, text: "You spoil me!! Night shift is almost bearable now 💙" },
    { me: true, text: "Text me when you leave St. Mary's. I worry about you." },
  ]),
  {
    id: "t8",
    title: "Emeka 🤝",
    time: "Mon",
    unread: false,
    msgs: [
      { me: false, text: "Oga, new girl from Chicago accepted the request" },
      { me: true, text: "Good. Use the doctor photos. Tell her I am at the field hospital." },
      { me: false, text: "She asked for a video call o" },
      { me: true, text: "Say the signal is bad. Always." },
    ],
  },
  flirtThread("t5", "Anna 💫", "Mon", [
    { me: true, text: "Did you like the handbag, honey? Picked it myself 💫" },
    { me: false, text: "I can't believe you remembered! I'm flying out Friday to see you ✈️" },
    { me: true, text: "Counting the hours. London will be ours." },
  ]),
  flirtThread("t4", "Rachel 💕", "Tue", [
    { me: true, text: "The ring is on its way, my love. Don't tell your son it's a surprise 💍" },
    { me: false, text: "Daniel... I'm speechless. He keeps asking when he'll meet you 🥹" },
    { me: true, text: "Very soon. Pick-up at 3:30 as always?" },
  ]),
];

const config: CaseConfig = {
  caseTitle: "The Perfect Boyfriend",
  tagline: "Is he who he says he is?",
  heroImage: img("daniel"),
  evidenceTotal: evidenceRounds.length,
  hintBudget: 4,
  evidenceRounds,
  client: {
    name: "Chloe",
    avatar: img("chloe"),
    hire,
    matches: [],
    matchThread: { name: "", avatar: "", msgs: [] },
  },
  hint: "Open the apps on the phone to find clues.",
  owner: { first: "Daniel", full: "Daniel Hayes", avatar: img("daniel") },
  wallpaper: img("wallpaper"),
  home: { pages: [page1, page2], dock },
  messages,
  whatsapp: [
    {
      id: "w1",
      title: "Emeka 🤝",
      time: "9:02 AM",
      unread: false,
      msgs: [
        { me: false, text: "Photos for the new profile are ready" },
        { me: true, text: "Send. And remember — Marcus Hale, army doctor." },
        { me: false, text: "Chicago girl asks if you are real 😂" },
        { me: true, text: "She will believe by Friday." },
      ],
    },
    {
      id: "w2",
      title: "Western Union Ikeja",
      time: "Yesterday",
      unread: false,
      msgs: [
        { me: false, text: "Your pickup is ready. Code 4482. Amount USD 4,800." },
        { me: true, text: "Coming in 30 minutes." },
      ],
    },
    {
      id: "w3",
      title: "Mama 🙏",
      time: "Sun",
      unread: false,
      msgs: [
        { me: false, text: "Did you eat?" },
        { me: true, text: "Yes Mama. I love you." },
      ],
    },
  ],
  calls: [],
  notes: [
    { title: "Rachel 💕", body: "Picks up her son at 3:30 — Maple Street Elementary. Always calls after.", lock: "1204", lockHint: "Her birthday" },
    { title: "Script v3", body: "Day 1: Hi beautiful.\nDay 30: I love you.\nDay 90: Customs fee. Never more than 5k at once." },
    { title: "Profile pics — source", body: "Photos = Dr. Marcus Hale (real surgeon, Instagram).\nNever video call. Always \"bad signal\"." },
    { title: "Shopping", body: "Phone credit\nSIM cards x4" },
  ],
  calendar: [
    { title: "Call Chloe", date: "11/03", month: "2026-11", dateLabel: "Tue, Nov 3", time: "8:00 PM" },
    { title: "Rachel's birthday 🎂", date: "12/04", month: "2026-11", dateLabel: "Fri, Dec 4", time: "All day" },
  ],
  instagram: {
    username: "dr.daniel.hayes",
    displayName: "Dr. Daniel Hayes",
    avatar: img("daniel"),
    posts: [
      { image: img("insta_0"), location: "General Hospital", caption: "Long shift, big heart 🩺", username: "dr.daniel.hayes" },
      { image: img("insta_1"), location: "Field hospital", caption: "Serving where I'm needed 🇺🇸", username: "dr.daniel.hayes" },
      { image: img("insta_2"), location: "Home", caption: "Missing my best boy 🐶", username: "dr.daniel.hayes" },
      { image: img("insta_3"), location: "Anywhere with you", caption: "Waiting for the right person ☕", username: "dr.daniel.hayes" },
    ],
  },
  airbnb: { name: "", img: "", listings: [] },
  gmail: [
    {
      sender: "Me (draft)",
      subject: "To Chloe — customs fee again",
      preview: "Hi babe, the gift I sent is held at customs…",
      body: "Hi babe, the gift I sent you is held at customs. They need another fee to release it. Please wire it today and keep it between us. I love you ❤️",
      time: "Draft",
    },
    {
      sender: "Anna K. (forwarded)",
      subject: "Your flight confirmation",
      preview: "Chicago O'Hare → London Heathrow · Fri 9:40 PM",
      body: "Chicago O'Hare (ORD) → London Heathrow (LHR)\nFriday 9:40 PM · Seat 14A\nBooked by Anna K.",
      time: "Mon",
    },
    { sender: "Jewelers Row", subject: "Order confirmed — diamond ring", preview: "Ship to: Rachel M. · Total $4,800.00", time: "Tue" },
    { sender: "Luxury Boutique", subject: "Your handbag has shipped", preview: "Ship to: Anna K. · Total $6,500.00", time: "Mon" },
    { sender: "Lagos Telecom", subject: "Your SIM bundle expires", preview: "Renew your data bundle to keep chatting…", time: "Mon" },
  ],
  photos: [
    { src: img("daniel"), date: "Mar 2" },
    { src: img("junk_food"), date: "Mar 1", caption: "Ikeja, Lagos" },
    { src: img("insta_2"), date: "Feb 27" },
    { src: img("junk_laptop"), date: "Feb 24" },
    { id: "jenny-house", src: img("jenny_house"), date: "Feb 22", caption: "214 Elm Street, Apt 4B · Hillview" },
    { src: img("junk_sunset"), date: "Feb 20", caption: "Lekki Beach, Lagos" },
    { src: img("insta_0"), date: "Feb 19" },
    { src: img("junk_market"), date: "Feb 15", caption: "Ikeja Market, Lagos" },
    { src: img("junk_cat"), date: "Feb 11" },
    { src: img("insta_1"), date: "Jan 30" },
    { src: img("junk_city"), date: "Jan 26", caption: "Lagos" },
    { src: img("junk_house2"), date: "Jan 21", caption: "Victoria Island, Lagos" },
    { src: img("insta_3"), date: "Jan 18" },
    { src: img("junk_car"), date: "Jan 9" },
  ],
  vaultCode: "0000",
  weather: { city: "Lagos", tempC: 31, hi: 33, lo: 25, condition: "Sunny" },
  revolut: {
    balance: "$12,340.00",
    transactions: [
      { name: "Transfer · Chloe T.", amount: "+$6,500.00", date: "Mon", note: "\"Emergency customs fee\"" },
      { name: "Luxury Boutique", amount: "-$6,500.00", date: "Mon", note: "Handbag · ship to Anna K." },
      { name: "Transfer · Chloe T.", amount: "+$4,800.00", date: "Tue" },
      { name: "Jewelers Row", amount: "-$4,800.00", date: "Tue", note: "Ring · for Rachel M." },
      { name: "Transfer · Chloe T.", amount: "+$3,200.00", date: "Last week" },
      { name: "Gift Cards Online × 8", amount: "-$3,200.00", date: "Last week", note: "For Sophie B." },
      { name: "Transfer · Chloe T.", amount: "+$900.00", date: "Last week" },
      { name: "Roses & Gifts", amount: "-$900.00", date: "Last week", note: "Delivered to Jenny L." },
      { name: "Transfer · Chloe T.", amount: "+$4,600.00", date: "Today" },
      { name: "Airline Tickets × 2", amount: "-$4,600.00", date: "Today", note: "For Elena V. · Lisbon" },
      { name: "Pending · Chloe T.", amount: "$5,000.00", date: "Tonight" },
    ],
  },
  maps: {
    locations: [
      { name: "Sophie 🌹 — live location", subtitle: "St. Mary's Hospital · now" },
      { name: "Ikeja Internet Café", subtitle: "Lagos, Nigeria · visited daily" },
      { name: "MTN Shop", subtitle: "Lagos, Nigeria" },
      { name: "Western Union", subtitle: "Ikeja, Lagos" },
    ],
    sectionLabel: "Tracked & frequent places",
  },
  now: "2026-11-03",
  scamIntro: {
    headline: "Last week he spent over $20,000 on strange transfers to women I don't know.",
    sub: "",
    bubble: "He just asked me for $5,000 again. What is he really doing? 😰",
    cta: "Expose Daniel 🔍",
  },
  trust: {
    label: "Trust in Daniel",
    // Từ ngưỡng cao xuống thấp — lấy dòng đầu tiên có trust >= min.
    clientReactions: [
      { min: 80, text: "He's so sweet, I really love him 🥰" },
      { min: 50, text: "Wait… that's weird 😳" },
      { min: 20, text: "Oh no… is it all fake? 😨" },
      { min: 1, text: "Please tell me it's not true… 😭" },
      { min: 0, text: "I can't believe it. Thank you 💔" },
    ],
  },
  ledger: {
    heading: "PAYMENT LOG",
    subheading: "All paid with Chloe's money",
    rows: [
      { name: "Anna K.", avatar: img("anna"), item: "Designer handbag", itemImage: img("item_handbag"), amount: "$6,500", note: "Mon · Chloe's money" },
      { name: "Rachel M.", avatar: img("rachel"), item: "Diamond ring", itemImage: img("item_ring"), amount: "$4,800", note: "Tue · Chloe's money" },
      { name: "Sophie B.", avatar: img("sophie"), item: "Gift cards × 8", itemImage: img("item_giftcards"), amount: "$3,200", note: "Last week · Chloe's money" },
      { name: "Jenny L.", avatar: img("jenny"), item: "Gift box & roses", itemImage: img("item_flowers"), amount: "$900", note: "Last week · Chloe's money" },
      { name: "Elena V.", avatar: img("elena"), item: "Flight tickets", itemEmoji: "✈️", amount: "$4,600", note: "Today · Chloe's money" },
      { name: "Chloe T.", avatar: img("chloe"), item: "Next: wire transfer", itemEmoji: "🏦", amount: "$5,000", note: "Tonight · asking Chloe again", highlight: true },
    ],
    totalLabel: "TOTAL",
    total: "$25,000",
    highlightTag: "Chloe's money — don't send it!",
    cta: "Continue",
  },
  endCard: {
    headline: "I'm in shock…",
    subhead: "He used my money to woo other women.",
    ctaLabel: "See his fate",
    teaser: {
      // ảnh 5 cô gái đang cãi nhau — teaser của ending
      blurImage: img("ending_argue"),
      title: "THE ENDING",
      text: "Do you want to know Daniel's ending?",
    },
    victims: VICTIMS,
    victimsLockText: "4 more women are still being scammed",
  },
};

export default { id: "05_daniel_scam", label: config.caseTitle, config };
