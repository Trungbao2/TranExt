export const storageService = {
  async saveVocabulary(vocabObj) {
    const { vocabularies = [] } = await chrome.storage.local.get('vocabularies');
    const existingIndex = vocabularies.findIndex(v => v.text.toLowerCase() === vocabObj.text.toLowerCase());
    
    if (existingIndex >= 0) {
      vocabularies[existingIndex].savedAt = Date.now();
    } else {
      vocabularies.unshift({ ...vocabObj, id: Date.now(), savedAt: Date.now() });
    }
    
    await chrome.storage.local.set({ vocabularies });
  },

  async getVocabularies() {
    const { vocabularies = [] } = await chrome.storage.local.get('vocabularies');
    return vocabularies;
  },

  async deleteVocabulary(id) {
    const { vocabularies = [] } = await chrome.storage.local.get('vocabularies');
    const updated = vocabularies.filter(v => v.id !== id);
    await chrome.storage.local.set({ vocabularies: updated });
  },

  async getSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    return settings || { isEnabled: true, targetLang: 'vi' };
  },

  async saveSettings(settings) {
    await chrome.storage.local.set({ settings });
  }
};