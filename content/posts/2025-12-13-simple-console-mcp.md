---
title: Day 14：我只想看 Console Log，為什麼要載入 50 個工具？
date: 2025-12-13
excerpt: 減法原則的極致實踐 — 全世界最小的瀏覽器 Console Log 監控 MCP
tags: [muripo, day-14, mcp, chrome, debugging, npm]
---

這個專案源自一個簡單的問題：**「我只想看 Console Log，為什麼要載入 50 個工具？」**

chrome-devtools-mcp 很強大，但每次 AI 呼叫工具前都要先理解這 50+ 個工具的用途，光是工具描述就吃掉大量 context。對於只想快速 debug JavaScript 錯誤的場景來說，這太浪費了。

## 最小可行 MCP

所以我做了這個「最小可行 MCP」：

- `list_targets` — 列出瀏覽器分頁
- `get_console_logs` — 讀取 Console 輸出
- `navigate` — 導航或重新整理

就這三個。夠用就好。

| 對比 | chrome-devtools-mcp | simple-console-mcp |
|------|---------------------|-------------------|
| 工具數 | 50+ | **3** |
| Context 消耗 | ~5000 tokens | **~160 tokens** |
| 節省比例 | - | **97%** |

## 減法原則 × 80/20 法則

這個 MCP 的核心目標，是徹底執行**減法原則** — 用最小的功能達成最大的效果。

實際上，這也是 **80/20 法則**的運用：80% 的 debug 場景只需要看 Console Log，那為什麼要載入 100% 的工具？

## 全世界最小？

我想這應該是全世界最小、能夠對 Console Log 做監控的 MCP 了吧。對於這一點，我覺得蠻值得驕傲的。

這也是我第一次開發 MCP 工具，過程中學會了怎麼把套件推送到 npm，讓全世界的人都能下載使用。不知道這個工具能不能被大家採用，但至少對我自己來說非常實用。

## 但說實話...

話說回來，這個 MCP 對於非 Vibe Coder 來說可能有點無聊 — 真正的工程師本來就會自己看 Console Log 找問題，哪需要 AI 幫忙？

所以這東西更像是練練手、增加經驗值的小專案。

不過，能把一個想法從零做到發布 npm，這個過程本身就很有價值了。

## 安裝使用

```json
{
  "mcpServers": {
    "simple-console": {
      "command": "npx",
      "args": ["-y", "simple-console-mcp"]
    }
  }
}
```

v1.1.0 加入自動啟動 Chrome 功能，不需要手動設定 `--remote-debugging-port`。

[npm →](https://www.npmjs.com/package/simple-console-mcp) | [GitHub →](https://github.com/tznthou/simple-console-mcp)

---

這就是 Muripo 精神：不是每個專案都要改變世界，有時候只是想學點東西、做點有趣的事。

而這次學到的是：**少即是多**。
