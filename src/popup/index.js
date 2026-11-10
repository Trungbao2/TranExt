import { storageService } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  async function renderVocabs() {
    const listEl = document.getElementById('vocab-list');
    const vocabs = await storageService.getVocabularies();
    
    if (vocabs.length === 0) {
      listEl.innerHTML = '<p style="text-align:center; color:#888;">Chưa có từ vựng nào.</p>';
      return;
    }

    listEl.innerHTML = vocabs.map(v => `
      <div class="vocab-item">
        <div class="vocab-text">${v.text}</div>
        <div class="vocab-trans">${v.translation}</div>
        <button class="btn-del" data-id="${v.id}">Xóa</button>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.target.dataset.id);
        await storageService.deleteVocabulary(id);
        renderVocabs();
      });
    });
  }

  const enableExt = document.getElementById('enable-ext');
  const targetLang = document.getElementById('target-lang');
  
  const settings = await storageService.getSettings();
  enableExt.checked = settings.isEnabled;
  targetLang.value = settings.targetLang;

  enableExt.addEventListener('change', async () => {
    settings.isEnabled = enableExt.checked;
    await storageService.saveSettings(settings);
  });

  targetLang.addEventListener('change', async () => {
    settings.targetLang = targetLang.value;
    await storageService.saveSettings(settings);
  });

  renderVocabs();
});
