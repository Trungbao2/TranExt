let tooltipHost = null;
let shadowRoot = null;

function createTooltip() {
  if (tooltipHost) return;
  tooltipHost = document.createElement('div');
  tooltipHost.id = 'vt-tooltip-host';
  tooltipHost.style.position = 'absolute';
  tooltipHost.style.zIndex = '2147483647';
  
  shadowRoot = tooltipHost.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    .tooltip-container {
      background: #333;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .text-original { font-weight: bold; }
    .text-translation { margin-top: 4px; }
    .btn-save {
      background: #4caf50;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-end;
    }
    .btn-save:disabled {
      background: #888;
      cursor: not-allowed;
    }
    .error-msg {
      color: #ff9800;
      font-size: 12px;
    }
  `;
  shadowRoot.appendChild(style);

  const container = document.createElement('div');
  container.className = 'tooltip-container';
  shadowRoot.appendChild(container);

  document.body.appendChild(tooltipHost);
}

function removeTooltip() {
  if (tooltipHost) {
    tooltipHost.remove();
    tooltipHost = null;
    shadowRoot = null;
  }
}

document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) {
    if (tooltipHost && !e.composedPath().includes(tooltipHost)) {
      removeTooltip();
    }
    return;
  }

  const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
  if (isVietnamese) {
    removeTooltip();
    return;
  }

  // Check if extension is enabled
  let isEnabled = true;
  try {
    const { settings } = await chrome.storage.local.get('settings');
    if (settings && settings.isEnabled === false) isEnabled = false;
  } catch (err) {}
  if (!isEnabled) return;

  createTooltip();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  tooltipHost.style.top = `${window.scrollY + rect.bottom + 5}px`;
  tooltipHost.style.left = `${window.scrollX + rect.left}px`;

  const container = shadowRoot.querySelector('.tooltip-container');
  container.innerHTML = `<div>Đang dịch...</div>`;

  const words = text.split(/\s+/).length;
  const isValid = text.length <= 100 && words <= 15;

  chrome.runtime.sendMessage({ action: 'TRANSLATE', text }, (response) => {
    if (!response || !response.success) {
      container.innerHTML = `<div class="error-msg">Lỗi dịch thuật.</div>`;
      return;
    }

    const translation = response.translation;
    container.innerHTML = `
      <div class="text-original">${text}</div>
      <div class="text-translation">${translation}</div>
      ${!isValid ? `<div class="error-msg">Đoạn văn quá dài để lưu.</div>` : ''}
      <button class="btn-save" ${!isValid ? 'disabled' : ''}>Lưu từ vựng</button>
    `;

    const btnSave = container.querySelector('.btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        btnSave.disabled = true;
        btnSave.textContent = 'Đang lưu...';
        chrome.runtime.sendMessage({
          action: 'SAVE_VOCAB',
          payload: { text, translation, sourceUrl: window.location.href }
        }, (res) => {
          if (res && res.success) {
            btnSave.textContent = 'Đã lưu';
            btnSave.style.background = '#2196F3';
          } else {
            btnSave.textContent = 'Lỗi';
          }
        });
      });
    }
  });
});

document.addEventListener('mousedown', (e) => {
  if (tooltipHost && !e.composedPath().includes(tooltipHost)) {
    removeTooltip();
  }
});