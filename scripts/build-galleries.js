#!/usr/bin/env node
/**
 * build-galleries.js
 *
 * 自動掃描 assets/projects/ 和 assets/gallery/ 資料夾
 * 產生 data/galleries.json
 *
 * 使用方式：
 * 1. 專案截圖：放圖片到 assets/projects/day-01/
 * 2. 生活相簿：放圖片到 assets/gallery/2025-12-標題/
 * 3. 執行 npm run build:galleries
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT, 'assets', 'projects');
const GALLERY_DIR = path.join(ROOT, 'assets', 'gallery');
const OUTPUT_FILE = path.join(ROOT, 'data', 'galleries.json');
const PROJECTS_JSON = path.join(ROOT, 'projects.json');

// 支援的圖片格式
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * 取得資料夾中的所有圖片
 */
function getImages(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    })
    .sort() // 按檔名排序
    .map(file => ({
      src: path.relative(ROOT, path.join(dir, file)).replace(/\\/g, '/'),
      caption: path.basename(file, path.extname(file))
    }));
}

/**
 * 掃描專案截圖
 */
function scanProjects() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.log('📁 assets/projects/ 不存在，跳過專案截圖');
    return [];
  }

  // 讀取 projects.json 取得專案名稱
  let projectsData = [];
  if (fs.existsSync(PROJECTS_JSON)) {
    projectsData = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf-8'));
  }

  const results = [];
  const dirs = fs.readdirSync(PROJECTS_DIR).filter(dir => {
    return fs.statSync(path.join(PROJECTS_DIR, dir)).isDirectory();
  });

  for (const dir of dirs) {
    // 解析 day-XX 格式
    const match = dir.match(/^day-(\d+)$/i);
    if (!match) continue;

    const dayIndex = parseInt(match[1], 10);
    const images = getImages(path.join(PROJECTS_DIR, dir));

    if (images.length === 0) continue;

    // 從 projects.json 找專案名稱
    const project = projectsData.find(p => p.dayIndex === dayIndex);
    const name = project?.name || `Day ${dayIndex}`;

    results.push({
      dayIndex,
      name,
      images
    });
  }

  // 按 dayIndex 排序
  return results.sort((a, b) => a.dayIndex - b.dayIndex);
}

/**
 * 掃描生活相簿
 */
function scanLifeGallery() {
  if (!fs.existsSync(GALLERY_DIR)) {
    console.log('📁 assets/gallery/ 不存在，跳過生活相簿');
    return [];
  }

  const results = [];
  const dirs = fs.readdirSync(GALLERY_DIR).filter(dir => {
    return fs.statSync(path.join(GALLERY_DIR, dir)).isDirectory();
  });

  for (const dir of dirs) {
    const galleryPath = path.join(GALLERY_DIR, dir);
    const images = getImages(galleryPath);

    if (images.length === 0) continue;

    // 解析資料夾名稱：YYYY-MM-slug
    const match = dir.match(/^(\d{4}-\d{2})-(.+)$/);
    let date, title, slug;

    if (match) {
      date = match[1] + '-01'; // 預設為該月1號
      slug = dir;
      title = match[2].replace(/-/g, ' '); // 將 kebab-case 轉為空格
    } else {
      // 無法解析就用資料夾名稱
      date = new Date().toISOString().split('T')[0];
      slug = dir;
      title = dir;
    }

    // 檢查是否有 meta.json 覆蓋設定
    const metaPath = path.join(galleryPath, 'meta.json');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (meta.title) title = meta.title;
        if (meta.date) date = meta.date;
      } catch (e) {
        console.warn(`⚠️ ${metaPath} 解析失敗`);
      }
    }

    results.push({
      slug,
      title,
      date,
      cover: images[0].src, // 第一張圖為封面
      images
    });
  }

  // 按日期降序排列（最新的在前面）
  return results.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 主程式
 */
function main() {
  console.log('🔍 掃描相簿資料夾...\n');

  const projects = scanProjects();
  const life = scanLifeGallery();

  const output = { projects, life };

  // 確保 data/ 目錄存在
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`📸 專案截圖：${projects.length} 個專案`);
  projects.forEach(p => {
    console.log(`   Day ${p.dayIndex}: ${p.name} (${p.images.length} 張)`);
  });

  console.log(`\n🖼️  生活相簿：${life.length} 個相簿`);
  life.forEach(l => {
    console.log(`   ${l.title} (${l.images.length} 張)`);
  });

  console.log(`\n✅ 已產生 ${OUTPUT_FILE}`);
}

main();
