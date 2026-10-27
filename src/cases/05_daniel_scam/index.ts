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
    prompt: "Hi, I'm Chloe — his wife. Help me find these strange transactions. Wait — $3,200 on gift cards? He told me he went for a run that morning. My card says otherwise.",
    answer: "St. Mary's Hospital",
    decoys: ["Her apartment", "A shopping mall", "The airport"],
    hint: "Open Maps — see where he actually was that morning.",
    hintApp: "maps",
    target: "St. Mary's Hospital",
    victim: "Sophie",
    reply: "He's tracking someone at a hospital?! 😨",
  },
  {
    prompt: "The very next day, another charge went through — while he swore he was 'just grabbing coffee'. He even took a photo of it, like he was proud.",
    answer: "214 Elm Street",
    decoys: ["88 Oak Avenue", "19 Maple Court", "402 Pine Road"],
    hint: "Open Photos and tap the delivery picture to see the address.",
    hintApp: "photos",
    target: "jenny-house",
    victim: "Jenny",
    reply: "A delivery to some stranger's apartment?! 😳",
  },
  {
    prompt: "Then Monday — bigger this time. He left lunch early, phone buzzing nonstop, and right after, an email landed that wasn't about work.",
    answer: "London Heathrow",
    decoys: ["Paris Orly", "Chicago O'Hare", "Dubai"],
    hint: "Open Mail and check the shipping request — it mentions a flight.",
    hintApp: "gmail",
    victim: "Anna",
    reply: "He rushed a gift before someone's flight?! Who else is there?! 😱",
  },
  {
    prompt: "Tuesday, he wrote something down and actually LOCKED the note. He's never done that before — not even I have the code.",
    answer: "Maple Street Elementary",
    decoys: ["Her office", "A supermarket", "Her mother's place"],
    hint: "There's a birthday on the Calendar — try it as the note's PIN.",
    hintApp: "calendar",
    steps: [
      { app: "calendar", target: "🎂 Don't forget" },
      { app: "notes", target: "💕 Her" },
    ],
    victim: "Rachel",
    reply: "Someone's school pickup time?! He knows that much about her 😭",
  },
  {
    prompt: "And today — right before he asked me for another $5,000 — an email came in about tickets. Tickets for who, and to where?",
    answer: "Riverside Art Gallery",
    decoys: ["A yoga studio", "Her office", "The airport"],
    hint: "Open Mail and check the flight-ticket confirmation.",
    hintApp: "gmail",
    victim: "Elena",
    reply: "A fifth woman?! Flight tickets, tonight of all nights?! 😡",
  },
];

