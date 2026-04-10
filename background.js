// Background service worker for Highlight AI
chrome.runtime.onInstalled.addListener(() => {
  console.log('Highlight AI installed!');
});

// Keyboard shortcut to open popup
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-popup') {
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_POPUP') {
    chrome.action.openPopup?.();
    return;
  }

  if (message.type === 'CALL_HF_API') {
    chrome.storage.sync.get(['apiKey'], async ({ apiKey }) => {
      if (!apiKey) {
        sendResponse({ error: 'No Hugging Face API key stored.' });
        return;
      }

      try {
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b:fastest',
            messages: [
              { role: 'system', content: 'You are a helpful assistant that responds clearly and concisely.' },
              { role: 'user', content: message.prompt }
            ],
            max_tokens: 256,
            temperature: 0.3,
            stream: false
          })
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          if (!response.ok) {
            sendResponse({ error: `Request failed: ${response.status} ${response.statusText} - ${text}` });
            return;
          }
          sendResponse({ error: `Invalid JSON response from Hugging Face: ${text}` });
          return;
        }

        if (!response.ok) {
          const errorMessage = data?.error || data?.detail || JSON.stringify(data);
          sendResponse({ error: `Request failed: ${response.status} ${response.statusText} - ${errorMessage}` });
          return;
        }

        const content = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
        sendResponse({ data: content });
      } catch (err) {
        sendResponse({ error: err.message || 'Unknown fetch error.' });
      }
    });

    return true; // Keep the message channel open for async response
  }
});
