import { translateText } from '../utils/api.js';
import { storageService } from '../utils/storage.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'TRANSLATE') {
    (async () => {
      try {
        const settings = await storageService.getSettings();
        if (!settings.isEnabled) {
          sendResponse({ success: false, disabled: true });
          return;
        }
        const translation = await translateText(request.text, settings.targetLang);
        sendResponse({ success: true, translation });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // keep channel open
  }

  if (request.action === 'SAVE_VOCAB') {
    (async () => {
      try {
        await storageService.saveVocabulary(request.payload);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});