const VICTIMS = [
  { name: "Sophie", avatar: img("sophie"), blurAvatar: img("blur_sophie"), line: "Night-shift nurse" },
  { name: "Jenny", avatar: img("jenny"), blurAvatar: img("blur_jenny"), line: "College student" },
  { name: "Elena", avatar: img("elena"), blurAvatar: img("blur_elena"), line: "Art curator" },
  { name: "Rachel", avatar: img("rachel"), blurAvatar: img("blur_rachel"), line: "Single mom" },
  { name: "Anna", avatar: img("anna"), blurAvatar: img("blur_anna"), line: "Executive" },
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
// v13: Messages không còn là nơi lộ manh mối của ai — tên/avatar thật đều giấu (title là
// nickname, không avatar) để 1 app này không cho thấy hết cả 5 cô cùng lúc.
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
  flirtThread("t3", "✨ Sweetheart", "Yesterday", [
    { me: true, text: "Did the roses reach your door, sweetheart? 🌹" },
    { me: false, text: "Daniel!! They're gorgeous, my roommates are jealous 😍" },
    { me: true, text: "Anything for my favorite girl. Library tonight?" },
  ]),
  flirtThread("t12", "🎨 Gallery girl", "Today", [
    { me: true, text: "Counting the days until Lisbon, babe. Flights are booked ✈️" },
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
  flirtThread("t2", "🌹 Night shift", "Yesterday", [
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
  flirtThread("t5", "💫 Traveler", "Mon", [
    { me: true, text: "Did you like the handbag, honey? Picked it myself 💫" },
    { me: false, text: "I can't believe you remembered! I'm flying out Friday to see you ✈️" },
    { me: true, text: "Counting the hours. London will be ours." },
  ]),
  flirtThread("t4", "💕 Secret keeper", "Tue", [
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
    { title: "💕 Her", body: "Rachel — picks up her son at 3:30, Maple Street Elementary. Always calls after.", lock: "1204", lockHint: "Her birthday", photo: img("together_rachel") },
    { title: "Script v3", body: "Day 1: Hi beautiful.\nDay 30: I love you.\nDay 90: Customs fee. Never more than 5k at once." },
    { title: "Profile pics — source", body: "Photos = Dr. Marcus Hale (real surgeon, Instagram).\nNever video call. Always \"bad signal\"." },
    { title: "Shopping", body: "Phone credit\nSIM cards x4" },
  ],
  calendar: [
    { title: "Call Chloe", date: "11/03", month: "2026-11", dateLabel: "Tue, Nov 3", time: "8:00 PM" },
    { title: "🎂 Don't forget", date: "12/04", month: "2026-11", dateLabel: "Fri, Dec 4", time: "All day" },
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
      sender: "Luxury Boutique",
      subject: "Your rush order has shipped",
      preview: "Rush delivery confirmed — see details",
      body: "Your handbag order ($6,500) has been rush-shipped — gift-wrapped and arriving today, as requested.",
      time: "Mon",
    },
    // v13: ảnh chụp chung KHÔNG hợp lý nằm trong mail xác nhận đơn hàng của
    // shop — phải là cô ấy tự gửi lại (mail cảm ơn), nên tách thành 1 thư riêng.
    // Đáp án (Heathrow) cũng dời hẳn về ĐÚNG thư này — chỗ có ảnh — thay vì
    // nằm tách rời ở mail xác nhận bên trên (người chơi mở mail có ảnh ra là
    // thấy luôn đáp án ngay tại đó, không phải đoán mở nhầm thư).
    {
      // v13: sender bị che (giống kiểu "Sent to A•••" ở noti đầu game) — tên thật
      // chỉ lộ qua thẻ VictimReveal sau khi trả lời đúng, không lộ ngay khi browse Gmail.
      sender: "A•••",
      subject: "Thank you!! 😍",
      preview: "I can't stop smiling — attached my favorite pic",
      body: "I can't stop smiling — thank you for the handbag! See you at Heathrow tonight, can't wait ✈️ Attached is my favorite photo of us together 💕 — Anna",
      time: "Mon",
      attachment: img("together_anna"),
    },
    { sender: "Jewelers Row", subject: "Order confirmed — diamond ring", preview: "Your order is being prepared", time: "Tue" },
    {
      sender: "SkyWings Travel",
      subject: "Your flight tickets are confirmed",
      preview: "2 tickets booked for today",
      body: "2 tickets booked for today's departure. Have a safe flight!",
      time: "Today",
    },
    // v13: đáp án (Riverside Art Gallery) dời về đúng thư này — chỗ có ảnh.
    {
      sender: "E•••",
      subject: "Thank you ❤️",
      preview: "You didn't have to, but I'm so glad",
      body: "You didn't have to get the tickets, but I'm so glad you did. Meet me at Riverside Art Gallery tonight, like always 🎨 Here's my favorite photo of us together 💕 — Elena",
      time: "Today",
      attachment: img("together_elena"),
    },
    { sender: "Lagos Telecom", subject: "Your SIM bundle expires", preview: "Renew your data bundle to keep chatting…", time: "Mon" },
  ],
  photos: [
    { src: img("daniel"), date: "Mar 2" },
    { src: img("junk_food"), date: "Mar 1", caption: "Ikeja, Lagos" },
    { src: img("insta_2"), date: "Feb 27" },
    { src: img("junk_laptop"), date: "Feb 24" },
    // v13: ẢNH DUY NHẤT — vừa là manh mối địa chỉ (caption), vừa là "ảnh bằng
    // chứng" (Daniel + Jenny trao quà ở cửa nhà) — thumbnail trong lưới nhỏ nên
    // khó nhận ra có 2 người, chạm vào xem to mới thấy rõ.
    { id: "jenny-house", src: img("together_jenny"), date: "Feb 22", caption: "Jenny L. — 214 Elm Street, Apt 4B · Hillview" },
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
      { name: "Luxury Boutique", amount: "-$6,500.00", date: "Mon", note: "Handbag · rush delivery" },
      { name: "Transfer · Chloe T.", amount: "+$4,800.00", date: "Tue" },
      { name: "Jewelers Row", amount: "-$4,800.00", date: "Tue", note: "Diamond ring" },
      { name: "Transfer · Chloe T.", amount: "+$3,200.00", date: "Last week" },
      { name: "Gift Cards Online × 8", amount: "-$3,200.00", date: "Last week" },
      { name: "Transfer · Chloe T.", amount: "+$900.00", date: "Last week" },
      { name: "Roses & Gifts", amount: "-$900.00", date: "Last week", note: "Delivered" },
      { name: "Transfer · Chloe T.", amount: "+$4,600.00", date: "Today" },
      { name: "Airline Tickets × 2", amount: "-$4,600.00", date: "Today", note: "2 tickets · today" },
      { name: "Pending · Chloe T.", amount: "$5,000.00", date: "Tonight" },
    ],
  },
  maps: {
    locations: [
      {
        name: "St. Mary's Hospital",
        subtitle: "Visited · this morning",
        photo: img("together_sophie"),
        photoCaption: "Sophie B. sent this after his visit 💙",
        coords: "📍 40.7306° N, 73.9352° W",
        personLine: "Night-shift nurse · St. Mary's Hospital",
      },
      { name: "Ikeja Internet Café", subtitle: "Lagos, Nigeria · visited daily" },
      { name: "MTN Shop", subtitle: "Lagos, Nigeria" },
      { name: "Western Union", subtitle: "Ikeja, Lagos" },
    ],
    sectionLabel: "Recent places",
  },
  now: "2026-11-03",
  scamIntro: {
    // v13: giờ là đoạn Chloe TỔNG KẾT LẠI (hiện sau khung ảnh chụp chat, xem .bubble) — không còn là headline riêng.
    headline: "So that's over $25,000 in strange payments this past week. I want to know who these 5 people are.",
    sub: "",
    // v13: nội dung tin nhắn THẬT của Daniel — hiện trong khung "ảnh chụp màn hình chat" (nền trắng, kiểu Messenger thật), không phải lời kể của Chloe.
    bubble: "Hey babe, I need $5,000 again. Customs fee for your gift — please, today? 🙏",
    cta: "Expose Daniel 🔍",
  },
  trust: {
    label: "Trust in Daniel",
    // Từ ngưỡng cao xuống thấp — lấy dòng đầu tiên có trust >= min.
    // v13: khớp đúng từng mốc trust sau mỗi câu giải xong (100 → 80 → 60 → 40 → 20 → 0) —
    // Chloe đã nghi ngờ sẵn từ đầu (không còn "yêu anh ấy lắm" — mâu thuẫn với intro mới,
    // cô ấy đã thấy $25,000 đáng ngờ trước khi vào máy rồi). Giữ gender-neutral ("people"),
    // vì Chloe CHƯA biết đó là phụ nữ cho tới khi tự điều tra ra.
    clientReactions: [
      { min: 100, text: "Something feels off... 🤔" },
      { min: 80, text: "How dare he... 😡" },
      { min: 60, text: "TWO people?! What did they even do? 😱" },
      { min: 40, text: "I'm losing it... gifts for someone else now?? 😭" },
      { min: 20, text: "Four people now... how did I not see this? 💔" },
      { min: 0, text: "I can't believe it. Thank you for showing me. 💔" },
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
