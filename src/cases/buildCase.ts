import type { AppIcon, AppKey, CaseConfig, EvidenceRound, HireStep } from "../types/case";

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
import iconAirbnb from "../Assets/Icons/real/airbnb.webp";

/**
 * v9: CaseConfig dựng từ case draft của app Stalkr thật
 * (test_case_draft_*.json → scripts/v9_convert_cases.py → phone.json + img/).
 * Mỗi case chỉ cần 1 file index.ts nhỏ: phone.json + map ảnh + phần
 * override viết tay (app gợi ý cho từng câu, lời thoại nối câu...).
 */

const ICONS: Partial<Record<AppKey, string>> = {
  instagram: iconInstagram,
  gmail: iconGmail,
  maps: iconMaps,
  whatsapp: iconWhatsapp,
  notes: iconNotes,
  photos: iconPhotos,
  calendar: iconCalendar,
  weather: iconWeather,
  wallet: iconWallet,
  revolut: iconRevoBank,
  clock: iconClock,
  compass: iconCompass,
  calculator: iconCalculator,
  settings: iconSettings,
  messages: iconMessages,
  phone: iconPhone,
  airbnb: iconAirbnb,
};

const FILLER_APPS = [
  { app: "compass", label: "Compass" },
  { app: "calculator", label: "Calculator" },
  { app: "clock", label: "Clock" },
  { app: "settings", label: "Settings" },
  { app: "wallet", label: "Wallet" },
];

/** App mà câu hỏi cần nhưng playable chưa có UI/icon — câu đó bị bỏ qua. */
export const MISSING_APPS = ["safari", "splitpay"] as const;
export type MissingApp = (typeof MISSING_APPS)[number];

interface Thread {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  avatar?: string;
  msgs: { me: boolean; text: string }[];
}

export interface PhoneJson {
  caseName: string;
  title: string;
  now: string;
  client: { name: string; avatar: string | null };
  owner: { first: string; full: string; avatar: string | null };
  wallpaper: string | null;
  passcode: string;
  totalQuestions: number;
  questions: { id: number; text: string; answer: string; decoys: string[]; hint: string }[];
  onboarding: { text: string; label: string; image: string | null }[];
  home: { app: string; label: string }[];
  dock: { app: string; label: string }[];
  missingApps: string[];
  calls: CaseConfig["calls"];
  messages: Thread[];
  whatsapp: Thread[];
  gmail: CaseConfig["gmail"];
  calendar: CaseConfig["calendar"];
  notes: CaseConfig["notes"];
  maps: CaseConfig["maps"]["locations"];
  revolut: CaseConfig["revolut"];
  weather: CaseConfig["weather"];
  photos: string[];
}

export interface QuestionOverride {
  /** App phát sáng gợi ý cho câu này. */
  hintApp: AppKey | MissingApp;
  /** Ghi đè đáp án hiển thị (vd viết hoa lại). */
  answer?: string;
  /** Bản V9_EASY: thay nguyên câu hỏi hiển thị cho rõ/dễ hơn. Không đụng
   *  tới correctReply/câu phản ứng (luôn lấy từ q.text gốc của câu kế). */
  easyQuestion?: string;
  /** Bản V9_EASY: thay cho q.hint — chỉ thẳng tên chat/mục/ngày cụ thể thay
   *  vì chỉ nói chung chung "mở app X". hintApp (app nào sáng gợi ý) KHÔNG
   *  đổi, vẫn y hệt bản gốc. */
  easyHint?: string;
}

export interface CaseOverrides {
  /** Theo thứ tự 5 câu đầu của draft. */
  questions: QuestionOverride[];
  introChoices: [string, string];
  introCta: string;
  /** Câu khách nói sau khi trả lời đúng câu cuối cùng có trong playable. */
  finalReply: string;
  endHeadline: string;
}

export interface V9Case {
  id: string;
  label: string;
  config: CaseConfig;
}

const firstLine = (text: string) => text.split("\n")[0].trim();
const withoutFirstLine = (text: string) => text.split("\n").slice(1).join("\n").trim();

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

