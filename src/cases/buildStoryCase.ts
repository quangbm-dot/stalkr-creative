import type { AppIcon, CaseConfig, HireStep, MessageThread } from "../types/case";

/**
 * v10: CaseConfig dựng từ "story" export của app Stalkr thật (schema giàu
 * hơn v9 — trả lời gõ chữ tự do thay vì trắc nghiệm, intro 2 lớp: slide
 * ảnh+text rồi tới đoạn chat có ô nhập tên + lựa chọn xen giữa).
 * scripts/v10_convert_story.py → src/cases/01_casey_miles/story.json + img/.
 * Chỉ dùng 10 câu hỏi đầu (theo yêu cầu) — xem docstring của script để biết
 * app nào được chọn cho từng câu và vì sao.
 */

export interface StoryJson {
  title: string;
  ownerFirst: string;
  ownerFull: string;
  clientName: string;
  clientAvatar: string | null;
  hero: string | null;
  wallpaper: string | null;
  passcode: string;
  endHeadline: string;
  endSubhead: string;
  onboardingContent: { text: string; caption: string; image: string | null }[];
  onboardingSms: {
    contactName: string;
    steps: (
      | { type: "messages"; messages: { text: string | null; image: string | null }[] }
      | { type: "prompt"; inputType: "keyboard"; placeholder: string }
      | { type: "prompt"; inputType: "choices"; options: string[] }
    )[];
  };
  home: {
    dock: { app: string; label: string; icon: string | null }[];
    home_page_1: { app: string; label: string; icon: string | null }[];
    home_page_2: { app: string; label: string; icon: string | null }[];
    home_page_3: { app: string; label: string; icon: string | null }[];
  };
  messages: MessageThread[];
  notes: { title: string; body: string }[];
  calendar: { title: string; date: string; location: string }[];
  maps: { name: string; subtitle: string }[];
  instagram?: { username: string; displayName: string; avatar: string | null; posts: { image: string; location: string; caption: string; username: string }[] };
  photos?: string[];
  airbnb: { name: string; listings: { title: string; img: string | null; subtitle: string }[] };
  revolut: { balance: string; transactions: { name: string; amount: string; date: string; note: string }[] };
  questions: { prompt: string; answer: string; decoys: string[]; hint: string; hintApp: string }[];
}

/** Trộn cố định theo seed — đáp án đúng không luôn nằm 1 chỗ, nhưng mỗi
 *  lần chơi vẫn ra cùng 1 thứ tự. */
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

export interface V10Case {
  id: string;
  label: string;
  config: CaseConfig;
}


// Chơi đủ 8 câu rồi mới tới endcard (story gốc có 10 câu, cắt ở 8).
const MAX_ROUNDS = 8;

// Câu cần 2 mini app liên tiếp: Q6 xem Calendar (địa chỉ buổi hẹn) rồi tra Maps (tên quán).
const HINT_STEPS: Record<number, { app: string; target?: string }[]> = {
  5: [
    { app: "calendar", target: "Tinder Date" },
    { app: "maps", target: "Pace 🍝" },
  ],
};

// Lời Casey đáp lại sau mỗi đáp án đúng (viết riêng, có emoji) — thay cho việc
// lặp lại câu đầu của câu hỏi kế tiếp như trước.
const CORRECT_REPLIES = [
  "Draper... so it really IS his phone 😳",
  "\"Do not pick up\"?! Who saves a contact like that 😱",
  "Mar... she even has a pet name 💔",
  "Tinder. Of course. I feel sick 🤢",
  "Italian — his go-to date night 🍝😤",
  "Pace. I'll never walk past that place again 📍",
  "A whole extra night in Venice 🏠😡",
  "$500 for a night with her?! 💸😭",
];

