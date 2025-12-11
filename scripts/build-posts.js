#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_FILE = path.join(__dirname, '../data/posts.json');

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
  // Create data directory if not exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Check if posts directory exists
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts directory found, creating empty posts.json');
    fs.writeFileSync(OUTPUT_FILE, '[]');
    return;
  }

  // Get all markdown files
  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // Newest first

  if (files.length === 0) {
    console.log('No markdown files found, creating empty posts.json');
    fs.writeFileSync(OUTPUT_FILE, '[]');
    return;
  }

  const posts = files.map(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { meta, body } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    return {
      slug,
      title: meta.title || slug,
      date: meta.date || slug.slice(0, 10),
      excerpt: meta.excerpt || '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      cover: meta.cover || '',
      content: marked.parse(body)
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
  console.log(`Built ${posts.length} post(s) to ${OUTPUT_FILE}`);
}

build();
