// ==========================================
// HIGHLIGHT AI — Content Script
// ==========================================

let panel = null;
let trigger = null;
let currentSelection = '';
let selectedLang = 'German';
let hideTimer = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let userQuestion = '';

// ---- Create trigger pill ----
function createTrigger() {
  trigger = document.createElement('div');
  trigger.id = 'highlight-ai-trigger';
  trigger.className = 'hidden';
  trigger.innerHTML = `<span class="trigger-spark">✦</span> Ask AI`;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    showPanel();
    trigger.classList.add('hidden');
  });
  document.body.appendChild(trigger);
}

// ---- Create main panel ----
function createPanel() {
  panel = document.createElement('div');
  panel.id = 'highlight-ai-panel';
  panel.className = 'hidden';
  panel.innerHTML = `
    <div class="hai-card">
      <div class="hai-header">
        <div class="hai-logo">
          <div class="hai-logo-mark">✦</div>
          <span class="hai-logo-text">Highlight AI</span>
        </div>
        <button class="hai-close" id="hai-close-btn">✕</button>
      </div>

      <div class="hai-selection-preview" id="hai-preview"></div>

      <div class="hai-apikey-notice" id="hai-apikey-notice">
        ⚠️ No API key set. <a id="hai-open-popup">Click to set your Hugging Face API key</a> in the extension popup.
        <button class="hai-popup-btn" id="hai-popup-btn" title="Open settings popup">⚙️</button>
      </div>

      <div class="hai-actions">
        <button class="hai-action-btn" data-action="explain">
          <span class="btn-icon">🧠</span>
          <span class="btn-text">
            <span class="btn-label">Explain</span>
            <span class="btn-desc">Simple breakdown</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="improve">
          <span class="btn-icon">✨</span>
          <span class="btn-text">
            <span class="btn-label">Improve</span>
            <span class="btn-desc">Make readable</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="summarize">
          <span class="btn-icon">📝</span>
          <span class="btn-text">
            <span class="btn-label">Summarize</span>
            <span class="btn-desc">Key points</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="tone">
          <span class="btn-icon">🎭</span>
          <span class="btn-text">
            <span class="btn-label">Tone</span>
            <span class="btn-desc">Mood & attitude</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="sentiment">
          <span class="btn-icon">😊</span>
          <span class="btn-text">
            <span class="btn-label">Sentiment</span>
            <span class="btn-desc">Pos/neg analysis</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="readability">
          <span class="btn-icon">📊</span>
          <span class="btn-text">
            <span class="btn-label">Readability</span>
            <span class="btn-desc">Reading level</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="notes">
          <span class="btn-icon">📋</span>
          <span class="btn-text">
            <span class="btn-label">Notes</span>
            <span class="btn-desc">Bullet points</span>
          </span>
        </button>
        <button class="hai-action-btn" data-action="question">
          <span class="btn-icon">💬</span>
          <span class="btn-text">
            <span class="btn-label">Ask</span>
            <span class="btn-desc">Question about text</span>
          </span>
        </button>
        <button class="hai-action-btn full-width" data-action="translate">
          <span class="btn-icon">🌐</span>
          <span class="btn-text">
            <span class="btn-label">Translate</span>
            <span class="btn-desc">Pick a language below</span>
          </span>
        </button>
      </div>

      <div class="hai-lang-row" id="hai-lang-row">
        <span class="hai-lang-pill visible" data-lang="German">🇩🇪 German</span>
        <span class="hai-lang-pill visible" data-lang="Kannada">🇮🇳 Kannada</span>
        <span class="hai-lang-pill visible" data-lang="French">🇫🇷 French</span>
        <span class="hai-lang-pill visible" data-lang="Japanese">🇯🇵 Japanese</span>
        <span class="hai-lang-pill visible" data-lang="Hindi">🇮🇳 Hindi</span>
        <span class="hai-lang-pill visible" data-lang="Spanish">🇪🇸 Spanish</span>
      </div>

      <div class="hai-question-input" id="hai-question-input">
        <input type="text" id="hai-question-field" placeholder="Ask a question about the highlighted text..." maxlength="200" />
        <button class="hai-ask-btn" id="hai-ask-btn">Ask</button>
      </div>

      <div class="hai-loading" id="hai-loading">
        <div class="hai-spinner"></div>
        <span id="hai-loading-text">Thinking...</span>
      </div>

      <div class="hai-result" id="hai-result">
        <div class="hai-result-header" id="hai-result-label">RESULT</div>
        <div class="hai-result-text" id="hai-result-text"></div>
        <div class="hai-confidence" id="hai-confidence"></div>
        <button class="hai-copy-btn" id="hai-copy-btn">📋 Copy</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  bindPanelEvents();
}

function bindPanelEvents() {
  // Close
  panel.querySelector('#hai-close-btn').addEventListener('click', hidePanel);

  // Make panel draggable
  const header = panel.querySelector('.hai-header');
  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    if (e.target === panel.querySelector('#hai-close-btn')) return; // Don't drag when clicking close button

    isDragging = true;
    const rect = panel.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
  });

  // Action buttons
  panel.querySelectorAll('.hai-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      if (action === 'translate') {
        // Just highlight the selected lang pill and trigger translation
        runAction('translate');
      } else if (action === 'question') {
        // Show question input instead of running immediately
        showQuestionInput();
      } else {
        runAction(action);
      }
      panel.querySelectorAll('.hai-action-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Language pills
  panel.querySelectorAll('.hai-lang-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      panel.querySelectorAll('.hai-lang-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedLang = pill.dataset.lang;
      runAction('translate');
      // Also mark translate button as active
      panel.querySelectorAll('.hai-action-btn').forEach(b => b.classList.remove('active'));
      panel.querySelector('[data-action="translate"]').classList.add('active');
    });
  });

  // Copy
  panel.querySelector('#hai-copy-btn').addEventListener('click', () => {
    const text = panel.querySelector('#hai-result-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = panel.querySelector('#hai-copy-btn');
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy', 1500);
    });
  });

  // Open popup link
  panel.querySelector('#hai-open-popup')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  });

  // Open popup button
  panel.querySelector('#hai-popup-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  });

  // Prevent panel clicks from closing
  panel.addEventListener('mousedown', e => e.stopPropagation());
}

function showQuestionInput() {
  const questionInput = panel.querySelector('#hai-question-input');
  const questionField = panel.querySelector('#hai-question-field');

  // Hide language pills and show question input
  panel.querySelector('#hai-lang-row').style.display = 'none';
  questionInput.style.display = 'flex';

  // Focus on the input field
  setTimeout(() => questionField.focus(), 100);

  // Handle ask button click
  const askBtn = panel.querySelector('#hai-ask-btn');
  const handleAsk = () => {
    userQuestion = questionField.value.trim();
    if (userQuestion) {
      runAction('question');
      askBtn.removeEventListener('click', handleAsk);
    }
  };
  askBtn.addEventListener('click', handleAsk);

  // Handle Enter key
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      userQuestion = questionField.value.trim();
      if (userQuestion) {
        runAction('question');
        questionField.removeEventListener('keydown', handleEnter);
      }
    }
  };
  questionField.addEventListener('keydown', handleEnter);
}

function handleDrag(e) {
  if (!isDragging) return;

  const newX = e.clientX - dragOffset.x;
  const newY = e.clientY - dragOffset.y;

  // Keep panel within viewport bounds
  const maxX = window.innerWidth - panel.offsetWidth;
  const maxY = window.innerHeight - panel.offsetHeight;

  panel.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
  panel.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
  panel.style.right = 'auto';
  panel.style.bottom = 'auto';
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
}

// ---- Show / hide ----
function showPanel() {
  if (!currentSelection.trim()) return;
  clearTimeout(hideTimer);

  const preview = panel.querySelector('#hai-preview');
  preview.textContent = currentSelection.length > 200
    ? currentSelection.slice(0, 200) + '…'
    : currentSelection;

  // Reset result/loading
  setLoading(false);
  panel.querySelector('#hai-result').classList.remove('visible');
  panel.querySelectorAll('.hai-action-btn').forEach(b => b.classList.remove('active'));

  // Reset question input
  panel.querySelector('#hai-lang-row').style.display = 'flex';
  panel.querySelector('#hai-question-input').style.display = 'none';
  panel.querySelector('#hai-question-field').value = '';
  userQuestion = '';

  // Check API key
  chrome.storage.sync.get(['apiKey'], ({ apiKey }) => {
    const notice = panel.querySelector('#hai-apikey-notice');
    notice.style.display = apiKey ? 'none' : 'block';
  });

  panel.classList.remove('hidden');
}

function hidePanel() {
  panel.classList.add('hidden');
  trigger.classList.add('hidden');
}

// ---- Position helpers ----
function positionNear(x, y, el) {
  const margin = 12;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const elW = el === trigger ? 100 : 420; // Increased width for 3 columns
  const elH = el === trigger ? 36 : 450; // Increased height

  if (el === panel) {
    // Position panel at top right
    const left = winW - elW - margin;
    const top = margin;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    return;
  }

  // Position trigger near cursor
  let left = x + margin;
  let top = y + margin;

  if (left + elW > winW - margin) left = x - elW - margin;
  if (top + elH > winH - margin) top = y - elH - margin;
  if (left < margin) left = margin;
  if (top < margin) top = margin;

  el.style.left = left + 'px';
  el.style.top = top + 'px';
}

// ---- Text formatting helper ----
function formatResultText(text) {
  if (!text) return text;

  // Clean up common AI artifacts
  text = text.replace(/^["\s]+|["\s]+$/g, ''); // Remove surrounding quotes
  text = text.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines

  // Fix broken markdown formatting
  text = text.replace(/\*([^*]+)$/gm, '*$1*'); // Fix unclosed italics
  text = text.replace(/^\*([^*]+)\*$/gm, '<em>$1</em>'); // Convert single *word* to italics
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); // Bold
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Italic (after bold to avoid conflicts)

  // Handle numbered lists
  text = text.replace(/^\d+\.\s+(.*)$/gm, '• $1');

  // Handle bullet points
  text = text.replace(/^[-•]\s+(.*)$/gm, '• $1');

  // Handle code blocks (basic)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Handle headers
  text = text.replace(/^###\s+(.*)$/gm, '<strong>$1</strong><br>');
  text = text.replace(/^##\s+(.*)$/gm, '<strong>$1</strong><br>');
  text = text.replace(/^#\s+(.*)$/gm, '<strong>$1</strong><br>');

  // Improve readability - break up long sentences
  text = text.replace(/([.!?])\s*([A-Z])/g, '$1<br><br>$2');

  // Handle line breaks and paragraphs
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  text = '<p>' + text + '</p>';

  // Clean up empty paragraphs
  text = text.replace(/<p><\/p>/g, '');
  text = text.replace(/<p><br><\/p>/g, '');

  return text;
}

// ---- Reading time calculator ----
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

// ---- Extract key points ----
function extractKeyPoints(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  // Simple heuristic: sentences with keywords or starting with capitals
  const keyPoints = sentences.filter(s =>
    s.includes('important') ||
    s.includes('key') ||
    s.includes('main') ||
    s.match(/^[A-Z]/) && s.length > 20
  ).slice(0, 3);

  return keyPoints.length > 0 ? keyPoints : sentences.slice(0, 2);
}

// ---- Selection listener ----
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';

    if (text.length > 3) {
      currentSelection = text;
      trigger.classList.remove('hidden');
      positionNear(e.clientX, e.clientY, trigger);

      // Auto-show panel after 600ms if still selected
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (window.getSelection().toString().trim() === text) {
          positionNear(e.clientX, e.clientY, panel);
          showPanel();
          trigger.classList.add('hidden');
        }
      }, 600);
    } else {
      if (!panel.contains(e.target)) {
        trigger.classList.add('hidden');
        clearTimeout(hideTimer);
      }
    }
  }, 10);
});

document.addEventListener('mousedown', (e) => {
  if (panel && !panel.contains(e.target) && trigger && !trigger.contains(e.target)) {
    hidePanel();
    clearTimeout(hideTimer);
  }
});

// ---- AI action runner ----
const ACTION_CONFIG = {
  explain: {
    label: 'EXPLANATION',
    loading: 'Breaking it down...',
    prompt: (t) => `Explain this clearly and concisely in 2-3 sentences. No bullet points, just plain prose:\n\n"${t}"`
  },
  simplify: {
    label: 'SIMPLIFIED',
    loading: 'Simplifying...',
    prompt: (t) => `Explain this like I'm 12 years old in 2-3 simple sentences:\n\n"${t}"`
  },
  notes: {
    label: 'KEY NOTES',
    loading: 'Making notes...',
    prompt: (t) => `Convert this into 3-5 concise bullet points. Start each with •:\n\n"${t}"`
  },
  question: {
    label: 'ANSWER',
    loading: 'Thinking...',
    prompt: (t, question) => `Using the following text as context, answer this question: "${question}"\n\nContext: "${t}"\n\nProvide a clear, concise answer based only on the provided context.`
  },
  translate: {
    label: (lang) => `TRANSLATED (${lang.toUpperCase()})`,
    loading: 'Translating...',
    prompt: (t, lang) => `Translate the following text to ${lang}. Provide only the translation, nothing else:\n\n"${t}"`
  },
  summarize: {
    label: 'SUMMARY',
    loading: 'Summarizing...',
    prompt: (t) => `Summarize this text in 2-3 sentences, capturing the main points:\n\n"${t}"`
  },
  tone: {
    label: 'TONE ANALYSIS',
    loading: 'Analyzing tone...',
    prompt: (t) => `Analyze the tone and emotional content of this text. Describe the overall mood, attitude, and any emotional language used:\n\n"${t}"`
  },
  sentiment: {
    label: 'SENTIMENT',
    loading: 'Analyzing sentiment...',
    prompt: (t) => `Analyze the sentiment of this text. Is it positive, negative, or neutral? Provide a brief explanation with a confidence score (0-100%):\n\n"${t}"`
  },
  readability: {
    label: 'READABILITY',
    loading: 'Calculating readability...',
    prompt: (t) => `Analyze the readability of this text. Estimate the reading level (elementary, middle school, high school, college, graduate) and suggest improvements if it's too complex:\n\n"${t}"`
  },
  improve: {
    label: 'IMPROVED',
    loading: 'Improving readability...',
    prompt: (t) => `Rewrite this text to be more readable and accessible. Use shorter sentences, simpler words, and clearer structure. Maintain the original meaning but make it easier to understand:\n\n"${t}"`
  }
};

