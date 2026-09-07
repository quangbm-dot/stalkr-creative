# Các kịch bản (KB1 / KB2 / KB3 / KB4)

Mục tiêu: có 3 bản case nội dung khác nhau để A/B test trên AppLovin — cùng cấu
trúc gameplay (thám tử mở điện thoại nhân vật, 3 câu hỏi bằng chứng, mở khoá
kết luận cuối), khác nhân vật/câu chuyện/app chứa manh mối để xem tổ hợp nào
giữ chân người chơi tốt nhất.

> **KB2/KB3/KB4 đã build xong** (mỗi KB 1 branch riêng: `content/kb2-kevin-mia`,
> `content/kb3-alex-sophia`, `content/kb4-daniel-sarah`, đều tách từ
> `fix/v1-compliance`). **Toàn bộ nội dung thật trong game là tiếng Anh, bối
> cảnh Mỹ** — các đoạn tiếng Việt dưới đây chỉ là bản thiết kế/tham khảo cấu
> trúc ban đầu, KHÔNG phải copy cuối cùng. Copy tiếng Anh chính thức nằm trong
> `src/services/CaseData.ts` của từng branch — coi đó là nguồn chính xác nhất
> nếu có sai khác với mô tả tiếng Việt bên dưới. Tên nhân vật thứ 3 đã đổi
> sang tiếng Anh: KB2 "Nam" → **Noah**, KB3 "Ngân" → **Nadia** (KB4 "Ivy" giữ
> nguyên).

Mỗi kịch bản cần 2 nhân vật chính:
- **Client** — người thuê bạn (chỉ xuất hiện ở đoạn intro/hire, dạng chat +
  1-2 ảnh reveal).
- **Owner** — chủ nhân chiếc điện thoại bạn "đột nhập" để tìm bằng chứng (ảnh
  đại diện dùng trong Instagram/Tinder-Flurt/wallpaper...).

Ảnh cho 2 nhân vật này: bạn gửi ảnh tham chiếu (style/khuôn mặt mong muốn),
mình dùng Gemini generate lại ảnh nhân vật + các ảnh phụ (story photos, match
photos, post photos...) theo đúng phong cách hiện có. Phần này làm **sau** khi
bạn duyệt nội dung kịch bản ở file này.

---

## KB1 — "Ryan & Emma" (đã build, giữ nguyên)

**Hook:** Emma nghi bạn trai Ryan ngoại tình, thuê bạn kiểm tra điện thoại anh ta.

| | |
|---|---|
| Client | Emma (thuê qua "Agent Iris" – người trung gian) |
| Owner (điện thoại bị soi) | Ryan Cole |
| Kết luận | Ryan bị bắt quả tang nhắn tin lạ + match Tinder/Flurt với Zoe + có album ảnh khoá bí mật |

**3 câu bằng chứng (giữ nguyên thứ tự đã build):**
1. **Messages** — số lạ "No Name" nhắn tin ban đêm.
2. **Flurt** (dating app) — match với "Zoe, 26".
3. **Photos** — có album ảnh khoá (secret album).

**Apps xuất hiện trên home:** Flurt, Photos, Notes, Calendar, Weather,
Glimpse, Nestly, RevoBank, Wallet, Mailly, Clock, Pinpoint, Compass,
Calculator, Settings, Messages, Phone, Chatta.

---

