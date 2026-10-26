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
  | "tinder"
  | "hinge"
  | "snapchat"
  | "chatgpt"
  | "snake"
  | "game2048"
  | "camera"
  | "photoshop"
  | "ozratu";

export interface AppIcon {
  app: AppKey;
  label: string;
  icon: string;
}

export type HireStep =
  | { type: "msgs"; text: string; image?: string }
  /** v10: ô nhập tên giữa đoạn chat — câu trả lời được lưu lại để thế vào
   *  "{{name}}" trong các tin nhắn tiếp theo (xem Intro.tsx). */
  | { type: "nameInput"; placeholder: string }
  | { type: "img"; src: string; label?: string }
  /** Ảnh + tin nhắn xuất hiện cùng lúc trong 1 bước (thay vì tách 2 bước riêng). */
  | { type: "reveal"; text: string; src: string; label?: string }
  /** Khoảnh khắc đặc biệt: thẻ kiểu app hẹn hò (ảnh + tên/tuổi/trạng thái)
   *  đẩy vào rồi mờ dần đi, không ghim lại trên bảng chứng cứ. */
  | { type: "tinderReveal"; text: string; src: string; name: string; age: number; subtitle: string }
  /** Ảnh polaroid đặc biệt: bóng người ẩn danh + dấu "?" + khoanh đỏ, ghim
   *  lên bảng như 1 khung ảnh bình thường (không cần src). */
  | { type: "mysteryReveal"; text: string; label: string }
  /** v4 intro: 1 ảnh "hành vi" duy nhất hiện dạng card app thật (ảnh +
   *  tên/subtitle đè lên, badge icon+tên app ở góc) ngay trong dòng chat,
   *  thay cho bảng ghim polaroid nhiều ảnh của v1-v3. */
  | { type: "appReveal"; text: string; src: string; name: string; subtitle: string; appLabel: string; appIcon: string }
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
  /** v13: ghi chú khoá bằng mã PIN — phải nhập đúng `lock` mới đọc được nội dung. */
  lock?: string;
  /** Gợi ý hiện dưới bàn phím PIN, vd "Her birthday". */
  lockHint?: string;
}

export interface CalendarEvent {
  title: string;
  /** "MM/DD" */
  date: string;
  /** "YYYY-MM" — khi có thì chỉ đánh dấu ngày trên lưới đúng tháng đó */
  month?: string;
  /** Nhãn ngày đầy đủ hiện trong agenda, vd "Mon, Aug 3, 2026" */
  dateLabel?: string;
  time?: string;
  location?: string;
}

export interface InstagramPost {
  image: string;
  location: string;
  caption?: string;
  username?: string;
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
  /** Nội dung đầy đủ khi mở thư — không có thì hiện preview */
  body?: string;
  time?: string;
  /** Mặc định "inbox" */
  folder?: "inbox" | "sent";
}

export interface PhotoEntry {
  src: string;
  /** true = chỉ hiện sau khi mở khoá vault bằng vaultCode */
  secret?: boolean;
  /** v13: id để trỏ manh mối (hintTargetId) vào đúng ảnh này. */
  id?: string;
  /** v13: chạm ảnh để xem to — khung thông tin hiện địa điểm (`caption`) + ngày (`date`), như iOS Photos. */
  caption?: string;
  date?: string;
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
  /** vd "14 min" / "Blocked" */
  detail?: string;
}

export interface WeatherInfo {
  city: string;
  tempC: number;
  hi: number;
  lo: number;
  condition: string;
}

export interface RevolutTransaction {
  name: string;
  amount: string;
  date?: string;
  note?: string;
}

export interface MapLocation {
  name: string;
  subtitle?: string;
}

/** v13: cô gái hiện ra (blur → rõ nét) rồi bay vào khay thu thập mỗi khi trả lời đúng 1 câu. */
export interface VictimRef {
  name: string;
  avatar: string;
  blurAvatar?: string;
}

export interface EvidenceRound {
  victim?: VictimRef;
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
  /** Câu cần đi qua NHIỀU mini app theo thứ tự (vd Calendar -> Maps): mỗi bước có app + dòng
   *  lộ đáp án. Rời app của bước hiện tại (về home) là sang bước kế; bước cuối mới mở khoá. */
  hintSteps?: { app: AppKey; target?: string }[];
  /** Khớp đúng bản gốc (V8): id dòng/thẻ chứa manh mối NGAY TRONG app đó —
   *  "Do not pick up" (tên hội thoại), "Tinder Date"/"Venice Loft" (tiêu đề
   *  sự kiện/listing), "Airbnb — Venice Loft" (tên giao dịch)... Khớp theo
   *  field tiêu đề/tên tương ứng của từng app (xem từng app con). undefined
   *  thì app đó không có dòng cụ thể để trỏ vào (vd Settings — chỉ cần mở
   *  app là thấy ngay, không cần tìm thêm) — mở app là đủ để mở khoá đáp
   *  án; có giá trị thì phải CHẠM đúng dòng đó mới mở khoá (gọi
   *  onFoundClue), không phải chỉ mở app là đủ — đúng cơ chế "hot"/row-clue
   *  của bản gốc. */
  hintTargetId?: string;
  /** v10: có mảng này thì EvidenceChat hiện ô gõ chữ thay vì nút chọn —
   *  so khớp (bỏ hoa/thường, khoảng trắng, dấu câu) với từng biến thể ở đây. */
  answerVariants?: string[];
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
  revolut: { balance: string; transactions: RevolutTransaction[] };
  maps: { locations: MapLocation[]; sectionLabel?: string };
  /** "Hôm nay" trong câu chuyện (ISO) — lịch mở đúng tháng này thay vì
   *  tháng thật của máy người chơi. */
  now?: string;
  /** v13: intro hook thị giác (thay cho đoạn chat) — ảnh chủ máy + nạn nhân bị làm mờ + 1 bong bóng + CTA. */
  scamIntro?: { headline: string; sub: string; bubble: string; cta: string };
  /** v13: người dùng tin tưởng (client) — thanh "Trust" ở TopBar tụt theo số câu đã giải. */
  trust?: { label: string; clientReactions: { min: number; text: string }[] };
  /** v13: tờ giấy thanh toán mở khoá sau khi tìm đủ các cô gái — liệt kê tiền Daniel lấy từ từng người, dòng của Chloe nổi bật. */
  ledger?: {
    heading: string;
    subheading: string;
    rows: {
      name: string;
      avatar: string;
      /** món đã mua bằng tiền của cô này (vd "Designer handbag") */
      item: string;
      /** ảnh món đồ; không có thì dùng itemEmoji */
      itemImage?: string;
      itemEmoji?: string;
      amount: string;
      note: string;
      highlight?: boolean;
    }[];
    totalLabel: string;
    total: string;
    highlightTag: string;
    cta: string;
  };
  endCard: {
    headline: string;
    subhead: string;
    ctaLabel: string;
    /** v13: danh sách nạn nhân hiện ở EndCard — người đầu tiên rõ nét, còn lại bị làm mờ. */
    victims?: { name: string; avatar: string; /** ảnh đã làm mờ sẵn (không dùng CSS blur → không bao giờ chớp nét) */ blurAvatar?: string; line: string }[];
    victimsLockText?: string;
    /** v13: thẻ "ending bị khoá" — ảnh mờ chủ máy + 🔒 + câu hỏi cliffhanger. */
    teaser?: { blurImage: string; title: string; text: string };
  };
}