export function buildCase(
  id: string,
  data: PhoneJson,
  images: Record<string, string>,
  o: CaseOverrides,
): V9Case {
  const img = (name: string | null | undefined) => (name ? images[`./img/${name}`] ?? "" : "");
  const client = { name: data.client.name, avatar: img(data.client.avatar) };

  // Câu nào cần app chưa có (Safari, SplitPay) thì bỏ qua. Lời thoại câu kế
  // tiếp trong draft mở đầu bằng 1 dòng phản ứng với đáp án câu trước —
  // dùng dòng đó làm correctReply, phần còn lại làm prompt của câu sau.
  const qs = data.questions;
  const kept = o.questions
    .map((ov, i) => ({ ov, q: qs[i], i }))
    .filter(({ ov }) => !(MISSING_APPS as readonly string[]).includes(ov.hintApp));

  const evidenceRounds: EvidenceRound[] = kept.map(({ ov, q, i }, k) => {
    const answer = ov.answer ?? q.answer;
    const reactionSource = qs[i + 1];
    const isLast = k === kept.length - 1;
    const hint = (__V9_EASY__ && ov.easyHint) || q.hint;
    return {
      informant: client,
      prompt: __V9_EASY__ && ov.easyQuestion ? ov.easyQuestion : k === 0 ? q.text : withoutFirstLine(q.text),
      choices: seededShuffle([answer, ...q.decoys.slice(0, 3)], q.id + id.length),
      correct: answer,
      correctReply: isLast || !reactionSource ? o.finalReply : firstLine(reactionSource.text),
      wrongReply: ["That doesn't sound right. Look again.", `Not that. ${hint}`],
      reward: 10,
      hint,
      hintApp: ov.hintApp as AppKey,
    };
  });

  const hire: HireStep[] = [
    ...data.onboarding.map(
      (ob): HireStep => ({ type: "reveal", text: ob.text, src: img(ob.image), label: ob.label }),
    ),
    { type: "choices", options: o.introChoices },
    { type: "cta", label: o.introCta },
  ];

  const icon = (a: { app: string; label: string }): AppIcon => ({
    app: a.app as AppKey,
    label: a.label,
    icon: ICONS[a.app as AppKey] ?? "",
  });
  // Trang 1 = 8 app đầu của case; trang 2 = app còn lại + vài app hệ thống
  // không cần dữ liệu case (Compass, Calculator...) để luôn có trang 2 để
  // vuốt sang như máy thật, kể cả khi case chỉ có ≤ 8 app có UI.
  const homeIcons = data.home.map(icon);
  const used = new Set([...data.home, ...data.dock].map((a) => a.app));
  const fillers = FILLER_APPS.filter((a) => !used.has(a.app)).map(icon);
  const pages: AppIcon[][] = [homeIcons.slice(0, 8), [...homeIcons.slice(8), ...fillers]].filter((p) => p.length);

  const ownerAvatar = img(data.owner.avatar) || client.avatar;
  const photos = data.photos.map((p) => ({ src: img(p) }));

  const config: CaseConfig = {
    caseTitle: data.title,
    tagline: data.caseName,
    heroImage: img(data.onboarding[1]?.image ?? data.onboarding[0]?.image),
    evidenceTotal: data.totalQuestions,
    hintBudget: 4,
    evidenceRounds,
    client: {
      ...client,
      hire,
      matches: [],
      matchThread: { name: "", avatar: "", msgs: [] },
    },
    hint: "Open the apps on the phone to find clues.",
    owner: { first: data.owner.first, full: data.owner.full, avatar: ownerAvatar },
    wallpaper: img(data.wallpaper),
    home: { pages, dock: data.dock.map(icon) },
    messages: data.messages.map((t) => ({ ...t, avatar: t.avatar ? img(t.avatar) : undefined })),
    whatsapp: data.whatsapp.map((t) => ({ ...t, avatar: t.avatar ? img(t.avatar) : undefined })),
    calls: data.calls,
    notes: data.notes,
    calendar: data.calendar,
    instagram: { username: "", displayName: data.owner.full, avatar: ownerAvatar, posts: [] },
    airbnb: { name: "", img: "", listings: [] },
    gmail: data.gmail,
    photos,
    vaultCode: data.passcode,
    weather: data.weather,
    revolut: data.revolut,
    maps: { locations: data.maps, sectionLabel: "Saved places" },
    now: data.now,
    endCard: {
      headline: o.endHeadline,
      subhead: `${data.totalQuestions} questions. One phone. Every answer is hiding inside it.`,
      ctaLabel: "Continue the case",
    },
  };

  return { id, label: data.title, config };
}
