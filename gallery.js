(function() {
  'use strict';

  let currentTab = 'projects';
  let data = null;

  async function init() {
    try {
      const res = await fetch('data/galleries.json');
      data = await res.json();

      setupTabs();
      render();
    } catch (err) {
      console.error('Failed to load galleries:', err);
      const container = document.getElementById('gallery-grid');
      if (container) {
        container.innerHTML = '<p class="empty-state">載入失敗</p>';
      }
    }
  }

  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        render();
      });
    });
  }

  function render() {
    const container = document.getElementById('gallery-grid');
    if (!container || !data) return;

    if (currentTab === 'projects') {
      renderProjects(container);
    } else {
      renderLife(container);
    }
  }

  function renderProjects(container) {
    if (!data.projects || data.projects.length === 0) {
      container.innerHTML = '<p class="empty-state">還沒有專案截圖</p>';
      return;
    }

    container.innerHTML = data.projects.map(project => `
      <div class="gallery-item">
        <h3>Day ${project.dayIndex}: ${escapeHtml(project.name)}</h3>
        <div class="gallery-images">
          ${project.images.map(img => `
            <figure>
              <img src="${img.src}" alt="${escapeHtml(img.caption)}" loading="lazy">
              <figcaption>${escapeHtml(img.caption)}</figcaption>
            </figure>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderLife(container) {
    if (!data.life || data.life.length === 0) {
      container.innerHTML = '<p class="empty-state">還沒有生活相簿</p>';
      return;
    }

    container.innerHTML = data.life.map(album => `
      <div class="gallery-album" onclick="window.location.href='album.html?slug=${encodeURIComponent(album.slug)}'">
        <img src="${album.cover}" alt="${escapeHtml(album.title)}" class="album-cover" loading="lazy">
        <div class="album-info">
          <time>${album.date}</time>
          <h3>${escapeHtml(album.title)}</h3>
          <span class="photo-count">${album.images.length} 張</span>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
