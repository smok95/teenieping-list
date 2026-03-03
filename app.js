const app = document.getElementById('app');
const nav = document.getElementById('category-nav');
const searchInput = document.getElementById('search');

// Fixed nav items
const NAV_ITEMS = [
  { label: '전체', filter: null },
  { label: '1기', filter: { type: 'season', value: '1기' } },
  { label: '2기', filter: { type: 'season', value: '2기' } },
  { label: '3기', filter: { type: 'season', value: '3기' } },
  { label: '4기', filter: { type: 'season', value: '4기' } },
  { label: '5기', filter: { type: 'season', value: '5기' } },
  { label: '6기', filter: { type: 'season', value: '6기' } },
  { label: '레전드', filter: { type: 'tier', value: 'legend' } },
  { label: '빌런', filter: { type: 'tier', value: 'villain' } },
];

let currentFilter = null;

// Build nav buttons
NAV_ITEMS.forEach((item, idx) => {
  const btn = document.createElement('button');
  btn.textContent = item.label;
  if (idx === 0) btn.classList.add('active');
  btn.addEventListener('click', () => {
    setActiveNav(btn);
    currentFilter = item.filter;
    render(item.filter);
  });
  nav.appendChild(btn);
});

function setActiveNav(activeBtn) {
  nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
  searchInput.value = '';
}

// Render
function render(filter, searchTerm) {
  let data = TEENIEPING_DATA;

  if (filter) {
    if (filter.type === 'season') {
      // Season filter includes villains from the same season
      data = data.filter(t => t.season === filter.value);
    } else if (filter.type === 'tier') {
      data = data.filter(t => t.tier === filter.value);
    }
  }

  if (searchTerm) {
    data = data.filter(t => t.name.includes(searchTerm));
  }

  if (data.length === 0) {
    app.innerHTML = '<div class="no-results">검색 결과가 없습니다</div>';
    return;
  }

  // Group by collection + season, preserving insertion order
  const grouped = {};
  const groupOrder = [];
  data.forEach(t => {
    const key = t.collection + (t.season ? ' ' + t.season : '');
    if (!grouped[key]) {
      grouped[key] = [];
      groupOrder.push(key);
    }
    grouped[key].push(t);
  });

  app.innerHTML = '';

  groupOrder.forEach(key => {
    const items = grouped[key];
    const section = document.createElement('section');
    section.className = 'category-section';

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.innerHTML = `${key} <span class="category-badge">${items.length}마리</span>`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'card-grid';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `card ${item.tier}`;

      const imgWrap = document.createElement('div');
      imgWrap.className = 'card-image';

      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image.startsWith('//') ? 'https:' + item.image : item.image;
        img.alt = item.name;
        img.loading = 'lazy';
        img.onerror = function() {
          this.parentElement.innerHTML = '<div class="placeholder">🧚</div>';
        };
        imgWrap.appendChild(img);
      } else {
        imgWrap.innerHTML = '<div class="placeholder">🧚</div>';
      }

      const name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = item.name;

      card.appendChild(imgWrap);
      card.appendChild(name);

      card.addEventListener('click', () => showModal(item));

      grid.appendChild(card);
    });

    section.appendChild(grid);
    app.appendChild(section);
  });
}

// Modal
const overlay = document.createElement('div');
overlay.className = 'modal-overlay';
overlay.innerHTML = `
  <div class="modal">
    <div class="modal-image"></div>
    <div class="modal-body">
      <div class="modal-name"></div>
      <div class="modal-tags"></div>
      <div class="modal-description"></div>
      <div class="modal-actions">
        <a class="modal-coloring" href="#" target="_blank" rel="noopener">색칠공부</a>
        <button class="modal-close">닫기</button>
      </div>
    </div>
  </div>
`;
document.body.appendChild(overlay);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay || e.target.classList.contains('modal-close')) {
    overlay.classList.remove('active');
  }
});

const TIER_LABEL = { royal: '로열', legend: '레전드', villain: '빌런' };
const TIER_CLASS = { royal: 'tier-royal', legend: 'tier-legend', villain: 'tier-villain' };

function showModal(item) {
  const modalImg = overlay.querySelector('.modal-image');
  if (item.image) {
    const imgSrc = item.image.startsWith('//') ? 'https:' + item.image : item.image;
    modalImg.innerHTML = `<img src="${imgSrc}" alt="${item.name}">`;
  } else {
    modalImg.innerHTML = '<div class="placeholder" style="font-size:80px">🧚</div>';
  }

  overlay.querySelector('.modal-name').textContent = item.name;

  // Tags: tier badge + season · collection
  const tagsEl = overlay.querySelector('.modal-tags');
  let tagsHtml = '';
  if (item.tier !== 'normal') {
    tagsHtml += `<span class="tier-badge ${TIER_CLASS[item.tier]}">${TIER_LABEL[item.tier]}</span>`;
  }
  const infoText = [item.season, item.collection].filter(Boolean).join(' · ');
  if (infoText) {
    tagsHtml += `<span class="modal-season-info">${infoText}</span>`;
  }
  tagsEl.innerHTML = tagsHtml;

  // Description
  const descEl = overlay.querySelector('.modal-description');
  if (item.description) {
    descEl.textContent = item.description;
    descEl.style.display = '';
  } else {
    descEl.textContent = '';
    descEl.style.display = 'none';
  }

  overlay.querySelector('.modal-coloring').href = `https://www.google.com/search?q=${encodeURIComponent(item.name + ' 색칠공부')}&tbm=isch`;
  overlay.classList.add('active');
}

// Search
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.trim();
  if (term) {
    nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    render(null, term);
  } else {
    nav.querySelector('button').classList.add('active');
    render();
  }
});

// Show total count
document.querySelector('.subtitle').textContent = `캐치! 티니핑 캐릭터 모음 (총 ${TEENIEPING_DATA.length}마리)`;

// Hide header when scrolled down, show only at top
(function() {
  const header = document.querySelector('header');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 80) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// Initial render
render();
