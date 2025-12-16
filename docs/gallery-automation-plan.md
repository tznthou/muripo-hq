# 相簿自動化計畫

> 2025-12-16 規劃，待實作

## 現況問題

1. **圖片壓縮手動做** — 要自己轉 webp
2. **命名不統一** — 截圖檔名亂七八糟
3. **caption 醜** — 預設用檔名，不好看
4. **忘記跑 build** — galleries.json 沒更新

## 目標工作流程

```
丟圖到 assets/inbox/day-17/
        ↓
npm run compress:gallery  （壓縮+命名+移動）
        ↓
git push
        ↓
GitHub Action 自動更新 galleries.json
```

## 實作計畫

### 階段 1：GitHub Action + Caption 改善（零依賴）

- [ ] 新增 `.github/workflows/build-galleries.yml`
- [ ] 修改 `build-galleries.js`：
  - caption 預設用「專案名」取代「檔名」
  - 支援 `captions.json` 客製化描述

### 階段 2：本地壓縮腳本（需要 cwebp）

前提：`brew install webp`（已安裝 ✓）

- [ ] 新增 `scripts/compress-gallery.js`
- [ ] 功能：
  - 掃描 `assets/inbox/day-XX/`
  - 用 cwebp 壓縮成 webp（品質 80）
  - 自動命名：`day-{XX}-{project-name}-{N}.webp`
  - 移動到 `assets/projects/day-XX/`
  - 刪除原檔
- [ ] 新增 npm script：`"compress:gallery": "node scripts/compress-gallery.js"`

### 階段 3（可選）：GitHub Action 壓縮

如果不想本地裝工具，可以讓 Action 做壓縮。

缺點：
- 原圖會暫時進 git history（佔空間）
- 要處理 commit 衝突

暫時不推薦。

## 技術細節

### 壓縮腳本偽代碼

```javascript
// scripts/compress-gallery.js
const { execSync } = require('child_process');

// 1. 掃描 inbox/day-XX/
// 2. 讀取 projects.json 取得專案名
// 3. 計算下一個編號
// 4. cwebp -q 80 input.png -o output.webp
// 5. 移動到 projects/day-XX/
// 6. 刪除原檔
```

### captions.json 格式

放在 `assets/projects/day-XX/captions.json`：

```json
{
  "day-16-font-mixer-1.webp": "字型調酒師 — 氛圍選擇介面",
  "day-16-font-mixer-2.webp": "字型配對預覽"
}
```

### Caption 優先順序

1. `captions.json` 有指定 → 用指定的
2. 沒指定 → 用「{專案名}」或「{專案名} ({N})」

## 決策紀錄

| 問題 | 決策 | 原因 |
|------|------|------|
| 壓縮在哪做？ | 本地（cwebp） | 避免原圖進 git |
| 原圖放哪？ | `assets/inbox/` | 與產出分離，可 gitignore |
| Caption 怎麼處理？ | 預設專案名 + captions.json 覆蓋 | 全自動 + 可客製 |

## 備註

- cwebp 已安裝：`/opt/homebrew/bin/cwebp` v1.6.0
- 可考慮把 `assets/inbox/` 加到 `.gitignore`
