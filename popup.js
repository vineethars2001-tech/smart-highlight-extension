// popup.js
const input = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');
const toggleVis = document.getElementById('toggleVis');
const popupClose = document.getElementById('popup-close');

// Ensure popup has correct size
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.width = '340px';
  document.body.style.height = '480px';
  document.body.style.minWidth = '340px';
  document.body.style.minHeight = '480px';
});

// Load saved key
chrome.storage.sync.get(['apiKey'], ({ apiKey }) => {
  if (apiKey) {
    input.value = apiKey;
    showStatus('✓ Key saved', 'ok');
  }
});

// Toggle visibility
toggleVis.addEventListener('click', () => {
  input.type = input.type === 'password' ? 'text' : 'password';
  toggleVis.textContent = input.type === 'password' ? '👁' : '🙈';
});

// Close popup
popupClose.addEventListener('click', () => {
  window.close();
});

// Save
saveBtn.addEventListener('click', () => {
  const key = input.value.trim();
  if (!key || !key.startsWith('hf_')) {
    showStatus('⚠️ Enter a valid Hugging Face key (starts with hf_)', 'err');
    return;
  }
  chrome.storage.sync.set({ apiKey: key }, () => {
    showStatus('✓ Saved! Highlight any text to start.', 'ok');
    saveBtn.textContent = '✓ Saved';
    setTimeout(() => saveBtn.textContent = 'Save Key & Activate', 2000);
  });
});

function showStatus(msg, type) {
  status.textContent = msg;
  status.className = 'status ' + type;
}