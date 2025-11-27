// js/app.js
const BASE_URL = 'https://quran-api-id.vercel.app';

// ambil elemen
const listEl = document.getElementById('surah-list');
const contentEl = document.getElementById('surah-content');

if (!listEl) console.error('Element #surah-list tidak ditemukan');
if (!contentEl) console.error('Element #surah-content tidak ditemukan');

// ================== LOAD LIST SURAH ==================
async function loadSurahList() {
  try {
    const res = await fetch(`${BASE_URL}/surah`);
    const json = await res.json();
    const surahs = json.data || json.surahs || json;

    if (!Array.isArray(surahs)) {
      listEl.innerHTML = `<li class="fs-5">Daftar surah tidak tersedia</li>`;
      console.error('Format response tidak sesuai:', surahs);
      return;
    }

    listEl.innerHTML = '';

    surahs.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'list-group-item py-2 px-3 surah-item';
      li.style.cursor = 'pointer';

      const no = item.number ?? item.no ?? item.nomor;
      const name =
        item.name?.transliteration?.id ||
        item.translation?.id ||
        item.name?.short ||
        item.name?.long ||
        'Nama surat';

      li.dataset.id = no;
      li.textContent = `${no ? no + '. ' : ''}${name}`;
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error('loadSurahList error:', err);
    listEl.innerHTML = `<li class="fs-5">Gagal memuat daftar surah</li>`;
  }
}

// ================== LOAD DETAIL SURAH ==================
async function loadSurahDetail(id) {
  if (!id) return;

  try {
    // hapus style welcome
    contentEl.classList.remove(
      'd-flex',
      'flex-column',
      'justify-content-center',
      'text-center'
    );

    contentEl.innerHTML = `
      <div class="text-center text-secondary">
        <h4>Memuat...</h4>
      </div>
    `;

    const res = await fetch(`${BASE_URL}/surah/${id}`);
    const json = await res.json();
    const surah = json.data || json;

    if (!surah || !surah.verses) {
      contentEl.innerHTML = `<p class="text-danger">Surat tidak ditemukan.</p>`;
      console.error('Data surah tidak sesuai:', surah);
      return;
    }

    const arabName = surah.name?.short || surah.name?.long || '';
    const latin =
      surah.name?.transliteration?.id || surah.translation?.id || '';

    const header = `
      <div class="mb-5">
        <h1 class="fw-bold text-center">${latin || arabName}</h1>
        <p class="opacity-75 fw-semibold fs-4 text-center">
          Surat ke-${surah.number ?? id}
        </p>
      </div>
    `;

    const verses = surah.verses
      .map((v) => {
        const num = v.number?.inSurah ?? v.number;
        const arab = v.text?.arab ?? v.ar ?? v.text;
        const indo =
          v.translation?.id ||
          v.translation ||
          v.translation?.text ||
          v.text?.translation ||
          '';

        return `
          <div class="w-1004">
            <div class="p-4 border-bottom border-bottom-primary d-flex align-items-start justify-content-between">
              <span class="fs-4">${num}</span>
              <div class="flex-fill text-end" style="max-width: 90%;">
                <h1 class="mb-4" style="font-family: 'Scheherazade', serif;">
                  ${arab}
                </h1>
                <p class="flex-fill text-start" style="max-width: 90%;">${indo}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    contentEl.innerHTML = header + verses;

    // scroll ke atas
    contentEl.scrollTop = 0;
    contentEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  } catch (err) {
    console.error('loadSurahDetail error:', err);
    contentEl.innerHTML = `<p class="text-danger">Gagal memuat surat.</p>`;
  }
}
// ================== SEARCH FUNCTION ==================
const searchInput = document.getElementById('search');

searchInput.addEventListener('keyup', function () {
  const keyword = this.value.toLowerCase();
  const items = document.querySelectorAll('#surah-list li');

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(keyword) ? '' : 'none';
  });
});

// Tombol Search = langsung buka surah pertama yang cocok
const searchForm = document.querySelector('form');

searchForm.addEventListener('submit', function (e) {
  e.preventDefault(); // supaya tidak reload halaman

  const keyword = searchInput.value.toLowerCase();
  const items = document.querySelectorAll('#surah-list li');

  for (let item of items) {
    const text = item.textContent.toLowerCase();

    if (text.includes(keyword)) {
      item.click(); // langsung buka surah
      return; // stop setelah ketemu pertama
    }
  }

  alert('Surah tidak ditemukan!');
});

// ================== EVENT LIST CLICK ==================
listEl.addEventListener('click', (e) => {
  const item = e.target.closest('li');
  if (!item) return;

  const id = item.dataset.id;
  if (!id) return;

  document
    .querySelectorAll('.surah-item')
    .forEach((el) => el.classList.remove('active'));

  item.classList.add('active');

  loadSurahDetail(id);
});

// ================== INIT ==================
loadSurahList();
