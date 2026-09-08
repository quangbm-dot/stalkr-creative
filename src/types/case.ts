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
 * v6: màn khoá máy mở đầu — tin nhắn ảnh "nhạy cảm" từ 1 biệt danh lạ, chủ
 * nhân điện thoại bấm share nhưng gửi nhầm sang đúng đoạn chat người yêu.
 */
export interface MishapScene {
  /** Biệt danh người gửi ảnh (hiện trên tin nhắn khoá máy + tên đoạn chat). */
  senderName: string;
  /** Ảnh "check-in" nhạy cảm được gửi tới. */
  photo: string;
  /** Số điện thoại cô ấy nhắn kèm, dặn chụp màn hình lại trước khi xoá. */
  phoneNumber: string;
  /** Tên người yêu. */
  girlfriendName: string;
  /** Tin nhắn người yêu nhờ gửi lại hoá đơn thanh toán hôm qua. */
  billRequestText: string;
  /** Câu trả lời nghi ngờ của người yêu sau khi nhận nhầm ảnh chụp màn hình. */
  replyText: string;
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
  mishap: MishapScene;
  endCard: {
    /** Câu hỏi lựa chọn kiểu "Nếu bạn là X sẽ chọn cách nào?" */
    question: string;
    /** Đúng 2 lựa chọn — bấm cái nào cũng dẫn tới mở link CTA. */
    choices: [string, string];
  };
}
