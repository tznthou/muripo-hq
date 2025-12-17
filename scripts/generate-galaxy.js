/**
 * Stargazer Galaxy Generator
 * 把 GitHub Stargazers 變成銀河系的星星
 * 輸出 PNG 格式（解決 GitHub SVG 外部圖片限制）
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// 設定參數（可自訂）
// ============================================
const CONFIG = {
  width: 800,
  height: 600,
  centerX: 400,
  centerY: 300,

  // 黃金螺旋參數
  goldenAngle: 137.508 * (Math.PI / 180), // 黃金角（弧度）
  spiralScale: 18, // 螺旋擴散係數

  // 星星樣式
  starSize: 28, // 頭像大小
  glowSize: 40, // 光暈大小

  // 顏色
  bgGradient: ['#0d1117', '#161b22', '#0d1117'],
  glowColors: ['#58a6ff', '#a371f7', '#f778ba', '#7ee787', '#ffa657'],
};

// ============================================
// Seeded Random（確保同一 ID 永遠在同位置）
// ============================================
function seededRandom(seed) {
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);

  // Mulberry32 algorithm
  return function() {
    let t = (hash + 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================
// 黃金螺旋座標計算
// ============================================
function calculatePosition(index, username) {
  const rand = seededRandom(username);

  // 基礎螺旋位置
  const n = index + 1;
  const radius = CONFIG.spiralScale * Math.sqrt(n);
  const angle = n * CONFIG.goldenAngle;

  // 加入隨機偏移，讓分佈更自然
  const offsetRadius = radius + (rand() - 0.5) * 10;
  const offsetAngle = angle + (rand() - 0.5) * 0.3;

  const x = CONFIG.centerX + offsetRadius * Math.cos(offsetAngle);
  const y = CONFIG.centerY + offsetRadius * Math.sin(offsetAngle);

  return { x, y };
}

// ============================================
// 取得 Stargazers（從 GitHub API）
// ============================================
async function fetchStargazers() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  if (!token || !owner || !repo) {
    console.log('⚠️  Missing environment variables, using demo data');
    return getDemoData();
  }

  const stargazers = [];
  let page = 1;
  const perPage = 100;

  console.log(`🔍 Fetching stargazers for ${owner}/${repo}...`);

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=${perPage}&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Stargazer-Galaxy-Generator'
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`);
      break;
    }

    const data = await response.json();
    if (data.length === 0) break;

    stargazers.push(...data.map(user => ({
      username: user.login,
      avatarUrl: user.avatar_url,
      id: user.id
    })));

    if (data.length < perPage) break;
    page++;
  }

  console.log(`✅ Found ${stargazers.length} stargazers`);
  return stargazers;
}

// ============================================
// Demo 資料（本地測試用）
// ============================================
function getDemoData() {
  const demoUsers = [
    'octocat', 'torvalds', 'gaearon', 'sindresorhus', 'tj',
    'yyx990803', 'addyosmani', 'paulirish', 'fat', 'mdo',
    'defunkt', 'mojombo', 'pjhyett', 'wycats', 'evanphx',
    'tpope', 'mattn', 'junegunn', 'sharkdp', 'BurntSushi'
  ];

  return demoUsers.map((username, index) => ({
    username,
    avatarUrl: `https://github.com/${username}.png`,
    id: index + 1000
  }));
}

// ============================================
// 生成 HTML（用於 Puppeteer 渲染）
// ============================================
function generateHTML(stargazers) {
  const stars = stargazers.map((user, index) => {
    const pos = calculatePosition(index, user.username);
    const colorIndex = user.username.length % CONFIG.glowColors.length;
    const glowColor = CONFIG.glowColors[colorIndex];

    return `
    <div class="star" style="left: ${pos.x}px; top: ${pos.y}px;">
      <div class="glow" style="background: radial-gradient(circle, ${glowColor}cc 0%, ${glowColor}4d 50%, transparent 70%);"></div>
      <img src="${user.avatarUrl}?s=${CONFIG.starSize * 2}" alt="${user.username}" />
      <div class="border" style="border-color: ${glowColor};"></div>
    </div>`;
  }).join('\n');

  // 生成背景星點
  const bgStars = Array.from({ length: 150 }, () => {
    const x = Math.random() * CONFIG.width;
    const y = Math.random() * CONFIG.height;
    const r = Math.random() * 1.2 + 0.3;
    const opacity = Math.random() * 0.6 + 0.2;
    return `<div class="bg-star" style="left: ${x.toFixed(1)}px; top: ${y.toFixed(1)}px; width: ${r * 2}px; height: ${r * 2}px; opacity: ${opacity.toFixed(2)};"></div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: ${CONFIG.width}px;
      height: ${CONFIG.height}px;
      background: radial-gradient(ellipse at center, #1a1f35 0%, #0d1117 50%, #010409 100%);
      position: relative;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .center-glow {
      position: absolute;
      left: ${CONFIG.centerX - 280}px;
      top: ${CONFIG.centerY - 200}px;
      width: 560px;
      height: 400px;
      background: radial-gradient(ellipse at center,
        rgba(88, 166, 255, 0.15) 0%,
        rgba(163, 113, 247, 0.08) 40%,
        transparent 70%);
      border-radius: 50%;
    }

    .bg-star {
      position: absolute;
      background: white;
      border-radius: 50%;
    }

    .star {
      position: absolute;
      transform: translate(-50%, -50%);
    }

    .star .glow {
      position: absolute;
      width: ${CONFIG.glowSize}px;
      height: ${CONFIG.glowSize}px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      opacity: 0.6;
    }

    .star img {
      width: ${CONFIG.starSize}px;
      height: ${CONFIG.starSize}px;
      border-radius: 50%;
      object-fit: cover;
      position: relative;
      z-index: 1;
    }

    .star .border {
      position: absolute;
      width: ${CONFIG.starSize}px;
      height: ${CONFIG.starSize}px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      border: 1.5px solid;
      border-radius: 50%;
      opacity: 0.8;
      z-index: 2;
      pointer-events: none;
    }

    .title {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      color: #8b949e;
      font-size: 12px;
      text-align: center;
    }

    .subtitle {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      color: #484f58;
      font-size: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  ${bgStars}
  <div class="center-glow"></div>
  ${stars}
  <div class="title">✨ ${stargazers.length} Stargazers Galaxy ✨</div>
  <div class="subtitle">Star this repo to join the galaxy!</div>
</body>
</html>`;
}

// ============================================
// 使用 Puppeteer 渲染 PNG
// ============================================
async function renderToPNG(html, outputPath) {
  console.log('🚀 Launching browser...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

  console.log('📄 Loading HTML...');
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // 等待所有圖片載入
  console.log('🖼️  Waiting for images...');
  await page.evaluate(async () => {
    const images = document.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // 即使失敗也繼續
        });
      })
    );
  });

  // 額外等待確保渲染完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('📸 Taking screenshot...');
  await page.screenshot({
    path: outputPath,
    type: 'png',
    omitBackground: false
  });

  await browser.close();
  console.log(`✅ PNG saved to ${outputPath}`);
}

// ============================================
// 主程式
// ============================================
async function main() {
  const isDemo = process.argv.includes('--demo');

  let stargazers;
  if (isDemo) {
    console.log('🎭 Running in demo mode');
    stargazers = getDemoData();
  } else {
    stargazers = await fetchStargazers();
  }

  if (stargazers.length === 0) {
    console.log('⭐ No stargazers yet. Be the first!');
    stargazers = getDemoData().slice(0, 1); // 至少顯示一個 demo
  }

  console.log('🎨 Generating galaxy...');
  const html = generateHTML(stargazers);

  // 確保 assets 目錄存在
  const assetsDir = join(__dirname, '..', 'assets');
  mkdirSync(assetsDir, { recursive: true });

  const outputPath = join(assetsDir, 'galaxy.png');
  await renderToPNG(html, outputPath);

  console.log(`🌟 Total stars in galaxy: ${stargazers.length}`);
}

main().catch(console.error);
