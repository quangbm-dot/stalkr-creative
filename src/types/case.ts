export type AppKey =
  | "messages"
  | "photos"
  | "notes"
  | "calendar"
  | "weather"
  | "instagram"
  | "airbnb"
  | "revolut"
  | "wallet"
  | "gmail"
  | "clock"
  | "maps"
  | "compass"
  | "calculator"
  | "settings"
  | "phone"
  | "whatsapp"
  | "chrome"
  | "tinder";

export interface AppIcon {
  app: AppKey;
  label: string;
  icon: string;
}

export type HireStep =
  | { type: "msgs"; text: string }
  | { type: "img"; src: string; label?: string }
  /** Ảnh + tin nhắn xuất hiện cùng lúc trong 1 bước (thay vì tách 2 bước riêng). */
  | { type: "reveal"; text: string; src: string; label?: string }
  /** Khoảnh khắc đặc biệt: thẻ kiểu app hẹn hò (ảnh + tên/tuổi/trạng thái)
   *  đẩy vào rồi mờ dần đi, không ghim lại trên bảng chứng cứ. */
  | { type: "tinderReveal"; text: string; src: string; name: string; age: number; subtitle: string }
  /** Ảnh polaroid đặc biệt: bóng người ẩn danh + dấu "?" + khoanh đỏ, ghim
   *  lên bảng như 1 khung ảnh bình thường (không cần src). */
  | { type: "mysteryReveal"; text: string; label: string }
  | { type: "choices"; options: string[] }
  | { type: "cta"; label: string };

export interface MessageThread {
  id: string;
  title: string;
  avatar?: string;
  time: string;
  unread: boolean;
  msgs: { me: boolean; text: string }[];
}

export interface NoteEntry {
  title: string;
  body: string;
}

export interface CalendarEvent {
  title: string;
  date: string;
}

export interface InstagramPost {
  image: string;
  location: string;
  caption?: string;
}

export interface AirbnbListing {
  title: string;
  img: string;
  rating?: string;
  subtitle?: string;
  price?: string;
}

export interface GmailEntry {
  sender: string;
  subject: string;
  preview: string;
}

export interface PhotoEntry {
  src: string;
  /** true = chỉ hiện sau khi mở khoá vault bằng vaultCode */
  secret?: boolean;
}

export interface MatchCard {
  name: string;
  age: number;
  photo: string;
  /** true = đây là match thật (có hội thoại trong tab Messages) */
  matched?: boolean;
}

/** Hội thoại duy nhất trong tab Messages của app Tinder. */
export interface MatchThread {
  name: string;
  avatar: string;
  msgs: { me: boolean; text: string }[];
}

export interface CallEntry {
  name: string;
  time: string;
  type: "incoming" | "outgoing" | "missed";
}

export interface WeatherInfo {
  city: string;
  tempC: number;
  hi: number;
  lo: number;
  condition: string;
}

export interface EvidenceRound {
  informant: { name: string; avatar: string };
  prompt: string;
  choices: string[];
  correct: string;
  correctReply: string;
  /** Mỗi lần chọn sai hiện 1 câu khác nhau (theo thứ tự) — hết mảng thì
   *  lặp lại câu cuối cùng. */
  wrongReply: string[];
  reward: number;
  hint: string;
  /** App cần mở để tìm manh mối cho câu này — bàn tay gợi ý sẽ trỏ vào đây. */
  hintApp: AppKey;
}

/**
 * Toàn bộ nội dung của 1 case gói trong 1 object duy nhất.
 * Case mới = tạo 1 CaseConfig mới (+ ảnh riêng trong src/Assets/<case>/),
 * không cần đụng vào component UI.
 */
export interface CaseConfig {
  caseTitle: string;
  tagline: string;
  heroImage: string;
  evidenceTotal: number;
  hintBudget: number;
  evidenceRounds: EvidenceRound[];
  client: {
    name: string;
    avatar: string;
    hire: HireStep[];
    /** Ảnh hiện trong lưới match app Tinder (chỉ để xem, không phải quiz) */
    matches: MatchCard[];
    /** Hội thoại duy nhất trong tab Messages của Tinder — với match thật */
    matchThread: MatchThread;
  };
  hint: string;
  owner: { first: string; full: string; avatar: string };
  wallpaper: string;
  home: {
    pages: AppIcon[][];
    dock: AppIcon[];
  };
  messages: MessageThread[];
  whatsapp: MessageThread[];
  calls: CallEntry[];
  notes: NoteEntry[];
  calendar: CalendarEvent[];
  instagram: { username: string; displayName: string; avatar: string; posts: InstagramPost[] };
  airbnb: { name: string; img: string; listings: AirbnbListing[] };
  gmail: GmailEntry[];
  photos: PhotoEntry[];
  vaultCode: string;
  weather: WeatherInfo;
  endCard: {
    headline: string;
    subhead: string;
    ctaLabel: string;
  };
}
