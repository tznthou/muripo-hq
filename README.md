# Muripo HQ

> 用最不正經的方式，做最省事的工具。

**30 天 30 Repo 挑戰** — 2025/11/30 ~ 2025/12/29

🔗 **[前往 Muripo HQ](https://tznthou.github.io/muripo-hq/)**

---

## 已完成專案

| Day | 名稱 | 類型 | 說明 |
|-----|------|------|------|
| 01 | [Compress](https://github.com/tznthou/day-01-compress) | web | 圖片壓縮工具 |
| 02 | [kebab-rename](https://github.com/tznthou/kebab-rename) | cli | 一鍵把檔名轉成 kebab-case |
| 03 | [counter](https://github.com/tznthou/day-03-counter) | web | 日常步數記錄器 PWA |
| 04 | [password](https://github.com/tznthou/day-04-password) | web | 暗黑密碼鍛造爐 - 遊戲化密碼產生器 |
| 05 | [ghost-radar](https://github.com/tznthou/ghost-radar) | cli | 重複檔案抓鬼雷達 |
| 06 | [json-salon](https://github.com/tznthou/muripo-day06-json-salon) | web | JSON 美容院 - 格式化工具 |
| 07 | [neon-drum](https://github.com/tznthou/day-07-neon-drum) | web | 霓虹動態鼓機 - Webcam 揮手觸發 |
| 08 | [game-of-life](https://github.com/tznthou/day-08-game-of-life) | web | Conway 生命遊戲 - d3.js 細胞自動機 |
| 09 | [voice-ripple](https://github.com/tznthou/day-09-voice-ripple) | web | 聲控漣漪鋼琴 - 音你而起的漣漪 |
| 10 | [rhythm-catcher](https://github.com/tznthou/day-10-rhythm-catcher) | web | AR Rhythm Catcher - 體感節奏捕捉 |
| 11 | [file-organizer](https://github.com/tznthou/day-11-file-organizer) | cli | 檔案整理大師 - 統計報告與羞辱榜 |
| 12 | [workday](https://github.com/tznthou/day-12-workday) | web | 工作日計算器 - 排除台灣假日 |

---

## 規則

1. **Muripo Law #1**：好笑可以，交付要有
2. 每天一個 repo，能跑、能 demo、README 一眼懂
3. 超過 2 小時還沒完成，就砍功能，不要砍交付

---

## 專案類型

| 標籤 | 說明 |
|------|------|
| `cli` | 命令列工具 |
| `web` | 網頁應用 |
| `action` | GitHub Action |
| `extension` | 瀏覽器擴充 |

---

## 互動

網站底部有 **留言板**，使用 [Giscus](https://giscus.app) 整合 GitHub Discussions。

用 GitHub 帳號登入即可留言、按表情符號反應。

---

## 結構

```
index.html        # 月曆主頁
blog.html         # Blog 列表
post.html         # 單篇文章
gallery.html      # 相簿
style.css         # 樣式
script.js         # 月曆渲染邏輯
blog.js           # Blog 渲染邏輯
gallery.js        # 相簿渲染邏輯
projects.json     # 30 天專案資料
data/
├── posts.json    # Blog 文章（build 產生）
└── galleries.json # 相簿資料
content/
└── posts/        # Markdown 原稿
scripts/
└── build-posts.js # Markdown → JSON
```

---

## Blog 使用

1. 在 `content/posts/` 建立 Markdown 檔案（格式：`YYYY-MM-DD-slug.md`）：

```markdown
---
title: 文章標題
date: 2025-12-11
excerpt: 一句話摘要
tags: [標籤1, 標籤2]
cover: assets/posts/xxx/cover.jpg
---

文章內容（支援完整 Markdown 語法）...
```

2. 執行 build：

```bash
npm run build:posts
```

3. Commit 並 push：

```bash
git add data/posts.json && git commit -m "新增文章" && git push
```

---

## 相簿使用（超簡單版）

只要放圖片，執行 build，就完成了！

### 專案截圖

```bash
# 1. 放圖片
assets/projects/day-01/screenshot.png

# 2. Build
npm run build:galleries

# 3. Push
git add . && git commit -m "新增截圖" && git push
```

### 生活相簿

```bash
# 1. 放圖片（資料夾名稱 = 日期-標題）
assets/gallery/2025-12-台北散步/01.jpg
assets/gallery/2025-12-台北散步/02.jpg

# 2. Build
npm run build:galleries

# 3. Push
git add . && git commit -m "新增相簿" && git push
```

**進階**：在相簿資料夾放 `meta.json` 可自訂標題和日期：
```json
{ "title": "台北一日遊", "date": "2025-12-10" }
```

---

## License

[MIT](LICENSE)
