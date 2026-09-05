# Stalkr Playable — Format chuẩn

Rút ra từ bản build production "Stalkr Playable 4.1" (case **Paris**, xem `src/split/`) — bản build gốc dùng Vite + Preact, không phải React trong base hiện tại, nhưng cấu trúc UI/data hoàn toàn tái dùng được. Đây là spec để bạn review trước khi mình build UI mới trên `src/` (base đã strip Cozy Tales).

## 1. Khung điện thoại giả (phone-mockup shell)

```
#root
└── .loader           # màn hình chờ, logo "Stalkr", hiện tới khi app mount xong
└── .frame             # bezel điện thoại: nền đen, bo góc 24px
    ├── .statusbar      # thanh trạng thái giả iOS, cao 44px
    ├── .home           # màn hình chính
    │   ├── .pgrid       # lưới app 3 cột (grid-template-columns: repeat(3,1fr))
    │   │   └── .appicon/.cell   # icon app 60×60px, bo góc 14px
    │   └── .dock         # thanh dock cuối màn hình, kính mờ (backdrop-filter blur)
    ├── .appscreen       # overlay full-screen khi mở 1 app (anim appopen 0.18s)
    │   ├── .appbar        # top nav: back | tên app | menu (grid 52px 1fr 52px)
    │   └── .appbody        # vùng nội dung scroll được
    └── .backdrop + .qsheet   # modal nền mờ + bottom sheet trượt lên (dùng cho popup chi tiết)
```

**Design token đề xuất giữ nguyên** (đưa vào biến CSS/theme của base mới):
- Màu hệ thống kiểu iOS: `--ios-blue #007aff`, `--ios-green #34c759`, `--ios-red #ff3b30`, `--ios-gray`, `--ios-sep`
- Gradient chủ đạo cho màn hình câu chuyện/romance: `--grad-1/2/3`, `--meta-pink*`, `--meta-accent #ff4d6d`
- Font: serif `Fraunces` cho tiêu đề/branding, sans hệ thống cho nội dung app

## 2. Bộ "app" chuẩn trong điện thoại

Giữ nguyên khung app này cho mọi case, chỉ đổi **nội dung bên trong** theo từng case mới:

| App | Icon asset | Vai trò | Loại |
|---|---|---|---|
| Tinder/Hinge | `icon-tinder.png` | Màn chơi clue chính — lưới match, câu hỏi "ai là người X tuổi" | Case-specific content, khung UI dùng chung |
| Photos | `icon-photos.png` | Thư viện ảnh + **vault ẩn** (ảnh bí mật khoá bằng mã PIN) | Dùng chung khung, ảnh case-specific |
| Notes | `icon-notes.png` | Ghi chú (gợi ý quà, lịch hẹn, booking...) | Case-specific |
| Calendar | `icon-calendar.png` | Lưới tháng + agenda sự kiện | Case-specific |
| Weather | `icon-weather.png` | Widget thời tiết theo địa điểm case | Case-specific (địa điểm) |
| Instagram | `icon-instagram.png` | Feed bài đăng, profile, bio | Case-specific |
| Airbnb | `icon-airbnb.png` | Danh sách chỗ ở → chi tiết listing | Case-specific |
| Revolut | `icon-revolut.png` | Tài khoản ngân hàng, giao dịch | Case-specific |
| Wallet | `icon-wallet.png` | Thẻ ngân hàng dạng xếp chồng, số thẻ che | Dùng chung khung |
| Gmail | `icon-gmail.png` | Inbox → thread chi tiết (có bản đồ ghim vị trí) | Case-specific |
| Clock | `icon-alarm.png` | Báo thức / múi giờ | Dùng chung khung |
| Maps | `icon-googlemaps.png` | Bản đồ ghim địa chỉ (dùng chung component với Gmail) | Case-specific (địa điểm) |
| Compass | `icon-compass.png` | La bàn xoay (trang trí) | Dùng chung khung |
| Calculator | `icon-calculator.png` | Máy tính thật + **cổng vault ẩn thứ 2** | Dùng chung khung, mã vault case-specific |
| Settings | `icon-settings.png` | Cài đặt kiểu iOS (hàng thông tin, toggle) | Dùng chung khung |
| Snake | `icon-snake.png` | Minigame rắn săn mồi, có điểm số riêng | Dùng chung 100% |
| 2048 | `icon-2048.png` | Minigame 2048, có điểm số riêng | Dùng chung 100% |
| Ozratu | `icon-ozratu.png` | App phụ/trang trí, nội dung mờ nhạt (decoy) | Dùng chung khung |
| Messages | `icon-messages.png` | Thread tin nhắn iMessage — dẫn dắt câu chuyện chính | Case-specific |
| Phone | `icon-phone.png` | Nhật ký cuộc gọi | Case-specific |
| WhatsApp | `icon-whatsapp.png` | Thread WhatsApp | Case-specific |
| Chrome | — | Khung trình duyệt (có style sẵn, chưa thấy dùng trong case Paris) | Dùng chung khung |
| Decoy apps | — | Icon/app giả không có chức năng, chỉ để lấp đầy lưới cho tự nhiên | Dùng chung 100% |

