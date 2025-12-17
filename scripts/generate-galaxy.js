/**
 * Stargazer Galaxy Generator
 * 把 GitHub Stargazers 變成銀河系的星星
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
// 生成 SVG
// ============================================
function generateSVG(stargazers) {
  const stars = stargazers.map((user, index) => {
    const pos = calculatePosition(index, user.username);
    const colorIndex = user.username.length % CONFIG.glowColors.length;
    const glowColor = CONFIG.glowColors[colorIndex];

    return `
    <g class="star" data-user="${user.username}">
      <!-- 光暈 -->
      <circle
        cx="${pos.x}"
        cy="${pos.y}"
        r="${CONFIG.glowSize / 2}"
        fill="url(#glow-${colorIndex})"
        opacity="0.6"
      />
      <!-- 頭像 -->
      <clipPath id="clip-${user.username}">
        <circle cx="${pos.x}" cy="${pos.y}" r="${CONFIG.starSize / 2}" />
      </clipPath>
      <image
        href="${user.avatarUrl}?s=${CONFIG.starSize * 2}"
        x="${pos.x - CONFIG.starSize / 2}"
        y="${pos.y - CONFIG.starSize / 2}"
        width="${CONFIG.starSize}"
        height="${CONFIG.starSize}"
        clip-path="url(#clip-${user.username})"
        preserveAspectRatio="xMidYMid slice"
      />
      <!-- 邊框 -->
      <circle
        cx="${pos.x}"
        cy="${pos.y}"
        r="${CONFIG.starSize / 2}"
        fill="none"
        stroke="${glowColor}"
        stroke-width="1.5"
        opacity="0.8"
      />
    </g>`;
  }).join('\n');

  const glowGradients = CONFIG.glowColors.map((color, index) => `
    <radialGradient id="glow-${index}">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.8" />
      <stop offset="50%" stop-color="${color}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${color}" stop-opacity="0" />
    </radialGradient>`).join('\n');

  // 生成背景星點
  const bgStars = Array.from({ length: 150 }, () => {
    const x = Math.random() * CONFIG.width;
    const y = Math.random() * CONFIG.height;
    const r = Math.random() * 1.2 + 0.3;
    const opacity = Math.random() * 0.6 + 0.2;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="white" opacity="${opacity.toFixed(2)}" />`;
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CONFIG.width} ${CONFIG.height}" width="${CONFIG.width}" height="${CONFIG.height}">
  <defs>
    <!-- 背景漸層 -->
    <radialGradient id="bg-gradient" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a1f35" />
      <stop offset="50%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#010409" />
    </radialGradient>

    <!-- 中心光暈 -->
    <radialGradient id="center-glow">
      <stop offset="0%" stop-color="#58a6ff" stop-opacity="0.15" />
      <stop offset="40%" stop-color="#a371f7" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0" />
    </radialGradient>

    <!-- 星星光暈漸層 -->
    ${glowGradients}
  </defs>

  <!-- 背景 -->
  <rect width="100%" height="100%" fill="url(#bg-gradient)" />

  <!-- 背景星點 -->
  <g class="background-stars">
    ${bgStars}
  </g>

  <!-- 中心光暈 -->
  <ellipse cx="${CONFIG.centerX}" cy="${CONFIG.centerY}" rx="280" ry="200" fill="url(#center-glow)" />

  <!-- Stargazers -->
  <g class="stargazers">
    ${stars}
  </g>

  <!-- 標題 -->
  <text x="${CONFIG.width / 2}" y="30" text-anchor="middle" fill="#8b949e" font-family="system-ui, sans-serif" font-size="12">
    ✨ ${stargazers.length} Stargazers Galaxy ✨
  </text>

  <!-- 說明文字 -->
  <text x="${CONFIG.width / 2}" y="${CONFIG.height - 12}" text-anchor="middle" fill="#484f58" font-family="system-ui, sans-serif" font-size="10">
    Star this repo to join the galaxy!
  </text>
</svg>`;

  return svg;
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
  const svg = generateSVG(stargazers);

  const outputPath = join(__dirname, '..', 'assets', 'galaxy.svg');
  writeFileSync(outputPath, svg);

  console.log(`✅ Galaxy saved to ${outputPath}`);
  console.log(`🌟 Total stars in galaxy: ${stargazers.length}`);
}

main().catch(console.error);