function calculateConfidence(text) {
  // Simple confidence calculation based on response characteristics
  let score = 50; // Base score

  // Length factor (responses that are too short or too long get lower scores)
  const length = text.length;
  if (length < 10) score -= 20;
  else if (length > 500) score -= 10;
  else if (length > 50 && length < 300) score += 15;

  // Sentence structure factor
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) score += 10;

  // Word variety factor
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const varietyRatio = uniqueWords.size / words.length;
  if (varietyRatio > 0.6) score += 10;

  // Contains common error indicators
  if (text.includes('error') || text.includes('sorry') || text.includes('unable')) {
    score -= 15;
  }

  return Math.max(10, Math.min(95, Math.round(score)));
}

function getConfidenceLevel(confidence) {
  if (confidence >= 80) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}

function callHuggingFace(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'CALL_HF_API', prompt }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!response) {
        return reject(new Error('No response from extension background service.'));
      }
      if (response.error) {
        return reject(new Error(response.error));
      }
      resolve(response.data);
    });
  });
}

async function runAction(action) {
  const config = ACTION_CONFIG[action];
  if (!config) return;

  // Get API key
  chrome.storage.sync.get(['apiKey'], async ({ apiKey }) => {
    if (!apiKey) {
      panel.querySelector('#hai-apikey-notice').style.display = 'block';
      return;
    }

    const loadingText = panel.querySelector('#hai-loading-text');
    loadingText.textContent = config.loading;
    setLoading(true);
    panel.querySelector('#hai-result').classList.remove('visible');

    const prompt = action === 'translate'
      ? config.prompt(currentSelection, selectedLang)
      : action === 'question'
      ? config.prompt(currentSelection, userQuestion)
      : config.prompt(currentSelection);

    try {
      const data = await callHuggingFace(prompt);

      let resultText = '';
      if (typeof data === 'string') {
        resultText = data;
      } else if (Array.isArray(data) && data[0]?.generated_text) {
        resultText = data[0].generated_text;
      } else if (data.generated_text) {
        resultText = data.generated_text;
      } else {
        resultText = JSON.stringify(data);
      }

      // Format the result text for better display
      resultText = formatResultText(resultText);

      const label = action === 'translate'
        ? config.label(selectedLang)
        : config.label;

      panel.querySelector('#hai-result-label').textContent = label;
      panel.querySelector('#hai-result-text').innerHTML = resultText;

      // Add confidence score (simulated based on response length and coherence)
      const confidence = calculateConfidence(resultText);
      panel.querySelector('#hai-confidence').textContent = `Confidence: ${confidence}%`;
      panel.querySelector('#hai-confidence').className = `hai-confidence confidence-${getConfidenceLevel(confidence)}`;

      // Add reading time estimate
      const readingTime = calculateReadingTime(resultText);
      const timeElement = panel.querySelector('#hai-reading-time') || document.createElement('div');
      timeElement.id = 'hai-reading-time';
      timeElement.className = 'hai-reading-time';
      timeElement.textContent = `📖 ${readingTime} min read`;
      if (!panel.querySelector('#hai-reading-time')) {
        panel.querySelector('#hai-result').appendChild(timeElement);
      }

      // Add text statistics
      const plainText = resultText.replace(/<[^>]*>/g, ''); // Strip HTML
      const wordCount = plainText.trim().split(/\s+/).length;
      const charCount = plainText.length;
      const statsElement = panel.querySelector('#hai-text-stats') || document.createElement('div');
      statsElement.id = 'hai-text-stats';
      statsElement.className = 'hai-text-stats';
      statsElement.textContent = `📊 ${wordCount} words, ${charCount} chars`;
      if (!panel.querySelector('#hai-text-stats')) {
        panel.querySelector('#hai-result').appendChild(statsElement);
      }

      // Add key points for longer responses
      if (resultText.length > 200 && action !== 'notes') {
        const keyPoints = extractKeyPoints(resultText.replace(/<[^>]*>/g, '')); // Strip HTML for analysis
        if (keyPoints.length > 0) {
          const pointsElement = panel.querySelector('#hai-key-points') || document.createElement('div');
          pointsElement.id = 'hai-key-points';
          pointsElement.className = 'hai-key-points';
          pointsElement.innerHTML = '<div class="key-points-header">💡 Key Points:</div>' +
            keyPoints.map(point => `<div class="key-point">• ${point.trim()}</div>`).join('');
          if (!panel.querySelector('#hai-key-points')) {
            panel.querySelector('#hai-result').appendChild(pointsElement);
          }
        }
      }

      setLoading(false);
      panel.querySelector('#hai-result').classList.add('visible');

    } catch (err) {
      panel.querySelector('#hai-result-label').textContent = 'ERROR';
      panel.querySelector('#hai-result-text').textContent = `Something went wrong: ${err.message}`;
      setLoading(false);
      panel.querySelector('#hai-result').classList.add('visible');
    }
  });
}

function setLoading(visible) {
  panel.querySelector('#hai-loading').classList.toggle('visible', visible);
}

// ---- Init ----
createTrigger();
createPanel();
