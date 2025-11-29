(function() {
  'use strict';

  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

  // Fetch projects and render
  async function init() {
    try {
      const res = await fetch('projects.json');
      const projects = await res.json();
      const projectMap = buildProjectMap(projects);

      renderCalendar('calendar-nov', 2025, 10, projectMap); // Month is 0-indexed
      renderCalendar('calendar-dec', 2025, 11, projectMap);
      updateProgress(projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }

  // Build date -> project map
  function buildProjectMap(projects) {
    const map = {};
    projects.forEach(p => {
      map[p.date] = p;
    });
    return map;
  }

  // Render a single month calendar
  function renderCalendar(containerId, year, month, projectMap) {
    const container = document.querySelector(`#${containerId} .calendar-grid`);
    if (!container) return;

    container.innerHTML = '';

    // Add weekday headers
    WEEKDAYS.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-header';
      header.textContent = day;
      container.appendChild(header);
    });

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      container.appendChild(empty);
    }

    // Add day cells
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = formatDate(year, month, day);
      const project = projectMap[dateStr];
      const cell = createDayCell(day, project);
      container.appendChild(cell);
    }
  }

  // Format date as YYYY-MM-DD
  function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // Create a day cell element
  function createDayCell(dayNum, project) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    if (!project) {
      cell.classList.add('locked');
      cell.innerHTML = `<span class="day-number">${dayNum}</span>`;
      return cell;
    }

    cell.classList.add(project.status);

    if (project.tagline) {
      cell.setAttribute('data-tagline', project.tagline);
    }

    // Day number
    const numSpan = document.createElement('span');
    numSpan.className = 'day-number';
    numSpan.textContent = dayNum;
    cell.appendChild(numSpan);

    // Project name (truncated)
    if (project.name) {
      const nameSpan = document.createElement('span');
      nameSpan.className = 'day-name';
      nameSpan.textContent = project.name.length > 8
        ? project.name.slice(0, 7) + '…'
        : project.name;
      cell.appendChild(nameSpan);
    }

    // Type badge
    if (project.type) {
      const badge = document.createElement('span');
      badge.className = `type-badge ${project.type}`;
      badge.textContent = project.type === 'extension' ? 'ext' : project.type;
      cell.appendChild(badge);
    }

    // Click handler for done projects
    if (project.status === 'done' && project.repo) {
      cell.addEventListener('click', () => {
        window.open(project.repo, '_blank');
      });
    }

    return cell;
  }

  // Update progress display
  function updateProgress(projects) {
    const doneCount = projects.filter(p => p.status === 'done').length;
    const total = 30;

    const countEl = document.querySelector('.done-count');
    const fillEl = document.querySelector('.progress-fill');

    if (countEl) countEl.textContent = doneCount;
    if (fillEl) fillEl.style.width = `${(doneCount / total) * 100}%`;
  }

  // Start
  document.addEventListener('DOMContentLoaded', init);
})();