> **Cập nhật:** ảnh tham chiếu bạn đưa cho KB2/KB3/KB4 đều là ảnh cặp đôi tình
> cảm thật (không phải phù dâu hay đối tác làm ăn) — nên 3 kịch bản dưới đây
> đổi lại theo đúng mô-típ gốc của KB1 ("người yêu/vợ chồng nghi ngờ đối
> phương ngoại tình"), mỗi cái một twist khác nhau, để khớp ảnh và giữ đúng
> công thức hook đã hiệu quả.

## KB2 — "Yêu xa" (Kevin & Mia)

**Hook:** Kevin đi công tác xa nhà 2 tháng, bạn gái Mia ở nhà bỗng dưng nhắn
tin thưa thớt hẳn, hay tắt máy sớm. Kevin thuê bạn kiểm tra điện thoại Mia.

| | |
|---|---|
| Client | Kevin |
| Owner (điện thoại bị soi) | Mia |
| Twist kết luận | Mia bí mật gặp lại 1 người cũ qua Chatta, có ảnh hẹn hò trên Glimpse và ghi chú lịch hẹn trong Notes |

**3 câu bằng chứng:**
1. **Chatta** — đoạn chat với 1 số lưu tên viết tắt, giọng điệu thân mật bất thường.
2. **Glimpse** — 1 story riêng tư (chỉ mình xem được) chụp cùng người lạ.
3. **Notes** — ghi chú lịch hẹn kèm dòng "đừng để K biết".

**Ảnh cần Gemini gen:** avatar Kevin (client), avatar Mia (owner) — tách từ
`character-refs/KB2/KB2.jpg` — + 2-3 ảnh story/post dùng trong Glimpse.

---

## KB3 — "Vừa cầu hôn" (Alex & Sophia)

**Hook:** Alex vừa cầu hôn Sophia trong 1 chuyến đi resort. Ngay sau đó Sophia
thấy điện thoại Alex sáng liên tục lúc nửa đêm — thuê bạn kiểm tra trước khi
cưới.

| | |
|---|---|
| Client | Sophia |
| Owner (điện thoại bị soi) | Alex |
| Twist kết luận | Alex vẫn âm thầm nhắn tin với người yêu cũ qua Mailly, có giao dịch RevoBank mua quà tặng người đó, và lịch sử vị trí Pinpoint ghé chỗ hẹn |

**3 câu bằng chứng:**
1. **Mailly** — email/tin nhắn qua lại với 1 địa chỉ email lạ, giọng điệu tình cảm.
2. **RevoBank** — có giao dịch mua quà tặng gửi cho "N." không phải Sophia.
3. **Pinpoint** — lịch sử ghé 1 địa điểm lạ nhiều lần trong tuần.

**Ảnh cần Gemini gen:** avatar Alex (owner), avatar Sophia (client) — đã tách
từ `character-refs/KB3/KB3.jpg`, xem `gemini-drafts/KB3_*_change.png`.

---

## KB4 — "Bạn cùng lớp cũ" (Daniel & Sarah)

**Hook:** Sarah tình cờ thấy chồng — Daniel — thả tim story của 1 cô bạn cấp 3
cũ liên tục mấy tuần nay. Sarah thuê bạn kiểm tra điện thoại Daniel.

| | |
|---|---|
| Client | Sarah |
| Owner (điện thoại bị soi) | Daniel |
| Twist kết luận | Daniel đã hẹn gặp lại bạn cũ (Ivy) vài lần, có ảnh chụp chung trên Glimpse, ghi chú hẹn gặp trong Notes, và lịch sử ghé cùng 1 quán quen trên Pinpoint |

**3 câu bằng chứng (thứ tự app khác cả KB2 lẫn KB3):**
1. **Glimpse** — ảnh/story chụp chung với "Ivy" tại 1 quán cà phê.
2. **Notes** — ghi chú "hẹn Ivy 7h - đừng nói với S".
3. **Pinpoint** — lịch sử vị trí ghé đúng quán đó nhiều lần trong tháng.

**Ảnh cần Gemini gen:** avatar Sarah (client), avatar Daniel (owner) — đã tách
từ `character-refs/KB4/KB4.jpg`, xem `gemini-drafts/KB4_*_change.png` — +
avatar/ảnh cho nhân vật thứ 3 "Ivy" (bạn cũ, không có ảnh tham chiếu, mình tự
gen khi build CaseData).

---

## Kịch bản câu hỏi chi tiết — app nào, xem gì, hỏi gì

Mỗi câu ghi rõ: **App cần mở** → **nội dung/ảnh cụ thể là bằng chứng** → câu
hỏi + đáp án (tiếng Việt) → câu trả lời đúng/sai của Agent → câu hint.

### KB2 — Kevin & Mia (người thứ 3: "Nam")

**Câu 1 — App: Chatta.** Bằng chứng: đoạn chat với danh bạ lưu tên **"N."**,
lúc 23:47: *"Anh nhớ em quá, khi nào gặp lại"*.
- Hỏi: "Mở Chatta. Mia đang nhắn tin thân mật với ai lúc nửa đêm?"
- Đáp án: Chị Hoa / **N.** / Sếp / Bố
- Đúng: "Số lạ lưu tên 'N.'... tìm ra rồi. Đào sâu thêm."
- Sai: "Đó chỉ là tin nhắn công việc thôi. Xem lại đi." / "Không phải người đó. Có ai đó khả nghi hơn."
- Hint: "Mở Chatta, tìm đoạn chat có giọng điệu thân mật bất thường."

**Câu 2 — App: Glimpse.** Bằng chứng: 1 story riêng tư (close friends) chụp
Mia đi chơi cùng 1 người đàn ông, tag tên **"Nam"**.
- Hỏi: "Glimpse có 1 story riêng tư ít người xem được. Mia đang đi chơi cùng ai?"
- Đáp án: Đồng nghiệp cũ / **Nam** / Em họ / Bạn học cấp 3
- Đúng: "Nam... trùng với số lưu tên 'N.' trong Chatta. Sắp đủ bằng chứng rồi."
- Sai: "Không phải người đó, xem kỹ story lại." / "Vẫn chưa đúng, tìm story khác."
- Hint: "Mở Glimpse, kiểm tra story riêng tư gần đây nhất."

**Câu 3 — App: Notes.** Bằng chứng: ghi chú *"Hẹn Nam 8h tối thứ 6 — chỗ cũ,
đừng để Kevin biết"*.
- Hỏi: "Notes có 1 ghi chú lạ. Nội dung ghi chú đó là gì?"
- Đáp án: Danh sách mua sắm / **Lịch hẹn với Nam — giữ bí mật** / Ghi chú công việc / Nhắc lịch khám
- Đúng: "Ghi chú hẹn gặp, còn dặn giữ bí mật với Kevin... đủ bằng chứng rồi."
- Sai: "Không phải ghi chú đó, tìm ghi chú khác trong Notes." / "Thử mở lại Notes, còn 1 ghi chú đáng ngờ nữa."
- Hint: "Mở Notes, tìm ghi chú có nhắc tên Nam."

### KB3 — Alex & Sophia (người thứ 3: "Ngân")

**Câu 1 — App: Mailly.** Bằng chứng: email qua lại với địa chỉ
**"ngan.tran@..."**, giọng điệu tình cảm: *"Anh nhớ em, đừng lo về đám cưới
của anh ấy"*.
- Hỏi: "Mở Mailly. Alex đang trao đổi email tình cảm với địa chỉ nào?"
- Đáp án: Đồng nghiệp / **ngan.tran@...** / Người thân / Khách hàng
- Đúng: "Email với Ngân... giọng điệu không hề bình thường. Tìm thêm bằng chứng."
- Sai: "Chỉ là email công việc thôi. Xem lại hộp thư." / "Không phải cái đó, còn 1 email đáng ngờ hơn."
- Hint: "Mở Mailly, tìm email có giọng điệu thân mật bất thường."

**Câu 2 — App: RevoBank.** Bằng chứng: giao dịch gần nhất *"Quà tặng — N.
Tran — $150"*.
- Hỏi: "RevoBank có 1 giao dịch lạ. Alex vừa mua quà tặng cho ai?"
- Đáp án: Sophia / **N. Tran** / Mẹ / Bạn thân
- Đúng: "Mua quà cho Ngân, không phải Sophia... rõ ràng có chuyện."
- Sai: "Giao dịch đó bình thường mà. Xem kỹ lại danh sách." / "Chưa đúng, còn 1 giao dịch khả nghi hơn."
- Hint: "Mở RevoBank, xem giao dịch gần nhất."

**Câu 3 — App: Pinpoint.** Bằng chứng: lịch sử vị trí ghé quán cà phê
**"Riverside"** nhiều lần trong tuần, không trùng lịch làm việc.
- Hỏi: "Pinpoint lưu lịch sử vị trí. Alex ghé đâu nhiều lần bất thường trong tuần?"
- Đáp án: Công ty / **Quán cà phê Riverside** / Phòng gym / Nhà bố mẹ
- Đúng: "Ghé đúng 1 chỗ nhiều lần trong tuần, không có lý do công việc... đủ để kết luận rồi."
- Sai: "Chỗ đó không có gì lạ. Xem lại lịch sử." / "Chưa phải, còn 1 địa điểm khả nghi hơn."
- Hint: "Mở Pinpoint, xem lịch sử các điểm đến gần đây."

### KB4 — Daniel & Sarah (người thứ 3: "Ivy")

**Câu 1 — App: Glimpse.** Bằng chứng: bài đăng gắn thẻ vị trí, chụp cùng
**"Ivy"** tại 1 quán cà phê.
- Hỏi: "Glimpse có 1 bài đăng gắn thẻ vị trí. Daniel đang chụp cùng ai?"
- Đáp án: Đồng nghiệp / **Ivy** / Em gái / Bạn thân thời đại học
- Đúng: "Ivy... một cái tên không hề quen thuộc với Sarah. Tìm thêm bằng chứng."
- Sai: "Không phải người đó, xem lại bài đăng khác." / "Chưa đúng, còn 1 bài gắn thẻ vị trí nữa."
- Hint: "Mở Glimpse, tìm bài đăng có gắn thẻ vị trí gần đây."

**Câu 2 — App: Notes.** Bằng chứng: ghi chú *"Hẹn Ivy 7h — đừng nói với
Sarah"*.
- Hỏi: "Notes có 1 ghi chú đáng ngờ. Nội dung là gì?"
- Đáp án: Nhắc việc nhà / **Hẹn Ivy 7h — giữ bí mật với Sarah** / Ghi chú công việc / Lịch họp
- Đúng: "Hẹn gặp Ivy, còn dặn giữ bí mật với Sarah... rõ ràng rồi."
- Sai: "Không phải ghi chú đó, tìm ghi chú khác." / "Chưa đúng, thử mở lại Notes."
- Hint: "Mở Notes, tìm ghi chú có nhắc tên Ivy."

**Câu 3 — App: Pinpoint.** Bằng chứng: lịch sử ghé đúng 1 quán quen nhiều lần
trong tháng.
- Hỏi: "Pinpoint cho thấy Daniel ghé đâu nhiều lần trong tháng?"
- Đáp án: Phòng gym / **Quán cà phê hẹn với Ivy** / Công ty / Nhà bạn
- Đúng: "Ghé đúng 1 quán nhiều lần trong tháng, đúng chỗ hẹn với Ivy... đủ bằng chứng rồi."
- Sai: "Chỗ đó không có gì lạ. Xem lại lịch sử." / "Chưa đúng, còn 1 địa điểm khả nghi hơn."
- Hint: "Mở Pinpoint, xem địa điểm ghé nhiều nhất."

---

## Ảnh tham chiếu nhân vật (input cho Gemini)

Ảnh mẫu 2 nhân vật/KB nằm trong `character-refs/{KB}/{KB}.jpg` (1 ảnh cặp đôi
chung, mình tách ra 2 avatar bằng Gemini — xem `gemini-drafts/{KB}_*_change.png`):

```
character-refs/
  KB1/  KB1.jpg  (Emma & Ryan — đã build, không cần ảnh mới)
  KB2/  KB2.jpg  (Kevin & Mia)
  KB3/  KB3.jpg  (Alex & Sophia)
  KB4/  KB4.jpg  (Daniel & Sarah)
```

Đây chỉ là ảnh gốc để mình base ra art bằng Gemini — không phải asset dùng
trực tiếp trong game (ảnh generate ra mới xếp vào `src/Assets/KB{n}/`).

## Cấu trúc thư mục ảnh (sau khi bạn duyệt avatar)

```
src/Assets/
  KB1/   (ảnh riêng Ryan & Emma — giữ nguyên trong UI/ như hiện tại)
  KB2/   (ảnh riêng Kevin & Mia + "Nam")
  KB3/   (ảnh riêng Alex & Sophia + "Ngân")
  KB4/   (ảnh riêng Daniel & Sarah + "Ivy")
  UI/    (asset dùng chung: wallpaper mặc định, font...)
  Icons/ (icon fictional dùng chung cho cả 4 KB)
```

## Quy tắc đặt tên file build

```
stalkr-v1-{KB}-{tên cặp nhân vật}-mini-app-quests (QuangBM)(Bao TC).html
```

- `{KB}` = mã kịch bản, vd `KB1`, `KB2`, `KB3`, `KB4`.
- `{tên cặp nhân vật}` = tên client-owner nối bằng dấu gạch ngang, viết thường.
- Ví dụ:
  - KB1: `stalkr-v1-KB1-ryan-emma-mini-app-quests (QuangBM)(Bao TC).html`
  - KB2: `stalkr-v1-KB2-kevin-mia-mini-app-quests (QuangBM)(Bao TC).html`
  - KB3: `stalkr-v1-KB3-alex-sophia-mini-app-quests (QuangBM)(Bao TC).html`
  - KB4: `stalkr-v1-KB4-daniel-sarah-mini-app-quests (QuangBM)(Bao TC).html`
- Lưu trong `build/` (không đè lên `stalkr-v1.html`/`stalkr-v2.html` gốc).

## Tiến độ & việc cần làm tiếp

- [x] Premise + câu hỏi bằng chứng chi tiết cho KB2/KB3/KB4 (thiết kế gốc, file này).
- [x] Avatar Kevin/Mia, Alex/Sophia, Daniel/Sarah + nhân vật thứ 3 (Noah/Nadia/Ivy)
      + ảnh hero cặp đôi — gen bằng Gemini, nén WebP, xếp vào `src/Assets/KB{n}/`.
- [x] `Revolut`/`Maps` tổng quát hoá thành data-driven per case (trước đó bị
      hardcode theo KB1) — cần thiết để KB3/KB4 dùng được RevoBank/Pinpoint
      làm bằng chứng. Đã commit trên `fix/v1-compliance`.
- [x] Dịch toàn bộ nội dung sang tiếng Anh, bối cảnh Mỹ, viết `CaseData.ts`
      riêng cho từng KB trên branch riêng, build + test end-to-end (không lỗi
      console, cả 3 câu trả lời đúng đều dẫn tới EndCard).
- [x] Build HTML test cho cả 4 KB theo đúng quy tắc tên, nằm trong `build/`.
- [ ] Bạn tự chơi thử cả 3 file HTML mới, xác nhận nội dung/twist đọc xuôi,
      trước khi up test AppLovin.
- [ ] KB4 premise do mình tự viết theo gợi ý "chồng đi date bạn cùng lớp cũ" —
      xác nhận lại nếu muốn chỉnh.
- [ ] Bảo trì: mỗi KB nằm trên 1 branch riêng — fix chung sau này (vd sửa
      icon/hint) cần cherry-pick/rebase thủ công sang cả 4 branch, không tự
      động lan sang.
