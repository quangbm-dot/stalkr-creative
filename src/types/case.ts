export interface PostComment {
  username: string;
  text: string;
  /** Mốc thời gian hiện cạnh username, vd "2m", "Just now". */
  time: string;
  colorFrom: string;
  colorTo: string;
  /** Ảnh avatar thật — có thì ưu tiên hiện thay cho vòng gradient+chữ cái. */
  avatar?: string;
  /** true = comment có nút tim để người chơi bấm — bấm xong sẽ kích hoạt
   *  reactionComment, rồi tự chuyển "Deleting..." -> "Comment deleted". */
  tappable?: boolean;
  /** true = hiện avatar dạng badge trái tim hồng + chữ thay vì icon chữ
   *  cái đầu username — dùng cho comment của người yêu. */
  heartBadge?: boolean;
}

export interface PostScene {
  /** Wordmark app bịa (không dùng tên/logo mạng xã hội thật). */
  appName: string;
  author: { username: string; timeAgo: string; avatar?: string };
  image: string;
  likesText: string;
  /** Hiện lần lượt từng dòng. */
  captionLines: string[];
  /** Hiện lần lượt; phần tử cuối cùng nên có tappable:true. */
  comments: PostComment[];
  /** Hiện ngay sau khi comment tappable được thả tim tự động. */
  reactionComment: PostComment;
  /** Câu ngắn hiện cùng nút "Check it now" giữa game — khác câu hỏi dài
   *  ở endCard, chỉ cần gợi tò mò tiếp tục. */
  midPrompt: string;
}

/** Nội dung banner thông báo hiện trên màn Home trước khi vào post. */
export interface NotifBanner {
  appName: string;
  preview: string;
  /** Số người vừa thả tim mới — hiện dạng "+N" nhỏ cạnh icon tim. */
  newLikes: number;
}

/**
 * Toàn bộ nội dung của 1 case gói trong 1 object duy nhất.
 * Case mới = tạo 1 CaseConfig mới (+ ảnh riêng trong src/Assets/<case>/),
 * không cần đụng vào component UI.
 */
export interface CaseConfig {
  homeWallpaper: string;
  notifBadgeCount: number;
  notif: NotifBanner;
  post: PostScene;
  endCard: {
    /** Câu hỏi lựa chọn kiểu "Nếu bạn là X sẽ chọn cách nào?" */
    question: string;
    /** Đúng 2 lựa chọn — bấm cái nào cũng dẫn tới mở link CTA. */
    choices: [string, string];
  };
}
