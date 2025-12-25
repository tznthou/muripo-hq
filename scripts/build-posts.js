#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const DATA_DIR = path.join(__dirname, '../data');
const POSTS_OUTPUT_DIR = path.join(DATA_DIR, 'posts');
const INDEX_FILE = path.join(DATA_DIR, 'posts-index.json');

// Frontmatter parser
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      let value = rest.join(':').trim();
      // Handle arrays: [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
      meta[key.trim()] = value;
    }
  });

  return { meta, body: match[2] };
}

function build() {
  // Create directories if not exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(POSTS_OUTPUT_DIR)) {
    fs.mkdirSync(POSTS_OUTPUT_DIR, { recursive: true });
  }

  // Check if posts directory exists
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts directory found, creating empty index');
    fs.writeFileSync(INDEX_FILE, '[]');
    return;
  }

  // Get all markdown files
  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // Newest first

  if (files.length === 0) {
    console.log('No markdown files found, creating empty index');
    fs.writeFileSync(INDEX_FILE, '[]');
    return;
  }

  const index = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { meta, body } = parseFrontmatter(content);
    const slug = file.replace('.md', '');
    const htmlContent = marked.parse(body);

    // Build index entry (metadata only, no content)
    index.push({
      slug,
      title: meta.title || slug,
      date: meta.date || slug.slice(0, 10),
      excerpt: meta.excerpt || '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      cover: meta.cover || ''
    });

    // Write individual post file (full content)
    const postFile = path.join(POSTS_OUTPUT_DIR, `${slug}.json`);
    fs.writeFileSync(postFile, JSON.stringify({
      slug,
      title: meta.title || slug,
      date: meta.date || slug.slice(0, 10),
      excerpt: meta.excerpt || '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      cover: meta.cover || '',
      content: htmlContent
    }, null, 2));
  });

  // Write index file
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

  console.log(`Built ${files.length} post(s):`);
  console.log(`  - Index: ${INDEX_FILE}`);
  console.log(`  - Posts: ${POSTS_OUTPUT_DIR}/`);
}

build();
