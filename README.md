# 📅 Quá trình trưởng thành của anh

<div align="center">

![App Screenshot](dist/index.html)

</div>

## Mô tả

Ứng dụng dành cho cặp đôi, mỗi ngày 1 ngôi sao để ghi lại tiến trình trưởng thành của anh. 
Vậy là nên như thế nào thì lệ, nên như thế nào thì đúng.

## Công nghệ

- **React** + **Vite**
- CSS thuần (no-framework styling)
- localStorage (dữ liệu không cần backend)

## Cài đặt & Chạy thử

```bash
# 1. Clone repo
git clone git@github.com:nghia4mt/thuhien-react.git
cd thuhien-react

# 2. Cài dependency
npm install

# 3. Chạy dev server
npm run dev

# 4. Mở trình duyệt
# http://localhost:5173
```

## Build & Deploy (GitHub Pages)

### Cấu hình GitHub Pages

1. Vào **Settings** → **Pages** của repo `nghia4mt/thuhien-react`
2. **Branch**: `main`
3. **Folder**: `/dist`
4. Click **Save**

### Công thức base path (vite.config.js)

```js
export default defineConfig({
  plugins: [react()],
  base: '/thuhien-react/',
})
```

### Build & Commit

```bash
npm run build
git add -A
git commit -m "build: production ready"
git push origin main
```

→ GitHub Pages sẽ tự deploy trong 1-2 phút.

## Tính năng

- 📅 Xem lịch tháng, chọn ngày để đánh giá
- ⭐ Chọn từ 0-5 sao (0 = không đánh giá)
- 🔒 Chỉ sửa được ngày hôm nay (tương lai & quá khứ không chỉnh sửa)
- 💾 Dữ liệu lưu lại bằng localStorage
- 🌈 Giao diện pastel (hồng xanh da trời xanh lá)

## Chỉnh sửa

```bash
# Linter
npx oxlint src/

# Build
npm run build
```

---

_Được sinh hoạt bởi Solar Mini4 + Vite + React_
