(function() {
  'use strict';

  async function init() {
    const slug = new URLSearchParams(window.location.search).get('slug');

    try {
      if (slug) {
        // Single post: load individual JSON
        const res = await fetch(`data/posts/${encodeURIComponent(slug)}.json`);
        if (!res.ok) throw new Error('Post not found');
        const post = await res.json();
        renderPost(post);
      } else {
        // List page: load lightweight index only
        const res = await fetch('data/posts-index.json');
        const posts = await res.json();
        renderList(posts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      const container = document.getElementById('posts-list') || document.getElementById('post-content');
      if (container) {
        if (slug) {
          container.innerHTML = `
            <p class="empty-state">文章不存在</p>
            <a href="blog.html" class="back-link">← 返回文章列表</a>
          `;
        } else {
          container.innerHTML = '<p class="empty-state">載入失敗</p>';
        }
      }
    }
  }

  function renderList(posts) {
    const container = document.getElementById('posts-list');
    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '<p class="empty-state">還沒有文章，敬請期待！</p>';
      return;
    }

    container.innerHTML = posts.map(post => `
      <article class="post-card">
        ${post.cover ? `<img src="${post.cover}" alt="${escapeHtml(post.title)}" class="post-cover">` : ''}
        <div class="post-info">
          <time class="post-date">${post.date}</time>
          <h2><a href="post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
          <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
          ${post.tags && post.tags.length ? `<div class="post-tags">${post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
      </article>
    `).join('');
  }

  function renderPost(post) {
    const container = document.getElementById('post-content');
    if (!container) return;

    document.title = `${post.title} - Muripo HQ`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && post.excerpt) {
      metaDesc.setAttribute('content', post.excerpt);
    }

    container.innerHTML = `
      <header class="post-header">
        <time class="post-date">${post.date}</time>
        <h1>${escapeHtml(post.title)}</h1>
        ${post.tags && post.tags.length ? `<div class="post-tags">${post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      </header>
      ${post.cover ? `<img src="${post.cover}" alt="${escapeHtml(post.title)}" class="post-hero-image">` : ''}
      <div class="post-body">${post.content}</div>
      <a href="blog.html" class="back-link">← 返回文章列表</a>
    `;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