**Nguyên tắc:** mỗi app namespace riêng theo prefix class (`ig-`, `wa-`, `msg-`, `gm-`, `ab-`/`bnb-`, `pset-`, `pcal-`, `pclk-`, `pnote-`, `pcalc-`, `sn-`, `g2-`, `rv-`, `wl-`, `wt-`, `cp-`, `oz-`) — không đụng chéo, thêm/bớt app không ảnh hưởng app khác. Các phần tử dùng lại giữa nhiều app (`convrow`, `cm-avatar`, `cm-search`, `qsheet`, `backdrop`, `pill`, `seg`, `dots`, `sep`) nên tách thành component/class chung.

## 3. Cấu trúc dữ liệu 1 "case" (đề xuất TypeScript type cho base React mới)

Toàn bộ nội dung 1 case nên gói trong **1 object config duy nhất** (giống bản gốc), style tương tự:

```ts
interface CaseConfig {
  client: {
    name: string;
    avatar: string;
    hire: Array<
      | { type: "msgs"; text: string }
      | { type: "img"; src: string }
      | { type: "choices"; options: string[] }
      | { type: "cta"; label: string }
    >;
    question: string;
    choices: string[];
    correct: string;
    win: string[];        // dòng thoại khi trả lời đúng
    wrongText: string;    // dòng thoại khi trả lời sai
  };
  hint: string;            // gợi ý tổng
  tapHint: { trail: Array<{ hint: string }> }; // thứ tự các data-hint được highlight khi user đứng im
  owner: { first: string; full: string };       // chủ nhân điện thoại = nghi phạm
  questionTotal: number;   // số hiển thị kiểu "Question 1/19" (flavor, không cần đúng số câu thật)
  wallpaper: string;
  home: {
    pages: Array<Array<{ app: string; label: string; icon: string }>>;
    dock: Array<{ app: string; label: string; icon: string }>;
  };
  messages: Array<{ id: string; title: string; time: string; unread: boolean; msgs: Array<{ me: boolean; text: string }> }>;
  notes: Array<{ title: string; body: string }>;
  calendar: Array<{ title: string; date: string }>;
  instagram: { username: string; displayName: string; posts: Array<{ location: string /* + ảnh, caption... */ }> };
  airbnb: { name: string; img: string; listings: Array<{ title: string }> };
  gmail: Array<{ subject: string; preview: string }>;
  vaultCode: string;         // mã PIN mở ảnh bí mật trong Photos
  calculatorVault: string;   // mã kích hoạt vault ẩn thứ 2 trong Calculator
}
```

**Case-specific mỗi lần làm case mới**: toàn bộ nội dung trong `client`, `owner`, `messages`, `notes`, `calendar`, `instagram`, `airbnb`, `gmail`, `vaultCode`, `wallpaper` + ảnh riêng trong `assets/<tên-case>/`.

**Dùng chung mọi case**: bộ icon app trong `home.pages`/`dock`, 2 minigame (Snake/2048), decoy app, các UI primitive, font, và kho ảnh nhân vật stock trong `assets/shared/` (6 ảnh `girl_*` để làm nhân vật generic nếu cần case nhanh).

## 4. Luồng chơi (game flow) chuẩn

