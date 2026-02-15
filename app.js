const app = document.getElementById('app');
const nav = document.getElementById('category-nav');
const searchInput = document.getElementById('search');

// Get unique categories in order
const categories = [...new Set(TEENIEPING_DATA.map(t => t.category))];

// Build category nav
const allBtn = document.createElement('button');
allBtn.textContent = '전체';
allBtn.className = 'active';
allBtn.addEventListener('click', () => {
  setActiveNav(allBtn);
  render();
});
nav.appendChild(allBtn);

categories.forEach(cat => {
  const btn = document.createElement('button');
  btn.textContent = cat.replace(/ \(.+\)/, '');
  btn.addEventListener('click', () => {
    setActiveNav(btn);
    render(cat);
  });
  nav.appendChild(btn);
});

function setActiveNav(activeBtn) {
  nav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
  searchInput.value = '';
}

// Render
function render(filterCategory, searchTerm) {
  let data = TEENIEPING_DATA;

  if (filterCategory) {
    data = data.filter(t => t.category === filterCategory);
  }

  if (searchTerm) {
    data = data.filter(t => t.name.includes(searchTerm));
  }

  if (data.length === 0) {
    app.innerHTML = '<div class="no-results">검색 결과가 없습니다</div>';
    return;
  }

  // Group by category
  const grouped = {};
  data.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  app.innerHTML = '';

  Object.entries(grouped).forEach(([cat, items]) => {
    const section = document.createElement('section');
    section.className = 'category-section';

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.innerHTML = `${cat} <span class="category-badge">${items.length}마리</span>`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'card-grid';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `card ${item.type}`;

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
      <div class="modal-category"></div>
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

function showModal(item) {
  const modalImg = overlay.querySelector('.modal-image');
  if (item.image) {
    const imgSrc = item.image.startsWith('//') ? 'https:' + item.image : item.image;
    modalImg.innerHTML = `<img src="${imgSrc}" alt="${item.name}">`;
  } else {
    modalImg.innerHTML = '<div class="placeholder" style="font-size:80px">🧚</div>';
  }
  overlay.querySelector('.modal-name').textContent = item.name;
  overlay.querySelector('.modal-category').textContent = item.category;
  overlay.querySelector('.modal-coloring').href = `https://www.google.com/search?q=${encodeURIComponent(item.name + ' 색칠공부')}&tbm=isch`;
  overlay.classList.add('active');
}

// Search
let currentCategory = null;
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
