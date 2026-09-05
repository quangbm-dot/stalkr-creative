# Hướng dẫn Git cơ bản cho project này

Repo: `origin` → `https://github.com/HM-Games-Studio/stalkr-creative.git`, branch chính: `main`.

## 1. Kiểm tra trạng thái trước khi làm gì

```
git status
```
Xem file nào đã sửa/thêm mới/chưa được track. Luôn chạy lệnh này trước khi commit hoặc trước khi làm thao tác nguy hiểm (checkout, reset...).

## 2. Lưu thay đổi (commit)

```
git add <đường-dẫn-file>      # thêm 1 file cụ thể
git add -A                    # thêm tất cả file đã đổi (kiểm tra kỹ bằng git status trước)
git commit -m "Mô tả ngắn gọn thay đổi"
```

Ví dụ:
```
git add src/App.tsx
git commit -m "Thêm màn hình UI mới cho Stalkr playable"
```

## 3. Đẩy commit lên GitHub (push)

```
git push
```
Nếu branch local chưa gắn với remote (lần đầu):
```
git push -u origin main
```
Sau lần đầu, chỉ cần `git push` là đủ vì đã gắn (track) sẵn.

## 4. Lấy thay đổi mới nhất từ GitHub về (pull)

```
git pull
```
Chạy trước khi bắt đầu làm việc mỗi ngày, tránh conflict.

## 5. Xem lịch sử commit

```
git log --oneline              # danh sách commit, mỗi dòng 1 commit (hash ngắn + message)
git log --oneline -10          # chỉ xem 10 commit gần nhất
git show <hash>                # xem chi tiết nội dung thay đổi của 1 commit
```

## 6. Xem trên GitHub (web)

- Toàn bộ lịch sử commit của branch `main`:
  `https://github.com/HM-Games-Studio/stalkr-creative/commits/main`
- Xem chi tiết 1 commit cụ thể:
  `https://github.com/HM-Games-Studio/stalkr-creative/commit/<hash>`
- Trên trang chính repo, cạnh dòng commit message mới nhất (phía trên danh sách file) luôn có mã hash ngắn — bấm vào đó cũng ra trang chi tiết commit.

## 7. Làm việc với branch (khi cần tách nhánh làm tính năng riêng)

```
git checkout -b ten-branch-moi     # tạo branch mới từ vị trí hiện tại và chuyển sang nó
git checkout main                  # quay lại branch main
git branch                         # xem danh sách branch local, branch đang đứng có dấu *
git push -u origin ten-branch-moi  # đẩy branch mới lên GitHub lần đầu
```

## 8. Một vài lệnh xem nhanh

```
git diff                # xem thay đổi chưa add
git diff --staged       # xem thay đổi đã add nhưng chưa commit
git remote -v           # xem remote đang trỏ tới đâu
```

## Lưu ý an toàn

- Không dùng `git reset --hard`, `git checkout -- .`, `git clean -f` khi chưa chắc chắn — các lệnh này xoá thay đổi chưa commit **không thể khôi phục**.
- Luôn `git status` trước khi làm thao tác có thể mất dữ liệu.
- Nếu không chắc lệnh nào, hỏi lại trước khi chạy.
