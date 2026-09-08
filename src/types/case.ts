/**
 * v6: màn khoá máy mở đầu — tin nhắn ảnh "nhạy cảm" từ 1 biệt danh lạ, chủ
 * nhân điện thoại bấm share nhưng gửi nhầm sang đúng đoạn chat người yêu.
 */
export interface MishapScene {
  /** Biệt danh người gửi ảnh (hiện trên tin nhắn khoá máy + tên đoạn chat). */
  senderName: string;
  /** Ảnh "check-in" nhạy cảm được gửi tới. */
  photo: string;
  /** Địa chỉ nhà cô ấy nhắn kèm, dặn chụp màn hình lại trước khi xoá. */
  homeAddress: string;
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
  mishap: MishapScene;
  endCard: {
    /** Nhãn ngắn trên 2 nút lựa chọn, vd "Deny everything". */
    choices: [string, string];
    /** Câu tin nhắn thật sự gửi đi khi bấm lựa chọn tương ứng (cùng thứ tự
     *  với choices) — không phải nhãn nút, mà là câu thoại tự nhiên. */
    replyLines: [string, string];
    /** Tiêu đề màn hình quảng cáo cuối cùng, vd "You solved the case". */
    headline: string;
    /** Câu mô tả ngắn dưới tiêu đề. */
    subhead: string;
    /** Chữ trên nút CTA, vd "Continue". */
    ctaLabel: string;
  };
}
