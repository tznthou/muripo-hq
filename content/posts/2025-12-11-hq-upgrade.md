---
title: HQ 大升級：Blog、相簿、留言板
date: 2025-12-11
excerpt: 30 天挑戰進行到 Day 12，HQ 終於有了完整的功能
tags: [muripo, hq, blog, gallery]
---

30 天 30 Repo 挑戰來到了 Day 12。

這幾天陸續幫 Muripo HQ 加上了幾個功能，現在終於有個像樣的樣子了：

## 留言板（12/9）

使用 [Giscus](https://giscus.app) 整合 GitHub Discussions，用 GitHub 帳號就能留言。這樣不用自己架後端，也不用管資料庫，完美符合 Muripo 的「最省事」精神。

## Blog（12/11）

你現在看到的就是它。

原本只有月曆，但每天做一個專案，總會有些心得想記錄。不想用 Jekyll 那麼重，所以自己寫了一個超簡單的 Markdown → JSON 轉換器：

1. 寫 Markdown 放到 `content/posts/`
2. 跑 `npm run build:posts`
3. Push

就這樣，沒有更多了。

## 相簿（12/11）

有時候想放專案截圖或生活照，所以加了相簿功能。同樣是超簡單版：

1. 放圖片到資料夾
2. 跑 `npm run build:galleries`
3. Push

Script 會自動掃描資料夾、產生 JSON。連手動編輯 JSON 都不用。

---

這三個功能加起來，HQ 現在可以：

- **月曆**：展示 30 天專案進度
- **Blog**：記錄心得
- **相簿**：放截圖和照片
- **留言板**：讓大家互動

應該夠用了。繼續趕專案去。