export function buildStoryCase(id: string, data: StoryJson, images: Record<string, string>): V10Case {
  const img = (name: string | null | undefined) => (name ? images[`./img/${name}`] ?? "" : "");

  // Chỉ show slide cuối (không cần cả 4 slide mở đầu), và bỏ hẳn bước nhập
  // tên — thanh dưới chỉ dùng để chọn đáp án dẫn vào điện thoại, không gõ gì.
  const lastSlide = data.onboardingContent[data.onboardingContent.length - 1];
  const hire: HireStep[] = [
    ...(lastSlide ? [{ type: "reveal" as const, text: lastSlide.text, src: img(lastSlide.image), label: lastSlide.caption }] : []),
    ...data.onboardingSms.steps.flatMap((step): HireStep[] => {
      if (step.type === "messages") {
        return step.messages.map((m): HireStep => ({ type: "msgs", text: m.text ?? "", image: img(m.image) || undefined }));
      }
      if (step.type === "prompt" && step.inputType === "keyboard") {
        return [];
      }
      return [{ type: "choices", options: step.options }];
    }),
    { type: "cta", label: `Open ${data.ownerFirst}'s phone 🔍` },
  ];

  // Id dòng/thẻ CHỨA manh mối ngay trong app đó — khớp đúng field tiêu đề/
  // tên của từng app con (xem comment hintTargetId trong types/case.ts).
  // Theo đúng thứ tự 10 câu hỏi đầu của story.json. undefined = app đó
  // không có dòng cụ thể để trỏ vào, mở app là đủ (Settings, câu 1).
  const HINT_TARGETS: (string | undefined)[] = [
    undefined, // Q1 settings — tên chủ máy ngay đầu màn hình
    "Do not pick up", // Q2 messages
    "Do not pick up", // Q3 messages
    "Do not pick up", // Q4 messages
    "Do not pick up", // Q5 messages
    "Tinder Date", // Q6 calendar
    "Venice Loft", // Q7 airbnb
    "Airbnb — Venice Loft", // Q8 revolut
    "Casey 💖", // Q9 messages
    "Bits and pieces", // Q10 notes
  ];

  // Chơi đủ 8 câu rồi mới tới endcard (story gốc có 10 câu, cắt ở 8).
  const evidenceRounds = data.questions.slice(0, MAX_ROUNDS).map((q, i) => ({
    informant: { name: data.clientName, avatar: img(data.clientAvatar) },
    prompt: q.prompt,
    // Chỉ lấy 3 decoy + 1 đáp án đúng = 4 lựa chọn, đúng như ảnh mẫu (không
    // phải cả 5 decoy có trong data gốc).
    choices: seededShuffle([q.answer, ...q.decoys.slice(0, 3)], i + 1),
    correct: q.answer,
    correctReply: CORRECT_REPLIES[i] ?? "Got it. Keep going. 🔍",
    wrongReply: ["Not that. Look again.", `Still not it — hint: ${q.hint}`],
    reward: 10,
    hint: q.hint,
    hintApp: q.hintApp as CaseConfig["evidenceRounds"][number]["hintApp"],
    hintTargetId: HINT_TARGETS[i],
    hintSteps: HINT_STEPS[i] as CaseConfig["evidenceRounds"][number]["hintSteps"],
  }));

  // Clone y hệt layout home screen thật (3 trang + dock, đúng app + thứ tự
  // của availableApps) — không tự chọn bớt app như bản trước.
  const toIcon = (a: { app: string; label: string; icon: string | null }): AppIcon => ({
    app: a.app as AppIcon["app"],
    label: a.label,
    icon: img(a.icon),
  });
  const dock = data.home.dock.map(toIcon);
  const pages = [data.home.home_page_1, data.home.home_page_2, data.home.home_page_3]
    .map((p) => p.map(toIcon))
    .filter((p) => p.length);

  const config: CaseConfig = {
    caseTitle: data.title,
    tagline: data.endSubhead,
    heroImage: img(data.hero),
    evidenceTotal: evidenceRounds.length,
    hintBudget: 4,
    evidenceRounds,
    client: {
      name: data.clientName,
      avatar: img(data.clientAvatar),
      hire,
      matches: [],
      matchThread: { name: "", avatar: "", msgs: [] },
    },
    hint: "Open the apps on the phone to find clues.",
    // Ảnh chủ máy (Miles) — lấy đúng slide chân dung riêng của anh ta
    // (onboarding slide 3), KHÔNG phải data.clientAvatar (đó là ảnh Casey,
    // người đi thuê thám tử) — trước bị gán nhầm nên Settings/Apple ID hiện
    // ảnh Casey thay vì Miles.
    owner: { first: data.ownerFirst, full: data.ownerFull, avatar: img(data.onboardingContent[2]?.image) || img(data.clientAvatar) },
    wallpaper: img(data.wallpaper),
    home: { pages, dock },
    messages: data.messages.map((t) => ({ ...t, avatar: t.avatar ? img(t.avatar as unknown as string) : undefined })),
    whatsapp: [],
    calls: [],
    notes: data.notes,
    calendar: data.calendar,
    instagram: { username: data.instagram?.username ?? "", displayName: data.instagram?.displayName ?? data.ownerFull, avatar: img(data.instagram?.avatar) || "",
      posts: (data.instagram?.posts ?? []).map((p) => ({ image: img(p.image), location: p.location, caption: p.caption, username: p.username })) },
    airbnb: { name: data.airbnb.name, img: "", listings: data.airbnb.listings.map((l) => ({ ...l, img: img(l.img as unknown as string) })) },
    gmail: [],
    photos: (data.photos ?? []).map((p) => ({ src: img(p) })),
    vaultCode: data.passcode,
    weather: { city: "", tempC: 0, hi: 0, lo: 0, condition: "" },
    revolut: data.revolut,
    maps: { locations: data.maps, sectionLabel: "Saved places" },
    endCard: {
      headline: data.endHeadline,
      subhead: data.endSubhead,
      ctaLabel: "Continue",
    },
  };

  return { id, label: data.title, config };
}
