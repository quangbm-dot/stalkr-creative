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

/** v17: mỗi bước có thể gắn `id` để làm điểm nhảy tới (xem "choices" bên
 *  dưới) — không gắn id thì không ai nhảy tới được, không ảnh hưởng gì. */
export type HireStep = { id?: string } & (
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
  /** v17: thẻ "lá thư" (giấy viết tay) — dùng cho nhánh "đọc thư trước khi
   *  vào điện thoại", trước CTA mở máy. */
  | { type: "letter"; text: string; signature?: string }
  /** v17: thẻ tiêu đề mở phim — tên 2 nhân vật + 1 dòng giới thiệu ngắn,
   *  hiện TRƯỚC "filmReel" (kiểu opening credits của phim), rồi tự chuyển
   *  sang bước kế sau TITLECARD_MS (xem Intro.tsx). */
  | { type: "titleCard"; title: string; subtitle?: string }
  /** v17: đổi CHỈ caption đang hiện trên nền cinema đóng băng (ảnh/track
   *  GIỮ NGUYÊN 100%, không đụng vào cinemaFrames/filmFrame) — dùng cho 1
   *  câu phản ứng ngắn ngay sau choices mà KHÔNG muốn ảnh nháy/đổi, khác
   *  hẳn "filmReel" (vốn luôn có mảng frames riêng, dễ gây giật khi ảnh
   *  không trùng pixel-for-pixel với ảnh đang đóng băng). */
  | { type: "cinemaCaption"; text: string; enterPhoneAfter?: boolean }
  /** v17: "cuốn phim" — nhiều khung ảnh TỰ cuộn qua lần lượt (như trailer),
   *  mỗi khung có 1 dòng chú thích riêng hiện đồng bộ theo khung đang chiếu
   *  (xem FILMREEL_FRAME_MS trong Intro.tsx). Xong hết khung thì tự sang
   *  bước kế, giống các step có hẹn giờ khác. */
  | {
      type: "filmReel";
      frames: { src: string; caption: string }[];
      /** "letter" = đảo trọng tâm: ảnh thu nhỏ làm thumbnail, text to chạy
       *  kiểu máy đánh chữ (gõ từng chữ) chiếm chỗ chính — dùng cho cảnh
       *  "đọc thư" (so với mặc định: ảnh to, caption nhỏ bên dưới). */
      variant?: "letter";
      /** ms mỗi khung — mặc định FILMREEL_FRAME_MS (Intro.tsx). Variant
       *  "letter" nên đặt dài hơn để có đủ thời gian gõ hết chữ + đọc. */
      frameMs?: number;
      /** true = hết khung CUỐI là vào thẳng điện thoại luôn (gọi onDone),
       *  KHÔNG cần bước "cta" (nút đỏ) ở giữa — dùng cho khung phản ứng
       *  cuối cùng của 1 nhánh, nơi chỉ cần đọc xong 1 câu là vào máy. */
      enterPhoneAfter?: boolean;
    }
  /** v17: mỗi lựa chọn có thể là string đơn giản (giữ nguyên hành vi cũ —
   *  bấm gì cũng sang bước kế) hoặc { label, goto } để NHẢY tới bước có
   *  `id` trùng `goto` (rẽ nhánh thật — xem Intro.tsx). */
  | { type: "choices"; options: (string | { label: string; goto?: string })[] }
  | { type: "cta"; label: string }
);

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
  endCard: {
    headline: string;
    subhead: string;
    ctaLabel: string;
  };
}