1. **Loader** → mount app.
2. **Intro/chat với "client"** (`meta-screen`): người thuê ẩn danh nhắn tin dạng bubble → gửi ảnh nghi phạm → hỏi xác nhận (choices: "Đúng người yêu tôi" / "Bạn nói dối") → CTA "Mở điện thoại anh ta 📱" mở khoá màn home.
3. **Tự do khám phá** màn home — có hệ thống **tap-hint** tự động: sau X giây đứng im (`idleMs`/`snoopMs`/`seekMs`/`readMs`), highlight phần tử `[data-hint]` tiếp theo trong `tapHint.trail` để dẫn dắt user, tự huỷ khi có overlay/choice/CTA đang hiện. Không có đồng hồ đếm ngược cho toàn game (chỉ minigame Snake có tick riêng).
4. **1 câu đố chính** (trong app hẹn hò): chọn đúng nhân vật theo mô tả → thoại "tìm ra rồi" + dẫn tiếp; chọn sai → thoại nhắc lại.
5. **Nội dung ẩn**: bàn phím số (`.v-pad`) mở khoá ảnh bí mật bằng `vaultCode`; Calculator có cổng vault ẩn thứ 2 (`calculatorVault`).
6. **Màn kết (end card)**: overlay full-screen, hiệu ứng confetti, logo Stalkr, headline dạng "Bắt được anh ta giấu diếm điều gì đó", subhead quảng cáo app thật ("69+ Cheaters khác. Ảnh ẩn. Tin nhắn bí mật. Khám phá ngay."), nút CTA to phủ toàn overlay → mở store.

## 5. Quy ước CSS/animation nên giữ

- Prefix riêng theo app (mục 2), không style chung đè chéo.
- Component UI lặp lại tách thành class chung (`convrow`, `qsheet`, `backdrop`, `pill`...).
- Animation ngắn, rẻ: mở app 0.18s, sheet trượt/backdrop fade 0.26s, hiệu ứng tap-hint bằng CSS animation thuần (không tween bằng JS).
- Chỉ tối ưu cho viewport điện thoại dọc (`html,body{height:100%;overflow:hidden}`), không có breakpoint desktop — đúng bản chất playable ad.
- Có tính đến `env(safe-area-inset-bottom)` cho dock/vùng input dưới cùng (tai thỏ/notch).

## 6. Tích hợp CTA / store link

Bản gốc dùng pattern đơn giản hơn nhiều so với `AdController.tsx` hiện tại của base (vốn kế thừa từ cozy-tales, hỗ trợ nhiều SDK: ExitApi/dapi/FbPlayableAd/install/callSDK). Bản Stalkr 4.1 chỉ xử lý MRAID + fallback:

```js
const storeUrl = {
  ios: "...",       // ⚠️ bản gốc case Paris để id6785890577 — SAI, cần đổi
  android: "..."    // ⚠️ bản gốc để com.awesome.detective — SAI, cần đổi
};
function openStore() {
  const url = /android/i.test(navigator.userAgent) ? storeUrl.android : storeUrl.ios;
  window.mraid?.open ? window.mraid.open(url) : window.open(url, "_blank");
}
// Gate khởi động game cho tới khi MRAID sẵn sàng (nếu đang ở trạng thái "loading")
function whenReady(fn) {
  const m = window.mraid;
  if (!m || m.getState() !== "loading") return fn();
  m.addEventListener("ready", fn);
}
```

**Lưu ý quan trọng**: link store trong file mẫu `src/split/` là của case Paris cũ, sai với app hiện tại. Base React hiện tại (`src/services/AdController.tsx`, `plugin-ads/fixmraid.js`) đã có sẵn link đúng:
- Android: `com.stalkr.mobile.detective`
- iOS: `id6798600853`

Nên **giữ nguyên `AdController.tsx` hiện tại** (đã hỗ trợ nhiều SDK, phòng trường hợp build cho nhiều mạng quảng cáo), chỉ bổ sung thêm nhánh `mraid` gate-on-ready giống bản Paris nếu cần build riêng cho MRAID.

## 7. Việc tiếp theo (chưa làm, chờ bạn duyệt format này)

- Tạo `src/services/CaseData.ts` theo type `CaseConfig` ở mục 3, migrate `ConfigData.ts` hiện tại vào đây hoặc để song song.
- Tạo `src/Components/PhoneFrame/` (khung điện thoại dùng chung — mục 1) + `src/Components/apps/<TênApp>/` cho từng app dùng chung khung (Snake, 2048, Wallet, Compass, Calculator, Settings, decoy...).
- Case đầu tiên sẽ cần: nội dung case mới (client, owner, messages, notes...) + ảnh riêng trong `src/Assets/<tên-case>/`.
